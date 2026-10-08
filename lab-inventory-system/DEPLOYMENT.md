# Lab Inventory System - Deployment Guide

## Production Deployment Architecture

### Frontend (Vercel)
- **Platform**: Vercel
- **Framework**: React + Vite
- **API Communication**: Uses `VITE_API_BASE_URL` environment variable

### Backend (Render)
- **Platform**: Render
- **Framework**: Flask + Gunicorn
- **Database**: PostgreSQL (Render's free tier)

---

## Step-by-Step Deployment

### 1. Deploy Backend to Render

1. **Push code to GitHub** (if not already):
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Create Render Web Service**:
   - Go to https://render.com and sign in
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Configure:
     - **Name**: `lab-inventory-backend`
     - **Root Directory**: `lab-inventory-system/backend`
     - **Runtime**: `Python 3`
     - **Build Command**: `pip install -r requirements.txt`
     - **Start Command**: `gunicorn --bind 0.0.0.0:$PORT --chdir lab-inventory-system/backend app:app`
   - Click "Create Web Service"
   - Wait for deployment to complete

3. **Copy your backend URL** (e.g., `https://lab-inventory-backend-5393.onrender.com`)

### 2. Deploy Frontend to Vercel

1. **Install Vercel CLI** (if not installed):
   ```bash
   npm install -g vercel
   ```

2. **Create `.env` file in frontend folder**:
   ```bash
   cd lab-inventory-system/frontend
   echo "VITE_API_BASE_URL=https://your-backend-url.onrender.com" > .env
   ```
   Replace `your-backend-url` with your actual Render backend URL.

3. **Deploy to Vercel**:
   ```bash
   vercel --prod
   ```
   - Follow the prompts (press Enter for defaults)
   - Copy your frontend URL (e.g., `https://your-app.vercel.app`)

4. **Set Environment Variable in Vercel Dashboard**:
   - Go to Vercel dashboard → Your project → Settings → Environment Variables
   - Add: `VITE_API_BASE_URL` = `https://your-backend-url.onrender.com`
   - Redeploy: Go to Deployments → Click "Redeploy" on the latest deployment

### 3. Verify Deployment

1. **Test Backend**:
   ```bash
   # Should return: {"msg":"Missing Authorization Header"}
   curl https://your-backend-url.onrender.com/api/labs

   # Should return JWT token
   curl -X POST https://your-backend-url.onrender.com/api/login \
     -H "Content-Type: application/json" \
     -d '{"username":"admin","password":"admin123","role":"admin"}'
   ```

2. **Test Frontend**:
   - Open your Vercel frontend URL in browser
   - Login with:
     - **Admin**: `admin` / `admin123`
     - **Student**: `student` / `student123`
   - QR Scanner should work (HTTPS from Vercel)

---

## Default Credentials

| Role    | Username | Password    |
|---------|----------|-------------|
| Admin   | admin    | admin123    |
| Student | student  | student123  |
| Teacher | teacher  | teacher123  |

---

## Troubleshooting

### Login Returns 404
- **Cause**: Frontend not using correct backend URL
- **Fix**: Ensure `VITE_API_BASE_URL` is set in Vercel environment variables and redeploy

### Camera Not Working
- **Cause**: Camera requires HTTPS
- **Fix**: Use Vercel (provides HTTPS automatically)

### Database Errors
- **Cause**: Database not seeded
- **Fix**: Backend auto-seeds on startup, check Render logs

---

## Environment Variables

### Frontend (.env)
```
VITE_API_BASE_URL=https://your-backend-url.onrender.com
```

### Backend (Render Environment Variables)
- None required (uses defaults from config.py)

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                     User's Browser                          │
│  (Mobile or Desktop - HTTPS via Vercel)                     │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                  Vercel (Frontend)                          │
│  - React + Vite                                             │
│  - HTTPS enabled                                            │
│  - QR Scanner works                                         │
│  - Uses VITE_API_BASE_URL to call backend                   │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          │ API Calls (HTTPS)
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                  Render (Backend)                           │
│  - Flask + Gunicorn                                         │
│  - PostgreSQL Database                                      │
│  - Auto-seeds users on startup                              │
│  - JWT Authentication                                       │
└─────────────────────────────────────────────────────────────┘