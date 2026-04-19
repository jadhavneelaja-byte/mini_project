# Lab Inventory System - Deployment Guide

This guide will help you deploy your lab inventory system so it can be accessed by people on different networks.

## 🚀 Backend Deployment (Flask API)

### Option 1: Heroku (Recommended)

1. **Create a Heroku account** at https://heroku.com
2. **Install Heroku CLI** from https://devcenter.heroku.com/articles/heroku-cli
3. **Login to Heroku**:
   ```bash
   heroku login
   ```

4. **Create a new Heroku app**:
   ```bash
   cd backend
   heroku create your-app-name
   ```

5. **Set environment variables** (replace with your actual values):
   ```bash
   heroku config:set FLASK_ENV=production
   heroku config:set SECRET_KEY=your-secret-key-here
   heroku config:set JWT_SECRET_KEY=your-jwt-secret-key-here
   heroku config:set DATABASE_URL=your-database-url-if-using-external-db
   ```

6. **Deploy to Heroku**:
   ```bash
   git add .
   git commit -m "Prepare for deployment"
   git push heroku main
   ```

7. **Your backend will be available at**: `https://your-app-name.herokuapp.com`

### Option 2: Railway

1. Go to https://railway.app
2. Connect your GitHub repository
3. Railway will automatically detect it's a Python app
4. Set environment variables in Railway dashboard
5. Deploy automatically

## 🎨 Frontend Deployment (React)

### Option 1: Vercel (Recommended)

1. **Create a Vercel account** at https://vercel.com
2. **Install Vercel CLI**:
   ```bash
   npm install -g vercel
   ```

3. **Deploy to Vercel**:
   ```bash
   cd frontend
   vercel --prod
   ```

4. **Set environment variable** for the backend URL:
   - In Vercel dashboard, go to your project settings
   - Add environment variable: `VITE_API_BASE_URL=https://your-backend-url.herokuapp.com`

5. **Your frontend will be available at**: `https://your-project-name.vercel.app`

### Option 2: Netlify

1. Go to https://netlify.com
2. Connect your GitHub repository
3. Set build command: `npm run build`
4. Set publish directory: `dist`
5. Add environment variable: `VITE_API_BASE_URL=https://your-backend-url.herokuapp.com`

## 🔧 Configuration Steps

### 1. Update CORS in Backend
In `backend/app.py`, update the CORS origins to include your deployed frontend URL:

```python
CORS(app, origins=[
    "http://localhost:5173",  # Local development
    "https://your-frontend-domain.vercel.app",  # Your Vercel domain
    "https://your-frontend-domain.netlify.app",  # Your Netlify domain
])
```

### 2. Update Vercel Configuration
In `frontend/vercel.json`, replace `your-backend-url.herokuapp.com` with your actual backend URL.

### 3. Environment Variables
Copy `.env.example` to `.env` and set the correct backend URL for production.

## 🌐 Accessing Your Deployed App

Once deployed:
- **Frontend**: `https://your-frontend-domain.vercel.app`
- **Backend API**: `https://your-backend-app.herokuapp.com`

People from different networks can now access your application using these public URLs!

## 📝 Important Notes

- Make sure to update the CORS settings in your backend to allow requests from your deployed frontend domain
- Test the deployed application thoroughly before sharing
- Consider setting up a custom domain if needed
- For production, use environment variables for sensitive data like secret keys

## 🐛 Troubleshooting

- **CORS errors**: Check that your backend allows requests from the frontend domain
- **API calls failing**: Verify the `VITE_API_BASE_URL` environment variable is set correctly
- **Database issues**: Make sure your database is accessible from the deployed environment