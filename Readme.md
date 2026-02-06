# Showbox & Febbox API Integration 📺 🎥

An advanced Node.js API that bridges **Showbox** (for media discovery) and **Febbox** (for high-speed downloads/streaming). It features an integrated, automated Cloudflare bypass system to ensure reliable access to protected links.

> **Note**: This project was developed with the assistance of **Google's Antigravity**.

---

## 🚀 Key Features

*   **Media Discovery**: Search for movies and TV shows via Showbox.
*   **Automated Bypass**: Built-in Python proxy server specifically tuned to bypass Cloudflare protection on Showbox links.
*   **Direct Downloads**: Extract direct Febbox download links (supports 4K/HD qualities).
*   **Metadata**: Retrieve detailed information for any movie or series.
*   **Docker Ready**: Full Docker support for easy deployment.

---

## 📥 Installation

### Prerequisites
*   Node.js (v18+)
*   Python 3.9+ (for the bypass server)
*   Docker (Optional, for containerized run)

### Manual Setup

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/zainulnazir/showbox-febbox-api.git
    cd showbox-febbox-api
    ```

2.  **Install Node.js dependencies**:
    ```bash
    cd api
    npm install
    cd ..
    ```

3.  **Setup the Cloudflare Bypass Server**:
    The bypass server is located in `bypass/` and runs on Python.
    ```bash
    cd bypass
    python3 -m venv venv
    source venv/bin/activate
    pip install -r requirements.txt
    cd ..
    ```

4.  **Configuration**:
    Copy the example environment file:
    ```bash
    cd api
    cp .env.example .env
    cd ..
    ```
    *Edit `api/.env` to add your optional configuration.*

---

## 🏃 Usage

To run the full system, you need to start both the **Bypass Server** (Python) and the **API Server** (Node.js).

### Option 1: Using Docker (Recommended)
```bash
docker-compose up -d --build
```

### Option 2: Using Helper Scripts
We provide scripts to manage the background processes:
```bash
# Start both servers
./scripts/start.sh

# Stop servers
./scripts/stop.sh
```

### Option 3: Manual Start
**Terminal 1 (Bypass Server):**
```bash
cd bypass
python server.py
```
**Terminal 2 (Main API):**
```bash
cd api
npm start
```

The API will be available at: `http://localhost:3000`

---

## 🔌 API Endpoints

### 1. Search
`GET /api/search/:type`
*   `type`: `movie`, `tv`, or `all`
*   `title`: Search query
*   **Example**: `GET /api/search/movie?title=avengers`

### 2. Get Details
*   Movie: `GET /api/movie/:id`
*   TV Show: `GET /api/show/:id`

### 3. Get Download Links (The Magic 🪄)
`GET /api/febbox/id`
*   Retrieves the Febbox ID for a given Showbox item (handles Cloudflare bypass automatically).
*   **Params**: `id` (Showbox ID), `type` (1=Movie, 2=TV)

`GET /api/febbox/files/:shareKey`
*   Lists files in the Febbox share.

`GET /api/febbox/links/:shareKey/:fid`
*   Generates direct download links for a specific file.

---

## 🤝 Credits & Acknowledgments

We believe in giving credit where it is due. This project builds upon the hard work of several developers and open-source projects:

*   **[CloudflareBypassForScraping](https://github.com/sarperavci/CloudflareBypassForScraping)** by **sarperavci**:
    *   This project is the backbone of our Cloudflare bypass mechanism. We have integrated it directly into our `bypass/` directory to enable seamless automated link extraction. A huge thanks to sarperavci for maintaining this excellent tool.
    
*   **Showbox & Febbox Community**:
    *   Thanks to the community for reverse-engineering efforts that made understanding the Showbox API structure possible.

*   **Google's Antigravity**:
    *   This project's refactoring, documentation, and final polish were achieved with the power of Google's Antigravity AI agent.

---

## 📄 License

This project is licensed under the **MIT License**. See the [LICENSE](LICENSE) file for details.

The `bypass` component is also licensed under MIT by its original author (sarperavci).
