from flask import Flask, jsonify, request, send_from_directory
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
from models import db, Lab, User, Item, Booking, Damage, Maintenance
from routes import admin_bp
from config import Config
from datetime import datetime
import os
from seed import seed_data

with app.app_context():
    seed_data()

app = Flask(__name__,
            static_folder='../frontend/dist',
            static_url_path='/')
app.config.from_object(Config)

db.init_app(app)
jwt = JWTManager(app)

# Configure CORS for deployment and local network access
CORS(app, origins=[
    "http://localhost:5173",  # Local development
    "http://localhost:5174",  # Local development (alternative port)
    "http://localhost:3000",  # Alternative local port
    "http://192.168.0.102:5173",  # Local network access
    "http://192.168.0.102:5174",  # Local network access (alternative port)
    "http://192.168.0.102:5181",  # Current network port
    "http://192.168.0.102:5000",  # Local Flask serving
    "https://your-frontend-domain.vercel.app",  # Replace with your actual Vercel domain
    "https://your-frontend-domain.netlify.app",  # Replace with your actual Netlify domain
    "*"  # Allow all origins for local network (remove in production)
])

app.register_blueprint(admin_bp, url_prefix='/api/admin')

@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    role = data.get('role')
    user = User.query.filter_by(username=username).first()
    if not user or not check_password_hash(user.password, password):
        return jsonify({'message': 'Invalid credentials'}), 401
    if role and user.role != role:
        return jsonify({'message': 'Role does not match'}), 401
    access_token = create_access_token(identity=username)
    return jsonify(access_token=access_token, role=user.role, user_id=user.id), 200

@app.route('/api/labs', methods=['GET'])
@jwt_required()
def get_labs():
    labs = Lab.query.all()
    result = [{'id': lab.id, 'name': lab.name} for lab in labs]
    return jsonify(result)

@app.route('/api/labs/<int:lab_id>/items', methods=['GET'])
@jwt_required()
def get_items_by_lab(lab_id):
    items = Item.query.filter_by(lab_id=lab_id).all()
    result = []
    for item in items:
        result.append({
            'id': item.id,
            'name': item.name,
            'description': item.description,
            'category': item.category,
            'status': item.status,
            'unique_id': item.unique_id,
            'quantity': item.quantity,
            'available_quantity': item.available_quantity,
            'health_score': item.health_score,
            'usage_count': item.usage_count,
            'last_maintenance_date': item.last_maintenance_date
        })
    return jsonify(result)

@app.route('/api/labs/<string:lab_name>/items', methods=['GET'])
@jwt_required()
def get_items_by_lab_name(lab_name):
    lab = Lab.query.filter_by(name=lab_name).first()
    if not lab:
        return jsonify({'message': 'Lab not found'}), 404
    return get_items_by_lab(lab.id)

@app.route('/api/items', methods=['GET'])
@jwt_required()
def get_all_items():
    current_user = get_jwt_identity()
    user = User.query.filter_by(username=current_user).first()
    if user.role != 'admin':
        return jsonify({'message': 'Access denied'}), 403
    items = Item.query.all()
    result = []
    for item in items:
        result.append({
            'id': item.id,
            'name': item.name,
            'description': item.description,
            'category': item.category,
            'status': item.status,
            'unique_id': item.unique_id,
            'quantity': item.quantity,
            'available_quantity': item.available_quantity,
            'lab_id': item.lab_id,
            'health_score': item.health_score,
            'usage_count': item.usage_count,
            'last_maintenance_date': item.last_maintenance_date
        })
    return jsonify(result)

@app.route('/api/items', methods=['POST'])
@jwt_required()
def create_item():
    current_user = get_jwt_identity()
    user = User.query.filter_by(username=current_user).first()
    if user.role != 'admin':
        return jsonify({'message': 'Access denied'}), 403
    data = request.get_json()
    item = Item(
        name=data['name'],
        description=data.get('description'),
        category=data.get('category', 'General'),
        unique_id=data['unique_id'],
        lab_id=data['lab_id'],
        quantity=data.get('quantity', 1),
        available_quantity=data.get('quantity', 1)
    )
    db.session.add(item)
    db.session.commit()
    return jsonify({'message': 'Item created'}), 201

