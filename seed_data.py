import datetime
from sqlalchemy.orm import Session
from models import Complaint, AIAnalysis, AuditLog
from database import SessionLocal, engine, Base

PRESET_COMPLAINTS = [
    {
        "id": "CMP-2024-001",
        "title": "Black Specks & Discoloration in Paracetamol 500mg Tablets",
        "complainant_name": "Dr. Sarah Jenkins",
        "complainant_org": "St. Jude Regional Hospital Pharmacy",
        "complainant_contact": "sjenkins@stjudehospital.org",
        "product_name": "Paracetamol 500mg Tablets",
        "dosage_form": "FDF",
        "batch_number": "PCM-2024-901",
        "mfg_date": "2024-02-10",
        "expiry_date": "2026-02-09",
        "quantity_affected": "12 Blister Packs (120 Tablets)",
        "defect_type": "Contamination",
        "status": "Under Investigation",
        "risk_level": "Critical",
        "completeness_score": 100.0,
        "source_type": "Email",
        "raw_content": """URGENT PHARMA QUALITY ALERT

From: Dr. Sarah Jenkins (Chief Pharmacist, St. Jude Regional Hospital)
To: Global Pharma Quality Assurance Team
Date: Feb 14, 2024

Subject: Quality Complaint - Black specks in Paracetamol 500mg Tablets (Batch PCM-2024-901)

Dear Quality Team,

During routine inpatient dispensing today, our pharmacy technicians discovered foreign dark particle contamination (black specks embedded inside the core tablet matrix) across multiple blister strips of Paracetamol 500mg Tablets.

Complaint Metadata:
- Product Name: Paracetamol 500mg Tablets (FDF)
- Batch Number: PCM-2024-901
- Mfg Date: Feb 10, 2024 | Expiry Date: Feb 2026
- Affected Quantity: 12 Blister Packs (120 tablets)
- Incident Details: 3 separate patients reported dark discolored specks. We have placed the entire box of Batch PCM-2024-901 in our quarantine vault. Samples are available for collection.

Please investigate immediately as this poses a potential health hazard to patients.""",
        "analysis": {
            "completeness_check": {
                "is_complete": True,
                "completeness_score": 100.0,
                "missing_fields": [],
                "audit_comments": "All regulatory required intake parameters present. Sample retention confirmed.",
                "followup_email_draft": "Dear Dr. Sarah Jenkins,\n\nThank you for alerting QA. Batch PCM-2024-901 has been quarantined globally across all sites pending FTIR particle investigation."
            },
            "risk_classification": {
                "risk_level": "Critical",
                "safety_hazard": "Particulate contamination in oral dosage form poses potential patient toxicity or adverse reaction risk.",
                "regulatory_impact": "Requires 15-day expedited FDA QMS Field Alert Report (FAR) and immediate batch distribution hold.",
                "rationale": "Foreign matter inside final dosage form violates USP <790> visual inspection standards."
            },
            "duplicate_detection": {
                "has_duplicates": True,
                "matching_complaints": [
                    {"complaint_id": "CMP-2024-001", "title": "Black Specks in Paracetamol", "match_reason": "Identical Batch Number PCM-2024-901", "risk_level": "Critical"}
                ],
                "rationale": "Detected matching batch PCM-2024-901 in recent production logs."
            },
            "root_cause_analysis": {
                "probable_causes": [
                    {"category": "Machine", "hypothesis": "Granulation press punch seal degradation shedding PTFE / carbon particles", "likelihood": "High"},
                    {"category": "Material", "hypothesis": "Contaminated binder raw material lot (Starch USP)", "likelihood": "Medium"},
                    {"category": "Environment", "hypothesis": "HVAC HEPA filter bypass in compression suite #3", "likelihood": "Low"}
                ],
                "fishbone_category": "Machine",
                "analysis_summary": "Initial 5-Whys points to mechanical punch oil seal wear on rotary compression press #3."
            },
            "capa_recommendations": {
                "corrective_actions": [
                    {"action": "Quarantine all remaining inventory of Batch PCM-2024-901 across supply chain", "target_days": 1, "responsible_role": "QA Warehouse Lead"},
                    {"action": "Perform FTIR spectrometry on dark specks to identify chemical fingerprint", "target_days": 3, "responsible_role": "QC Analytical Lab"}
                ],
                "preventive_actions": [
                    {"action": "Replace punch dust cups & oil seals on Tablet Press #3 and update PM schedule", "target_days": 14, "responsible_role": "Maintenance Engineering Manager"},
                    {"action": "Implement automatic optical tablet sorting system on packaging line", "target_days": 45, "responsible_role": "Validation Lead"}
                ],
                "implementation_timeline": "Target full CAPA verification and closure in 30 days."
            },
            "executive_summary": "Critical QMS complaint logged for Paracetamol 500mg Batch PCM-2024-901 due to foreign dark particulate matter. Batch quarantined; CAPA initiated for Tablet Press #3 punch seal overhaul."
        }
    },
    {
        "id": "CMP-2024-002",
        "title": "Out-of-Specification Impurity in Bulk Metformin HCI API Powder",
        "complainant_name": "Marcus Vance",
        "complainant_org": "Apex Formulations Inc. (FDF Manufacturer)",
        "complainant_contact": "m.vance@apexpharma.com",
        "product_name": "Metformin Hydrochloride API",
        "dosage_form": "API",
        "batch_number": "MFT-API-884",
        "mfg_date": "2024-01-15",
        "expiry_date": "2027-01-14",
        "quantity_affected": "500 kg (20 Fiber Drums)",
        "defect_type": "Sub-potency",
        "status": "CAPA Assigned",
        "risk_level": "Major",
        "completeness_score": 95.0,
        "source_type": "PDF Document",
        "raw_content": """INCOMING API QUALITY EXCURSION REPORT

To: API Quality Assurance Director, Global Synth Chem
From: Marcus Vance, VP Quality Control (Apex Formulations Inc.)
Date: Jan 28, 2024

Subject: Out of Specification (OOS) Impurity C in Metformin HCI API (Batch MFT-API-884)

Dear Team,

During receiving QC release testing of Metformin HCI API (Batch MFT-API-884, 500kg shipment received on Jan 22), our HPLC assay revealed Related Compound C level at 0.28% (USP Specification Limit: NMT 0.15%).

Raw Material Details:
- Compound: Metformin Hydrochloride API (Bulk Powder)
- Batch Number: MFT-API-884
- Coa Reported Purity: 99.8% | Re-test HPLC Assay: 98.4%
- Defect: High Impurity C & Elevated Loss on Drying (LOD = 1.2% vs Spec NMT 0.5%)

We have rejected the shipment and issued a Supplier Corrective Action Request (SCAR). Please confirm root cause and return merchandise authorization.""",
        "analysis": {
            "completeness_check": {
                "is_complete": True,
                "completeness_score": 95.0,
                "missing_fields": [],
                "audit_comments": "Complete technical OOS analytical packet provided by customer lab.",
                "followup_email_draft": "Dear Marcus Vance,\n\nSCAR received. Our API synthesis QA team is performing investigation on Reactor 4 wash cycles for Batch MFT-API-884."
            },
            "risk_classification": {
                "risk_level": "Major",
                "safety_hazard": "Elevated API impurity level could result in out-of-spec finished tablet degradation.",
                "regulatory_impact": "Requires formal SCAR response and internal OOS investigation per ICH Q7 API guidelines.",
                "rationale": "Chemical assay parameter exceeds pharmacopeial (USP/EP) monograph limits."
            },
            "duplicate_detection": {
                "has_duplicates": False,
                "matching_complaints": [],
                "rationale": "No previous complaints recorded for Batch MFT-API-884."
            },
            "root_cause_analysis": {
                "probable_causes": [
                    {"category": "Method", "hypothesis": "Incomplete wash cycle volume during API centrifuge isolation stage", "likelihood": "High"},
                    {"category": "Environment", "hypothesis": "High ambient humidity during drying phase causing elevated moisture content", "likelihood": "Medium"}
                ],
                "fishbone_category": "Method",
                "analysis_summary": "Centrifuge washing phase flow rate drop led to mother liquor impurity retention on API crystals."
            },
            "capa_recommendations": {
                "corrective_actions": [
                    {"action": "Issue RMA for 500kg returned API powder and re-purify via recrystallization", "target_days": 7, "responsible_role": "API Operations Lead"},
                    {"action": "Re-test retention samples for all sister batches (MFT-API-883 to 886)", "target_days": 5, "responsible_role": "QC Analytical Lab"}
                ],
                "preventive_actions": [
                    {"action": "Automate flow-rate interlocks on API centrifuge wash solvent line", "target_days": 20, "responsible_role": "Process Engineering Manager"}
                ],
                "implementation_timeline": "CAPA closure targeted in 25 days."
            },
            "executive_summary": "Major API quality complaint logged for Metformin HCI Batch MFT-API-884 due to HPLC OOS Impurity C (0.28%). SCAR active; centrifuge wash automation CAPA underway."
        }
    },
    {
        "id": "CMP-2024-003",
        "title": "Blister Seal Foil Leakage in Amoxicillin 500mg Capsules",
        "complainant_name": "Elena Rostova",
        "complainant_org": "EuroMed Wholesalers Ltd (Prague, CZ)",
        "complainant_contact": "e.rostova@euromed.cz",
        "product_name": "Amoxicillin 500mg Capsules",
        "dosage_form": "FDF",
        "batch_number": "AMX-FDF-4402",
        "mfg_date": "2024-03-01",
        "expiry_date": "2026-02-28",
        "quantity_affected": "40 Cartons (4,000 Blisters)",
        "defect_type": "Packaging Leak",
        "status": "Logged",
        "risk_level": "Major",
        "completeness_score": 85.0,
        "source_type": "Form Submission",
        "raw_content": """CUSTOMER COMPLAINT SUBMISSION

Product Name: Amoxicillin 500mg Capsules
Batch/Lot: AMX-FDF-4402
Dosage Form: Finished Dosage Form (Capsules in ALU/PVDC Blister)
Complainant: Elena Rostova, EuroMed Wholesalers

Description:
Upon receipt of shipment pallet #4, our warehouse quality team noticed unsealed aluminum backing foil on approximately 15% of blister cavities. Capsules in unsealed pockets show signs of atmospheric moisture clumping.

Affected Quantity: 40 Cartons / 4000 Blister packs.
Sample Status: Photos attached, sample boxes retained.""",
        "analysis": {
            "completeness_check": {
                "is_complete": False,
                "completeness_score": 85.0,
                "missing_fields": ["Complainant Phone Number"],
                "audit_comments": "Missing direct phone contact for wholesaler QA representative.",
                "followup_email_draft": "Dear Elena Rostova,\n\nThank you for submitting the complaint for Amoxicillin 500mg Capsules (Batch AMX-FDF-4402). Please reply with your direct phone number and carrier waybill number."
            },
            "risk_classification": {
                "risk_level": "Major",
                "safety_hazard": "Moisture ingress into antibiotic capsules causes chemical hydrolysis and loss of potency.",
                "regulatory_impact": "Requires packaging line integrity audit and stability re-evaluation.",
                "rationale": "Primary container closure integrity failure impacts product shelf life."
            },
            "duplicate_detection": {
                "has_duplicates": False,
                "matching_complaints": [],
                "rationale": "First complaint for Batch AMX-FDF-4402."
            },
            "root_cause_analysis": {
                "probable_causes": [
                    {"category": "Machine", "hypothesis": "Blister sealing roller temperature drop on Sealing Station 2", "likelihood": "High"},
                    {"category": "Material", "hypothesis": "Foil thickness variation in aluminum lamination lot", "likelihood": "Medium"}
                ],
                "fishbone_category": "Machine",
                "analysis_summary": "Blister sealing station thermocouple calibration offset caused intermittent cold spots."
            },
            "capa_recommendations": {
                "corrective_actions": [
                    {"action": "Perform 100% visual inspection and leak testing on Batch AMX-FDF-4402 warehouse stock", "target_days": 4, "responsible_role": "Packaging Supervisor"}
                ],
                "preventive_actions": [
                    {"action": "Install continuous infrared heat monitoring on packaging line heat sealing roller", "target_days": 21, "responsible_role": "Automation Lead"}
                ],
                "implementation_timeline": "Target completion in 30 days."
            },
            "executive_summary": "Major packaging complaint for Amoxicillin 500mg Capsules due to unsealed aluminum blister foil. Sealing roller heat monitoring CAPA initiated."
        }
    }
]

