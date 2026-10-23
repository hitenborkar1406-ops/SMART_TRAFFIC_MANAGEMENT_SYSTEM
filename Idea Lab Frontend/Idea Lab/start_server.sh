#!/usr/bin/env bash
# =========================================================================
# SMART TRAFFIC MANAGEMENT SYSTEM FOR UNEVEN TRAFFIC DISTRIBUTION
# Nagpur City, Maharashtra, India
# =========================================================================

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" >/dev/null 2>&1 && pwd)"
cd "$DIR"

echo "========================================================================="
echo "SMART TRAFFIC MANAGEMENT SYSTEM FOR UNEVEN TRAFFIC DISTRIBUTION"
echo "Nagpur City, Maharashtra, India (Real Interactive Map Edition)"
echo "========================================================================="
echo ""
echo "Launching Microsoft Edge at http://localhost:8000 ..."

if which microsoft-edge >/dev/null 2>&1; then
    microsoft-edge http://localhost:8000 &
elif which xdg-open >/dev/null 2>&1; then
    xdg-open http://localhost:8000 &
fi

echo ""
echo "Starting FastAPI / Uvicorn backend server on port 8000..."
echo "(Press Ctrl+C to stop the server)"
echo ""

python3 -m uvicorn backend.main:app --host 0.0.0.0 --port 8000
if [ $? -ne 0 ]; then
    echo ""
    echo "Uvicorn exited or encountered an issue. Starting standard HTTP server fallback..."
    python3 -m http.server 8000
fi
