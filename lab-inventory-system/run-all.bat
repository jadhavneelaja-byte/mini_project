@echo off
echo ================================================
echo    🧪 Lab Inventory System - FULL INTEGRATION
echo ================================================
echo.
echo Building frontend and starting integrated server...
echo.

echo [1/4] Activating virtual environment...
cd backend
call venv\Scripts\activate.bat
if %errorlevel% neq 0 (
    echo ERROR: Failed to activate virtual environment. Please ensure venv exists in backend/.
    pause
    exit /b 1
)

echo [2/4] Installing/updating Python dependencies...
pip install -r requirements.txt
if %errorlevel% neq 0 (
    echo ERROR: Failed to install Python dependencies.
    pause
    exit /b 1
)

echo [3/4] Seeding database...
python seed.py
if %errorlevel% neq 0 (
    echo ERROR: Failed to seed database.
    pause
    exit /b 1
)

echo [4/4] Building frontend...
cd ../frontend
call npm install
if %errorlevel% neq 0 (
    echo ERROR: Failed to install npm dependencies.
    pause
    exit /b 1
)
call npm run build
if %errorlevel% neq 0 (
    echo ERROR: Failed to build frontend.
    pause
    exit /b 1
)

echo.
echo ✅ BUILD COMPLETE! Starting integrated server...
echo.
cd ../backend
python app.py