def seed_database(db: Session):
    """Seed DB with realistic pharmaceutical complaints if empty."""
    existing_count = db.query(Complaint).count()
    if existing_count > 0:
        print("[Seed DB] Database already contains records. Skipping seed.")
        return

    print("[Seed DB] Seeding database with realistic API & FDF Pharma Complaints...")
    for item in PRESET_COMPLAINTS:
        comp = Complaint(
            id=item["id"],
            title=item["title"],
            complainant_name=item["complainant_name"],
            complainant_org=item["complainant_org"],
            complainant_contact=item["complainant_contact"],
            product_name=item["product_name"],
            dosage_form=item["dosage_form"],
            batch_number=item["batch_number"],
            mfg_date=item["mfg_date"],
            expiry_date=item["expiry_date"],
            quantity_affected=item["quantity_affected"],
            defect_type=item["defect_type"],
            status=item["status"],
            risk_level=item["risk_level"],
            completeness_score=item["completeness_score"],
            raw_content=item["raw_content"],
            source_type=item["source_type"],
            created_at=datetime.datetime.utcnow()
        )
        db.add(comp)
        
        # Add AI analysis
        analysis_data = item.get("analysis", {})
        analysis = AIAnalysis(
            complaint_id=item["id"],
            completeness_check=analysis_data.get("completeness_check"),
            followup_email_draft=analysis_data.get("completeness_check", {}).get("followup_email_draft"),
            risk_classification=analysis_data.get("risk_classification"),
            duplicate_detection=analysis_data.get("duplicate_detection"),
            root_cause_analysis=analysis_data.get("root_cause_analysis"),
            capa_recommendations=analysis_data.get("capa_recommendations"),
            executive_summary=analysis_data.get("executive_summary"),
            agent_trace={
                "steps": [
                    {"step": "Extraction Node", "latency_ms": 120, "output": {"product": item["product_name"], "batch": item["batch_number"]}},
                    {"step": "Completeness Checker", "latency_ms": 150, "output": {"score": item["completeness_score"]}},
                    {"step": "Risk Classifier", "latency_ms": 180, "output": {"risk": item["risk_level"]}},
                    {"step": "Duplicate Detector", "latency_ms": 80, "output": {"duplicates": False}},
                    {"step": "RCA Node", "latency_ms": 210, "output": {"category": "Machine"}},
                    {"step": "CAPA Node", "latency_ms": 190, "output": {"actions": 2}},
                    {"step": "Executive Summarizer", "latency_ms": 140, "output": {"status": "Complete"}}
                ]
            }
        )
        db.add(analysis)

        # Audit log
        log = AuditLog(
            complaint_id=item["id"],
            action="System Ingestion & AI Workflow Execution",
            performed_by="LangGraph Agent System",
            details=f"Complaint ingested from {item['source_type']}. Risk classified as {item['risk_level']}."
        )
        db.add(log)

    db.commit()
    print(f"[Seed DB] Successfully seeded {len(PRESET_COMPLAINTS)} pharmaceutical complaints.")

if __name__ == "__main__":
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    seed_database(db)
    db.close()
