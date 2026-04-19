# Smart Lab Inventory System

A full-stack web application for managing lab inventory with role-based access control.

## Tech Stack
- **Backend**: Flask (Python) with SQLAlchemy, JWT Authentication
- **Frontend**: React (Vite) with Tailwind CSS, Chart.js
- **Database**: SQLite

## Features
- **Student**: View items by lab, request bookings via QR simulation, return items, report damages
- **Admin**: Full CRUD on inventory (add/edit/delete/view), approve/deny bookings, resolve damages, view usage logs, analytics with charts
- **Teacher**: View usage logs and damage reports

## New Features Added
- Equipment categories (General, Equipment, Apparatus, Tools, Electronics)
- Equipment statuses (available, borrowed, damaged, maintenance)
- Search and filter equipment by name and category
- Analytics dashboard with charts (most borrowed items, booking frequency, inventory summary)
- Improved booking flow: pending → borrowed → returned
- Enhanced UI with better cards and dashboards
- Error handling with user-friendly messages
- QR code scanning for quick booking

## Prerequisites
- Python 3.11.7 (download from [python.org](https://www.python.org/downloads/))
- Node.js and npm (download from [nodejs.org](https://nodejs.org/))
- Git (for cloning the repository)

## Quick Start (Integrated Mode)
For the easiest setup, run the integrated batch file:
1. Double-click `run-all.bat` in the project root.
2. It will set up everything and start the server at `http://localhost:5000`.

## Setup and Installation

### Backend Setup
1. Navigate to the `backend/` directory:
   ```
   cd backend
   ```
2. Create and activate a virtual environment:
   ```
   python -m venv venv
   venv\Scripts\activate  # On Windows; use `source venv/bin/activate` on macOS/Linux
   ```
3. Install Python dependencies:
   ```
   pip install -r requirements.txt
   ```
4. Initialize the database and seed sample data:
   ```
   python seed.py
   ```

### Frontend Setup
1. Navigate to the `frontend/` directory:
   ```
   cd frontend
   ```
2. Install Node.js dependencies:
   ```
   npm install
   ```
3. Build for production:
   ```
   npm run build
   ```

## Running the Application

### Integrated Mode (Recommended)
After setup, run the Flask server, which serves both backend API and frontend:
```
cd backend
python app.py
```
- Access the app at: `http://localhost:5000`
- For network access (e.g., college network): `http://[your-local-ip]:5000`

### Development Mode (Separate Servers)
1. Start the backend (in one terminal):
   ```
   cd backend
   venv\Scripts\activate  # Activate venv
   python app.py
   ```
   - API available at: `http://localhost:5000`

2. Start the frontend (in another terminal):
   ```
   cd frontend
   npm run dev
   ```
   - Frontend available at: `http://localhost:5173` (with hot-reloading)

### Windows Batch Files
- `run-all.bat`: Full setup and run (builds frontend, sets up backend, starts server).
- `START-INTEGRATED.bat`: Runs integrated mode (assumes setup is done).
- `start-college.bat`: Runs separate mode for network access.
- `deploy.bat`: Builds frontend for production.

### Sample Users
- Admin: username `admin`, password `AdminSecure2024!`
- Student: username `student`, password `StudentSecure2024!`
- Teacher: username `teacher`, password `TeacherSecure2024!`

## API Endpoints
- Base URL: `http://localhost:5000` (or your configured host)
- POST `/api/login` - User authentication
- GET `/api/labs` - List all labs
- GET `/api/labs/<id>/items` - Get items by lab ID
- GET `/api/labs/<name>/items` - Get items by lab name
- GET `/api/items` - List all items (Admin)
- POST `/api/items` - Create item (Admin)
- PUT `/api/items/<id>` - Update item (Admin)
- DELETE `/api/items/<id>` - Delete item (Admin)
- GET `/api/items/search` - Search items
- POST `/api/request-booking` - Request item booking
- POST `/api/report-damage` - Report item damage
- GET `/api/my-bookings` - Get user's bookings
- POST `/api/return-item/<id>` - Return item
- GET `/api/usage-logs` - Get usage logs (Admin/Teacher)
- GET `/api/damage-reports` - Get damage reports (Admin/Teacher)
- GET `/api/pending-requests` - Get pending bookings (Admin)
- POST `/api/approve-request` - Approve booking (Admin)
- POST `/api/deny-request` - Deny booking (Admin)
- GET `/api/analytics/*` - Analytics data (Admin/Teacher)
- POST `/items` - Create item (Admin only)
- PUT `/items/<id>` - Update item (Admin)
- DELETE `/items/<id>` - Delete item (Admin)
- POST `/request-booking` - Request item booking
- POST `/return-item` - Return item
- POST `/report-damage` - Report item damage
- GET `/admin/pending-requests` - Get pending bookings (Admin)
- POST `/approve-request` - Approve booking (Admin)
- POST `/deny-request` - Deny booking (Admin)
- GET `/usage-logs` - Get usage log (Admin/Teacher)
- GET `/damage-reports` - Get damage reports (Admin/Teacher)
- POST `/resolve-damage/<id>` - Resolve damage (Admin)
- GET `/analytics/*` - Analytics data (Admin/Teacher)