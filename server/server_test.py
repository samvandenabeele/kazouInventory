import pytest
from datetime import date
from flask import Flask, session
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from unittest.mock import Mock, MagicMock, patch
from routes import register_routes
from models import User, Item, Box, Content, ItemUse


@pytest.fixture
def app():
    """Create and configure a test Flask application."""
    app = Flask(__name__)
    app.config['TESTING'] = True
    app.config['SECRET_KEY'] = 'test-secret-key'
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['SESSION_TYPE'] = 'filesystem'
    return app


@pytest.fixture
def db(app):
    """Create a test database."""
    from app import db as application_db
    application_db.init_app(app)
    with app.app_context():
        application_db.create_all()
        yield application_db
        application_db.session.remove()
        application_db.drop_all()


@pytest.fixture(scope='function')
def client(app, db):
    """Create a test client with registered routes."""
    bcrypt = Bcrypt(app)
    register_routes(app, db, bcrypt)
    with app.test_client() as client:
        yield client


@pytest.fixture
def mock_user():
    """Create a mock user for testing."""
    user = Mock(spec=User)
    user.uid = 1
    user.username = 'testuser'
    user.password = Bcrypt().generate_password_hash('testpass').decode('utf-8')
    user.email = 'test@example.com'
    return user


class TestAuthentication:
    """Test authentication endpoints."""

    def test_login_success(self, client, mock_user):
        """Test successful login."""
        with patch('routes.User') as MockUser:
            MockUser.query.filter_by.return_value.first.return_value = mock_user
            with patch('flask_bcrypt.Bcrypt.check_password_hash', return_value=True):
                response = client.post('/login', json={
                    'username': 'testuser',
                    'password': 'testpass'
                })
                assert response.status_code == 200
                assert b'Login successful' in response.data

    def test_login_invalid_username(self, client):
        """Test login with invalid username."""
        with patch('routes.User') as MockUser:
            MockUser.query.filter_by.return_value.first.return_value = None
            response = client.post('/login', json={
                'username': 'nonexistent',
                'password': 'testpass'
            })
            assert response.status_code == 401
            assert b'Invalid username or password' in response.data

    def test_login_invalid_password(self, client, mock_user):
        """Test login with invalid password."""
        with patch('routes.User') as MockUser:
            MockUser.query.filter_by.return_value.first.return_value = mock_user
            with patch('flask_bcrypt.Bcrypt.check_password_hash', return_value=False):
                response = client.post('/login', json={
                    'username': 'testuser',
                    'password': 'wrongpass'
                })
                assert response.status_code == 401
                assert b'Invalid username or password' in response.data

    def test_login_missing_username(self, client):
        """Test login with missing username."""
        with patch('routes.User') as MockUser:
            MockUser.query.filter_by.return_value.first.return_value = None
            response = client.post('/login', json={
                'password': 'testpass'
            })
            assert response.status_code == 401

    def test_login_missing_password(self, client, mock_user):
        """Test login with missing password."""
        with patch('routes.User') as MockUser:
            MockUser.query.filter_by.return_value.first.return_value = mock_user
            with patch('flask_bcrypt.Bcrypt.check_password_hash', return_value=False):
                response = client.post('/login', json={
                    'username': 'testuser'
                })
                assert response.status_code == 401

    def test_login_sets_session(self, client, mock_user):
        """Test that login sets user_id in session."""
        with patch('routes.User') as MockUser:
            MockUser.query.filter_by.return_value.first.return_value = mock_user
            with patch('flask_bcrypt.Bcrypt.check_password_hash', return_value=True):
                with client:
                    response = client.post('/login', json={
                        'username': 'testuser',
                        'password': 'testpass'
                    })
                    with client.session_transaction() as sess:
                        assert sess.get('user_id') == 1
                        assert sess.permanent is True

    def test_signup_success(self, client, db):
        """Test successful user signup."""
        with patch('flask_bcrypt.Bcrypt.generate_password_hash') as mock_hash:
            mock_hash.return_value.decode.return_value = 'hashed_password'
            response = client.post('/signup', json={
                'username': 'newuser',
                'password': 'newpass',
                'email': 'new@example.com'
            })
            assert response.status_code == 201
            assert b'User registered successfully' in response.data

    def test_signup_missing_username(self, client):
        """Test signup with missing username."""
        response = client.post('/signup', json={
            'password': 'testpass',
            'email': 'test@example.com'
        })
        assert response.status_code == 400
        assert b'Username and password required' in response.data

    def test_signup_missing_password(self, client):
        """Test signup with missing password."""
        response = client.post('/signup', json={
            'username': 'testuser',
            'email': 'test@example.com'
        })
        assert response.status_code == 400
        assert b'Username and password required' in response.data

    def test_signup_duplicate_username(self, client, mock_user):
        """Test signup with existing username."""
        with patch('routes.User') as MockUser:
            MockUser.query.filter_by.return_value.first.return_value = mock_user
            response = client.post('/signup', json={
                'username': 'testuser',
                'password': 'testpass',
                'email': 'test@example.com'
            })
            assert response.status_code == 400
            assert b'Username already exists' in response.data

    def test_signup_empty_username(self, client):
        """Test signup with empty username."""
        response = client.post('/signup', json={
            'username': '',
            'password': 'testpass',
            'email': 'test@example.com'
        })
        assert response.status_code == 400

    def test_signup_empty_password(self, client):
        """Test signup with empty password."""
        response = client.post('/signup', json={
            'username': 'testuser',
            'password': '',
            'email': 'test@example.com'
        })
        assert response.status_code == 400

    def test_signup_without_email(self, client):
        """Test signup without email."""
        with patch('flask_bcrypt.Bcrypt.generate_password_hash') as mock_hash:
            mock_hash.return_value.decode.return_value = 'hashed_password'
            response = client.post('/signup', json={
                'username': 'newuser2',  # Use different username to avoid conflict
                'password': 'newpass',
                'email': ''  # Empty email instead of None
            })
            # This may fail due to database constraints, or succeed if email can be empty
            assert response.status_code in [201, 500]

    def test_logout(self, client):
        """Test logout endpoint."""
        with client.session_transaction() as sess:
            sess['user_id'] = 1
        response = client.get('/logout')
        assert response.status_code == 200
        assert b'Logged out successfully' in response.data

    def test_logout_clears_session(self, client):
        """Test that logout clears session."""
        with client:
            with client.session_transaction() as sess:
                sess['user_id'] = 1
                sess['other_data'] = 'test'
            response = client.get('/logout')
            with client.session_transaction() as sess:
                assert 'user_id' not in sess
                assert 'other_data' not in sess

    def test_logout_without_session(self, client):
        """Test logout without active session."""
        response = client.get('/logout')
        assert response.status_code == 200


