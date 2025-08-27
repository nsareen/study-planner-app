#!/bin/bash

# Study Planner Dev Server with Auto-Restart
# This script keeps the development server running even if it crashes

echo "🚀 Starting Study Planner Development Server with auto-restart..."
echo "📍 Server will run at: http://localhost:5173"
echo "🔄 Auto-restart is enabled - server will restart if it crashes"
echo ""
echo "Press Ctrl+C to stop the server"
echo "========================================="
echo ""

cd "$(dirname "$0")"

# Function to start the server
start_server() {
    npm run dev 2>&1 | while IFS= read -r line; do
        echo "[$(date '+%H:%M:%S')] $line"
    done
}

# Keep restarting the server if it crashes
while true; do
    echo "[$(date '+%H:%M:%S')] Starting development server..."
    start_server
    
    # If we get here, the server crashed
    echo ""
    echo "[$(date '+%H:%M:%S')] ⚠️  Server stopped unexpectedly!"
    echo "[$(date '+%H:%M:%S')] 🔄 Restarting in 2 seconds..."
    sleep 2
    echo ""
done