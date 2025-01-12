from flask import Flask, request, jsonify
from flask_cors import CORS
from ai_handler import get_recommendations

app = Flask(__name__)
CORS(app)

@app.route("/", methods=["GET"])
def home():
    return jsonify({"message": "Welcome to Sentinel Backend API!"})


@app.route("/recommendations", methods=["POST"])
def recommendations():
    data = request.json
    if not data or "windows" not in data or "doors" not in data or "city" not in data:
        return jsonify({"error": "Invalid input"}), 400

    try:
        recommendations = get_recommendations(data["windows"], data["doors"], data["city"])
        return jsonify({"recommendations": recommendations})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True)
