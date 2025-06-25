from sqlalchemy import Column, String, DateTime, Text, ForeignKey, Index
from sqlalchemy.orm import declarative_base, relationship
from datetime import datetime

Base = declarative_base()

class Query(Base):
    __tablename__ = "queries"
    id = Column(String, primary_key=True, index=True)
    user_id = Column(String)
    query = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    responses = relationship("Response", back_populates="query")

class Response(Base):
    __tablename__ = "responses"
    id = Column(String, primary_key=True, index=True)
    query_id = Column(String, ForeignKey("queries.id"))
    answer_json = Column(Text, nullable=False)
    docs_json = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    parent_response_id = Column(String, ForeignKey("responses.id"), nullable=True)
    query = relationship("Query", back_populates="responses")

class Document(Base):
    __tablename__ = "documents"
    id = Column(String, primary_key=True, index=True)
    text = Column(Text, nullable=False)
    embedding = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

class Feedback(Base):
    __tablename__ = "feedback"
    id = Column(String, primary_key=True, index=True)
    user_id = Column(String)
    query_id = Column(String, ForeignKey("queries.id"))
    response_id = Column(String, ForeignKey("responses.id"))
    rating = Column(String)
    comment = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)

Index('ix_queries_user_id_created_at', Query.user_id, Query.created_at)
Index('ix_responses_query_id_created_at', Response.query_id, Response.created_at)
Index('ix_documents_created_at', Document.created_at)
Index('ix_feedback_user_id_created_at', Feedback.user_id, Feedback.created_at) 