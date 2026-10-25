@echo off
title Smart Traffic Management System - Nagpur City
echo =========================================================================
echo SMART TRAFFIC MANAGEMENT SYSTEM FOR UNEVEN TRAFFIC DISTRIBUTION
echo Nagpur City, Maharashtra, India (Real Interactive Map Edition)
echo =========================================================================
echo.
echo Launching your browser at http://localhost:8000 ...
start http://localhost:8000
echo.
echo Starting FastAPI / Uvicorn backend server on port 8000...
echo (Keep this terminal window open while using the website)
echo.
python -m uvicorn backend.main:app --host 0.0.0.0 --port 8000
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo Uvicorn exited or encountered an issue. Starting standard HTTP server fallback...
    python -m http.server 8000 --directory frontend
)
pause
