# Smart Traffic Management System for Uneven Traffic Distribution
**Nagpur City, Maharashtra, India**

An intelligent urban traffic routing and management platform engineered to resolve uneven traffic distribution across Nagpur City using real-time spatial analytics, dynamic alternate routing, and automated congestion alleviation.

---

## 🚦 System Architecture & Components

The repository comprises two primary modules:

1. **`Idea Lab Frontend/Idea Lab`**
   - **Interactive Web Interface**: High-fidelity Leaflet map visualizing Nagpur's road networks, arterial corridors, and high-congestion zones.
   - **Frontend Engine**: Built with React 18, Leaflet, and custom interactive components for origin-destination route calculation.
   - **Integrated FastAPI Service**: Serves web assets and provides real-time local routing and traffic telemetry via `backend/main.py`.
   - **Launch Scripts**: Quick launch scripts for both Windows (`start_server.bat`) and Linux (`start_server.sh`).

2. **`nagpur-traffic-backend-full/nagpur-traffic-backend`**
   - **Predictive ML Service**: FastAPI service equipped with a trained XGBoost model predicting congestion levels across key Nagpur corridors.
   - **Endpoints**: Route congestion analysis, historical telemetry, and alternate route evaluation.

---

## 🚀 Quick Start Guide

### Prerequisites
- Python 3.10+
- Modern Web Browser (Microsoft Edge, Chrome, Firefox)

### Running the Web Platform
```bash
cd "Idea Lab Frontend/Idea Lab"

# On Linux:
./start_server.sh

# Or start manually:
python3 -m uvicorn backend.main:app --host 0.0.0.0 --port 8000
```
Open [http://localhost:8000](http://localhost:8000) in your browser.

---

## 🔒 Security & Safe Repository Practices
- Secrets and environment configs (`.env`) are excluded via `.gitignore`.
- Reference configuration templates are provided in `.env.example`.
- Large model binaries and caches (`.pytest_cache`, `__pycache__`) are excluded from version control.
