from app import db

class Person(db.Model):
    __tablename__ = 'people'
    
    pid = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.Text, nullable=False)
    age = db.Column(db.Integer)
    job = db.Column(db.Text)
    
class Item(db.Model):
    __tablename__ = 'items'
    
    iid = db.Column(db.Integer, primary_key=True)
    description = db.Column(db.Text, nullable=False)
    status = db.Column(db.Text, nullable=False, default='good')
    barcode = db.Column(db.Text, unique=True)

class box(db.Model):
    __tablename__ = 'boxes'
    
    bid = db.Column(db.Integer, primary_key=True)
    description = db.Column(db.Text, nullable=False)
    barcode = db.Column(db.Text, nullable=False)
    content = db.Column(db.PickleType, nullable=False)