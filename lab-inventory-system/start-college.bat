@echo off
echo ================================================
echo    🧪 Lab Inventory System - College Network
echo ================================================
echo.
echo Starting servers for college network access...
echo.
echo [1/2] Starting Backend Server (Flask API)...
start "Lab Inventory - Backend" /min cmd /c "cd /d %~dp0backend && python app.py"

echo [2/2] Starting Frontend Server (React)...
start "Lab Inventory - Frontend" /min cmd /c "cd /d %~dp0frontend && npm run dev"

timeout /t 5 /nobreak > nul

echo.
echo ✅ SERVERS STARTED SUCCESSFULLY!
echo.
echo ================================================
echo 🌐 COLLEGE NETWORK ACCESS URLs:
echo ================================================
echo 📱 Frontend: http://192.168.0.102:5181/
echo 🔧 Backend:  http://192.168.0.102:5000/
echo.
echo 📋 HOW TO ACCESS:
echo 1. Open any web browser on your computer
echo 2. Go to: http://192.168.0.102:5181/
echo 3. Login with your credentials
echo.
echo 👥 LOGIN CREDENTIALS:
echo Admin:    admin    / admin123
echo Student:  student  / student123
echo Teacher:  teacher  / teacher123
echo.
echo ⚠️  IMPORTANT NOTES:
echo • All computers must be on the same WiFi network
echo • Keep this window open while using the system
echo • Close this window to stop the servers
echo.
echo Press any key to close this information window...
echo (Servers will continue running in background)
pause > nul