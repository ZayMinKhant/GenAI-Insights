import os
from flask import Flask, jsonify
from flask_cors import CORS
from database import SessionLocal

# Import blueprints
from routes.query import query_bp
from routes.history import history_bp
from routes.feedback import feedback_bp

app = Flask(__name__)
CORS(app)

app.register_blueprint(query_bp)
app.register_blueprint(history_bp)
app.register_blueprint(feedback_bp)

@app.route('/health', methods=['GET'])
def health_check():
    try:
        db = SessionLocal()
        db.execute("SELECT 1")
        db.close()
        return jsonify({"status": "healthy", "database": "connected"}), 200
    except Exception as e:
        return jsonify({"status": "unhealthy", "error": str(e)}), 500

@app.errorhandler(404)
def handle_404(e):
    return jsonify({"error": "Not found", "code": 404}), 404

@app.errorhandler(429)
def handle_429(e):
    return jsonify({"error": "Too many requests", "code": 429}), 429

@app.errorhandler(500)
def handle_500(e):
    return jsonify({"error": "Internal server error", "code": 500}), 500

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    app.run(host="0.0.0.0", port=port, debug=False)