from flask import request, render_template

from models import Person, Item

def register_routes(app, db):
    @app.route('/api/searchItemsLike', methods=['POST'])
    def search_like():
        data = request.get_json()
        keyword = data.get('keyword', '')
        
        search_results = db.query(Item.barcode).filter(Item.barcode.ilike(f'%{keyword}%')).all()
        barcodes = [barcode for (barcode,) in search_results]
        return {'results': barcodes}

        

    
    @app.route('/api/addItem/', methods=['POST'])
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