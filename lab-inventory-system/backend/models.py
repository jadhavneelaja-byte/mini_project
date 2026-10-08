from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()

class Lab(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), unique=True, nullable=False)

class Item(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text)
    category = db.Column(db.String(50), default='General')
    status = db.Column(db.String(20), default='available')  # 'available', 'borrowed', 'damaged', 'maintenance'
    unique_id = db.Column(db.String(50), unique=True, nullable=False)
    lab_id = db.Column(db.Integer, db.ForeignKey('lab.id'), nullable=False)
    quantity = db.Column(db.Integer, default=1)
    available_quantity = db.Column(db.Integer, default=1)
    # Health tracking
    health_score = db.Column(db.Integer, default=100)  # 0-100
    usage_count = db.Column(db.Integer, default=0)
    last_maintenance_date = db.Column(db.DateTime, default=datetime.utcnow)
    lab = db.relationship('Lab', backref='items')

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password = db.Column(db.String(120), nullable=False)
    role = db.Column(db.String(20), nullable=False)  # 'student', 'admin', 'teacher'

class Booking(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    item_id = db.Column(db.Integer, db.ForeignKey('item.id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    status = db.Column(db.String(20), default='pending')  # 'pending', 'borrowed', 'returned', 'denied'
    time_requested = db.Column(db.DateTime, default=datetime.utcnow)
    time_borrowed = db.Column(db.DateTime)
    time_returned = db.Column(db.DateTime)
    quantity_borrowed = db.Column(db.Integer, default=1)
    booking_date = db.Column(db.Date, nullable=True)  # Specific date for the booking
    time_slot = db.Column(db.String(50), nullable=True)  # Time slot like "9:00 AM - 11:00 AM"
    item = db.relationship('Item', backref='bookings')
    user = db.relationship('User', backref='bookings')

class Damage(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    item_id = db.Column(db.Integer, db.ForeignKey('item.id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    description = db.Column(db.Text, nullable=False)
    status = db.Column(db.String(20), default='reported')  # 'reported', 'resolved'
    time_reported = db.Column(db.DateTime, default=datetime.utcnow)
    time_resolved = db.Column(db.DateTime)
    item = db.relationship('Item', backref='damages')
    user = db.relationship('User', backref='damages')

class Maintenance(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    item_id = db.Column(db.Integer, db.ForeignKey('item.id'), nullable=False)
    performed_by = db.Column(db.String(100))  # Admin or technician who performed maintenance
    description = db.Column(db.Text)  # What maintenance was done
    time_performed = db.Column(db.DateTime, default=datetime.utcnow)
    item = db.relationship('Item', backref='maintenance_records')