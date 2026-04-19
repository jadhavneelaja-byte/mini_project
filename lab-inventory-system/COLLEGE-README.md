# Lab Inventory System - College Network Deployment

## 🎓 College Network Setup - INTEGRATED VERSION

This guide helps you deploy the Lab Inventory System for use within your college network.

**NEW: Everything runs from a single Flask server! No more separate frontend/backend.**

## 🚀 Quick Start

### Step 1: Double-click the startup script
- Locate `START-INTEGRATED.bat` in the project folder
- Double-click it to start the integrated server automatically

### Step 2: Access from any computer in the college
- **Application URL**: `http://192.168.0.102:5000/`
- **API Endpoint**: `http://192.168.0.102:5000/api/`

## 📋 Requirements

- Windows computer connected to college WiFi
- Python 3.11+ installed (Node.js no longer required for deployment!)
- All computers must be on the same network

## 🔧 Manual Setup (Alternative)

If the batch file doesn't work, start the integrated server manually:

### Single Command:
```bash
cd backend
python app.py
```

That's it! Flask now serves both the API and the React frontend.

## 🌐 Network Access

### Finding Your IP Address
If the IP address changes, run this command:
```bash
ipconfig | findstr "IPv4"
```

### Updating IP Address
If your IP changes, update these files:
1. `backend/app.py` - CORS origins
2. `START-INTEGRATED.bat` - URLs in the script

## 👥 User Roles & Credentials

### Admin Access
- **Username**: `admin`
- **Password**: `admin123`
- **Capabilities**: Full system management, equipment inventory, user management

### Student Access
- **Username**: `student`
- **Password**: `student123`
- **Capabilities**: View labs, book equipment, return items, report damage

### Teacher Access
- **Username**: `teacher`
- **Password**: `teacher123`
- **Capabilities**: View lab status, manage bookings, equipment monitoring

## 🛠️ Features Available

- ✅ Equipment booking and management
- ✅ Real-time inventory tracking
- ✅ Damage reporting system
- ✅ Equipment health monitoring
- ✅ QR code scanning for equipment
- ✅ Multi-role user system
- ✅ Responsive design for all devices

## 🔒 Security Notes

- This setup is for local college network use only
- All data is stored locally on your computer
- No external internet access required
- CORS is configured for local network access

## 🆘 Troubleshooting

### "Connection Refused" Error
- Make sure the integrated Flask server is running
- Check that the IP address in URLs matches your computer's IP
- Verify all computers are on the same WiFi network

### "Page Not Loading"
- Clear browser cache (Ctrl+F5)
- Try a different browser
- Check firewall settings

### IP Address Changed
- Run `ipconfig` to find new IP
- Update the IP in `START-INTEGRATED.bat`
- Update CORS in `backend/app.py`

## 📞 Support

For technical issues:
1. Check the terminal windows for error messages
2. Verify Python and Node.js are installed
3. Ensure all dependencies are installed (`pip install -r requirements.txt` and `npm install`)

---

**Happy Lab Managing! 🧪🔬**