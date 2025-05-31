#!/bin/bash

# Script to optimize MP3 for web use
# Usage: ./optimize-music.sh input.mp3

if [ $# -eq 0 ]; then
    echo "Usage: $0 <input-mp3-file>"
    exit 1
fi

INPUT_FILE="$1"
OUTPUT_DIR="public/music"

# Check if input file exists
if [ ! -f "$INPUT_FILE" ]; then
    echo "Error: File '$INPUT_FILE' not found!"
    exit 1
fi

# Create output directory if it doesn't exist
mkdir -p "$OUTPUT_DIR"

echo "Optimizing MP3 for web..."

# Check if ffmpeg is installed
if ! command -v ffmpeg &> /dev/null; then
    echo "ffmpeg is not installed. Installing..."
    sudo apt-get update && sudo apt-get install -y ffmpeg
fi

# Optimize MP3 (128kbps, mono, normalized)
ffmpeg -i "$INPUT_FILE" \
    -codec:a libmp3lame \
    -b:a 128k \
    -ac 2 \
    -ar 44100 \
    -filter:a "volume=0.5" \
    "$OUTPUT_DIR/background.mp3" \
    -y

# Also create OGG version for better browser compatibility
ffmpeg -i "$INPUT_FILE" \
    -codec:a libvorbis \
    -qscale:a 4 \
    -ac 2 \
    -ar 44100 \
    -filter:a "volume=0.5" \
    "$OUTPUT_DIR/background.ogg" \
    -y

echo "✅ Music files created:"
echo "   - $OUTPUT_DIR/background.mp3"
echo "   - $OUTPUT_DIR/background.ogg"
echo ""
echo "File sizes:"
ls -lh "$OUTPUT_DIR/background.mp3" "$OUTPUT_DIR/background.ogg"