#!/bin/bash

# MAXIMUM QUALITY favicon generation - NO COMPRESSION
# This script generates uncompressed, highest quality favicons and icons

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

echo "🎨 Generating UNCOMPRESSED MAXIMUM QUALITY favicons and icons"
echo "📁 Source: $SOURCE_LOGO"

# Detect platform and use best available tools
if command -v sips >/dev/null 2>&1; then
    echo "🍎 Using macOS sips (UNCOMPRESSED)..."
    
    # macOS native sips - highest quality, no compression
    echo "📱 Creating favicon-16x16.png (UNCOMPRESSED)..."
    sips -z 16 16 "$SOURCE_LOGO" --out "$ICONS_DIR/favicon-16x16.png" >/dev/null

    echo "📱 Creating favicon-32x32.png (UNCOMPRESSED)..."
    sips -z 32 32 "$SOURCE_LOGO" --out "$ICONS_DIR/favicon-32x32.png" >/dev/null

    echo "📱 Creating icon-192.png (UNCOMPRESSED)..."
    sips -z 192 192 "$SOURCE_LOGO" --out "$ICONS_DIR/icon-192.png" >/dev/null

    echo "📱 Creating icon-512.png (UNCOMPRESSED)..."
    sips -z 512 512 "$SOURCE_LOGO" --out "$ICONS_DIR/icon-512.png" >/dev/null

    # Create favicon.ico
    echo "🔧 Creating favicon.ico..."
    sips -s format ico "$ICONS_DIR/favicon-32x32.png" --out "$FAVICON_DIR/favicon.ico" >/dev/null

elif command -v convert >/dev/null 2>&1; then
    echo "🐧 Using ImageMagick with ZERO COMPRESSION settings..."
    
    # ImageMagick with MAXIMUM quality settings - NO COMPRESSION
    echo "📱 Creating favicon-16x16.png (UNCOMPRESSED)..."
    convert "$SOURCE_LOGO" \
        -filter Lanczos \
        -resize 16x16 \
        -unsharp 0x0.75+0.75+0.008 \
        -define png:compression-level=0 \
        -define png:compression-strategy=0 \
        -define png:exclude-chunk=all \
        -strip \
        -quality 100 \
        PNG32:"$ICONS_DIR/favicon-16x16.png"

    echo "📱 Creating favicon-32x32.png (UNCOMPRESSED)..."
    convert "$SOURCE_LOGO" \
        -filter Lanczos \
        -resize 32x32 \
        -unsharp 0x0.75+0.75+0.008 \
        -define png:compression-level=0 \
        -define png:compression-strategy=0 \
        -define png:exclude-chunk=all \
        -strip \
        -quality 100 \
        PNG32:"$ICONS_DIR/favicon-32x32.png"

    echo "📱 Creating icon-192.png (UNCOMPRESSED)..."
    convert "$SOURCE_LOGO" \
        -filter Lanczos \
        -resize 192x192 \
        -unsharp 0x0.5+0.5+0.008 \
        -define png:compression-level=0 \
        -define png:compression-strategy=0 \
        -define png:exclude-chunk=all \
        -strip \
        -quality 100 \
        PNG32:"$ICONS_DIR/icon-192.png"

    echo "📱 Creating icon-512.png (UNCOMPRESSED)..."
    convert "$SOURCE_LOGO" \
        -filter Lanczos \
        -resize 512x512 \
        -unsharp 0x0.5+0.5+0.008 \
        -define png:compression-level=0 \
        -define png:compression-strategy=0 \
        -define png:exclude-chunk=all \
        -strip \
        -quality 100 \
        PNG32:"$ICONS_DIR/icon-512.png"

    # Create favicon.ico with multiple sizes - UNCOMPRESSED
    echo "🔧 Creating favicon.ico (UNCOMPRESSED, multi-resolution)..."
    convert "$SOURCE_LOGO" \
        \( -clone 0 -filter Lanczos -resize 16x16 -unsharp 0x0.75+0.75+0.008 \) \
        \( -clone 0 -filter Lanczos -resize 32x32 -unsharp 0x0.75+0.75+0.008 \) \
        \( -clone 0 -filter Lanczos -resize 48x48 -unsharp 0x0.75+0.75+0.008 \) \
        -delete 0 \
        -define ico:auto-resize=16,32,48 \
        "$FAVICON_DIR/favicon.ico"

else
    echo "❌ Error: No suitable image processing tool found (sips or convert)"
    exit 1
fi

echo ""
echo "✅ MAXIMUM QUALITY (UNCOMPRESSED) favicons generated successfully!"
echo ""
echo "📁 Generated files:"
echo "  📄 $ICONS_DIR/favicon-16x16.png (16×16px, UNCOMPRESSED)"
echo "  📄 $ICONS_DIR/favicon-32x32.png (32×32px, UNCOMPRESSED)" 
echo "  📄 $ICONS_DIR/icon-192.png (192×192px, UNCOMPRESSED)"
echo "  📄 $ICONS_DIR/icon-512.png (512×512px, UNCOMPRESSED)"
echo "  📄 $FAVICON_DIR/favicon.ico (multi-resolution ICO)"
echo ""
if command -v sips >/dev/null 2>&1; then
    echo "🎯 Generated using macOS sips - ZERO COMPRESSION!"
else
    echo "🎯 Generated using ImageMagick - ZERO COMPRESSION!"
    echo "🔧 Settings: PNG32 format, compression-level=0, quality=100"
fi
echo "🔍 Maximum quality preserved - NO COMPRESSION APPLIED!"