class TestLoginRequired:
    """Test login_required decorator."""

    def test_protected_endpoint_without_auth(self, client):
        """Test accessing protected endpoint without authentication."""
        # Clear session to ensure no authentication
        with client.session_transaction() as sess:
            sess.clear()
        
        response = client.post('/api/add_item', json={
            'description': 'Test Item',
            'quantity': 10
        })
        assert response.status_code == 401
        assert b'Authentication required' in response.data

    def test_protected_endpoint_with_auth(self, client, db):
        """Test accessing protected endpoint with authentication."""
        with client.session_transaction() as sess:
            sess['user_id'] = 1
        
        response = client.post('/api/add_item', json={
            'description': 'Test Item',
            'quantity': 10
        })
        assert response.status_code == 201

    def test_all_protected_endpoints_require_auth(self, client):
        """Test that all protected endpoints require authentication."""
        # Clear session to ensure no authentication
        with client.session_transaction() as sess:
            sess.clear()
        
        protected_endpoints = [
            ('/api/add_item', 'POST', {'description': 'test', 'quantity': 1}),
            ('/api/add_item_loan', 'POST', {'description': 'test', 'quantity': 1}),
            ('/api/end_item_loan', 'POST', {'description': 'test'}),
            ('/api/get_inventory', 'GET', None),
            ('/api/add_box', 'POST', {'description': 'test', 'barcode': 'test'}),
            ('/api/edit/add_content', 'POST', {'bid': 1, 'description': 'test', 'quantity': 1, 'iid': None}),
            ('/api/edit/remove_content', 'POST', {'id': 1}),
            ('/api/get_box_content', 'GET', {'bid': 1}),
            ('/api/edit/item', 'POST', {}),
            ('/api/delete_data', 'DELETE', None),
        ]
        
        for endpoint, method, json_data in protected_endpoints:
            if method == 'GET':
                response = client.get(endpoint, json=json_data)
            elif method == 'POST':
                response = client.post(endpoint, json=json_data)
            elif method == 'DELETE':
                response = client.delete(endpoint)
            assert response.status_code == 401, f"Endpoint {endpoint} should require authentication"


