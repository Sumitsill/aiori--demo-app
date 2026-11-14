from datetime import datetime
from typing import Optional
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.security import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.schemas.consumer import ConsumerAccessRequest, ConsumerAccessResponse
from app.services.aiori_client import aiori_client

router = APIRouter(prefix="/consumer", tags=["Downstream Consumer Simulation"])

@router.post("/test-access", response_model=ConsumerAccessResponse)
def simulate_consumer_data_request(
    payload: ConsumerAccessRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Simulates a third-party downstream data consumer (FitPulse Analytics Platform)
    requesting fitness data under a stated purpose.
    Evaluates through AIORI-3's 10-point cryptographic authorization pipeline:
    - ALLOW (HTTP 200) with telemetry if consent active
    - DENY (HTTP 403/401) with RFC 9457 Problem Details if withdrawn or unauthorized
    """
    target_user = payload.target_user_id or current_user.id
    status_code, response_body = aiori_client.simulate_downstream_data_access(
        user_id=target_user,
        purpose=payload.purpose,
        consumer_key=payload.override_api_key,
        db=db,
    )

    is_allowed = (status_code == 200)
    reason_code = response_body.get("reason_code", "UNKNOWN")
    message = response_body.get("message") or ("Access granted by AIORI-3" if is_allowed else "Access denied by AIORI-3")

    return ConsumerAccessResponse(
        allowed=is_allowed,
        status_code=status_code,
        status="ALLOWED" if is_allowed else "DENIED",
        reason_code=reason_code,
        message=message,
        consumer_id=response_body.get("consumer_id", "consumer_fitpulse"),
        user_id=target_user,
        purpose=payload.purpose,
        timestamp=datetime.utcnow(),
        data=response_body.get("data") if is_allowed else None,
        problem_details=response_body if not is_allowed else None,
    )
