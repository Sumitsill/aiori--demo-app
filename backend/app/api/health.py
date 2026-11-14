from datetime import datetime
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text

from app.db.session import get_db
from app.services.aiori_client import aiori_client

router = APIRouter(tags=["Health & Status"])

@router.get("/health")
def health_check(db: Session = Depends(get_db)):
    """FitPulse backend service health probe."""
    try:
        db.execute(text("SELECT 1"))
        db_ok = True
    except Exception:
        db_ok = False

    aiori_ok, aiori_data = aiori_client.check_health()

    return {
        "service": "FitPulse Fitness Platform Backend",
        "status": "healthy" if db_ok else "unhealthy",
        "version": "1.0.0",
        "database_connected": db_ok,
        "aiori_integration": {
            "connected": aiori_ok,
            "target_url": aiori_client.base_url,
        },
        "timestamp": datetime.utcnow().isoformat() + "Z",
    }

