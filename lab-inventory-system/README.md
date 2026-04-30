# Smart Lab Inventory Management and Booking System

A full-stack web application for managing lab inventory with role-based access control.

🌐 Live Demo: https://mini-project-lyart-psi.vercel.app

Tech Stack

Backend: Flask (Python), SQLAlchemy, JWT

Frontend: React (Vite), Tailwind CSS

Database: SQLite

Features:

Student: Browse items, request bookings (QR), return items, report damage

Admin: Manage inventory, approve/deny bookings, analytics dashboard

Teacher: View usage logs and damage reports

Highlights:

QR-based equipment booking

Equipment categories & status tracking

Search & filter functionality

Analytics dashboard (charts & reports)

Improved booking flow (pending → borrowed → returned)

Clean UI + error handling

Deployment: 
https://mini-project-lyart-psi.vercel.app
Hosted on Vercel
Fully functional without local setup

Run locally:

# Backend
cd backend

python -m venv venv

venv\Scripts\activate

pip install -r requirements.txt

python seed.py

python app.py

# Frontend
cd frontend

npm install
npm run dev

Sample Users

Admin: admin / admin123

Student: student / student123

Teacher: teacher / teacher123