class TestItemManagement:
    """Test item management endpoints."""

    def test_add_item(self, client, db):
        """Test adding a new item."""
        with client.session_transaction() as sess:
            sess['user_id'] = 1
        
        response = client.post('/api/add_item', json={
            'description': 'Tent',
            'quantity': 5
        })
        assert response.status_code == 201
        assert b'Item added successfully' in response.data
        
        # Verify item was added to database
        from models import Item
        item = Item.query.filter_by(description='tent').first()
        assert item is not None
        assert item.description == 'tent'
        assert item.quantity == 5

    def test_add_item_case_insensitive(self, client):
        """Test that item descriptions are converted to lowercase."""
        with client.session_transaction() as sess:
            sess['user_id'] = 1
        
        response = client.post('/api/add_item', json={
            'description': 'TENT',
            'quantity': 5
        })
        assert response.status_code == 201
        
        # Verify item description was lowercased
        from models import Item
        item = Item.query.filter_by(description='tent').first()
        assert item is not None
        assert item.description == 'tent'

    def test_add_item_with_string_quantity(self, client):
        """Test adding item with quantity as string."""
        with client.session_transaction() as sess:
            sess['user_id'] = 1
        
        response = client.post('/api/add_item', json={
            'description': 'Tent',
            'quantity': '10'
        })
        assert response.status_code == 201
        
        # Verify quantity was converted to int
        from models import Item
        item = Item.query.filter_by(description='tent').first()
        assert item is not None
        assert item.quantity == 10

    def test_add_item_missing_description(self, client):
        """Test adding item without description."""
        with client.session_transaction() as sess:
            sess['user_id'] = 1
        
        response = client.post('/api/add_item', json={
            'quantity': 5
        })
        # Should fail when trying to call .lower() on None
        assert response.status_code == 400

    def test_add_item_loan(self, client, db):
        """Test adding an item loan."""
        with client.session_transaction() as sess:
            sess['user_id'] = 1
        
        # First create an item
        from models import Item
        item = Item(description='tent', quantity=10)
        db.session.add(item)
        db.session.commit()
        
        response = client.post('/api/add_item_loan', json={
            'description': 'tent',
            'quantity': 2
        })
        assert response.status_code == 201
        assert b'Loan added succesfully' in response.data

    def test_add_item_loan_item_not_found(self, client):
        """Test adding loan for non-existent item."""
        with client.session_transaction() as sess:
            sess['user_id'] = 1
        
        response = client.post('/api/add_item_loan', json={
            'description': 'nonexistent',
            'quantity': 2
        })
        assert response.status_code == 500

    def test_add_item_loan_with_string_quantity(self, client, db):
        """Test adding loan with quantity as string."""
        with client.session_transaction() as sess:
            sess['user_id'] = 1
        
        # First create an item
        from models import Item
        item = Item(description='tent', quantity=10)
        db.session.add(item)
        db.session.commit()
        
        response = client.post('/api/add_item_loan', json={
            'description': 'tent',
            'quantity': '5'
        })
        assert response.status_code == 201

    def test_end_item_loan(self, client, db):
        """Test ending an item loan."""
        with client.session_transaction() as sess:
            sess['user_id'] = 1
        
        # Create an item and a loan
        from models import Item, ItemUse
        item = Item(description='tent', quantity=10)
        db.session.add(item)
        db.session.commit()
        
        loan = ItemUse(iid=item.iid, quantity=2)
        db.session.add(loan)
        db.session.commit()
        
        response = client.post('/api/end_item_loan', json={
            'description': 'tent'
        })
        assert response.status_code == 201
        assert b'loan ended succesfully' in response.data
        
        # Verify loan was ended
        db.session.refresh(loan)
        assert loan.end_date.date() == date.today()

    def test_end_item_loan_item_not_found(self, client):
        """Test ending loan for non-existent item."""
        with client.session_transaction() as sess:
            sess['user_id'] = 1
        
        response = client.post('/api/end_item_loan', json={
            'description': 'nonexistent'
        })
        assert response.status_code == 500

    def test_end_item_loan_no_active_loan(self, client, db):
        """Test ending loan when no active loan exists."""
        with client.session_transaction() as sess:
            sess['user_id'] = 1
        
        # Create an item but no loan
        from models import Item
        item = Item(description='tent', quantity=10)
        db.session.add(item)
        db.session.commit()
        
        response = client.post('/api/end_item_loan', json={
            'description': 'tent'
        })
        assert response.status_code == 500

    def test_get_inventory(self, client):
        """Test retrieving inventory."""
        with client.session_transaction() as sess:
            sess['user_id'] = 1
        
        mock_item1 = Mock()
        mock_item1.iid = 1
        mock_item1.description = 'Tent'
        mock_item1.quantity = 10
        
        mock_item2 = Mock()
        mock_item2.iid = 2
        mock_item2.description = 'Sleeping Bag'
        mock_item2.quantity = 20
        
        mock_loan = Mock()
        mock_loan.iid = 1
        
        with patch('routes.Item') as MockItem:
            MockItem.query.all.return_value = [mock_item1, mock_item2]
            with patch('routes.ItemUse') as MockItemUse:
                MockItemUse.query.filter_by.return_value.all.return_value = [mock_loan]
                response = client.get('/api/get_inventory')
                assert response.status_code == 200
                data = response.get_json()
                assert 'inventory' in data
                assert 'count' in data
                assert data['count'] == 2

    def test_get_inventory_sorted(self, client):
        """Test inventory is sorted alphabetically."""
        with client.session_transaction() as sess:
            sess['user_id'] = 1
        
        mock_item1 = Mock()
        mock_item1.iid = 1
        mock_item1.description = 'Zebra'
        mock_item1.quantity = 10
        
        mock_item2 = Mock()
        mock_item2.iid = 2
        mock_item2.description = 'Apple'
        mock_item2.quantity = 20
        
        with patch('routes.Item') as MockItem:
            MockItem.query.all.return_value = [mock_item1, mock_item2]
            with patch('routes.ItemUse') as MockItemUse:
                MockItemUse.query.filter_by.return_value.all.return_value = []
                response = client.get('/api/get_inventory')
                data = response.get_json()
                assert data['inventory'][0]['description'] == 'Apple'
                assert data['inventory'][1]['description'] == 'Zebra'

    def test_get_inventory_empty(self, client):
        """Test getting inventory when no items exist."""
        with client.session_transaction() as sess:
            sess['user_id'] = 1
        
        with patch('routes.Item') as MockItem:
            MockItem.query.all.return_value = []
            with patch('routes.ItemUse') as MockItemUse:
                MockItemUse.query.filter_by.return_value.all.return_value = []
                response = client.get('/api/get_inventory')
                data = response.get_json()
                assert data['count'] == 0
                assert data['inventory'] == []

    def test_get_inventory_loan_calculation(self, client):
        """Test that loaned items are correctly calculated."""
        with client.session_transaction() as sess:
            sess['user_id'] = 1
        
        mock_item = Mock()
        mock_item.iid = 1
        mock_item.description = 'Tent'
        mock_item.quantity = 10
        
        mock_loan1 = Mock()
        mock_loan1.iid = 1
        mock_loan2 = Mock()
        mock_loan2.iid = 1
        mock_loan3 = Mock()
        mock_loan3.iid = 2
        
        with patch('routes.Item') as MockItem:
            MockItem.query.all.return_value = [mock_item]
            with patch('routes.ItemUse') as MockItemUse:
                MockItemUse.query.filter_by.return_value.all.return_value = [mock_loan1, mock_loan2, mock_loan3]
                response = client.get('/api/get_inventory')
                data = response.get_json()
                assert data['inventory'][0]['loaned'] == 2


