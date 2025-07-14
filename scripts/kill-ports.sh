#!/bin/bash

echo "🔄 Cleaning up development ports..."

# Kill development processes
echo "Stopping development processes..."
pkill -f "vite|tsx.*server|node.*server|npm.*dev" 2>/dev/null

# Wait for processes to stop
sleep 2

# Force kill any remaining processes on development ports
echo "Force killing processes on ports 5001, 5173-5176..."
lsof -ti:5001,5173,5174,5175,5176 2>/dev/null | xargs kill -9 2>/dev/null

# Verify ports are free
echo "Checking port status..."
PORTS_IN_USE=$(netstat -tlnp 2>/dev/null | grep -E ":5001|:517[3-6]" | wc -l)

if [ "$PORTS_IN_USE" -eq 0 ]; then
    echo "✅ All development ports are now free"
else
    echo "⚠️  Some ports may still be in use:"
    netstat -tlnp 2>/dev/null | grep -E ":5001|:517[3-6]"
fi

echo "🎉 Port cleanup complete!"
