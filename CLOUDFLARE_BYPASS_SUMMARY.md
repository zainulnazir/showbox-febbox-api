# Cloudflare Bypass Implementation Summary

## Problem
The Showbox API (`ShowboxAPI.js`) was unable to fetch share links directly because Cloudflare's protection layer was blocking the requests. Previously, this required a manual workflow: opening a browser, copying the link, and pasting it into the console.

## Solution Implemented
We automated this process by setting up a local Python proxy server that uses a stealthy browser to solve the Cloudflare challenge and return the clean data to the Node.js application.

## Key Changes

### 1. Local Bypass Server (`cf-bypass/`)
*   **Source**: Based on the `sarperavci/CloudflareBypassForScraping` repository.
*   **Mechanism**: Uses `Camoufox` (a modified Firefox browser) to load the protected URL, solve the Cloudflare challenge automatically, and extract the page content.
*   **Configuration**:
    *   Runs in a Python virtual environment (`venv`).
    *   Dependencies: `fastapi`, `uvicorn`, `camoufox`, `playwright`.
    *   Port: `http://localhost:8000`.

### 2. Node.js Client Integration (`src/ShowboxAPI.js`)
*   **`getFebBoxId` Modification**:
    *   Removed the manual `readline` prompt.
    *   Implemented an automatic fetch request to `http://localhost:8000/html?url=...`.
*   **Response Parsing**:
    *   The Python server returns JSON data wrapped in HTML tags (due to the browser's view source behavior).
    *   Added Regex logic (`/<pre[^>]*>([\s\S]*?)<\/pre>/i`) to detect this wrapper and extract the raw JSON string before parsing.

### 3. Process Management Scripts
*   **`start_bypass.sh`**: Starts the Python server in the background using `nohup`. Logs are written to `bypass_server.log`.
*   **`stop_bypass.sh`**: Finds and kills the running server process.

## Workflow
1.  `ShowboxAPI.js` constructs the target movie link.
2.  It sends this URL to the local Python server (`localhost:8000`).
3.  The Python server opens a hidden browser instance, passes the Cloudflare check, and retrieves the page content.
4.  `ShowboxAPI.js` receives the response, strips any HTML wrappers, parses the JSON, and proceeds with fetching the file list.
