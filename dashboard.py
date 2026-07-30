from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from database import get_db
from models import Complaint
from schemas import DashboardStatsSchema

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard"])

@router.get("/stats", response_model=DashboardStatsSchema)
def get_dashboard_stats(db: Session = Depends(get_db)):
    total = db.query(Complaint).count()

    critical = db.query(Complaint).filter(Complaint.risk_level == "Critical").count()
    major = db.query(Complaint).filter(Complaint.risk_level == "Major").count()
    minor = db.query(Complaint).filter(Complaint.risk_level == "Minor").count()
    pending = db.query(Complaint).filter(Complaint.risk_level == "Pending").count()

    logged = db.query(Complaint).filter(Complaint.status == "Logged").count()
    investigating = db.query(Complaint).filter(Complaint.status == "Under Investigation").count()
    capa_assigned = db.query(Complaint).filter(Complaint.status == "CAPA Assigned").count()
    closed = db.query(Complaint).filter(Complaint.status == "Closed").count()

    api_count = db.query(Complaint).filter(Complaint.dosage_form == "API").count()
    fdf_count = db.query(Complaint).filter(Complaint.dosage_form == "FDF").count()

    avg_score_res = db.query(func.avg(Complaint.completeness_score)).scalar()
    avg_score = round(float(avg_score_res or 0.0), 1)

    # Defect type breakdown
    defects_query = (
        db.query(Complaint.defect_type, func.count(Complaint.id))
        .group_by(Complaint.defect_type)
        .all()
    )
    
    top_defects = [
        {"defect_type": d[0] or "Unspecified", "count": d[1]}
        for d in defects_query
    ]
    top_defects.sort(key=lambda x: x["count"], reverse=True)

    return {
        "total_complaints": total,
        "critical_risk": critical,
        "major_risk": major,
        "minor_risk": minor,
        "pending_risk": pending,
        "open_complaints": logged + investigating + capa_assigned,
        "investigating_complaints": investigating,
        "capa_assigned_complaints": capa_assigned,
        "closed_complaints": closed,
        "avg_completeness_score": avg_score,
        "api_complaints_count": api_count,
        "fdf_complaints_count": fdf_count,
        "risk_distribution": {
            "Critical": critical,
            "Major": major,
            "Minor": minor,
            "Pending": pending
        },
        "top_defect_types": top_defects
    }
