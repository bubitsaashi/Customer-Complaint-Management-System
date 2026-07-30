import time
from typing import Dict, Any, List, TypedDict
from langgraph.graph import StateGraph, END
from agent.prompts import (
    SYSTEM_EXTRACTION_PROMPT,
    SYSTEM_COMPLETENESS_PROMPT,
    SYSTEM_RISK_CLASSIFICATION_PROMPT,
    SYSTEM_RCA_PROMPT,
    SYSTEM_CAPA_PROMPT,
    SYSTEM_SUMMARY_PROMPT
)
from agent.llm_client import GroqQMSClient

class ComplaintState(TypedDict):
    raw_content: str
    groq_api_key: str
    extracted_data: Dict[str, Any]
    completeness_result: Dict[str, Any]
    risk_result: Dict[str, Any]
    duplicate_result: Dict[str, Any]
    rca_result: Dict[str, Any]
    capa_result: Dict[str, Any]
    summary_result: Dict[str, Any]
    existing_complaints: List[Dict[str, Any]]
    trace_logs: List[Dict[str, Any]]

def extract_node(state: ComplaintState) -> Dict[str, Any]:
    start_t = time.time()
    client = GroqQMSClient(api_key=state.get("groq_api_key"))
    res = client.generate_json(SYSTEM_EXTRACTION_PROMPT, state["raw_content"])
    
    elapsed = round((time.time() - start_t) * 1000, 2)
    log_entry = {
        "step": "Extraction Node",
        "description": "Extracted structured complaint details (Batch, Product, Complainant, Dosage Form).",
        "latency_ms": elapsed,
        "output": res
    }
    
    return {
        "extracted_data": res,
        "trace_logs": state.get("trace_logs", []) + [log_entry]
    }

def completeness_node(state: ComplaintState) -> Dict[str, Any]:
    start_t = time.time()
    client = GroqQMSClient(api_key=state.get("groq_api_key"))
    ext = state.get("extracted_data", {})
    user_prompt = f"Extracted Data:\n{ext}\n\nOriginal Text:\n{state['raw_content']}"
    
    res = client.generate_json(SYSTEM_COMPLETENESS_PROMPT, user_prompt)
    
    elapsed = round((time.time() - start_t) * 1000, 2)
    log_entry = {
        "step": "Completeness Checker Node",
        "description": f"Evaluated regulatory mandatory fields. Score: {res.get('completeness_score', 0)}%.",
        "latency_ms": elapsed,
        "output": res
    }
    
    return {
        "completeness_result": res,
        "trace_logs": state.get("trace_logs", []) + [log_entry]
    }

def risk_node(state: ComplaintState) -> Dict[str, Any]:
    start_t = time.time()
    client = GroqQMSClient(api_key=state.get("groq_api_key"))
    ext = state.get("extracted_data", {})
    user_prompt = f"Product: {ext.get('product_name')}\nDosage Form: {ext.get('dosage_form')}\nDefect: {ext.get('defect_type')}\nDetails:\n{ext.get('summary')}"
    
    res = client.generate_json(SYSTEM_RISK_CLASSIFICATION_PROMPT, user_prompt)
    
    elapsed = round((time.time() - start_t) * 1000, 2)
    log_entry = {
        "step": "Risk Classifier Node",
        "description": f"Classified QMS risk tier as: {res.get('risk_level', 'Pending')}.",
        "latency_ms": elapsed,
        "output": res
    }
    
    return {
        "risk_result": res,
        "trace_logs": state.get("trace_logs", []) + [log_entry]
    }

def duplicate_node(state: ComplaintState) -> Dict[str, Any]:
    start_t = time.time()
    ext = state.get("extracted_data", {})
    batch_num = (ext.get("batch_number") or "").strip().upper()
    product = (ext.get("product_name") or "").strip().lower()
    
    matches = []
    for item in state.get("existing_complaints", []):
        item_batch = (item.get("batch_number") or "").strip().upper()
        item_prod = (item.get("product_name") or "").strip().lower()
        
        # Exact batch match or high similarity product + defect
        if batch_num and item_batch and batch_num == item_batch:
            matches.append({
                "complaint_id": item.get("id"),
                "title": item.get("title"),
                "match_reason": f"Identical Batch Number matched ({batch_num})",
                "risk_level": item.get("risk_level")
            })
        elif product and item_prod and product in item_prod:
            matches.append({
                "complaint_id": item.get("id"),
                "title": item.get("title"),
                "match_reason": f"Matching product family ({item.get('product_name')})",
                "risk_level": item.get("risk_level")
            })

    dup_res = {
        "has_duplicates": len(matches) > 0,
        "matching_complaints": matches[:5],
        "rationale": f"Found {len(matches)} historical complaint match(es) in database." if matches else "No duplicate complaint signatures detected for this lot/product."
    }

    elapsed = round((time.time() - start_t) * 1000, 2)
    log_entry = {
        "step": "Duplicate Detector Node",
        "description": f"Scanned DB complaints. Found {len(matches)} potential duplicate matches.",
        "latency_ms": elapsed,
        "output": dup_res
    }

    return {
        "duplicate_result": dup_res,
        "trace_logs": state.get("trace_logs", []) + [log_entry]
    }

