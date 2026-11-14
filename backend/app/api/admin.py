from typing import List, Dict, Any, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session
from sqlalchemy import desc

from app.core.security import require_roles
from app.db.session import get_db
from app.models.user import User
from app.models.workout import Workout
from app.models.metrics import FitnessMetric
from app.models.consent_sync import ConsentSyncRecord, IntegrationOutbox
from app.models.integration import IntegrationEvent, ApplicationAuditLog
from app.schemas.auth import UserRead
from app.services.aiori_client import aiori_client
from app.services.consent_sync_service import ConsentSyncService

class NoticePublishRequest(BaseModel):
    version: str = Field(..., description="e.g. v2.0")
    title: str = Field(..., description="Notice title")
    content: str = Field(..., description="Full text terms & data processing scope")
    language: Optional[str] = "en"

router = APIRouter(prefix="/admin", tags=["FitPulse Administration"])

@router.get("/stats")
def get_platform_stats(
    db: Session = Depends(get_db),
    admin_user: User = Depends(require_roles("ADMIN")),
):
    """
    Administrator dashboard telemetry:
    - User count
    - Workout statistics
    - Consent sync state distribution
    - AIORI-3 connection status
    - Pending outbox operations
    """
    total_users = db.query(User).count()
    total_workouts = db.query(Workout).count()
    total_metrics = db.query(FitnessMetric).count()
    pending_outbox = db.query(IntegrationOutbox).filter(IntegrationOutbox.status == "PENDING").count()

    # Sync records distribution
    sync_records = db.query(ConsentSyncRecord).all()
    status_distribution: Dict[str, int] = {}
    for r in sync_records:
        status_distribution[r.local_status] = status_distribution.get(r.local_status, 0) + 1

    aiori_ok, aiori_health = aiori_client.check_health()

    return {
        "platform": {
            "total_users": total_users,
            "total_workouts": total_workouts,
            "total_metrics_logged": total_metrics,
            "pending_sync_outbox": pending_outbox,
        },
        "consent_distribution": status_distribution,
        "aiori_integration": {
            "is_connected": aiori_ok,
            "target_url": aiori_client.base_url,
            "health_details": aiori_health,
        },
    }

@router.get("/users", response_model=List[UserRead])
def list_users(
    db: Session = Depends(get_db),
    admin_user: User = Depends(require_roles("ADMIN")),
):
    """Lists registered FitPulse users."""
    return db.query(User).order_by(User.created_at.desc()).all()

@router.get("/integration-events")
def list_integration_events(
    limit: int = 50,
    db: Session = Depends(get_db),
    admin_user: User = Depends(require_roles("ADMIN")),
):
    """Audit stream of HTTP communications with AIORI-3."""
    events = db.query(IntegrationEvent).order_by(desc(IntegrationEvent.created_at)).limit(limit).all()
    return [
        {
            "id": e.id,
            "user_id": e.user_id,
            "event_type": e.event_type,
            "purpose_id": e.purpose_id,
            "target_url": e.target_url,
            "status_code": e.status_code,
            "error_detail": e.error_detail,
            "created_at": e.created_at,
        }
        for e in events
    ]

@router.get("/notices/current")
def get_current_notice_admin(
    lang: str = Query("en"),
    db: Session = Depends(get_db),
    admin_user: User = Depends(require_roles("ADMIN")),
):
    """Retrieves active notice from AIORI-3 for admin inspection."""
    notice = aiori_client.get_current_notice(lang=lang, db=db)
    if not notice:
        raise HTTPException(status_code=404, detail="No active privacy notice found on AIORI-3.")
    return notice

@router.post("/notices/publish")
def publish_notice_revision(
    payload: NoticePublishRequest,
    db: Session = Depends(get_db),
    admin_user: User = Depends(require_roles("ADMIN")),
):
    """
    FitPulse Admin endpoint to publish a privacy notice revision to AIORI-3.
    This creates an RFC 8785 SHA-256 hash block in AIORI-3's audit ledger,
    invalidates all older user consents (marking them CONSENT_STALE),
    and halts downstream data release until individual users re-consent.
    """
    success, message, detail = ConsentSyncService.publish_notice_and_invalidate_consents(
        db=db,
        version=payload.version.strip(),
        title=payload.title.strip(),
        content=payload.content.strip(),
        language=payload.language or "en",
        admin_id=admin_user.id,
    )
    if not success:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=message,
        )
    return {
        "success": True,
        "message": message,
        "notice": detail,
    }