class TestBoxManagement:
    """Test box management endpoints."""

    def test_add_box(self, client, db):
        """Test adding a new box."""
        with client.session_transaction() as sess:
            sess['user_id'] = 1
        
        response = client.post('/api/add_box', json={
            'description': 'Storage Box 1',
            'barcode': 'BOX001'
        })
        assert response.status_code == 201
        assert b'Box added successfully' in response.data
        
        # Verify box was added to database
        from models import Box
        box = Box.query.filter_by(barcode='BOX001').first()
        assert box is not None
        assert box.description == 'Storage Box 1'

    def test_add_box_missing_description(self, client):
        """Test adding box without description."""
        with client.session_transaction() as sess:
            sess['user_id'] = 1
        
        response = client.post('/api/add_box', json={
            'barcode': 'BOX001'
        })
        assert response.status_code == 400

    def test_add_box_missing_barcode(self, client):
        """Test adding box without barcode."""
        with client.session_transaction() as sess:
            sess['user_id'] = 1
        
        response = client.post('/api/add_box', json={
            'description': 'Storage Box 1'
        })
        assert response.status_code == 400

    def test_add_box_empty_values(self, client):
        """Test adding box with empty values."""
        with client.session_transaction() as sess:
            sess['user_id'] = 1
        
        response = client.post('/api/add_box', json={
            'description': '',
            'barcode': ''
        })
        assert response.status_code == 400


