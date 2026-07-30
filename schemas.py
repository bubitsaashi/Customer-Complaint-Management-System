from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime

class ComplaintBase(BaseModel):
    title: str
    complainant_name: Optional[str] = None
    complainant_org: Optional[str] = None
    complainant_contact: Optional[str] = None
    product_name: str
    dosage_form: str = "FDF" # API or FDF
    batch_number: Optional[str] = None
    mfg_date: Optional[str] = None
    expiry_date: Optional[str] = None
    quantity_affected: Optional[str] = None
    defect_type: Optional[str] = None
    raw_content: str
    source_type: str = "Form Submission"

class ComplaintCreate(ComplaintBase):
    groq_api_key: Optional[str] = None

class ComplaintStatusUpdate(BaseModel):
    status: str
    updated_by: Optional[str] = "QA Manager"
    note: Optional[str] = None

class ReanalyzeRequest(BaseModel):
    groq_api_key: Optional[str] = None

class AIChatRequest(BaseModel):
    question: str
    context: Optional[str] = None
    groq_api_key: Optional[str] = None

class AIChatResponse(BaseModel):
    answer: str


class AuditLogSchema(BaseModel):
    id: int
    complaint_id: str
    action: str
    performed_by: str
    details: Optional[str] = None
    timestamp: datetime

    class Config:
        from_attributes = True

class AIAnalysisSchema(BaseModel):
    id: int
    complaint_id: str
    completeness_check: Optional[Dict[str, Any]] = None
    followup_email_draft: Optional[str] = None
    risk_classification: Optional[Dict[str, Any]] = None
    duplicate_detection: Optional[Dict[str, Any]] = None
    root_cause_analysis: Optional[Dict[str, Any]] = None
    capa_recommendations: Optional[Dict[str, Any]] = None
    executive_summary: Optional[str] = None
    agent_trace: Optional[Dict[str, Any]] = None
    updated_at: datetime

    class Config:
        from_attributes = True

class ComplaintDetailSchema(ComplaintBase):
    id: str
    status: str
    risk_level: str
    completeness_score: float
    created_at: datetime
    updated_at: datetime
    analysis: Optional[AIAnalysisSchema] = None
    audit_logs: List[AuditLogSchema] = []

    class Config:
        from_attributes = True

class ComplaintListItemSchema(BaseModel):
    id: str
    title: str
    complainant_name: Optional[str] = None
    complainant_org: Optional[str] = None
    product_name: str
    dosage_form: str
    batch_number: Optional[str] = None
    defect_type: Optional[str] = None
    status: str
    risk_level: str
    completeness_score: float
    source_type: str
    created_at: datetime

    class Config:
        from_attributes = True

class DashboardStatsSchema(BaseModel):
    total_complaints: int
    critical_risk: int
    major_risk: int
    minor_risk: int
    pending_risk: int
    open_complaints: int
    investigating_complaints: int
    capa_assigned_complaints: int
    closed_complaints: int
    avg_completeness_score: float
    api_complaints_count: int
    fdf_complaints_count: int
    risk_distribution: Dict[str, int]
    top_defect_types: List[Dict[str, Any]]
