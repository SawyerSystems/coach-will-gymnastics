#!/bin/bash

# Ultra-high quality favicon generation script
# Uses advanced ImageMagick techniques for maximum logo quality

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

echo "🚀 Generating ULTRA-HIGH QUALITY favicons and icons from: $SOURCE_LOGO"
echo "🔬 Using advanced ImageMagick settings for superior logo quality..."

# Advanced ImageMagick settings for logo scaling
# These settings are specifically tuned for logo/icon generation
QUALITY_OPTS="-filter Catrom -define filter:support=2 -unsharp 0x0.75+0.75+0.008 -quality 95 -background transparent"

# Generate favicons with ultra-high quality settings
echo "💎 Creating favicon-16x16.png with ultra-high quality..."
convert "$SOURCE_LOGO" $QUALITY_OPTS -resize 16x16 "$ICONS_DIR/favicon-16x16.png"

echo "💎 Creating favicon-32x32.png with ultra-high quality..."
convert "$SOURCE_LOGO" $QUALITY_OPTS -resize 32x32 "$ICONS_DIR/favicon-32x32.png"

echo "💎 Creating icon-192.png with ultra-high quality..."
convert "$SOURCE_LOGO" $QUALITY_OPTS -resize 192x192 "$ICONS_DIR/icon-192.png"

echo "💎 Creating icon-512.png with ultra-high quality..."
convert "$SOURCE_LOGO" $QUALITY_OPTS -resize 512x512 "$ICONS_DIR/icon-512.png"

# Create a high-quality ICO file using the best PNG as source
echo "🔧 Creating ultra-high quality favicon.ico..."
convert "$ICONS_DIR/favicon-32x32.png" \
        "$ICONS_DIR/favicon-16x16.png" \
        -background transparent \
        "$FAVICON_DIR/favicon.ico"

echo ""
echo "✨ ULTRA-HIGH QUALITY favicons and icons generated successfully!"
echo ""
echo "📁 Generated files:"
echo "  💎 $ICONS_DIR/favicon-16x16.png (16×16px, ultra-sharp)"
echo "  💎 $ICONS_DIR/favicon-32x32.png (32×32px, ultra-sharp)" 
echo "  💎 $ICONS_DIR/icon-192.png (192×192px, ultra-sharp)"
echo "  💎 $ICONS_DIR/icon-512.png (512×512px, ultra-sharp)"
echo "  💎 $FAVICON_DIR/favicon.ico (multi-resolution ICO, ultra-sharp)"
echo ""
echo "🎯 Quality Features Applied:"
echo "  🔬 Catrom filter for superior edge preservation"
echo "  🔍 Unsharp masking for crisp details"
echo "  💎 95% PNG quality for maximum clarity"
echo "  🚀 Optimized specifically for logo/icon scaling"
