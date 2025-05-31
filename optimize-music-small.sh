#!/bin/bash

# Optimize music to be under 3MB
# Usage: ./optimize-music-small.sh input.mp3

if [ $# -eq 0 ]; then
    echo "Usage: $0 <input-mp3-file>"
    exit 1
fi

INPUT_FILE="$1"
OUTPUT_DIR="public/music"

mkdir -p "$OUTPUT_DIR"

echo "🎵 Optimizing music file to be under 3MB..."
echo "Original file: $INPUT_FILE"
echo ""

# Get original file info
ORIGINAL_SIZE=$(du -h "$INPUT_FILE" | cut -f1)
echo "Original size: $ORIGINAL_SIZE"

# Try different bitrates to get under 3MB
for BITRATE in 96 80 64; do
    echo ""
    echo "Trying ${BITRATE}kbps..."
    
    ffmpeg -i "$INPUT_FILE" \
        -codec:a libmp3lame \
        -b:a ${BITRATE}k \
        -ac 1 \
        -ar 44100 \
        -filter:a "volume=0.7" \
        "$OUTPUT_DIR/background_temp.mp3" \
        -y -loglevel error
    
    # Check file size
    SIZE_MB=$(du -m "$OUTPUT_DIR/background_temp.mp3" | cut -f1)
    SIZE_HUMAN=$(du -h "$OUTPUT_DIR/background_temp.mp3" | cut -f1)
    
    echo "Output size: $SIZE_HUMAN"
    
    if [ $SIZE_MB -lt 3 ]; then
        mv "$OUTPUT_DIR/background_temp.mp3" "$OUTPUT_DIR/background.mp3"
        echo "✅ Success! File is under 3MB at ${BITRATE}kbps"
        
        # Also create OGG version
        ffmpeg -i "$OUTPUT_DIR/background.mp3" \
            -codec:a libvorbis \
            -qscale:a 2 \
            "$OUTPUT_DIR/background.ogg" \
            -y -loglevel error
        
        echo ""
        echo "📁 Files created:"
        ls -lh "$OUTPUT_DIR/background.mp3" "$OUTPUT_DIR/background.ogg"
        echo ""
        echo "🎯 Optimization complete!"
        exit 0
    fi
done

# If still too large, trim the audio
echo ""
echo "File still too large. Trimming to 2 minutes..."

# Get duration in seconds
DURATION=$(ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "$INPUT_FILE" | cut -d. -f1)

# Limit to 2 minutes (120 seconds)
if [ $DURATION -gt 120 ]; then
    TRIM_DURATION=120
else
    TRIM_DURATION=$DURATION
fi

ffmpeg -i "$INPUT_FILE" \
    -codec:a libmp3lame \
    -b:a 64k \
    -ac 1 \
    -ar 44100 \
    -t $TRIM_DURATION \
    -filter:a "volume=0.7,afade=t=out:st=$((TRIM_DURATION-3)):d=3" \
    "$OUTPUT_DIR/background.mp3" \
    -y -loglevel error

echo "✅ Created 2-minute version at 64kbps"
echo ""
echo "📁 Final files:"
ls -lh "$OUTPUT_DIR/background.mp3"