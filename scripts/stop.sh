#!/bin/bash

echo "Stopping Cloudflare Bypass Server..."
pkill -f "bypass/server.py"

if [ $? -eq 0 ]; then
    echo "Server stopped successfully."
else
    echo "No running server found or failed to stop."
fi
