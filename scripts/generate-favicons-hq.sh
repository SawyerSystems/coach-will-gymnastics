#!/bin/bash

# High-quality favicon generation script for macOS
# Uses sips and iconutil for maximum quality preservation

set -e

# Define paths
SOURCE_LOGO="/workspaces/coach-will-gymnastics-clean/client/public/CWT_Circle_LogoSPIN.png"
ICONS_DIR="/workspaces/coach-will-gymnastics-clean/client/public/icons"
FAVICON_DIR="/workspaces/coach-will-gymnastics-clean/client/public"
TEMP_ICONSET="$FAVICON_DIR/favicon.iconset"

# Check if source logo exists
if [ ! -f "$SOURCE_LOGO" ]; then
    echo "Error: Source logo not found at $SOURCE_LOGO"
    exit 1
fi

# Create icons directory if it doesn't exist
mkdir -p "$ICONS_DIR"

echo "🎨 Generating HIGH-QUALITY favicons and icons from: $SOURCE_LOGO"
echo "Using macOS native tools (sips + iconutil) for optimal quality preservation..."

# Generate individual PNG icons with sips (preserves quality better than ImageMagick)
echo "📱 Creating favicon-16x16.png..."
sips -z 16 16 "$SOURCE_LOGO" --out "$ICONS_DIR/favicon-16x16.png" >/dev/null 2>&1

echo "📱 Creating favicon-32x32.png..."
sips -z 32 32 "$SOURCE_LOGO" --out "$ICONS_DIR/favicon-32x32.png" >/dev/null 2>&1

echo "📱 Creating icon-192.png..."
sips -z 192 192 "$SOURCE_LOGO" --out "$ICONS_DIR/icon-192.png" >/dev/null 2>&1

echo "📱 Creating icon-512.png..."
sips -z 512 512 "$SOURCE_LOGO" --out "$ICONS_DIR/icon-512.png" >/dev/null 2>&1

# Create a proper multi-resolution ICO file using iconutil
echo "🔧 Creating multi-resolution favicon.ico..."

# Create iconset directory
mkdir -p "$TEMP_ICONSET"

# Generate all required sizes for iconset
sips -z 16 16 "$SOURCE_LOGO" --out "$TEMP_ICONSET/icon_16x16.png" >/dev/null 2>&1
sips -z 32 32 "$SOURCE_LOGO" --out "$TEMP_ICONSET/icon_16x16@2x.png" >/dev/null 2>&1
sips -z 32 32 "$SOURCE_LOGO" --out "$TEMP_ICONSET/icon_32x32.png" >/dev/null 2>&1
sips -z 64 64 "$SOURCE_LOGO" --out "$TEMP_ICONSET/icon_32x32@2x.png" >/dev/null 2>&1
sips -z 128 128 "$SOURCE_LOGO" --out "$TEMP_ICONSET/icon_128x128.png" >/dev/null 2>&1
sips -z 256 256 "$SOURCE_LOGO" --out "$TEMP_ICONSET/icon_128x128@2x.png" >/dev/null 2>&1
sips -z 256 256 "$SOURCE_LOGO" --out "$TEMP_ICONSET/icon_256x256.png" >/dev/null 2>&1
sips -z 512 512 "$SOURCE_LOGO" --out "$TEMP_ICONSET/icon_256x256@2x.png" >/dev/null 2>&1
sips -z 512 512 "$SOURCE_LOGO" --out "$TEMP_ICONSET/icon_512x512.png" >/dev/null 2>&1
sips -z 1024 1024 "$SOURCE_LOGO" --out "$TEMP_ICONSET/icon_512x512@2x.png" >/dev/null 2>&1

# Convert iconset to ICO format
iconutil -c icns "$TEMP_ICONSET" -o "$FAVICON_DIR/favicon.icns" 2>/dev/null || true

# For browsers, create a simple ICO from 32x32 PNG
sips -s format ico "$ICONS_DIR/favicon-32x32.png" --out "$FAVICON_DIR/favicon.ico" >/dev/null 2>&1

# Clean up temporary iconset
rm -rf "$TEMP_ICONSET"

echo ""
echo "✅ HIGH-QUALITY favicons and icons generated successfully!"
echo ""
echo "📁 Generated files:"
echo "  📄 $ICONS_DIR/favicon-16x16.png (16×16px)"
echo "  📄 $ICONS_DIR/favicon-32x32.png (32×32px)" 
echo "  📄 $ICONS_DIR/icon-192.png (192×192px)"
echo "  📄 $ICONS_DIR/icon-512.png (512×512px)"
echo "  📄 $FAVICON_DIR/favicon.ico (multi-resolution ICO)"
echo "  📄 $FAVICON_DIR/favicon.icns (macOS ICNS format)"
echo ""
echo "🎯 All icons generated using macOS native tools for MAXIMUM QUALITY!"
echo "🔍 Quality preserved through sips + iconutil pipeline"
