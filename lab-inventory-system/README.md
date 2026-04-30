Smart Lab Inventory System

A full-stack web application for managing lab inventory with role-based access control.

🌐 Live Demo: https://mini-project-lyart-psi.vercel.app

Tech Stack
Backend: Flask (Python) with SQLAlchemy, JWT Authentication
Frontend: React (Vite) with Tailwind CSS, Chart.js
Database: SQLite
Features
Student: View items by lab, request bookings via QR simulation, return items, report damages
Admin: Full CRUD on inventory (add/edit/delete/view), approve/deny bookings, resolve damages, view usage logs, analytics with charts
Teacher: View usage logs and damage reports
New Features Added
Equipment categories (General, Equipment, Apparatus, Tools, Electronics)
Equipment statuses (available, borrowed, damaged, maintenance)
Search and filter equipment by name and category
Analytics dashboard with charts (most borrowed items, booking frequency, inventory summary)
Improved booking flow: pending → borrowed → returned
Enhanced UI with better cards and dashboards
Error handling with user-friendly messages
QR code scanning for quick booking
🚀 Deployment

The project is deployed and accessible online:

👉 https://mini-project-lyart-psi.vercel.app

Frontend is hosted on Vercel
Backend APIs are connected and running (Flask server)
No local setup required to view or test basic functionality
Prerequisites (For Local Setup)
Python 3.11.7 (download from https://www.python.org/downloads/
)
Node.js and npm (download from https://nodejs.org/
)
Git (for cloning the repository)
Quick Start (Integrated Mode)

For the easiest setup, run the integrated batch file:

Double-click run-all.bat in the project root

It will set up everything and start the server at:

http://localhost:5000
Setup and Installation
Backend Setup
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python seed.py
Frontend Setup
cd frontend
npm install
npm run build
Running the Application
Integrated Mode (Recommended)
cd backend
python app.py
Access locally: http://localhost:5000
Development Mode (Separate Servers)

Backend:

cd backend
venv\Scripts\activate
python app.py

Frontend:

cd frontend
npm run dev
Sample Users
Admin: admin / AdminSecure2024!
Student: student / StudentSecure2024!
Teacher: teacher / TeacherSecure2024!
API Endpoints
Base URL (local): http://localhost:5000

Auth

POST /api/login

Inventory

GET /api/labs
GET /api/labs/<id>/items
GET /api/items
POST /api/items
PUT /api/items/<id>
DELETE /api/items/<id>

Bookings

POST /api/request-booking
GET /api/my-bookings
POST /api/return-item/<id>

Damage

POST /api/report-damage
GET /api/damage-reports

Admin

GET /api/pending-requests
POST /api/approve-request
POST /api/deny-request

Analytics

GET /api/analytics/*
