#!/bin/bash

# SUPREME QUALITY favicon generation using VIPS and FFmpeg
# VIPS is considered one of the best image processing libraries for quality

set -e

# Define paths
SOURCE_LOGO="/workspaces/coach-will-gymnastics-clean/client/public/CWT_Circle_LogoSPIN.png"
ICONS_DIR="/workspaces/coach-will-gymnastics-clean/client/public/icons"
FAVICON_DIR="/workspaces/coach-will-gymnastics-clean/client/public"

# Check if source logo exists
if [ ! -f "$SOURCE_LOGO" ]; then
    echo "Error: Source logo not found at $SOURCE_LOGO"
    exit 1
fi

# Create icons directory if it doesn't exist
mkdir -p "$ICONS_DIR"

echo "🎨 Generating SUPREME QUALITY favicons using VIPS + FFmpeg"
echo "📁 Source: $SOURCE_LOGO"

# Detect which tools we have available
if command -v vips >/dev/null 2>&1; then
    echo "⚡ Using VIPS for SUPREME QUALITY image processing..."
    
    # VIPS with maximum quality settings
    echo "📱 Creating favicon-16x16.png (VIPS SUPREME QUALITY)..."
    vips resize "$SOURCE_LOGO" "$ICONS_DIR/favicon-16x16.png" 0.0102564102564 --kernel lanczos3
    
    echo "📱 Creating favicon-32x32.png (VIPS SUPREME QUALITY)..."
    vips resize "$SOURCE_LOGO" "$ICONS_DIR/favicon-32x32.png" 0.0205128205128 --kernel lanczos3
    
    echo "📱 Creating icon-192.png (VIPS SUPREME QUALITY)..."
    vips resize "$SOURCE_LOGO" "$ICONS_DIR/icon-192.png" 0.1228070175439 --kernel lanczos3
    
    echo "📱 Creating icon-512.png (VIPS SUPREME QUALITY)..."
    vips resize "$SOURCE_LOGO" "$ICONS_DIR/icon-512.png" 0.3274853801169 --kernel lanczos3

elif command -v ffmpeg >/dev/null 2>&1; then
    echo "🎬 Using FFmpeg for SUPREME QUALITY image processing..."
    
    # FFmpeg with ultra-high quality settings
    echo "📱 Creating favicon-16x16.png (FFmpeg SUPREME QUALITY)..."
    ffmpeg -i "$SOURCE_LOGO" -vf "scale=16:16:flags=lanczos+accurate_rnd+full_chroma_int" -compression_level 0 -pix_fmt rgba -y "$ICONS_DIR/favicon-16x16.png" 2>/dev/null
    
    echo "📱 Creating favicon-32x32.png (FFmpeg SUPREME QUALITY)..."
    ffmpeg -i "$SOURCE_LOGO" -vf "scale=32:32:flags=lanczos+accurate_rnd+full_chroma_int" -compression_level 0 -pix_fmt rgba -y "$ICONS_DIR/favicon-32x32.png" 2>/dev/null
    
    echo "📱 Creating icon-192.png (FFmpeg SUPREME QUALITY)..."
    ffmpeg -i "$SOURCE_LOGO" -vf "scale=192:192:flags=lanczos+accurate_rnd+full_chroma_int" -compression_level 0 -pix_fmt rgba -y "$ICONS_DIR/icon-192.png" 2>/dev/null
    
    echo "📱 Creating icon-512.png (FFmpeg SUPREME QUALITY)..."
    ffmpeg -i "$SOURCE_LOGO" -vf "scale=512:512:flags=lanczos+accurate_rnd+full_chroma_int" -compression_level 0 -pix_fmt rgba -y "$ICONS_DIR/icon-512.png" 2>/dev/null

