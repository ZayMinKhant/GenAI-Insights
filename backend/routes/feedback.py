from flask import Blueprint, request, jsonify
import uuid
from database import SessionLocal
from models import Feedback

feedback_bp = Blueprint('feedback_bp', __name__)

@feedback_bp.route('/feedback', methods=['POST'])
def feedback():
    data = request.json
    user_id = data.get('user_id')
    query_id = data.get('query_id')
    response_id = data.get('response_id')
    rating = data.get('rating')
    comment = data.get('comment')

    if not all([user_id, query_id, response_id, rating]):
        return jsonify({"error": "Missing required fields"}), 400

    db = SessionLocal()
    
    existing_feedback = db.query(Feedback).filter(
        Feedback.user_id == user_id,
        Feedback.response_id == response_id
    ).first()

    if existing_feedback:
        existing_feedback.rating = rating
        existing_feedback.comment = comment if comment else existing_feedback.comment
        feedback_id = existing_feedback.id
        status_code = 200
    else:
        feedback_id = str(uuid.uuid4())
        new_feedback = Feedback(
            id=feedback_id,
            user_id=user_id,
            query_id=query_id,
            response_id=response_id,
            rating=rating,
            comment=comment
        )
        db.add(new_feedback)
        status_code = 201

    db.commit()
    db.close()
    
    return jsonify({"status": "success", "feedback_id": feedback_id}), status_code

@feedback_bp.route('/feedback/aggregate', methods=['GET'])
def feedback_aggregate():
    response_id = request.args.get('response_id')
    if not response_id:
        return jsonify({"error": "Missing response_id"}), 400

    db = SessionLocal()
    likes = db.query(Feedback).filter(Feedback.response_id == response_id, Feedback.rating == 'like').count()
    dislikes = db.query(Feedback).filter(Feedback.response_id == response_id, Feedback.rating == 'dislike').count()
    db.close()
    return jsonify({"likes": likes, "dislikes": dislikes})