def rca_node(state: ComplaintState) -> Dict[str, Any]:
    start_t = time.time()
    client = GroqQMSClient(api_key=state.get("groq_api_key"))
    ext = state.get("extracted_data", {})
    user_prompt = f"Product: {ext.get('product_name')}\nDosage Form: {ext.get('dosage_form')}\nDefect Type: {ext.get('defect_type')}\nContext: {ext.get('summary')}"
    
    res = client.generate_json(SYSTEM_RCA_PROMPT, user_prompt)
    
    elapsed = round((time.time() - start_t) * 1000, 2)
    log_entry = {
        "step": "Root Cause Analysis (RCA) Node",
        "description": f"Generated Ishikawa 5-Whys root cause hypotheses ({res.get('fishbone_category')}).",
        "latency_ms": elapsed,
        "output": res
    }
    
    return {
        "rca_result": res,
        "trace_logs": state.get("trace_logs", []) + [log_entry]
    }

def capa_node(state: ComplaintState) -> Dict[str, Any]:
    start_t = time.time()
    client = GroqQMSClient(api_key=state.get("groq_api_key"))
    ext = state.get("extracted_data", {})
    rca = state.get("rca_result", {})
    user_prompt = f"Product: {ext.get('product_name')}\nDosage Form: {ext.get('dosage_form')}\nRCA Hypotheses: {rca.get('probable_causes')}\nDefect: {ext.get('defect_type')}"
    
    res = client.generate_json(SYSTEM_CAPA_PROMPT, user_prompt)
    
    elapsed = round((time.time() - start_t) * 1000, 2)
    log_entry = {
        "step": "CAPA Recommendation Node",
        "description": "Formulated Corrective & Preventive Action plan for QMS approval.",
        "latency_ms": elapsed,
        "output": res
    }
    
    return {
        "capa_result": res,
        "trace_logs": state.get("trace_logs", []) + [log_entry]
    }

def summary_node(state: ComplaintState) -> Dict[str, Any]:
    start_t = time.time()
    client = GroqQMSClient(api_key=state.get("groq_api_key"))
    ext = state.get("extracted_data", {})
    risk = state.get("risk_result", {})
    rca = state.get("rca_result", {})
    capa = state.get("capa_result", {})

    user_prompt = f"Complaint: {ext.get('title')}\nProduct: {ext.get('product_name')}\nBatch: {ext.get('batch_number')}\nRisk Tier: {risk.get('risk_level')}\nRCA Summary: {rca.get('analysis_summary')}\nCAPA Timeline: {capa.get('implementation_timeline')}"
    
    res = client.generate_json(SYSTEM_SUMMARY_PROMPT, user_prompt)
    
    elapsed = round((time.time() - start_t) * 1000, 2)
    log_entry = {
        "step": "Executive Summarizer Node",
        "description": "Synthesized executive QA summary report.",
        "latency_ms": elapsed,
        "output": res
    }
    
    return {
        "summary_result": res,
        "trace_logs": state.get("trace_logs", []) + [log_entry]
    }

def build_complaint_agent_workflow():
    workflow = StateGraph(ComplaintState)

    workflow.add_node("extract", extract_node)
    workflow.add_node("completeness", completeness_node)
    workflow.add_node("risk", risk_node)
    workflow.add_node("duplicate", duplicate_node)
    workflow.add_node("rca", rca_node)
    workflow.add_node("capa", capa_node)
    workflow.add_node("summary", summary_node)

    workflow.set_entry_point("extract")
    workflow.add_edge("extract", "completeness")
    workflow.add_edge("completeness", "risk")
    workflow.add_edge("risk", "duplicate")
    workflow.add_edge("duplicate", "rca")
    workflow.add_edge("rca", "capa")
    workflow.add_edge("capa", "summary")
    workflow.add_edge("summary", END)

    return workflow.compile()
