from flask import Blueprint, jsonify
import json
from database import SessionLocal
from models import Response, Feedback

history_bp = Blueprint('history_bp', __name__)

@history_bp.route('/history', methods=['GET'])
def history():
    db = SessionLocal()
    results = []
    
    # Get all initial responses (not regenerations)
    initial_responses = db.query(Response).filter(Response.parent_response_id.is_(None)).order_by(Response.created_at.desc()).all()
    
    for resp in initial_responses:
        feedback = db.query(Feedback).filter(
            Feedback.response_id == resp.id,
            Feedback.user_id == 'anonymous'
        ).first()

        results.append({
            "query_id": resp.query.id,
            "response_id": resp.id,
            "query": resp.query.query,
            "answer": json.loads(resp.answer_json),
            "timestamp": resp.created_at.isoformat(),
            "docs": json.loads(resp.docs_json),
            "feedback": {"rating": feedback.rating} if feedback else None
        })

    db.close()
    return jsonify(results)

@history_bp.route('/responses/<string:response_id>/history', methods=['GET'])
def get_response_history(response_id):
    db = SessionLocal()
    
    # Find all responses that are children of the given response_id
    child_responses = db.query(Response).filter(Response.parent_response_id == response_id).order_by(Response.created_at.asc()).all()
    
    results = []
    for r in child_responses:
        feedback = db.query(Feedback).filter(
            Feedback.response_id == r.id,
            Feedback.user_id == 'anonymous'
        ).first()

        results.append({
            "response_id": r.id,
            "query_id": r.query_id,
            "query": r.query.query,
            "answer": json.loads(r.answer_json),
            "docs": json.loads(r.docs_json),
            "timestamp": r.created_at.isoformat(),
            "feedback": {"rating": feedback.rating} if feedback else None
        })
    
    db.close()
    return jsonify(results)
