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

1. **`frontend/`**
   - **Interactive Web Interface**: High-fidelity Leaflet GIS dashboard, responsive UI controls, and live route selection HUD.
   - **Components & Data**:
     - `css/style.css`: Modern UI design system and map styling.
     - `js/app.js`: Main client map and telemetry application controller.
     - `js/data/`: Nagpur road network coordinates, vehicle profiles, and street geometries.
     - `js/services/`: Client-side route calculations and fallback algorithms.
     - `assets/`: Reference city maps and imagery.

2. **`backend/`**
   - **Integrated FastAPI Service (`backend/main.py`)**:
     - Dynamic static file routing serving `frontend/`.
     - Nagpur geocoding with local locality resolution (`/api/geocode`).
     - Traffic condition queries (`/api/traffic`, `/api/traffic/hotspots`, `/api/traffic/predict-15min`).
     - Dynamic multi-route generation and congestion scoring (`/api/route`).
   - **Machine Learning Service (`backend/ml_service/`)**:
     - Standalone FastAPI predictive service powered by a trained XGBoost classifier.
     - Historical corridor datasets and model artifact definitions.

3. **`docs/`**
   - Project presentation slide decks and hackathon documentation.

---

## 📁 Repository Structure

```text
SMART-TRAFFIC/
├── frontend/                              # Web application UI & GIS map
│   ├── index.html                         # Main entry point
│   ├── css/                               # Styling & design system
│   │   └── style.css
│   ├── js/                                # Application logic & road telemetry
│   │   ├── app.js
│   │   ├── data/
│   │   └── services/
│   └── assets/                            # Map visuals & references
│
├── backend/                               # FastAPI routing & telemetry engine
│   ├── main.py                            # Gateway & routing API
│   ├── requirements.txt                   # Backend dependencies
│   ├── .env.example                       # Environment template
│   └── ml_service/                        # XGBoost ML predictive service
│       ├── app/                           # ML service logic & schemas
│       ├── data/                          # Nagpur corridor CSV datasets
│       ├── models/                        # Pre-trained ML model binaries
│       ├── tests/                         # API test suite
│       └── requirements.txt
│
├── docs/                                  # Presentation decks & documentation
├── start_server.sh                        # Linux quick launch script
├── start_server.bat                       # Windows quick launch script
├── Dockerfile                             # Production Docker container definition
├── requirements.txt                       # Root Python dependencies
└── README.md                              # Project documentation
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
     ./start_server.sh
     ```
   - **On Windows:**
     ```cmd
     start_server.bat
     ```
   - **Or via Uvicorn directly:**
     ```bash
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
