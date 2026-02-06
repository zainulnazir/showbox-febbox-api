#!/bin/bash

# Get the directory where this script is located
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Path to the virtual environment python
PYTHON_EXEC="$DIR/cf-bypass/venv/bin/python"
SERVER_SCRIPT="$DIR/cf-bypass/server.py"

echo "Starting Cloudflare Bypass Server..."
echo "Python Executable: $PYTHON_EXEC"
echo "Server Script: $SERVER_SCRIPT"

# Check if already running
if pgrep -f "server.py" > /dev/null; then
    echo "Server is already running."
else
    # Run in background
    nohup "$PYTHON_EXEC" "$SERVER_SCRIPT" > "$DIR/bypass_server.log" 2>&1 &
    echo "Server started in background. Logs are in bypass_server.log"
fi