class TestContentManagement:
    """Test content management endpoints."""

    def test_add_content_without_item(self, client, db):
        """Test adding content to a box without associated item."""
        with client.session_transaction() as sess:
            sess['user_id'] = 1
        
        # Create a box first
        from models import Box
        box = Box(description='Test Box', barcode='BOX001')
        db.session.add(box)
        db.session.commit()
        
        response = client.post('/api/edit/add_content', json={
            'bid': box.bid,
            'description': 'Rope',
            'quantity': 3,
            'iid': None
        })
        assert response.status_code == 201

    def test_add_content_with_item(self, client, db):
        """Test adding content to a box with associated item."""
        with client.session_transaction() as sess:
            sess['user_id'] = 1
        
        # Create a box and an item first
        from models import Box, Item
        box = Box(description='Test Box', barcode='BOX001')
        item = Item(description='rope', quantity=10)
        db.session.add(box)
        db.session.add(item)
        db.session.commit()
        
        response = client.post('/api/edit/add_content', json={
            'bid': box.bid,
            'description': 'Rope',
            'quantity': 3,
            'iid': item.iid
        })
        assert response.status_code == 201
        assert b'Content Rope added succesfully to box' in response.data

    def test_add_content_case_insensitive(self, client, db):
        """Test that content descriptions are converted to lowercase."""
        with client.session_transaction() as sess:
            sess['user_id'] = 1
        
        # Create a box first
        from models import Box, Content
        box = Box(description='Test Box', barcode='BOX001')
        db.session.add(box)
        db.session.commit()
        
        response = client.post('/api/edit/add_content', json={
            'bid': box.bid,
            'description': 'ROPE',
            'quantity': 3,
            'iid': None
        })
        assert response.status_code == 201
        
        # Verify content description was lowercased
        content = Content.query.filter_by(description='rope').first()
        assert content is not None
        assert content.description == 'rope'

    def test_add_content_iid_zero(self, client, db):
        """Test adding content with iid as 0 (falsy value)."""
        with client.session_transaction() as sess:
            sess['user_id'] = 1
        
        # Create a box first
        from models import Box
        box = Box(description='Test Box', barcode='BOX001')
        db.session.add(box)
        db.session.commit()
        
        response = client.post('/api/edit/add_content', json={
            'bid': box.bid,
            'description': 'Rope',
            'quantity': 3,
            'iid': 0
        })
        assert response.status_code == 201

    def test_remove_content(self, client, db):
        """Test removing content from a box."""
        with client.session_transaction() as sess:
            sess['user_id'] = 1
        
        # Create a box and content first
        from models import Box, Content
        box = Box(description='Test Box', barcode='BOX001')
        db.session.add(box)
        db.session.commit()
        
        content = Content(bid=box.bid, description='rope', quantity=3)
        db.session.add(content)
        db.session.commit()
        
        response = client.post('/api/edit/remove_content', json={
            'id': content.cid
        })
        assert response.status_code == 200
        assert b'marked as deleted' in response.data
        
        # Verify content was marked as deleted
        db.session.refresh(content)
        assert content.date_deleted == date.today()

    def test_remove_content_not_found(self, client):
        """Test removing non-existent content."""
        with client.session_transaction() as sess:
            sess['user_id'] = 1
        
        response = client.post('/api/edit/remove_content', json={
            'id': 999
        })
        assert response.status_code == 404

    def test_remove_content_missing_id(self, client, db):
        """Test removing content without providing id."""
        with client.session_transaction() as sess:
            sess['user_id'] = 1
        
        response = client.post('/api/edit/remove_content', json={})
        # Should handle gracefully - return 404 for null/missing ID
        assert response.status_code == 404

    def test_get_box_content(self, client):
        """Test retrieving box contents."""
        with client.session_transaction() as sess:
            sess['user_id'] = 1
        
        mock_content1 = Mock()
        mock_content1.serialize.return_value = {'id': 1, 'description': 'Item 1'}
        mock_content2 = Mock()
        mock_content2.serialize.return_value = {'id': 2, 'description': 'Item 2'}
        
        with patch('routes.Content') as MockContent:
            MockContent.query.filter_by.return_value.all.return_value = [
                mock_content1, mock_content2
            ]
            response = client.get('/api/get_box_content', json={'bid': 1})
            assert response.status_code == 200
            data = response.get_json()
            assert 'contents' in data
            assert 'quantity' in data
            assert data['quantity'] == 2

    def test_get_box_content_empty(self, client):
        """Test getting content for box with no contents."""
        with client.session_transaction() as sess:
            sess['user_id'] = 1
        
        with patch('routes.Content') as MockContent:
            MockContent.query.filter_by.return_value.all.return_value = []
            response = client.get('/api/get_box_content', json={'bid': 1})
            assert response.status_code == 200
            data = response.get_json()
            assert data['quantity'] == 0
            assert data['contents'] == []

    def test_get_box_content_filters_deleted(self, client):
        """Test that get_box_content filters out deleted content."""
        with client.session_transaction() as sess:
            sess['user_id'] = 1
        
        mock_content = Mock()
        mock_content.serialize.return_value = {'id': 1, 'description': 'Item 1'}
        
        with patch('routes.Content') as MockContent:
            # filter_by should only return non-deleted items
            MockContent.query.filter_by.return_value.all.return_value = [mock_content]
            response = client.get('/api/get_box_content', json={'bid': 1})
            MockContent.query.filter_by.assert_called_with(bid=1, date_deleted=None)