@app.route('/api/items/<int:item_id>', methods=['PUT', 'DELETE'])
@jwt_required()
def update_item(item_id):
    current_user = get_jwt_identity()
    user = User.query.filter_by(username=current_user).first()
    if user.role != 'admin':
        return jsonify({'message': 'Access denied'}), 403
    
    item = Item.query.get(item_id)
    if not item:
        return jsonify({'message': 'Item not found'}), 404
    
    if request.method == 'DELETE':
        # Temporarily commented out for testing - allow deletion even with active bookings/damages
        # # Check for active bookings (pending or borrowed)
        # active_bookings = Booking.query.filter_by(item_id=item_id).filter(
        #     Booking.status.in_(['pending', 'borrowed'])
        # ).count()
        
        # if active_bookings > 0:
        #     return jsonify({'message': f'Cannot delete item with {active_bookings} active booking(s). Please resolve all bookings first.'}), 400
        
        # # Check for unresolved damage reports
        # unresolved_damage = Damage.query.filter_by(item_id=item_id, status='reported').count()
        
        # if unresolved_damage > 0:
        #     return jsonify({'message': f'Cannot delete item with {unresolved_damage} unresolved damage report(s). Please resolve all damage reports first.'}), 400
        
        # Delete associated completed bookings and resolved damage reports
        Booking.query.filter_by(item_id=item_id).delete()
        Damage.query.filter_by(item_id=item_id).delete()
        
        db.session.delete(item)
        db.session.commit()
        return jsonify({'message': 'Item deleted successfully'}), 200
    
    data = request.get_json()
    item.name = data.get('name', item.name)
    item.description = data.get('description', item.description)
    item.category = data.get('category', item.category)
    item.unique_id = data.get('unique_id', item.unique_id)
    item.quantity = data.get('quantity', item.quantity)
    item.available_quantity = min(item.available_quantity, item.quantity)
    
    db.session.commit()
    return jsonify({'message': 'Item updated successfully'}), 200

@app.route('/api/items/search', methods=['GET'])
@jwt_required()
def search_items():
    query = request.args.get('q', '')
    category = request.args.get('category', '')
    lab_id = request.args.get('lab_id', '')
    
    items_query = Item.query
    if query:
        items_query = items_query.filter(Item.name.contains(query))
    if category:
        items_query = items_query.filter_by(category=category)
    if lab_id:
        items_query = items_query.filter_by(lab_id=lab_id)
    
    items = items_query.all()
    result = []
    for item in items:
        result.append({
            'id': item.id,
            'name': item.name,
            'description': item.description,
            'category': item.category,
            'status': item.status,
            'unique_id': item.unique_id,
            'quantity': item.quantity,
            'available_quantity': item.available_quantity,
            'lab_id': item.lab_id,
            'health_score': item.health_score,
            'usage_count': item.usage_count,
            'last_maintenance_date': item.last_maintenance_date
        })
    return jsonify(result)

@app.route('/api/request-booking', methods=['POST'])
@jwt_required()
def request_booking():
    current_user = get_jwt_identity()
    user = User.query.filter_by(username=current_user).first()
    if user.role != 'student':
        return jsonify({'message': 'Access denied'}), 403
    data = request.get_json()
    item_id = data.get('itemId') or data.get('item_id')
    quantity = data.get('quantity', 1)
    booking_date_str = data.get('booking_date')
    time_slot = data.get('time_slot')
    item = Item.query.get(item_id)
    if not item or item.available_quantity < quantity:
        return jsonify({'message': 'Item not available or insufficient quantity'}), 400
    
    # Convert booking_date string to date object
    booking_date = None
    if booking_date_str:
        try:
            booking_date = datetime.strptime(booking_date_str, '%Y-%m-%d').date()
        except ValueError:
            return jsonify({'message': 'Invalid booking date format'}), 400
    
    booking = Booking(
        item_id=item_id, 
        user_id=user.id, 
        quantity_borrowed=quantity,
        booking_date=booking_date,
        time_slot=time_slot
    )
    db.session.add(booking)
    item.available_quantity -= quantity
    if item.available_quantity == 0:
        item.status = 'pending'
    db.session.commit()
    return jsonify({'message': 'Booking requested'}), 201

