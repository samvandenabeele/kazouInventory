from flask import request, render_template

from models import Item, Box, Content

def register_routes(app, db):
    @app.route('/api/add_item/', methods=['POST'])
    def add_item():
        data = request.get_json()

        description = data.get('description')
        barcode = data.get('barcode')
        status = data.get('status')

        item = Item(description=description, barcode=barcode, status=status)
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
        pass
    
    @app.route('/api/edit/remove_content', methods=['POST'])
    def remove_content():
        pass
    
    @app.route('/api/edit/item', methods=['POST'])
    def edit_item():
        pass
    
    @app.route('/api/delete_data', methods=['DELETE'])
    def delete_data():
        pass