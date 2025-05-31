# Background Music Files

Place your background music files in this directory:

- `background.mp3` - Main background music file (MP3 format)
- `background.ogg` - Alternative format for browser compatibility

## Important Notes:

1. **File Size**: Keep files under 2MB for faster loading
2. **Format**: Use 128kbps bitrate for web optimization
3. **License**: Ensure you have proper licensing for any music used
4. **Volume**: Normalize audio to prevent loud playback

## Recommended Free Music Sources:

1. **YouTube Audio Library** - Free music for creators
2. **Free Music Archive** - CC-licensed tracks
3. **Incompetech** - Royalty-free music by Kevin MacLeod
4. **Bensound** - Free music with attribution

## Legal Requirements:

If using copyrighted music, you need:
- ASCAP/BMI/SESAC licenses for US
- Proper attribution where required
- Written permission from copyright holders

## Audio Optimization:

```bash
# Convert to web-optimized MP3 (requires ffmpeg)
ffmpeg -i input.mp3 -codec:a libmp3lame -b:a 128k background.mp3

# Convert to OGG for compatibility
ffmpeg -i input.mp3 -codec:a libvorbis -qscale:a 4 background.ogg
```