@app.route('/api/request-item', methods=['POST'])
@jwt_required()
def request_item():
    return request_booking()

@app.route('/api/report-damage', methods=['POST'])
@jwt_required()
def report_damage():
    current_user = get_jwt_identity()
    user = User.query.filter_by(username=current_user).first()
    data = request.get_json()
    item_id = data.get('item_id') or data.get('itemId')
    description = data.get('description', 'Reported damage')

    item = Item.query.get(item_id)
    if not item:
        return jsonify({'message': 'Item not found'}), 404

    damage = Damage(item_id=item_id, user_id=user.id, description=description)
    db.session.add(damage)

    # Mark item as damaged if it is currently available
    if item.status != 'damaged':
        item.status = 'damaged'
    db.session.commit()
    return jsonify({'message': 'Damage reported'}), 201

@app.route('/api/my-bookings', methods=['GET'])
@jwt_required()
def get_my_bookings():
    current_user = get_jwt_identity()
    user = User.query.filter_by(username=current_user).first()
    bookings = Booking.query.filter_by(user_id=user.id).all()
    result = []
    for b in bookings:
        result.append({
            'id': b.id,
            'item_name': b.item.name,
            'lab_name': b.item.lab.name,
            'status': b.status,
            'quantity': b.quantity_borrowed,
            'time_borrowed': b.time_borrowed.isoformat() if b.time_borrowed else None,
            'time_returned': b.time_returned.isoformat() if b.time_returned else None,
            'booking_date': b.booking_date.isoformat() if b.booking_date else None,
            'time_slot': b.time_slot
        })
    return jsonify(result)