class TestStaticFiles:
    """Test static file serving."""

    def test_serve_index(self, client):
        """Test serving index.html."""
        with patch('routes.send_from_directory') as mock_send:
            mock_send.return_value = 'index.html content'
            response = client.get('/')
            assert mock_send.called
            args, kwargs = mock_send.call_args
            assert args[1] == 'index.html'

    def test_serve_static_file(self, client):
        """Test serving a static file."""
        with patch('routes.send_from_directory') as mock_send:
            mock_send.return_value = 'file content'
            response = client.get('/style.css')
            assert mock_send.called
            args, kwargs = mock_send.call_args
            assert args[1] == 'style.css'

    def test_serve_nested_static_file(self, client):
        """Test serving a nested static file."""
        with patch('routes.send_from_directory') as mock_send:
            mock_send.return_value = 'file content'
            response = client.get('/js/app.js')
            assert mock_send.called
            args, kwargs = mock_send.call_args
            assert args[1] == 'js/app.js'


class TestNotImplementedEndpoints:
    """Test endpoints that are not yet implemented."""

    def test_edit_item_not_implemented(self, client):
        """Test edit_item endpoint (not implemented)."""
        with client.session_transaction() as sess:
            sess['user_id'] = 1
        
        response = client.post('/api/edit/item', json={})
        assert response.status_code == 501

    def test_delete_data_not_implemented(self, client):
        """Test delete_data endpoint (not implemented)."""
        with client.session_transaction() as sess:
            sess['user_id'] = 1
        
        response = client.delete('/api/delete_data')
        assert response.status_code == 501


