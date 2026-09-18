from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database.supabase import Base

class Entity(Base):
    __tablename__ = "entities"

    id = Column(String, primary_key=True, index=True) # Canonical ID
    name = Column(String, index=True)
    type = Column(String) # PERSON, PHONE, LOCATION, VEHICLE, BANKACCOUNT, FIR, CCTV, AUDIO
    case_id = Column(String, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class Relationship(Base):
    __tablename__ = "relationships"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    source_id = Column(String, ForeignKey("entities.id"))
    target_id = Column(String, ForeignKey("entities.id"))
    type = Column(String) # CALLED, OWNS, MENTIONED_IN, TRANSACTED_WITH, PRESENT_AT, ASSOCIATED_WITH
    case_id = Column(String, index=True)
    weight = Column(Float, default=1.0)
    created_at = Column(DateTime, default=datetime.utcnow)

class Alert(Base):
    __tablename__ = "alerts"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    case_id = Column(String, index=True)
    severity = Column(String) # Critical, High, Medium
    title = Column(String)
    description = Column(String)
    entity_id = Column(String, ForeignKey("entities.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
