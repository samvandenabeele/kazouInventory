from flask import request, session
from datetime import date
from models import Item, Box, Content, ItemUse, User
from flask_cors import cross_origin
from flask import send_from_directory
from flask_bcrypt import Bcrypt
from functools import wraps
import os

def register_routes(app, db):
    def login_required(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            if 'user_id' not in session:
                return {'error': 'Authentication required'}, 401
            return f(*args, **kwargs)
        return decorated_function
    
    @app.route('/', defaults={'filename': 'index.html'})
    @app.route('/<path:filename>')
    def serve_static(filename):
        static_folder = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'www')
        return send_from_directory(static_folder, filename)

    @cross_origin
    @app.route('/login', methods=['POST'])
    def login():
        data = request.get_json()
        username = data.get('username')
        password = data.get('password')
        
        user = User.query.filter_by(username=username).first()
        if not user or not Bcrypt.check_password_hash(user.password, password):
            return {'error': 'Invalid username or password'}, 401
        
        session['user_id'] = user.id
        session.permanent = True

        return {'error': 'Invalid username or password'}, 401
    
    @cross_origin
    @app.route('/signup', methods=['POST'])
    def signup():
        data = request.get_json()
        username = data.get('username')
        password = data.get('password')
        email = data.get('email')

        if not username or not password:
            return {'error': 'Username and password required'}, 400

        # Check if username already exists
        if User.query.filter_by(username=username).first():
            return {'error': 'Username already exists'}, 400

        hashed_pw = Bcrypt.generate_password_hash(password).decode('utf-8')
        new_user = User(username=username, password_hash=hashed_pw, email=email)
        db.session.add(new_user)
        db.session.commit()
            
        return {'message': 'User registered successfully'}, 201
    
    @cross_origin
    @app.route('/logout')
    def logout():
        session.clear()
        return {'message': 'Logged out successfully'}, 200
            
    @login_required
    @cross_origin
    @app.route('/api/add_item', methods=['POST'])
    def add_item():
        data = request.get_json()

        description = data.get('description')
        quantity = data.get('quantity')

        item = Item()
        item.description = description.lower()
        item.quantity = int(quantity)
        db.session.add(item)
        db.session.commit()
        return {"message": "Item added successfully"}, 201

    @login_required
    @cross_origin
    @app.route('/api/add_item_loan', methods=['POST'])
    def add_item_loan():
        data = request.get_json()
        item = Item.query.filter_by(description=data['description']).first()
        iid = item.iid
        itemLoan = ItemUse(iid=iid, quantity=int(data['quantity']))

        db.session.add(itemLoan)
        db.session.commit()
        return {'message': 'Loan added succesfully'}, 201
    
    @login_required
    @cross_origin
    @app.route('/api/end_item_loan', methods=['POST'])
    def end_item_loan():
        data = request.get_json()
        item = Item.query.filter_by(description=data['description']).first()
        iid = item.iid
        loan = ItemUse.query.filter_by(iid=iid, end_date=None).first()
        loan.end_date = date.today()
        
        return {'message': 'loan ended succesfully'}, 201
        
    @login_required
    @cross_origin
    @app.route('/api/get_inventory', methods=['GET'])
    def get_inventory():
        # mock_inventory = [
        #     {"description": "Tent", "quantity": 10, "loaned": 2},
        #     {"description": "Sleeping Bag", "quantity": 20, "loaned": 5},
        #     {"description": "Camping Stove", "quantity": 8, "loaned": 1},
        #     {"description": "Lantern", "quantity": 15, "loaned": 3},
        #     {"description": "First Aid Kit", "quantity": 12, "loaned": 0},
        #     {"description": "Water Bottle", "quantity": 30, "loaned": 10},
        #     {"description": "Backpack", "quantity": 18, "loaned": 4},
        #     {"description": "Raincoat", "quantity": 25, "loaned": 7},
        #     {"description": "Map", "quantity": 14, "loaned": 2},
        #     {"description": "Compass", "quantity": 16, "loaned": 1},
        #     {"description": "Flashlight", "quantity": 22, "loaned": 6},
        #     {"description": "Cooking Pot", "quantity": 9, "loaned": 2},
        #     {"description": "Rope", "quantity": 13, "loaned": 3},
        #     {"description": "Gloves", "quantity": 17, "loaned": 5},
        #     {"description": "Hat", "quantity": 21, "loaned": 8},
        # ]

        items = Item.query.all()
        loans = ItemUse.query.filter_by(end_date=None).all()

        inventory = []
        for item in items:
            loaned = sum(1 for loan in loans if loan.iid == item.iid)
            inventory.append({
                "description": item.description,
                "quantity": item.quantity,
                "loaned": loaned
            })

        inventory.sort(key=lambda x: x["description"].lower())

        return {"inventory": inventory, "count": len(inventory)}, 200
    
    @login_required
    @app.route("/api/add_box", methods=['POST'])
    def add_box():
        data = request.get_json()
        box = Box(description=data['description'], barcode=data['barcode'])
        db.session.add(box)
        db.session.commit()
        return {"message": "Box added successfully"}, 201
    
    @login_required
    @app.route('/api/edit/add_content', methods=['POST'])
    def edit_box():
        data = request.get_json()
        content = Content(bid=data['bid'], description=data['description'].lower(), quantity=data['quantity'])
        
        if data['iid']:
            itemUse = ItemUse(iid=data['iid'])
        
        db.session.add(content)
        db.session.add(itemUse)
        db.session.commit()
        
        
        return {"message": f"Content {data['description']} added succesfully to box {data['bid']}."}, 201
    
    @login_required
    @app.route('/api/edit/remove_content', methods=['POST'])
    def remove_content():
        data = request.get_json()
        content_id = data.get('id')

        content = Content.query.get(content_id)

        content.date_deleted = date.today()
        db.session.commit()
        return {"message": f"Content {content_id} marked as deleted."}, 200
    
    @login_required
    @app.route('/api/get_box_content', methods=['GET'])
    def get_box_content():
        data = request.get_json()
        bid = data['bid']
        
        contents = Content.query.filter_by(bid=bid, date_deleted=None).all()
        return {"contents": [c.serialize() for c in contents], "quantity": len(contents)}, 200
        
    @login_required
    @app.route('/api/edit/item', methods=['POST'])
    def edit_item():
        pass
    
    @login_required
    @app.route('/api/delete_data', methods=['DELETE'])
    def delete_data():
        pass