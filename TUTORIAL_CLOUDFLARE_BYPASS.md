# Tutorial: Implementing Cloudflare Bypass for ShowBox-FebBox Bridge

This guide details the step-by-step process to automate the Cloudflare bypass required to fetch FebBox share links from ShowBox. This creates a bridge that allows your Node.js application to communicate seamlessly with FebBox without manual intervention.

## Prerequisites

*   **Node.js** (for the main application)
*   **Python 3.9+** (for the bypass server)
*   **Git**

---

## Step 1: Set Up the Python Bypass Server

We will use a specialized Python server that runs a headless browser to solve Cloudflare challenges.

1.  **Clone the Bypass Repository**
    Inside your project root, clone the `CloudflareBypassForScraping` repository into a folder named `cf-bypass`.

    ```bash
    git clone https://github.com/sarperavci/CloudflareBypassForScraping.git cf-bypass
    ```

2.  **Create a Python Virtual Environment**
    It is best practice to isolate the dependencies.

    ```bash
    # Create the virtual environment
    python3 -m venv cf-bypass/venv
    ```

3.  **Install Dependencies**
    Activate the environment and install the required packages.

    ```bash
    # Activate venv (macOS/Linux)
    source cf-bypass/venv/bin/activate

    # Install Python packages
    pip install fastapi uvicorn camoufox playwright

    # Install Playwright browsers
    playwright install
    ```

4.  **Verify the Server**
    Try running the server manually to ensure it starts.

    ```bash
    # Run from the cf-bypass directory
    cd cf-bypass
    python server.py
    ```
    You should see output indicating the server is running on `http://0.0.0.0:8000`. Press `Ctrl+C` to stop it for now.

---

## Step 2: Integrate with Node.js Client

Now we need to modify the ShowBox API client to send requests to our local Python server instead of asking the user for input.

1.  **Open `src/ShowboxAPI.js`**
2.  **Locate the `getFebBoxId` function**.
3.  **Replace the function** with the following implementation. This code sends the target URL to the local server and handles the response.

    ```javascript
    async getFebBoxId(id, type) {
        const targetUrl = `https://www.showbox.media/index/share_link?id=${id}&type=${type}`;
        // Point to our local Python bypass server
        const bypassUrl = `http://localhost:8000/html?url=${encodeURIComponent(targetUrl)}`;
        
        console.log(`\n🔄 Bypassing Cloudflare for: ${targetUrl}`);
        
        try {
            const response = await fetch(bypassUrl);
            if (!response.ok) {
                throw new Error(`Bypass server error: ${response.statusText}`);
            }
            
            let rawText = await response.text();
            
            try {
                // The bypass server (Camoufox) often returns JSON wrapped in HTML tags
                // We need to extract the raw JSON string
                if (rawText.trim().startsWith('<html') || rawText.trim().startsWith('<!DOCTYPE html>')) {
                    console.log("Received HTML wrapped response, attempting to extract JSON...");
                    
                    // Regex to find content inside <pre> tags
                    const preMatch = rawText.match(/<pre[^>]*>([\s\S]*?)<\/pre>/i);
                    if (preMatch && preMatch[1]) {
                        rawText = preMatch[1];
                    } else {
                        // Fallback: strip all HTML tags
                        rawText = rawText.replace(/<[^>]*>/g, '');
                    }
                }
                
                // Parse the clean JSON
                const data = JSON.parse(rawText);
                return data;
                
            } catch (e) {
                console.error("Failed to parse JSON from bypass server:", e);
                console.log("Raw response was:", rawText);
                throw e;
            }
            
        } catch (error) {
            console.error("Error in getFebBoxId:", error);
            return null;
        }
    }
    ```

---

## Step 3: Create Management Scripts

To make running the system easier, create helper scripts in your project root.

**`start_bypass.sh`** (Starts the server in the background)
```bash
#!/bin/bash
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PYTHON_EXEC="$DIR/cf-bypass/venv/bin/python"
SERVER_SCRIPT="$DIR/cf-bypass/server.py"

if pgrep -f "server.py" > /dev/null; then
    echo "Server is already running."
else
    nohup "$PYTHON_EXEC" "$SERVER_SCRIPT" > "$DIR/bypass_server.log" 2>&1 &
    echo "Server started in background."
fi
```

**`stop_bypass.sh`** (Stops the server)
```bash
#!/bin/bash
echo "Stopping Cloudflare Bypass Server..."
pkill -f "cf-bypass/server.py"
```

Make them executable:
```bash
chmod +x start_bypass.sh stop_bypass.sh
```

---

## Step 4: Running the Bridge

1.  **Start the Bypass Server**:
    ```bash
    ./start_bypass.sh
    ```

2.  **Run Your Application**:
    ```bash
    node main.js
    ```

Your application will now automatically negotiate the Cloudflare challenge and retrieve the FebBox links without any manual copy-pasting!