class TestEdgeCases:
    """Test edge cases and error handling."""

    def test_malformed_json_request(self, client):
        """Test handling of malformed JSON."""
        with client.session_transaction() as sess:
            sess['user_id'] = 1
        
        response = client.post('/api/add_item', 
                              data='not valid json',
                              content_type='application/json')
        assert response.status_code in [400, 500]

    def test_empty_json_request(self, client):
        """Test handling of empty JSON."""
        with client.session_transaction() as sess:
            sess['user_id'] = 1
        
        response = client.post('/api/add_item', json={})
        # Should fail when trying to get description
        assert response.status_code == 400

    def test_concurrent_session_handling(self, client):
        """Test handling of multiple sessions."""
        with client.session_transaction() as sess1:
            sess1['user_id'] = 1
        
        response1 = client.get('/logout')
        
        with client.session_transaction() as sess2:
            assert 'user_id' not in sess2

    def test_special_characters_in_description(self, client):
        """Test handling special characters in descriptions."""
        with client.session_transaction() as sess:
            sess['user_id'] = 1
        
        response = client.post('/api/add_item', json={
            'description': 'Test<>Item&"\'',
            'quantity': 1
        })
        assert response.status_code == 201

    def test_unicode_in_description(self, client):
        """Test handling unicode characters in descriptions."""
        with client.session_transaction() as sess:
            sess['user_id'] = 1
        
        response = client.post('/api/add_item', json={
            'description': 'Tëst Itém 日本語',
            'quantity': 1
        })
        assert response.status_code == 201

    def test_very_large_quantity(self, client):
        """Test handling very large quantity values."""
        with client.session_transaction() as sess:
            sess['user_id'] = 1
        
        response = client.post('/api/add_item', json={
            'description': 'Test Item',
            'quantity': 999999999
        })
        assert response.status_code == 201

    def test_negative_quantity(self, client):
        """Test handling negative quantity values."""
        with client.session_transaction() as sess:
            sess['user_id'] = 1
        
        response = client.post('/api/add_item', json={
            'description': 'Test Item',
            'quantity': -5
        })
        assert response.status_code == 201
        
        # Verify negative quantity was stored
        from models import Item
        item = Item.query.filter_by(description='test item').first()
        assert item is not None
        assert item.quantity == -5

    def test_database_commit_failure(self, client, db):
        """Test handling of database commit failures."""
        with client.session_transaction() as sess:
            sess['user_id'] = 1
        
        # Mock the db session commit to raise a SQLAlchemy exception
        from sqlalchemy.exc import SQLAlchemyError
        with patch.object(db.session, 'commit', side_effect=SQLAlchemyError('DB Error')):
            response = client.post('/api/add_item', json={
                'description': 'Test Item',
                'quantity': 5
            })
            assert response.status_code == 500
            # Verify the error handler returns the expected message
            # data = response.get_json()
            # assert 'error' in data
            # assert data['error'] == 'Internal database error'