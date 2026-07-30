import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File, Form
from sqlalchemy.orm import Session
from database import get_db
from models import Complaint, AIAnalysis, AuditLog
from schemas import (
    ComplaintDetailSchema,
    ComplaintListItemSchema,
    ComplaintCreate,
    ComplaintStatusUpdate,
    ReanalyzeRequest
)
from agent.workflow import build_complaint_agent_workflow
from seed_data import PRESET_COMPLAINTS

router = APIRouter(prefix="/api/complaints", tags=["Complaints"])

agent_workflow = build_complaint_agent_workflow()

@router.get("/presets")
def get_preset_complaints():
    """Return realistic pre-loaded pharmaceutical complaint templates for instant UI testing."""
    return PRESET_COMPLAINTS

@router.get("", response_model=List[ComplaintListItemSchema])
def list_complaints(
    search: Optional[str] = None,
    risk_level: Optional[str] = None,
    dosage_form: Optional[str] = None,
    status: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Complaint)

    if search:
        s = f"%{search}%"
        query = query.filter(
            (Complaint.title.ilike(s)) |
            (Complaint.product_name.ilike(s)) |
            (Complaint.batch_number.ilike(s)) |
            (Complaint.complainant_name.ilike(s)) |
            (Complaint.defect_type.ilike(s))
        )
    if risk_level and risk_level.lower() != "all":
        query = query.filter(Complaint.risk_level == risk_level)
    if dosage_form and dosage_form.lower() != "all":
        query = query.filter(Complaint.dosage_form == dosage_form)
    if status and status.lower() != "all":
        query = query.filter(Complaint.status == status)

    complaints = query.order_by(Complaint.created_at.desc()).all()
    return complaints

@router.get("/{complaint_id}", response_model=ComplaintDetailSchema)
def get_complaint_detail(complaint_id: str, db: Session = Depends(get_db)):
    comp = db.query(Complaint).filter(Complaint.id == complaint_id).first()
    if not comp:
        raise HTTPException(status_code=404, detail="Complaint not found")
    return comp

@router.post("/ingest", response_model=ComplaintDetailSchema)
def ingest_complaint(payload: ComplaintCreate, db: Session = Depends(get_db)):
    """Ingest raw complaint text, run LangGraph AI Agent pipeline, and save to DB."""
    # 1. Fetch existing complaints for duplicate detection node
    existing_records = db.query(Complaint).all()
    existing_data = [
        {
            "id": c.id,
            "title": c.title,
            "product_name": c.product_name,
            "batch_number": c.batch_number,
            "risk_level": c.risk_level
        } for c in existing_records
    ]

    # 2. Run LangGraph Workflow
    state_input = {
        "raw_content": payload.raw_content,
        "groq_api_key": payload.groq_api_key or "",
        "existing_complaints": existing_data,
        "trace_logs": []
    }
    
    workflow_result = agent_workflow.invoke(state_input)

    ext = workflow_result.get("extracted_data", {})
    completeness = workflow_result.get("completeness_result", {})
    risk = workflow_result.get("risk_result", {})
    dup = workflow_result.get("duplicate_result", {})
    rca = workflow_result.get("rca_result", {})
    capa = workflow_result.get("capa_result", {})
    summary = workflow_result.get("summary_result", {})
    trace = workflow_result.get("trace_logs", [])

    # 3. Formulate ID
    comp_id = f"CMP-{uuid.uuid4().hex[:6].upper()}"

    # Use extracted or payload provided values
    title = payload.title or ext.get("title") or f"Quality Excursion: {payload.product_name}"
    prod_name = ext.get("product_name") or payload.product_name
    dosage = ext.get("dosage_form") or payload.dosage_form or "FDF"
    batch_num = ext.get("batch_number") or payload.batch_number
    defect = ext.get("defect_type") or payload.defect_type
    complainant_name = ext.get("complainant_name") or payload.complainant_name
    complainant_org = ext.get("complainant_org") or payload.complainant_org
    complainant_contact = ext.get("complainant_contact") or payload.complainant_contact

    risk_lvl = risk.get("risk_level", "Pending")
    comp_score = float(completeness.get("completeness_score", 0.0))

    comp = Complaint(
        id=comp_id,
        title=title,
        complainant_name=complainant_name,
        complainant_org=complainant_org,
        complainant_contact=complainant_contact,
        product_name=prod_name,
        dosage_form=dosage,
        batch_number=batch_num,
        mfg_date=ext.get("mfg_date") or payload.mfg_date,
        expiry_date=ext.get("expiry_date") or payload.expiry_date,
        quantity_affected=ext.get("quantity_affected") or payload.quantity_affected,
        defect_type=defect,
        status="Logged",
        risk_level=risk_lvl,
        completeness_score=comp_score,
        raw_content=payload.raw_content,
        source_type=payload.source_type or "Form Submission"
    )
    db.add(comp)

    # Save AI Analysis record
    analysis = AIAnalysis(
        complaint_id=comp_id,
        completeness_check=completeness,
        followup_email_draft=completeness.get("followup_email_draft"),
        risk_classification=risk,
        duplicate_detection=dup,
        root_cause_analysis=rca,
        capa_recommendations=capa,
        executive_summary=summary.get("executive_summary"),
        agent_trace={"steps": trace}
    )
    db.add(analysis)

    # Add audit log
    log = AuditLog(
        complaint_id=comp_id,
        action="LangGraph Agent Processing Completed",
        performed_by="System Agent",
        details=f"Extracted attributes, checked completeness ({comp_score}%), classified risk as {risk_lvl}."
    )
    db.add(log)

    db.commit()
    db.refresh(comp)
    return comp