@app.route('/api/return-item/<int:booking_id>', methods=['POST'])
@jwt_required()
def return_item(booking_id):
    current_user = get_jwt_identity()
    user = User.query.filter_by(username=current_user).first()
    booking = Booking.query.get(booking_id)
    if not booking or booking.user_id != user.id:
        return jsonify({'message': 'Booking not found'}), 404
    if booking.status != 'borrowed':
        return jsonify({'message': 'Booking is not currently borrowed'}), 400

    booking.status = 'returned'
    booking.time_returned = datetime.utcnow()
    item = booking.item
    
    # Decrease health score based on usage (1-3% per use)
    health_decrease = min(3, max(1, (100 - item.health_score) // 20 + 1))
    item.health_score = max(0, item.health_score - health_decrease)
    item.usage_count += booking.quantity_borrowed
    
    item.available_quantity = min(item.quantity, item.available_quantity + booking.quantity_borrowed)
    if item.available_quantity > 0 and item.status != 'damaged':
        item.status = 'available'
    db.session.commit()

    return jsonify({'message': 'Item returned successfully', 'health_score': item.health_score})

@app.route('/api/usage-logs', methods=['GET'])
@jwt_required()
def usage_logs():
    current_user = get_jwt_identity()
    user = User.query.filter_by(username=current_user).first()
    if user.role not in ['admin', 'teacher']:
        return jsonify({'message': 'Access denied'}), 403
    bookings = Booking.query.filter(Booking.status.in_(['borrowed', 'returned'])).all()
    result = []
    for b in bookings:
        result.append({
            'id': b.id,
            'item_name': b.item.name,
            'user': b.user.username,
            'quantity': b.quantity_borrowed,
            'time_borrowed': b.time_borrowed.isoformat() if b.time_borrowed else None,
            'time_returned': b.time_returned.isoformat() if b.time_returned else None,
            'status': b.status
        })
    return jsonify(result)

@app.route('/api/reports', methods=['GET'])
@jwt_required()
def get_reports():
    return usage_logs()

@app.route('/api/damage-reports', methods=['GET'])
@jwt_required()
def damage_reports():
    current_user = get_jwt_identity()
    user = User.query.filter_by(username=current_user).first()
    if user.role not in ['admin', 'teacher']:
        return jsonify({'message': 'Access denied'}), 403
    damages = Damage.query.all()
    result = []
    for d in damages:
        result.append({
            'id': d.id,
            'item_name': d.item.name,
            'user': d.user.username,
            'description': d.description,
            'status': d.status,
            'time_reported': d.time_reported.isoformat()
        })
    return jsonify(result)

@app.route('/api/pending-requests', methods=['GET'])
@jwt_required()
def pending_requests():
    current_user = get_jwt_identity()
    user = User.query.filter_by(username=current_user).first()
    if user.role != 'admin':
        return jsonify({'message': 'Access denied'}), 403
    bookings = Booking.query.filter_by(status='pending').all()
    result = []
    for b in bookings:
        result.append({
            'id': b.id,
            'item_name': b.item.name,
            'student': b.user.username,
            'lab': b.item.lab.name,
            'time_requested': b.time_requested.isoformat(),
            'booking_date': b.booking_date.isoformat() if b.booking_date else None,
            'time_slot': b.time_slot
        })
    return jsonify(result)

@app.route('/api/admin/approve-request', methods=['POST'])
@jwt_required()
def approve_request():
    current_user = get_jwt_identity()
    user = User.query.filter_by(username=current_user).first()
    if user.role != 'admin':
        return jsonify({'message': 'Access denied'}), 403
    data = request.get_json()
    booking_id = data.get('booking_id')
    booking = Booking.query.get(booking_id)
    if not booking or booking.status != 'pending':
        return jsonify({'message': 'Invalid booking'}), 400
    booking.status = 'borrowed'
    booking.time_borrowed = datetime.utcnow()
    # Item status remains, but available_quantity is already reduced
    db.session.commit()
    return jsonify({'message': 'Booking approved'})

@app.route('/api/deny-request', methods=['POST'])
@jwt_required()
def deny_request():
    current_user = get_jwt_identity()
    user = User.query.filter_by(username=current_user).first()
    if user.role != 'admin':
        return jsonify({'message': 'Access denied'}), 403
    data = request.get_json()
    booking_id = data.get('booking_id')
    booking = Booking.query.get(booking_id)
    if not booking or booking.status != 'pending':
        return jsonify({'message': 'Invalid booking'}), 400
    booking.status = 'denied'
    # Restore available quantity
    booking.item.available_quantity += booking.quantity_borrowed
    if booking.item.available_quantity > 0:
        booking.item.status = 'available'
    db.session.commit()
    return jsonify({'message': 'Booking denied'})

@app.route('/api/return-item', methods=['POST'])
@jwt_required()
def return_item_endpoint():
    data = request.get_json()
    booking_id = data.get('booking_id')
    return return_item(booking_id)

@app.route('/api/return-item/<int:booking_id>', methods=['POST'])
@jwt_required()
def return_item_by_id(booking_id):
    return return_item(booking_id)

@app.route('/api/analytics/most-borrowed', methods=['GET'])
@jwt_required()
def most_borrowed():
    current_user = get_jwt_identity()
    user = User.query.filter_by(username=current_user).first()
    if user.role not in ['admin', 'teacher']:
        return jsonify({'message': 'Access denied'}), 403
    
    from sqlalchemy import func
    result = db.session.query(
        Item.name,
        func.count(Booking.id).label('borrow_count')
    ).join(Booking).filter(Booking.status.in_(['borrowed', 'returned'])).group_by(Item.id).order_by(func.count(Booking.id).desc()).limit(10).all()
    
    return jsonify([{'name': r[0], 'count': r[1]} for r in result])

@app.route('/api/analytics/booking-frequency', methods=['GET'])
@jwt_required()
def booking_frequency():
    current_user = get_jwt_identity()
    user = User.query.filter_by(username=current_user).first()
    if user.role not in ['admin', 'teacher']:
        return jsonify({'message': 'Access denied'}), 403
    
    from sqlalchemy import func, extract
    result = db.session.query(
        extract('month', Booking.time_requested).label('month'),
        func.count(Booking.id).label('count')
    ).filter(Booking.status.in_(['borrowed', 'returned'])).group_by(extract('month', Booking.time_requested)).all()
    
    return jsonify([{'month': int(r[0]), 'count': r[1]} for r in result])

@app.route('/api/analytics/total-inventory', methods=['GET'])
@jwt_required()
def total_inventory():
    current_user = get_jwt_identity()
    user = User.query.filter_by(username=current_user).first()
    if user.role not in ['admin', 'teacher']:
        return jsonify({'message': 'Access denied'}), 403
    
    total = Item.query.count()
    available = Item.query.filter_by(status='available').count()
    borrowed = Booking.query.filter_by(status='borrowed').count()
    damaged = Item.query.filter_by(status='damaged').count()
    
    return jsonify({
        'total': total,
        'available': available,
        'borrowed': borrowed,
        'damaged': damaged
    })

@app.route('/api/items/<int:item_id>/health', methods=['GET'])
@jwt_required()
def get_item_health(item_id):
    item = Item.query.get(item_id)
    if not item:
        return jsonify({'message': 'Item not found'}), 404
    
    return jsonify({
        'id': item.id,
        'name': item.name,
        'health_score': item.health_score,
        'usage_count': item.usage_count,
        'last_maintenance_date': item.last_maintenance_date.isoformat() if item.last_maintenance_date else None,
        'status': 'warning' if item.health_score < 70 else 'good'
    })

@app.route('/api/items/health', methods=['GET'])
@jwt_required()
def get_all_items_health():
    current_user = get_jwt_identity()
    user = User.query.filter_by(username=current_user).first()
    if user.role != 'admin':
        return jsonify({'message': 'Access denied'}), 403
    
    items = Item.query.all()
    result = []
    for item in items:
        result.append({
            'id': item.id,
            'name': item.name,
            'health_score': item.health_score,
            'usage_count': item.usage_count,
            'last_maintenance_date': item.last_maintenance_date.isoformat() if item.last_maintenance_date else None,
            'status': 'warning' if item.health_score < 70 else 'good',
            'lab_id': item.lab_id
        })
    return jsonify(result)

@app.route('/api/items/<int:item_id>/return-item', methods=['POST'])
@jwt_required()
def return_item_with_health(item_id):
    current_user = get_jwt_identity()
    user = User.query.filter_by(username=current_user).first()
    data = request.get_json()
    booking_id = data.get('booking_id')
    booking = Booking.query.get(booking_id)
    if not booking or booking.user_id != user.id:
        return jsonify({'message': 'Booking not found'}), 404
    if booking.status != 'borrowed':
        return jsonify({'message': 'Booking is not currently borrowed'}), 400

    booking.status = 'returned'
    booking.time_returned = datetime.utcnow()
    item = booking.item
    
    # Decrease health score based on usage (1-3% per use)
    health_decrease = min(3, max(1, (100 - item.health_score) // 20 + 1))
    item.health_score = max(0, item.health_score - health_decrease)
    item.usage_count += booking.quantity_borrowed
    
    item.available_quantity = min(item.quantity, item.available_quantity + booking.quantity_borrowed)
    if item.available_quantity > 0 and item.status != 'damaged':
        item.status = 'available'
    db.session.commit()

    return jsonify({'message': 'Item returned successfully', 'health_score': item.health_score})

@app.route('/api/items/<int:item_id>/maintenance', methods=['POST'])
@jwt_required()
def perform_maintenance(item_id):
    current_user = get_jwt_identity()
    user = User.query.filter_by(username=current_user).first()
    if user.role != 'admin':
        return jsonify({'message': 'Access denied'}), 403
    
    item = Item.query.get(item_id)
    if not item:
        return jsonify({'message': 'Item not found'}), 404
    
    data = request.get_json()
    description = data.get('description', 'General maintenance performed')
    
    # Create maintenance record
    maintenance = Maintenance(
        item_id=item_id,
        performed_by=current_user,
        description=description
    )
    db.session.add(maintenance)
    
    # Reset health score to 100
    item.health_score = 100
    item.last_maintenance_date = datetime.utcnow()
    item.status = 'available'
    db.session.commit()
    
    return jsonify({
        'message': 'Maintenance completed successfully',
        'health_score': item.health_score,
        'last_maintenance_date': item.last_maintenance_date.isoformat()
    })

@app.route('/api/items/<int:item_id>/maintenance-history', methods=['GET'])
@jwt_required()
def get_maintenance_history(item_id):
    current_user = get_jwt_identity()
    user = User.query.filter_by(username=current_user).first()
    if user.role != 'admin':
        return jsonify({'message': 'Access denied'}), 403
    
    item = Item.query.get(item_id)
    if not item:
        return jsonify({'message': 'Item not found'}), 404
    
    records = Maintenance.query.filter_by(item_id=item_id).order_by(Maintenance.time_performed.desc()).all()
    result = []
    for record in records:
        result.append({
            'id': record.id,
            'performed_by': record.performed_by,
            'description': record.description,
            'time_performed': record.time_performed.isoformat()
        })
    return jsonify(result)

@app.route('/api/equipment/<int:equipment_id>', methods=['GET'])
@jwt_required()
def get_equipment_details(equipment_id):
    """Get equipment details by ID for QR code scanning"""
    item = Item.query.get(equipment_id)
    if not item:
        return jsonify({'message': 'Equipment not found'}), 404
    
    return jsonify({
        'id': item.id,
        'name': item.name,
        'description': item.description,
        'category': item.category,
        'status': item.status,
        'unique_id': item.unique_id,
        'quantity': item.quantity,
        'available_quantity': item.available_quantity,
        'lab_id': item.lab_id,
        'lab_name': item.lab.name,
        'health_score': item.health_score,
        'usage_count': item.usage_count,
        'last_maintenance_date': item.last_maintenance_date.isoformat() if item.last_maintenance_date else None
    })

@app.route('/api/request-equipment', methods=['POST'])
@jwt_required()
def request_equipment():
    """Request equipment using equipment_id (from QR scan)"""
    current_user = get_jwt_identity()
    user = User.query.filter_by(username=current_user).first()
    if user.role != 'student':
        return jsonify({'message': 'Access denied'}), 403
    
    data = request.get_json()
    equipment_id = data.get('equipment_id')
    quantity = data.get('quantity', 1)
    booking_date_str = data.get('booking_date')
    time_slot = data.get('time_slot')
    
    item = Item.query.get(equipment_id)
    if not item:
        return jsonify({'message': 'Equipment not found'}), 404
    
    if item.available_quantity < quantity:
        return jsonify({'message': 'Equipment not available or insufficient quantity'}), 400
    
    # Convert booking_date string to date object
    booking_date = None
    if booking_date_str:
        try:
            booking_date = datetime.strptime(booking_date_str, '%Y-%m-%d').date()
        except ValueError:
            return jsonify({'message': 'Invalid booking date format'}), 400
    
    booking = Booking(
        item_id=item.id, 
        user_id=user.id, 
        quantity_borrowed=quantity,
        booking_date=booking_date,
        time_slot=time_slot
    )
    db.session.add(booking)
    item.available_quantity -= quantity
    if item.available_quantity == 0:
        item.status = 'pending'
    db.session.commit()
    
    return jsonify({
        'message': 'Equipment request sent successfully',
        'booking_id': booking.id
    }), 201

@app.route('/api/equipment-demand', methods=['GET'])
@jwt_required()
def get_equipment_demand():
    """Calculate equipment demand based on booking patterns"""
    current_user = get_jwt_identity()
    user = User.query.filter_by(username=current_user).first()
    if user.role != 'admin':
        return jsonify({'message': 'Access denied'}), 403
    
    # Count bookings per item
    from sqlalchemy import func
    booking_counts = db.session.query(
        Item.id,
        Item.name,
        Item.category,
        func.count(Booking.id).label('booking_count')
    ).outerjoin(Booking).group_by(Item.id, Item.name, Item.category).all()
    
    # Sort by booking count descending
    demand_data = []
    for item_id, name, category, count in booking_counts:
        demand_data.append({
            'id': item_id,
            'name': name,
            'category': category,
            'demand_score': count,
            'status': 'High Demand' if count >= 5 else 'Medium Demand' if count >= 2 else 'Low Demand'
        })
    
    demand_data.sort(key=lambda x: x['demand_score'], reverse=True)
    
    # Add simple predictions based on trends
    result = {
        'top_demanded': demand_data[:10],
        'total_bookings': sum(item['demand_score'] for item in demand_data),
        'average_demand': round(sum(item['demand_score'] for item in demand_data) / len(demand_data), 2) if demand_data else 0,
        'predictions': []
    }
    
    # Simple prediction: if demand is high, predict increase next month
    for item in demand_data[:5]:
        if item['demand_score'] >= 5:
            result['predictions'].append({
                'item_name': item['name'],
                'prediction': f"{item['name']} demand expected to increase next month - consider maintaining higher stock levels.",
                'confidence': 'High' if item['demand_score'] >= 10 else 'Medium'
            })
        elif item['demand_score'] >= 2:
            result['predictions'].append({
                'item_name': item['name'],
                'prediction': f"{item['name']} shows steady demand - stable stock levels recommended.",
                'confidence': 'Medium'
            })
    
    return jsonify(result)

@app.route('/api/dashboard-stats', methods=['GET'])
@jwt_required()
def get_dashboard_stats():
    """Get comprehensive lab statistics for dashboard"""
    from sqlalchemy import func
    
    # Total equipment and status breakdown
    total_items = Item.query.count()
    available_items = Item.query.filter_by(status='available').count()
    borrowed_items = Item.query.filter_by(status='borrowed').count()
    maintenance_items = Item.query.filter_by(status='maintenance').count()
    damaged_items = Item.query.filter_by(status='damaged').count()
    
    # Top requested equipment
    top_requested = db.session.query(
        Item.id,
        Item.name,
        func.count(Booking.id).label('request_count')
    ).outerjoin(Booking).group_by(Item.id, Item.name).order_by(func.count(Booking.id).desc()).limit(5).all()
    
    top_requested_data = [
        {
            'id': item_id,
            'name': name,
            'requests': count,
            'percentage': round((count / max(1, max([c[2] for c in top_requested]))) * 100) if top_requested else 0
        }
        for item_id, name, count in top_requested
    ]
    
    # Damage reports
    pending_damage = Damage.query.filter_by(status='reported').count()
    resolved_damage = Damage.query.filter_by(status='resolved').count()
    
    # Health alerts - items below 70%
    low_health_items = Item.query.filter(Item.health_score < 70).all()
    health_alerts = []
    for item in low_health_items:
        health_alerts.append({
            'id': item.id,
            'name': item.name,
            'health_score': item.health_score,
            'status': 'Critical' if item.health_score < 50 else 'Warning'
        })
    
    # Sort by health score
    health_alerts.sort(key=lambda x: x['health_score'])
    
    return jsonify({
        'equipment_stats': {
            'total': total_items,
            'available': available_items,
            'borrowed': borrowed_items,
            'maintenance': maintenance_items,
            'damaged': damaged_items
        },
        'top_requested': top_requested_data,
        'damage_stats': {
            'pending': pending_damage,
            'resolved': resolved_damage,
            'total': pending_damage + resolved_damage
        },
        'health_alerts': health_alerts[:5]  # Top 5 low health items
    })

# Serve React App
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve_react_app(path):
    if path != "" and os.path.exists(os.path.join(app.static_folder, path)):
        return send_from_directory(app.static_folder, path)
    else:
        return send_from_directory(app.static_folder, 'index.html')

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
        # Auto-seed database on startup (for deployment)
        try:
            from seed import seed_database
            seed_database()
        except Exception as e:
            print(f"Seed failed: {e}")
            print("Continuing without seeding...")
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=os.environ.get('FLASK_ENV') == 'development')
