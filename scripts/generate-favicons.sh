#!/bin/bash

# Script to generate all favicons and icons from the main CWT_Circle_LogoSPIN.png logo
# Auto-detects macOS vs Linux and uses the best available tools

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

echo "🎨 Generating high-quality favicons and icons from: $SOURCE_LOGO"

# Detect platform and use best available tools
if command -v sips >/dev/null 2>&1; then
    echo "🍎 Using macOS sips for optimal quality..."
    
    # macOS native sips - highest quality
    echo "📱 Creating favicon-16x16.png..."
    sips -z 16 16 "$SOURCE_LOGO" --out "$ICONS_DIR/favicon-16x16.png" >/dev/null

    echo "📱 Creating favicon-32x32.png..."
    sips -z 32 32 "$SOURCE_LOGO" --out "$ICONS_DIR/favicon-32x32.png" >/dev/null

    echo "📱 Creating icon-192.png..."
    sips -z 192 192 "$SOURCE_LOGO" --out "$ICONS_DIR/icon-192.png" >/dev/null

    echo "📱 Creating icon-512.png..."
    sips -z 512 512 "$SOURCE_LOGO" --out "$ICONS_DIR/icon-512.png" >/dev/null

    # Create favicon.ico
    echo "🔧 Creating favicon.ico..."
    sips -s format ico "$ICONS_DIR/favicon-32x32.png" --out "$FAVICON_DIR/favicon.ico" >/dev/null

elif command -v convert >/dev/null 2>&1; then
    echo "🐧 Using ImageMagick convert with ULTRA-HIGH quality settings..."
    
    # Ultra-high quality ImageMagick settings for logos
    QUALITY_OPTS="-filter Catrom -define filter:support=2 -unsharp 0x0.75+0.75+0.008 -quality 95 -background transparent"
    
    echo "� Creating favicon-16x16.png..."
    convert "$SOURCE_LOGO" $QUALITY_OPTS -resize 16x16 "$ICONS_DIR/favicon-16x16.png"

    echo "� Creating favicon-32x32.png..."
    convert "$SOURCE_LOGO" $QUALITY_OPTS -resize 32x32 "$ICONS_DIR/favicon-32x32.png"

    echo "� Creating icon-192.png..."
    convert "$SOURCE_LOGO" $QUALITY_OPTS -resize 192x192 "$ICONS_DIR/icon-192.png"

    echo "� Creating icon-512.png..."
    convert "$SOURCE_LOGO" $QUALITY_OPTS -resize 512x512 "$ICONS_DIR/icon-512.png"

    # Create favicon.ico with multiple sizes
    echo "🔧 Creating ultra-high quality favicon.ico..."
    convert "$ICONS_DIR/favicon-32x32.png" \
            "$ICONS_DIR/favicon-16x16.png" \
            -background transparent \
            "$FAVICON_DIR/favicon.ico"

else
    echo "❌ Error: No suitable image processing tool found (sips or convert)"
    exit 1
fi

echo ""
echo "✅ HIGH-QUALITY favicons and icons generated successfully!"
echo ""
echo "📁 Generated files:"
echo "  📄 $ICONS_DIR/favicon-16x16.png (16×16px)"
echo "  📄 $ICONS_DIR/favicon-32x32.png (32×32px)" 
echo "  📄 $ICONS_DIR/icon-192.png (192×192px)"
echo "  📄 $ICONS_DIR/icon-512.png (512×512px)"
echo "  📄 $FAVICON_DIR/favicon.ico (multi-resolution ICO)"
echo ""
if command -v sips >/dev/null 2>&1; then
    echo "🎯 Generated using macOS sips for MAXIMUM QUALITY!"
else
    echo "🎯 Generated using ImageMagick with ULTRA-HIGH quality Catrom filtering!"
fi
echo "🔍 Quality preserved through professional logo-optimized algorithms"