@router.put("/{complaint_id}/status", response_model=ComplaintDetailSchema)
def update_complaint_status(
    complaint_id: str,
    payload: ComplaintStatusUpdate,
    db: Session = Depends(get_db)
):
    comp = db.query(Complaint).filter(Complaint.id == complaint_id).first()
    if not comp:
        raise HTTPException(status_code=404, detail="Complaint not found")

    old_status = comp.status
    comp.status = payload.status

    log = AuditLog(
        complaint_id=complaint_id,
        action=f"Status Changed: {old_status} -> {payload.status}",
        performed_by=payload.updated_by or "QA Manager",
        details=payload.note or f"Updated status to {payload.status}."
    )
    db.add(log)

    db.commit()
    db.refresh(comp)
    return comp

@router.post("/{complaint_id}/reanalyze", response_model=ComplaintDetailSchema)
def reanalyze_complaint(
    complaint_id: str,
    payload: ReanalyzeRequest,
    db: Session = Depends(get_db)
):
    comp = db.query(Complaint).filter(Complaint.id == complaint_id).first()
    if not comp:
        raise HTTPException(status_code=404, detail="Complaint not found")

    existing_records = db.query(Complaint).filter(Complaint.id != complaint_id).all()
    existing_data = [
        {
            "id": c.id,
            "title": c.title,
            "product_name": c.product_name,
            "batch_number": c.batch_number,
            "risk_level": c.risk_level
        } for c in existing_records
    ]

    state_input = {
        "raw_content": comp.raw_content,
        "groq_api_key": payload.groq_api_key or "",
        "existing_complaints": existing_data,
        "trace_logs": []
    }

    workflow_result = agent_workflow.invoke(state_input)

    ext = workflow_result.get("extracted_data", {})
    completeness = workflow_result.get("completeness_result", {})
    risk = workflow_result.get("risk_result", {})
    dup = workflow_result.get("duplicate_result", {})
    rca = workflow_result.get("rca_result", {})
    capa = workflow_result.get("capa_result", {})
    summary = workflow_result.get("summary_result", {})
    trace = workflow_result.get("trace_logs", [])

    comp.risk_level = risk.get("risk_level", comp.risk_level)
    comp.completeness_score = float(completeness.get("completeness_score", comp.completeness_score))

    # Update or create AIAnalysis
    if comp.analysis:
        comp.analysis.completeness_check = completeness
        comp.analysis.followup_email_draft = completeness.get("followup_email_draft")
        comp.analysis.risk_classification = risk
        comp.analysis.duplicate_detection = dup
        comp.analysis.root_cause_analysis = rca
        comp.analysis.capa_recommendations = capa
        comp.analysis.executive_summary = summary.get("executive_summary")
        comp.analysis.agent_trace = {"steps": trace}
    else:
        comp.analysis = AIAnalysis(
            complaint_id=comp.id,
            completeness_check=completeness,
            followup_email_draft=completeness.get("followup_email_draft"),
            risk_classification=risk,
            duplicate_detection=dup,
            root_cause_analysis=rca,
            capa_recommendations=capa,
            executive_summary=summary.get("executive_summary"),
            agent_trace={"steps": trace}
        )

    log = AuditLog(
        complaint_id=comp.id,
        action="Re-run LangGraph Agent AI Analysis",
        performed_by="System Agent",
        details="Triggered AI re-analysis on demand."
    )
    db.add(log)

    db.commit()
    db.refresh(comp)
    return comp

@router.delete("/{complaint_id}")
def delete_complaint(complaint_id: str, db: Session = Depends(get_db)):
    comp = db.query(Complaint).filter(Complaint.id == complaint_id).first()
    if not comp:
        raise HTTPException(status_code=404, detail="Complaint not found")

    db.delete(comp)
    db.commit()
    return {"message": f"Complaint {complaint_id} deleted successfully."}

@router.post("/chat")
def chat_with_ai_assistant(payload: dict):
    from agent.llm_client import GroqQMSClient
    client = GroqQMSClient(api_key=payload.get("groq_api_key"))
    question = payload.get("question", "")
    context = payload.get("context", "")

    system_prompt = "You are the AI Complaint Intake Assistant for a Pharmaceutical QMS (21 CFR Part 211.198 / ICH Q10). Help the QA manager understand the complaint, mandatory details, potential root causes, or regulatory guidelines."
    user_prompt = f"Complaint Context:\n{context}\n\nUser Question:\n{question}"

    if client.client:
        try:
            res = client.client.chat.completions.create(
                model="gemma2-9b-it",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                max_tokens=500
            )
            answer = res.choices[0].message.content
        except Exception as e:
            answer = f"Based on cGMP Quality Management standards: {question} is evaluated against API & Finished Dosage Form safety guidelines. Make sure all batch parameters and retention samples are logged."
    else:
        answer = f"Based on cGMP QMS guidelines for API & FDF manufacturing: Regarding '{question}', ensure product batch numbers, manufacturing dates, and complainant details are verified before closing."

    return {"answer": answer}

