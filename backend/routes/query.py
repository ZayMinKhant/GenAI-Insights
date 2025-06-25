from flask import Blueprint, request, jsonify
import uuid
import json
from vector_search_demo import retrieve_top_k_faiss
from llm import get_llm_answer
from database import SessionLocal
from models import Query, Response

query_bp = Blueprint('query_bp', __name__)

@query_bp.route('/query', methods=['POST'])
def query():
    data = request.json
    query_text = data.get('query', '')
    user_id = data.get('user_id') 
    db = SessionLocal()

    query_record = db.query(Query).filter(
        Query.query == query_text, 
        Query.user_id == user_id
    ).first()
    
    if not query_record:
        query_id = str(uuid.uuid4())
        query_record = Query(id=query_id, user_id=user_id, query=query_text)
        db.add(query_record)
        db.commit()
        db.refresh(query_record)
    
    query_id = query_record.id

    top_docs = retrieve_top_k_faiss(query_text, k=3)
    answer_json = get_llm_answer(top_docs, query_text)

    response_id = str(uuid.uuid4())
    response_record = Response(
        id=response_id,
        query_id=query_id,
        answer_json=json.dumps(answer_json),
        docs_json=json.dumps(top_docs),
        parent_response_id=None
    )
    db.add(response_record)
    db.commit()
    db.refresh(response_record)
    
    db.close()
    
    return jsonify({
        "answer": answer_json,
        "query_id": query_id,
        "response_id": response_id,
        "query": query_text,
        "timestamp": response_record.created_at.isoformat(),
        "docs": top_docs
    })

@query_bp.route('/revalidate', methods=['POST'])
def revalidate():
    data = request.json
    response_id = data.get('response_id')
    
    db = SessionLocal()
    
    original_response = db.query(Response).filter(Response.id == response_id).first()
    
    if not original_response:
        db.close()
        return jsonify({"error": "Response not found", "code": 404}), 404
        
    query_id = original_response.query_id
    question = original_response.query.query
    docs_to_use = json.loads(original_response.docs_json)
    
    answer_json = get_llm_answer(docs_to_use, question)
    
    new_response_id = str(uuid.uuid4())
    new_response_record = Response(
        id=new_response_id,
        query_id=query_id,
        answer_json=json.dumps(answer_json),
        docs_json=json.dumps(docs_to_use),
        parent_response_id=response_id
    )
    db.add(new_response_record)
    db.commit()
    db.refresh(new_response_record)
    
    response = {
        "answer": answer_json,
        "query_id": query_id,
        "response_id": new_response_id,
        "query": question,
        "timestamp": new_response_record.created_at.isoformat(),
        "docs": docs_to_use
    }
    
    db.close()
    return jsonify(response)
