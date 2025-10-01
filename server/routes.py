from flask import request, render_template
from datetime import date
from models import Item, Box, Content, ItemUse
from flask_cors import cross_origin

def register_routes(app, db):
    @cross_origin
    @app.route('/api/add_item', methods=['POST'])
    def add_item():
        data = request.get_json()

        description = data.get('description')
        quantity = data.get('quantity')

        item = Item(description=description, quantity=quantity)
        print(item)
        db.session.add(item)
        db.session.commit()
        return {"message": "Item added successfully"}, 201
    
    @app.route("/api/add_box", methods=['POST'])
    def add_box():
        data = request.get_json()
        box = Box(description=data['description'], barcode=data['barcode'])
        db.session.add(box)
        db.session.commit()
        return {"message": "Box added successfully"}, 201
    
    @app.route('/api/edit/add_content', methods=['POST'])
    def edit_box():
        data = request.get_json()
        content = Content(bid=data['bid'], description=data['description'], quantity=data['quantity'])
        
        if data['iid']:
            itemUse = ItemUse(iid=data['iid'])
        
        db.session.add(content)
        db.session.add(itemUse)
        db.session.commit()
        
        
        return {"message": f"Content {data['description']} added succesfully to box {data['bid']}."}, 201
    
    @app.route('/api/edit/remove_content', methods=['POST'])
    def remove_content():
        data = request.get_json()
        content_id = data.get('id')

        content = Content.query.get(content_id)

        content.date_deleted = date.today()
        db.session.commit()
        return {"message": f"Content {content_id} marked as deleted."}, 200
    
    @app.route('/api/get_box_content', methods=['GET'])
    def get_box_content():
        data = request.get_json()
        bid = data['bid']
        
        contents = Content.query.filter_by(bid=bid, date_deleted=None).all()
        return {"contents": [c.serialize() for c in contents], "quantity": len(contents)}, 200
        
    
    @app.route('/api/edit/item', methods=['POST'])
    def edit_item():
        pass
    
    @app.route('/api/delete_data', methods=['DELETE'])
    def delete_data():
        pass