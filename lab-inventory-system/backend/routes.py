from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, Booking, User, Damage
from datetime import datetime

admin_bp = Blueprint('admin', __name__)

@admin_bp.route('/pending-bookings', methods=['GET'])
@jwt_required()
def get_pending_bookings():
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
            'user': b.user.username,
            'time_requested': b.time_requested.isoformat(),
            'booking_date': b.booking_date.isoformat() if b.booking_date else None,
            'time_slot': b.time_slot
        })
    return jsonify(result)

@admin_bp.route('/approve-booking/<int:booking_id>', methods=['POST'])
@jwt_required()
def approve_booking(booking_id):
    current_user = get_jwt_identity()
    user = User.query.filter_by(username=current_user).first()
    if user.role != 'admin':
        return jsonify({'message': 'Access denied'}), 403
    
    booking = Booking.query.get(booking_id)
    if not booking or booking.status != 'pending':
        return jsonify({'message': 'Invalid booking'}), 400
    
    booking.status = 'borrowed'
    booking.time_borrowed = datetime.utcnow()
    db.session.commit()
    return jsonify({'message': 'Booking approved'})

@admin_bp.route('/deny-booking/<int:booking_id>', methods=['POST'])
@jwt_required()
def deny_booking(booking_id):
    current_user = get_jwt_identity()
    user = User.query.filter_by(username=current_user).first()
    if user.role != 'admin':
        return jsonify({'message': 'Access denied'}), 403
    
    booking = Booking.query.get(booking_id)
    if not booking or booking.status != 'pending':
        return jsonify({'message': 'Invalid booking'}), 400
    
    booking.status = 'denied'
    db.session.commit()
    return jsonify({'message': 'Booking denied'})

@admin_bp.route('/resolve-damage/<int:id>', methods=['POST'])
@jwt_required()
def resolve_damage(id):
    current_user = get_jwt_identity()
    user = User.query.filter_by(username=current_user).first()
    if user.role != 'admin':
        return jsonify({'message': 'Access denied'}), 403
    
    damage = Damage.query.get(id)
    if not damage:
        return jsonify({'message': 'Damage report not found'}), 404
    
    damage.status = 'resolved'
    # Optionally update item status back to available if it was damaged
    if damage.item.status == 'damaged':
        damage.item.status = 'available'
    db.session.commit()
    return jsonify({'message': 'Damage report resolved'})