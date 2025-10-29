from app import db
from datetime import date

class User(db.Model):
    __tablename__ = 'users'
    
    uid = db.Column(db.Integer, primary_key=True)
    username = db.Columnn(db.Text, nullable=False)
    password = db.Column(db.Text, nullable=False)
    email = db.Column(db.Text, nullable=False, unique=True)
    edit_permission = db.Column(db.Bool, default=False)

class Item(db.Model):
    __tablename__ = 'items'
    
    iid = db.Column(db.Integer, primary_key=True)
    description = db.Column(db.Text, nullable=False)
    quantity = db.Column(db.Integer, nullable=False)

class Box(db.Model):
    __tablename__ = 'boxes'
    
    bid = db.Column(db.Integer, primary_key=True)
    description = db.Column(db.Text, nullable=False)
    barcode = db.Column(db.Text, nullable=False)
    
class Content(db.Model):
    __tablename__ = 'box_content'
    
    cid = db.Column(db.Integer, primary_key=True)
    bid = db.Column(db.Integer, db.ForeignKey('boxes.bid'), nullable=False)
    description = db.Column(db.Text, nullable=False)
    quantity = db.Column(db.Integer, nullable=False)
    date_added = db.Column(db.Date, default=date.today)
    date_deleted = db.Column(db.Date, nullable=True)
    
class ItemUse(db.Model):
    __tablename__ = 'item_usage'
    
    iuid = db.Column(db.Integer, primary_key=True)
    iid = db.Column(db.Integer, db.ForeignKey('items.iid'), nullable=False)
    quantity = db.Column(db.Integer, nullable=False)
    start_date = db.Column(db.DateTime, default=date.today())
    end_date = db.Column(db.DateTime, nullable=True)