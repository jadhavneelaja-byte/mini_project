@echo off
echo ================================================
echo    🧪 Lab Inventory System - INTEGRATED
echo ================================================
echo.
echo Starting INTEGRATED server (Flask + React)...
echo.
echo [1/1] Starting Flask Server (API + Frontend)...
start "Lab Inventory - Integrated" /min cmd /c "cd /d %~dp0backend && python app.py"

timeout /t 3 /nobreak > nul

echo.
echo ✅ INTEGRATED SERVER STARTED SUCCESSFULLY!
echo.
echo ================================================
echo 🌐 COLLEGE NETWORK ACCESS URL:
echo ================================================
echo 📱 Application: http://192.168.0.102:5000/
echo 🔧 API:         http://192.168.0.102:5000/api/
echo.
echo 📋 HOW TO ACCESS:
echo 1. Open any web browser on your computer
echo 2. Go to: http://192.168.0.102:5000/
echo 3. Login with your credentials
echo.
echo 👥 LOGIN CREDENTIALS:
echo Admin:    admin    / admin123
echo Student:  student  / student123
echo Teacher:  teacher  / teacher123
echo.
echo ⚠️  IMPORTANT NOTES:
echo • Only ONE server runs now (Flask serves everything)
echo • All computers must be on the same WiFi network
echo • Keep this window open while using the system
echo • Close this window to stop the server
echo.
echo 🎉 NOW YOU ONLY NEED TO RUN ONE COMMAND!
echo.
echo Press any key to close this information window...
echo (Server will continue running in background)
pause > nul