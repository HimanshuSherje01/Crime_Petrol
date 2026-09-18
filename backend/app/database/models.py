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
    pagerank = Column(Float, default=0.0)
    betweenness = Column(Float, default=0.0)
    community = Column(Integer, default=0)
    risk_score = Column(Float, nullable=True)
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

class Case(Base):
    __tablename__ = "cases"

    id = Column(String, primary_key=True, index=True) # E.g., CH-2026-1023
    name = Column(String)
    priority = Column(String, default="Medium")
    status = Column(String, default="Active")
    created_at = Column(DateTime, default=datetime.utcnow)

class UploadedFile(Base):
    __tablename__ = "uploaded_files"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    case_id = Column(String, index=True)
    name = Column(String)
    size_mb = Column(Float)
    type = Column(String)
    status = Column(String, default="Parsed")
    path = Column(String) # Path on disk or cloud
    created_at = Column(DateTime, default=datetime.utcnow)

class AnalysisRun(Base):
    __tablename__ = "analysis_runs"

    id = Column(String, primary_key=True, index=True) # RUN-2026...
    case_id = Column(String, index=True)
    status = Column(String, default="Running")
    files_processed = Column(Integer, default=0)
    modules = Column(String, default="All")
    findings = Column(String, default="-")
    duration = Column(String, default="-")
    created_at = Column(DateTime, default=datetime.utcnow)

class ParsedDocument(Base):
    __tablename__ = "parsed_documents"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    case_id = Column(String, index=True)
    file = Column(String)
    source_type = Column(String)
    text = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)

