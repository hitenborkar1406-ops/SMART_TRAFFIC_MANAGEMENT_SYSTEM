# Smart Traffic Management System for Uneven Traffic Distribution
**Nagpur City, Maharashtra, India**

An intelligent urban traffic routing and management platform engineered to resolve uneven traffic distribution across Nagpur City using real-time spatial analytics, dynamic alternate routing, predictive ML telemetry, and automated congestion alleviation.

---

## 🚦 Key Features

- **Interactive High-Fidelity GIS Map**: Built with Leaflet, visualizing arterial corridors, high-congestion junctions, and multi-tier road networks across Nagpur.
- **Dynamic Multi-Route Computation**: Calculates primary, alternate, and green wave bypass routes between any origin and destination points in Nagpur.
- **Per-Segment Traffic Congestion Visualization**: Renders color-coded road segments reflecting live or simulated traffic intensities (green for smooth flow, amber for moderate congestion, red for heavy bottlenecks).
- **Single Active Route Isolation**: Automatically highlights the user-selected route with detailed turn-by-turn metrics while muting or hiding competing alternatives to keep the interface clean and intuitive.
- **Dynamic Time Simulation**: Test and evaluate routing under different traffic windows:
  - `Current Time` (Live conditions)
  - `Morning Peak` (Commute rush hours)
  - `Evening Peak` (Return commute hours)
  - `Off-Peak / Night` (Light traffic flow)
- **Predictive Telemetry (15-Minute Forecast)**: Uses ML-driven traffic forecasting to anticipate emerging bottlenecks before drivers enter congested corridors.
- **Route HUD & Metrics**: Real-time Heads-Up Display displaying distance, estimated duration, congestion score, and time saved by choosing alternate routes.
- **Containerized & Cloud-Ready**: Fully containerized with Docker and configured for frictionless deployment on cloud hosts (such as Render).

---

## 🏗️ System Architecture & Components

The repository comprises two primary modules:

1. **`Idea Lab Frontend/Idea Lab`**
   - **Interactive Web Interface**: Leaflet-powered GIS dashboard, custom responsive UI controls, and route selection HUD.
   - **Integrated FastAPI Service (`backend/main.py`)**:
     - Serves web assets with cache-control headers.
     - Provides geocoding (`/api/geocode`) with built-in fallback coordinates for Nagpur localities.
     - Exposes real-time traffic condition queries (`/api/traffic`, `/api/traffic/hotspots`, `/api/traffic/predict-15min`).
     - Orchestrates multi-route generation and congestion scoring (`/api/route`).
   - **Launch Scripts**: Quick launch scripts for Linux (`start_server.sh`) and Windows (`start_server.bat`).

2. **`nagpur-traffic-backend-full/nagpur-traffic-backend`**
   - **Predictive ML Service**: FastAPI service equipped with a trained XGBoost model predicting congestion levels across key Nagpur corridors.
   - **Endpoints**: Route congestion analysis, historical telemetry, and alternate route evaluation.

---

## 📁 Repository Structure

```text
SMART-TRAFFIC/
├── Dockerfile                             # Container build file for web & API service
├── requirements.txt                       # Python dependencies
├── README.md                              # Project documentation
├── Idea Lab Frontend/
│   └── Idea Lab/
│       ├── backend/
│       │   └── main.py                    # FastAPI server & routing engine
│       ├── css/
│       │   └── styles.css                 # Application styling & layout
│       ├── js/
│       │   └── app.js                     # Client-side map & routing controller
│       ├── index.html                     # Main application entry point
│       ├── start_server.sh                # Linux launch script
│       └── start_server.bat               # Windows launch script
└── nagpur-traffic-backend-full/
    └── nagpur-traffic-backend/
        ├── app/
        │   └── main.py                    # Standalone ML predictive API
        ├── data/                          # Nagpur corridor datasets
        └── models/                        # Pre-trained ML model binaries
```

---

## 🚀 Quick Start Guide

### Prerequisites
- Python 3.10+
- Modern Web Browser (Chrome, Edge, Firefox, Brave)
- *(Optional)* Docker

---

### Option 1: Running Locally (Recommended)

1. **Clone the repository:**
   ```bash
   git clone https://github.com/hitenborkar1406-ops/SMART_TRAFFIC_MANAGEMENT_SYSTEM.git
   cd SMART_TRAFFIC_MANAGEMENT_SYSTEM
   ```

2. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

3. **Start the application:**
   - **On Linux / macOS:**
     ```bash
     cd "Idea Lab Frontend/Idea Lab"
     ./start_server.sh
     ```
   - **On Windows:**
     ```cmd
     cd "Idea Lab Frontend\Idea Lab"
     start_server.bat
     ```
   - **Or via Uvicorn directly:**
     ```bash
     cd "Idea Lab Frontend/Idea Lab"
     python3 -m uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload
     ```

4. **Access the application:**
   Open [http://localhost:8000](http://localhost:8000) in your web browser.

---

### Option 2: Running with Docker

1. **Build the Docker container:**
   ```bash
   docker build -t nagpur-smart-traffic .
   ```

2. **Run the container:**
   ```bash
   docker run -d -p 8000:8000 --name smart-traffic nagpur-smart-traffic
   ```

3. **Access the application:**
   Navigate to [http://localhost:8000](http://localhost:8000).

---

## 🌐 API Overview

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Health check and service status |
| `GET` | `/api/geocode` | Search coordinates for Nagpur localities |
| `GET` | `/api/traffic` | Real-time traffic congestion telemetry |
| `GET` | `/api/traffic/hotspots` | List of current high-density traffic hotspots |
| `GET` | `/api/traffic/predict-15min` | 15-minute predictive traffic congestion forecast |
| `POST`| `/api/route` | Compute optimal routes with dynamic congestion scoring |

---

## 🔒 Security & Repository Practices

- Secrets and environment configs (`.env`) are excluded via `.gitignore`.
- Reference configuration templates are provided in `.env.example`.
- Large model binaries and compiler caches (`.pytest_cache`, `__pycache__`) are excluded from version control.
