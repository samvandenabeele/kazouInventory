from flask import request, session, jsonify
from datetime import date
from models import Item, Transaction, User
from flask_cors import cross_origin
from flask import send_from_directory
from functools import wraps
from sqlalchemy.exc import SQLAlchemyError
import os

def register_routes(app, db, bcrypt):
    def login_required(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            if 'user_id' not in session:
                app.logger.info(f"Unauthorized login request - request from {request.remote_addr}")
                return {'error': 'Authentication required'}, 401
            return f(*args, **kwargs)
        return decorated_function
    
    @app.errorhandler(SQLAlchemyError)
    def handle_sqlalchemy_error(e):
        app.logger.exception("Database error: %s", e)  # logs stack trace
        return {"error": "Internal database error"}, 500
    
    @app.route('/', defaults={'filename': 'index.html'})
    @app.route('/<path:filename>')
    def serve_static(filename):
        static_folder = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'www')
        return send_from_directory(static_folder, filename)

    @app.route('/login', methods=['POST', 'OPTIONS'])
    @cross_origin(supports_credentials=True)
    def login():
        if request.method == 'OPTIONS':
            return '', 200
        
        app.logger.info(f"Login attempt - Request from {request.remote_addr}")
        app.logger.info(f"Request headers: {dict(request.headers)}")
        
        data = request.get_json()
        app.logger.info(f"Login request data: {data}")
        
        username = data.get('username')
        password = data.get('password')
        
        if not username or not password:
            app.logger.warning("Login failed: Missing username or password")
            return {'error': 'Username and password required'}, 400
        
        user = User.query.filter_by(username=username).first()
        if not user:
            app.logger.warning(f"Login failed: User '{username}' not found")
            return {'error': 'Invalid username or password'}, 401
            
        if not bcrypt.check_password_hash(user.password, password):
            app.logger.warning(f"Login failed: Invalid password for user '{username}'")
            return {'error': 'Invalid username or password'}, 401
        
        session['user_id'] = user.uid
        session.permanent = True
        app.logger.info(f"Login successful for user '{username}'")

        return {'message': 'Login successful'}, 200
    
    @app.route('/signup', methods=['POST', 'OPTIONS'])
    @cross_origin(supports_credentials=True)
    def signup():
        if request.method == 'OPTIONS':
            return '', 200
            
        try:
            data = request.get_json()
            username = data.get('username')
            password = data.get('password')
            email = data.get('email')

            if not username or not password:
                return {'error': 'Username and password required'}, 400

            # Check if username already exists
            if User.query.filter_by(username=username).first():
                return {'error': 'Username already exists'}, 400

            hashed_pw = bcrypt.generate_password_hash(password).decode('utf-8')
            new_user = User(username=username, password=hashed_pw, email=email)
            db.session.add(new_user)
            db.session.commit()

            session['user_id'] = new_user.uid
            session.permanent = True
                
            return {'message': 'User registered successfully'}, 201
        except Exception as e:
            app.logger.error(f"Error during signup: {str(e)}")
            return {'error': 'Internal server error'}, 500
    
    @app.route('/logout', methods=['POST'])
    @cross_origin(supports_credentials=True)
    def logout():
        session.clear()
        return {'message': 'Logged out successfully'}, 200

    @app.route('/api/add_item', methods=['POST'])
    @cross_origin(supports_credentials=True)
    @login_required
    def add_item():
        data = request.get_json()

        description = data['description']

        if not description:
            return {'error': 'no description provided'}, 400
        elif Item.query.filter_by(description=description).first():
            return {'error': 'Item already exists'}, 400

        item = Item(description=description)
        db.session.add(item)
        db.session.commit()

        loggermessage = f'Added new item - {description}'

        app.logger.info(loggermessage)

        return {'message': 'Item added succesfully'}, 200
            
    @app.route('/api/transaction/<transaction_type>', methods=['POST'])
    @cross_origin(supports_credentials=True)
    @login_required
    def add_transaction(transaction_type):
        if not transaction_type in ['borrow', 'return', 'purchase', 'dispose']:
            return {'error', 'Invalid transaction type. Valid types are: borrow, return, purchase, dispose'}, 400

        data = request.get_json()

        item_description = data.get('item_description')
        quantity = data.get('quantity')

        if not item_description or not quantity:
            return {"error": "Description and quantity are required"}, 400

        item = Item.query.filter_by(description=item_description.lower()).first()

        if not item:
            return {"error", "No such item found"}, 400

        transaction = Transaction(iid=item.iid, uid=session['user_id'], transaction_type=transaction_type, quantity=quantity)
        db.session.add(transaction)
        db.session.commit()

        return {'message': 'transaction added succesfully'}, 200

    @app.route('/api/get_inventory', methods=['GET'])
    @cross_origin(supports_credentials=True)
    @login_required
    def get_inventory():
        items = Item.query.all()

        inventory = []
        for item in items:
            loans = Transaction.query.filter_by(transaction_type='borrow', iid=item.iid).all()
            returns = Transaction.query.filter_by(transaction_type='return', iid=item.iid).all()
            purchases = Transaction.query.filter_by(transaction_type='purchase', iid=item.iid).all()
            disposes = Transaction.query.filter_by(transaction_type='dispose', iid=item.iid).all()

            loaned = sum(loan.quantity for loan in loans)
            returned = sum(Return.quantity for Return in returns)
            purchased = sum(purchase.quantity for purchase in purchases)
            disposed = sum(disposed.quantity for disposed in disposes)

            quantity = purchased - disposed
            loaned = loaned - returned
            
            inventory.append({
                "description": item.description,
                "quantity": quantity,
                "loaned": loaned
            })

        inventory.sort(key=lambda x: x["description"].lower())

        return {"inventory": inventory, "count": len(inventory)}, 200

    @app.route('/api/item/<item_description>', methods=['GET'])
    @cross_origin(supports_credentials=True)
    @login_required
    def get_item(item_description):
        item = Item.query.filter_by(description=item_description).first()

        if not item:
            return {'error': 'No such item'}, 400

        transactions = Transaction.query.filter_by(iid=item.iid).all()

        transaction_list = []
        for transaction in transactions:
            transaction_list.append({
                'id': transaction.tid,
                'transaction_type': transaction.transaction_type,
                'quantity': transaction.quantity,
                'date': transaction.date,
            })

        return {'transaction_list': transaction_list}, 200
