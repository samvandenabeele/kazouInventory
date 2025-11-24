from app import db
from datetime import date

class User(db.Model):
    """
    Represents a user in the system.
    This model stores user authentication and authorization information.
    Attributes:
        uid (int): The primary key and unique identifier for the user.
        username (str): The username of the user. Cannot be null.
        password (str): The hashed password of the user. Cannot be null.
        email (str): The email address of the user. Must be unique and cannot be null.
        edit_permission (bool): Flag indicating whether the user has edit permissions. Defaults to False.
    """
    __tablename__ = 'users'
    
    uid = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.Text, nullable=False)
    password = db.Column(db.Text, nullable=False)
    email = db.Column(db.Text, nullable=False, unique=True)
    edit_permission = db.Column(db.Boolean, default=False)

class Item(db.Model):
    """
    Represents an item in the inventory database.
    Attributes:
        iid (int): The primary key identifier for the item.
        description (str): A text description of the item. Cannot be null.
    """
    __tablename__ = 'items'
    
    iid = db.Column(db.Integer, primary_key=True)
    description = db.Column(db.Text, nullable=False)

class Transaction(db.Model):
    """
    Represents a transaction in the inventory system.
    This model tracks all inventory movements including borrowing, returning,
    purchasing, and disposing of items.
    Attributes:
        tid (int): Primary key, unique transaction identifier.
        iid (int): Foreign key reference to the item involved in the transaction.
        uid (int): Foreign key reference to the user who performed the transaction.
        transaction_type (Enum): Type of transaction - 'borrow', 'return', 'purchase', or 'dispose'.
        quantity (int): Number of items involved in the transaction.
        date (DateTime): Date and time when the transaction occurred, defaults to current date.
    """
    __tablename__ = 'transations'
    
    tid = db.Column(db.Integer, primary_key=True)
    iid = db.Column(db.Integer, db.ForeignKey('items.iid'), nullable=False)
    uid = db.Column(db.Integer, db.ForeignKey('users.uid'), nullable=False)
    transaction_type = db.Column(db.Enum('borrow', 'return', 'purchase', 'dispose', name='transaction_types'), nullable=False)
    quantity = db.Column(db.Integer, nullable=False)
    date = db.Column(db.DateTime, default=date.today())