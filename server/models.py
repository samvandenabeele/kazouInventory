from app import db
from datetime import date

class Item(db.Model):
    __tablename__ = 'items'
    
    iid = db.Column(db.Integer, primary_key=True)
    description = db.Column(db.Text, nullable=False)
    status = db.Column(db.Text, nullable=False, default='good')
    barcode = db.Column(db.Text, unique=True)

class Box(db.Model):
    __tablename__ = 'boxes'
    
    bid = db.Column(db.Integer, primary_key=True)
    description = db.Column(db.Text, nullable=False)
    barcode = db.Column(db.Text, nullable=False)
    
class Content(db.Model):
    __tablename__ = 'box_content'
    
    cid = db.Column(db.Text, primary_key=True)
    bid = db.Column(db.Integer, db.ForeignKey('boxes.bid'), nullable=False)
    description = db.Column(db.Text, nullable=False)
    quantity = db.Column(db.Integer, nullable=False)
    date_added = db.Column(db.Date, default=date.today)
    date_deleted = db.Column(db.Date, nullable=True)