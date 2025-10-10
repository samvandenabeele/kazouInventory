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

    @cross_origin
    @app.route('/api/add_item_loan', methods=['POST'])
    def add_item_loan():
        data = request.get_json()
        item = Item.query.filter_by(description=data['description']).first()
        iid = item.iid
        itemLoan = ItemUse(iid=iid)
        
        db.session.add(itemLoan)
        db.session.commit()
        return {'message': 'Loan added succesfully'}, 201
    
    @cross_origin
    @app.route('/api/end_item_loan', methods=['POST'])
    def end_item_loan():
        data = request.get_json()
        item = Item.query.filter_by(description=data['description']).first()
        iid = item.iid
        loan = ItemUse.query.filter_by(iid=iid, end_date='').first()
        loan.end_date = date.today()
        
        return {'message': 'loan ended succesfully'}, 201
        
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
        content = Content(bid=data['bid'], description=data['description'].lower(), quantity=data['quantity'])
        
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