@echo off
title Start All Services - RoxGD
echo ========================================================
echo   Starting Group Discussion Platform (All Services)
echo ========================================================
echo.

echo [1/3] Starting ML Microservice (FastAPI on port 8000)...
start "RoxGD - ML Service (:8000)" cmd /k "cd /d %~dp0ml-server && python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload"

echo [2/3] Starting Backend Server (Node.js on port 4000)...
start "RoxGD - Backend (:4000)" cmd /k "cd /d %~dp0server && npm run dev"

echo [3/3] Starting Frontend Client (Vite on port 5173)...
start "RoxGD - Client (:5173)" cmd /k "cd /d %~dp0client && npm run dev"

echo.
echo ========================================================
echo   All services launched in separate windows!
echo   Frontend : http://localhost:5173
echo   Backend  : http://localhost:4000 (Health: http://localhost:4000/health)
echo   ML Engine: http://localhost:8000 (Docs: http://localhost:8000/docs)
echo ========================================================
pause
