from app import app, db
from models import Lab, User, Item, Booking
from werkzeug.security import generate_password_hash
from datetime import datetime

with app.app_context():
    db.drop_all()  # Drop all tables to recreate with new schema
    db.create_all()

    # Create labs
    if not Lab.query.filter_by(name='Physics').first():
        physics = Lab(name='Physics')
        db.session.add(physics)

    if not Lab.query.filter_by(name='Chemistry').first():
        chemistry = Lab(name='Chemistry')
        db.session.add(chemistry)

    if not Lab.query.filter_by(name='Biology').first():
        biology = Lab(name='Biology')
        db.session.add(biology)

    if not Lab.query.filter_by(name='Computer Science').first():
        cs = Lab(name='Computer Science')
        db.session.add(cs)

    db.session.commit()  # Commit labs first

    physics = Lab.query.filter_by(name='Physics').first()
    chemistry = Lab.query.filter_by(name='Chemistry').first()
    biology = Lab.query.filter_by(name='Biology').first()
    cs = Lab.query.filter_by(name='Computer Science').first()

    # Create users
    if not User.query.filter_by(username='admin').first():
        admin = User(username='admin', password=generate_password_hash('admin123'), role='admin')
        db.session.add(admin)

    if not User.query.filter_by(username='student').first():
        student = User(username='student', password=generate_password_hash('student123'), role='student')
        db.session.add(student)

    if not User.query.filter_by(username='teacher').first():
        teacher = User(username='teacher', password=generate_password_hash('teacher123'), role='teacher')
        db.session.add(teacher)

    # Create items
    if not Item.query.filter_by(unique_id='item1').first():
        item1 = Item(name='Microscope', description='High-powered microscope', category='Equipment', unique_id='item1', lab_id=physics.id, quantity=5, available_quantity=5)
        db.session.add(item1)

    if not Item.query.filter_by(unique_id='item2').first():
        item2 = Item(name='Bunsen Burner', description='Gas burner for heating', category='Apparatus', unique_id='item2', lab_id=chemistry.id, quantity=10, available_quantity=10)
        db.session.add(item2)

    if not Item.query.filter_by(unique_id='item3').first():
        item3 = Item(name='Dissection Kit', description='Tools for biology dissection', category='Tools', unique_id='item3', lab_id=biology.id, quantity=7, available_quantity=7)
        db.session.add(item3)

    if not Item.query.filter_by(unique_id='item4').first():
        item4 = Item(name='Raspberry Pi Kit', description='Electronics kit for programming', category='Electronics', unique_id='item4', lab_id=cs.id, quantity=8, available_quantity=8)
        db.session.add(item4)

    # Add a test item that won't have bookings for testing delete functionality
    if not Item.query.filter_by(unique_id='test-item').first():
        test_item = Item(name='Test Item', description='Item for testing delete functionality', category='General', unique_id='test-item', lab_id=physics.id, quantity=1, available_quantity=1)
        db.session.add(test_item)

    db.session.commit()

    # Create comprehensive sample bookings for realistic analytics
    from datetime import timedelta
    import random

    student = User.query.filter_by(username='student').first()
    teacher = User.query.filter_by(username='teacher').first()

    # Get all items
    items = Item.query.all()

    # Create multiple bookings over the past 30 days
    bookings_data = []

    # High-demand items get more bookings
    high_demand_items = [item for item in items if item.name in ['Microscope', 'Bunsen Burner']]
    medium_demand_items = [item for item in items if item.name in ['Dissection Kit', 'Raspberry Pi Kit']]

    # Create 50+ bookings for realistic analytics
    for i in range(60):
        # Randomly select item with weighted probability
        if random.random() < 0.4:  # 40% chance for high-demand items
            item = random.choice(high_demand_items)
        elif random.random() < 0.7:  # 30% chance for medium-demand items
            item = random.choice(medium_demand_items)
        else:  # 30% chance for any item
            item = random.choice(items)

        # Random user (student or teacher)
        user = random.choice([student, teacher])

        # Random time in the past 30 days
        days_ago = random.randint(0, 30)
        borrow_time = datetime.utcnow() - timedelta(days=days_ago, hours=random.randint(0, 23))

        # 70% chance of being returned, 30% still borrowed
        if random.random() < 0.7:
            status = 'returned'
            return_time = borrow_time + timedelta(hours=random.randint(1, 8))
        else:
            status = 'borrowed'
            return_time = None

        # Random quantity (1-3 items)
        quantity = random.randint(1, min(3, item.available_quantity))

        booking = Booking(
            item_id=item.id,
            user_id=user.id,
            status=status,
            time_borrowed=borrow_time,
            time_returned=return_time,
            quantity_borrowed=quantity
        )
        bookings_data.append(booking)

    # Add all bookings to database
    for booking in bookings_data:
        db.session.add(booking)

    # Create some damage reports for variety
    from models import Damage
    microscope = Item.query.filter_by(name='Microscope').first()
    bunsen = Item.query.filter_by(name='Bunsen Burner').first()

    if microscope:
        damage1 = Damage(
            item_id=microscope.id,
            user_id=student.id,
            description="Lens cracked during use",
            status="reported",
            time_reported=datetime.utcnow() - timedelta(days=2)
        )
        db.session.add(damage1)

    if bunsen:
        damage2 = Damage(
            item_id=bunsen.id,
            user_id=teacher.id,
            description="Gas valve malfunctioning",
            status="resolved",
            time_reported=datetime.utcnow() - timedelta(days=5)
        )
        db.session.add(damage2)

    # Update item health scores based on usage
    for item in items:
        # Calculate health based on booking frequency and damage reports
        booking_count = len([b for b in bookings_data if b.item_id == item.id])
        damage_count = Damage.query.filter_by(item_id=item.id).count()

        # Health decreases with more bookings and damage
        base_health = 100
        health_reduction = (booking_count * 2) + (damage_count * 15)
        item.health_score = max(20, base_health - health_reduction)  # Minimum 20% health

    db.session.commit()
    print(f"Database seeded with {len(bookings_data)} bookings and sample damage reports!")