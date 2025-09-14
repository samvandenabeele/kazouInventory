from flask import Flask, jsonify
from flask_cors import CORS

app = Flask(__name__)
cors = CORS(app, origins='*')

@app.route('/api/users', methods=['GET'])
def users():
    return jsonify(
        {
            "users": [
                "Sam",
                "Merijn",
                "Tijl"
            ]
        }
    )

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)