@echo off
echo 🚀 Lab Inventory System - Quick Deployment Setup
echo.

echo Step 1: Setting up environment variables...
if not exist "frontend\.env" (
    copy "frontend\.env.example" "frontend\.env"
    echo Created frontend/.env file. Please edit it with your backend URL.
) else (
    echo frontend/.env already exists.
)

echo.
echo Step 2: Building frontend for production...
cd frontend
npm run build
cd ..

echo.
echo ✅ Frontend built successfully!
echo.
echo 📋 Next Steps:
echo 1. Deploy backend to Heroku/Railway
echo 2. Deploy frontend to Vercel/Netlify
echo 3. Update CORS in backend/app.py with your frontend domain
echo 4. Set VITE_API_BASE_URL environment variable in your hosting platform
echo.
echo 📖 See DEPLOYMENT.md for detailed instructions
echo.
pause