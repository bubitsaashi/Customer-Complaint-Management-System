from sqlalchemy import Column, String, Float, Text, DateTime, ForeignKey, JSON, Integer
from sqlalchemy.orm import relationship
from datetime import datetime
from database import Base

class Complaint(Base):
    __tablename__ = "complaints"

    id = Column(String, primary_key=True, index=True) # e.g. CMP-2024-001
    title = Column(String, nullable=False)
    complainant_name = Column(String, nullable=True)
    complainant_org = Column(String, nullable=True)
    complainant_contact = Column(String, nullable=True)
    product_name = Column(String, nullable=False, index=True)
    dosage_form = Column(String, nullable=False, default="FDF") # API or FDF
    batch_number = Column(String, nullable=True, index=True)
    mfg_date = Column(String, nullable=True)
    expiry_date = Column(String, nullable=True)
    quantity_affected = Column(String, nullable=True)
    defect_type = Column(String, nullable=True, index=True) # e.g. Contamination, Sub-potency, Packaging
    status = Column(String, nullable=False, default="Logged", index=True) # Logged, Under Investigation, CAPA Assigned, Closed
    risk_level = Column(String, nullable=False, default="Pending", index=True) # Critical, Major, Minor, Pending
    completeness_score = Column(Float, nullable=False, default=0.0)
    raw_content = Column(Text, nullable=False)
    source_type = Column(String, nullable=False, default="Form Submission") # Email, PDF Document, Form Submission
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    analysis = relationship("AIAnalysis", back_populates="complaint", uselist=False, cascade="all, delete-orphan")
    audit_logs = relationship("AuditLog", back_populates="complaint", cascade="all, delete-orphan")

class AIAnalysis(Base):
    __tablename__ = "ai_analyses"

    id = Column(Integer, primary_key=True, autoincrement=True)
    complaint_id = Column(String, ForeignKey("complaints.id"), unique=True, nullable=False)
    
    completeness_check = Column(JSON, nullable=True)
    followup_email_draft = Column(Text, nullable=True)
    risk_classification = Column(JSON, nullable=True)
    duplicate_detection = Column(JSON, nullable=True)
    root_cause_analysis = Column(JSON, nullable=True)
    capa_recommendations = Column(JSON, nullable=True)
    executive_summary = Column(Text, nullable=True)
    agent_trace = Column(JSON, nullable=True)

    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    complaint = relationship("Complaint", back_populates="analysis")

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, autoincrement=True)
    complaint_id = Column(String, ForeignKey("complaints.id"), nullable=False)
    action = Column(String, nullable=False)
    performed_by = Column(String, nullable=False, default="System Agent")
    details = Column(Text, nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow)

    complaint = relationship("Complaint", back_populates="audit_logs")
