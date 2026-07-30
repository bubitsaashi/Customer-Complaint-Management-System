import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base, SessionLocal
from routers import complaints, dashboard
from seed_data import seed_database

# Create DB tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Pharma QMS AI Customer Complaint Management System",
    description="AI-Powered Customer Complaint Intake, Risk Triage, RCA, and CAPA Pipeline built with LangGraph & Groq LLM.",
    version="1.0.0"
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Seed database on startup if empty
@app.on_event("startup")
def startup_event():
    db = SessionLocal()
    try:
        seed_database(db)
    finally:
        db.close()

# Include Routers
app.include_router(complaints.router)
app.include_router(dashboard.router)

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "system": "Pharma QMS AI Complaint Engine",
        "framework": "LangGraph + Groq LLM"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
