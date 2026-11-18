# PARXSTREAM 🎬

PARXSTREAM is a high-performance, full-featured universal OTT streaming platform. It features a responsive Next.js web application paired with a high-speed Python FastAPI backend for streaming stream extraction, subtitle parsing, and media discovery.

---

## 🌟 Acknowledgements & Credits

Special thanks to:
- **[walterwhite-69/Moviebox-API](https://github.com/walterwhite-69/Moviebox-API.git)** — The core streaming extraction engine, source link resolution, and subtitle APIs used by this platform are powered by the Moviebox-API project. Full credit goes to [@walterwhite-69](https://github.com/walterwhite-69) and contributors for their outstanding work on the API reverse-engineering and provider scrapers.
- **[TMDB (The Movie Database)](https://www.themoviedb.org/)** — For movie/series metadata, posters, backdrops, and trending catalogs.

---

## 🏗️ Architecture & How It Works

```
┌────────────────────────────────────────┐
│      Next.js Frontend & Server         │
│         (http://localhost:3000)        │
│  - User Interface & Video Player       │
│  - TMDB Discovery & Search             │
│  - SQLite / Prisma Authentication      │
└──────────────────┬─────────────────────┘
                   │
                   ▼ (Calls REST endpoints)
┌────────────────────────────────────────┐
│       Python FastAPI Backend           │
│         (http://localhost:8000)        │
│  - MovieBox API Stream Resolver        │
│  - HLS / MP4 Stream Extraction         │
│  - Multi-language Subtitles            │
└──────────────────┬─────────────────────┘
                   │
                   ▼
       Upstream CDN & Video Streams
```

1. **Frontend (Next.js 14 + React 18):** Delivers a responsive cinema UI, authentication, watchlist management, and integrated HLS/Shaka media players.
2. **Backend (Python FastAPI):** Exposes `/search`, `/detail`, and streaming link extraction endpoints using `httpx` and `curl_cffi` to bypass Cloudflare and stream protection.

---

## 📋 Prerequisites

Make sure the following are installed on your machine:
- **Node.js** v18.17+ or v20 LTS (Recommended): [Download Node.js](https://nodejs.org/)
- **Python** 3.9+ to 3.12: [Download Python](https://www.python.org/)
- **pip** (Python package manager)
- **Git**
- A free **TMDB API Key**: [Get a TMDB API Key](https://www.themoviedb.org/settings/api)

---

## 🚀 Step-by-Step Local Setup

### 1. Clone the Repository
```bash
git clone https://github.com/parvezrepository/parxstream.git
cd parxstream
```

### 2. Install Dependencies

#### A. Install Python Backend Requirements
Open your terminal in the project root and run:
```bash
# Recommended: Create a virtual environment
python -m venv venv

# Activate the virtual environment
# Windows (PowerShell):
.\venv\Scripts\Activate.ps1
# Windows (CMD):
.\venv\Scripts\activate.bat
# Linux / macOS:
source venv/bin/activate

# Install requirements
pip install -r requirements.txt
```

#### B. Install Node.js Frontend Dependencies
```bash
npm install
```

---

### 3. Configure Environment Variables

Create your local `.env` configuration file from the template:
```bash
# Windows PowerShell:
Copy-Item .env.example .env

# Linux / macOS / Bash:
cp .env.example .env
```

Open `.env` and fill in your credentials:
```env
# TMDB API Settings (Required for posters, titles, and discovery)
TMDB_API_KEY=your_tmdb_api_key_here
TMDB_API_READ_ACCESS_TOKEN=your_tmdb_read_access_token_here
TMDB_IMAGE_BASE_URL=https://image.tmdb.org/t/p

# Backend Connection
MOVIEBOX_BACKEND_URL=http://localhost:8000
MOVIEBOX_FALLBACK_ACTIVE=true

# Database (Default zero-config SQLite)
DATABASE_URL="file:./dev.db"

# Security (Change to random strings in production)
AUTH_SECRET="super-secret-random-jwt-key"
ADMIN_KEY="admin-secret-passkey"

# App Info
NEXT_PUBLIC_APP_NAME="PARXSTREAM"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
DISCLAIMER_VERSION=1.0
NODE_ENV=production
```

---

### 4. Initialize Database (Prisma)

Generate the Prisma Client and create your local SQLite database:
```bash
npm run prisma:generate
npm run prisma:push
```

---

### 5. Running the Application on Localhost

To run the complete platform, start both the Python backend and the Next.js server in separate terminals:

#### Terminal 1 — Start Python API Backend:
```bash
# Activate virtual environment if used, then run:
python main.py
# Or via npm script:
npm run start:backend
```
> The API will start on **`http://localhost:8000`** (Swagger docs available at `http://localhost:8000/docs`).

#### Terminal 2 — Start Next.js Frontend Server:
```bash
npm start
```
> The web application will be live at **`http://localhost:3000`**.

Open your browser and navigate to:
👉 **[http://localhost:3000](http://localhost:3000)**

---

## 🛠️ Available Scripts

| Command | Description |
|---|---|
| `python main.py` / `npm run start:backend` | Starts the Python FastAPI streaming resolver on port 8000 |
| `npm start` | Starts the Next.js web application on port 3000 (`node server.js`) |
| `npm run prisma:generate` | Generates the Prisma client |
| `npm run prisma:push` | Migrates and synchronizes schema to the database |
| `npm test` | Runs automated tests with Vitest |

---

## ⚠️ Disclaimer

This software is developed strictly for educational and personal research purposes. The developers and contributors do not host, store, or upload any media content or videos on any servers. All streams are retrieved dynamically through third-party public endpoints. Please ensure compliance with local copyright regulations and terms of service.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE) — see the LICENSE file for details.