elif command -v sips >/dev/null 2>&1; then
    echo "🍎 Using macOS sips for high quality..."
    
    # macOS native sips - highest quality on Mac
    echo "📱 Creating favicon-16x16.png..."
    sips -z 16 16 "$SOURCE_LOGO" --out "$ICONS_DIR/favicon-16x16.png" >/dev/null

    echo "📱 Creating favicon-32x32.png..."
    sips -z 32 32 "$SOURCE_LOGO" --out "$ICONS_DIR/favicon-32x32.png" >/dev/null

    echo "📱 Creating icon-192.png..."
    sips -z 192 192 "$SOURCE_LOGO" --out "$ICONS_DIR/icon-192.png" >/dev/null

    echo "📱 Creating icon-512.png..."
    sips -z 512 512 "$SOURCE_LOGO" --out "$ICONS_DIR/icon-512.png" >/dev/null

elif command -v convert >/dev/null 2>&1; then
    echo "🐧 Using ImageMagick as fallback..."
    
    # ImageMagick fallback with best settings
    echo "📱 Creating favicon-16x16.png..."
    convert "$SOURCE_LOGO" -filter Lanczos -resize 16x16 -unsharp 0x0.75+0.75+0.008 -compress None -define png:compression-level=0 -quality 100 PNG32:"$ICONS_DIR/favicon-16x16.png"

    echo "📱 Creating favicon-32x32.png..."
    convert "$SOURCE_LOGO" -filter Lanczos -resize 32x32 -unsharp 0x0.75+0.75+0.008 -compress None -define png:compression-level=0 -quality 100 PNG32:"$ICONS_DIR/favicon-32x32.png"

    echo "📱 Creating icon-192.png..."
    convert "$SOURCE_LOGO" -filter Lanczos -resize 192x192 -unsharp 0x0.5+0.5+0.008 -compress None -define png:compression-level=0 -quality 100 PNG32:"$ICONS_DIR/icon-192.png"

    echo "📱 Creating icon-512.png..."
    convert "$SOURCE_LOGO" -filter Lanczos -resize 512x512 -unsharp 0x0.5+0.5+0.008 -compress None -define png:compression-level=0 -quality 100 PNG32:"$ICONS_DIR/icon-512.png"

else
    echo "❌ Error: No suitable image processing tool found"
    exit 1
fi

# Create favicon.ico using the best available tool
echo "🔧 Creating favicon.ico..."
if command -v ffmpeg >/dev/null 2>&1; then
    # Use FFmpeg to create a high-quality ICO
    ffmpeg -i "$ICONS_DIR/favicon-32x32.png" -vf "scale=32:32:flags=lanczos" -y "$FAVICON_DIR/favicon.ico" 2>/dev/null
elif command -v convert >/dev/null 2>&1; then
    # Fallback to ImageMagick
    convert "$ICONS_DIR/favicon-32x32.png" "$FAVICON_DIR/favicon.ico"
elif command -v sips >/dev/null 2>&1; then
    # macOS sips
    sips -s format ico "$ICONS_DIR/favicon-32x32.png" --out "$FAVICON_DIR/favicon.ico" >/dev/null
fi

echo ""
echo "✅ SUPREME QUALITY favicons generated successfully!"
echo ""
echo "📁 Generated files:"
echo "  📄 $ICONS_DIR/favicon-16x16.png (16×16px)"
echo "  📄 $ICONS_DIR/favicon-32x32.png (32×32px)" 
echo "  📄 $ICONS_DIR/icon-192.png (192×192px)"
echo "  📄 $ICONS_DIR/icon-512.png (512×512px)"
echo "  📄 $FAVICON_DIR/favicon.ico (ICO format)"
echo ""
if command -v vips >/dev/null 2>&1; then
    echo "🏆 Generated using VIPS - SUPREME QUALITY!"
    echo "🔧 Settings: Lanczos3 kernel, professional image processing library"
elif command -v ffmpeg >/dev/null 2>&1; then
    echo "🏆 Generated using FFmpeg - SUPREME QUALITY!"
    echo "🔧 Settings: Lanczos scaling, accurate rounding, full chroma interpolation"
else
    echo "🎯 Generated using fallback tools with maximum quality settings"
fi
echo "🔍 Maximum possible quality achieved with available tools!"
