from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.core.security import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.schemas.consent import (
    ConsentActionRequest,
    UserConsentOverview,
    ReceiptRead,
    ReceiptVerifyResult,
)
from app.services.consent_sync_service import ConsentSyncService
from app.services.aiori_client import aiori_client

router = APIRouter(prefix="/consent", tags=["AIORI-3 Consent Integration"])

@router.get("/overview", response_model=UserConsentOverview)
def get_consent_overview(
    lang: str = Query("en", description="Language code: en, hi, bn"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Retrieves live purpose-specific consent status and active privacy notice from AIORI-3.
    Evaluates staleness, withdrawal, and pending outbox synchronization.
    """
    return ConsentSyncService.get_user_consent_overview(db, current_user.id, lang=lang)

@router.post("/grant")
def grant_consent(
    payload: ConsentActionRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Authenticates user and securely communicates with AIORI-3 to record consent.
    Generates Kantara-aligned receipt and appends to the SHA-256 audit ledger on AIORI-3.
    """
    if current_user.role == "ADMIN":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Administrators cannot grant personal consent on behalf of users under DPDP Act 2023 §6.",
        )

    success, message, detail = ConsentSyncService.grant_consent(
        db=db,
        user_id=current_user.id,
        purpose_id=payload.purpose_id,
        language=payload.language or "en",
    )
    if not success:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=message,
        )
    return {"success": True, "message": message, "data": detail}

@router.post("/withdraw")
def withdraw_consent(
    payload: ConsentActionRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Submits an authoritative consent withdrawal to AIORI-3.
    Withdrawals immediately block downstream data access.
    If AIORI-3 is unreachable, uses fail-closed pattern: immediately blocks sharing
    and enqueues for outbox reconciliation.
    """
    if current_user.role == "ADMIN":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Administrators cannot withdraw personal consent on behalf of users under DPDP Act 2023 §6.",
        )

    success, message, detail = ConsentSyncService.withdraw_consent(
        db=db,
        user_id=current_user.id,
        purpose_id=payload.purpose_id,
        language=payload.language or "en",
    )
    return {"success": True, "message": message, "data": detail}

@router.get("/receipts", response_model=List[ReceiptRead])
def get_receipts(
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Retrieves Kantara 7807 structured consent receipts issued by AIORI-3."""
    receipts = aiori_client.list_receipts(user_id=current_user.id, limit=limit, db=db)
    return receipts

@router.get("/receipts/{receipt_id}/verify", response_model=ReceiptVerifyResult)
def verify_receipt(
    receipt_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Cryptographically validates the SHA-256 integrity of an individual consent receipt."""
    ok, res = aiori_client.verify_receipt(receipt_id=receipt_id, db=db)
    if not ok and "not found" in str(res).lower():
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Receipt not found on AIORI-3.")
    return res

@router.post("/retry-outbox")
def retry_outbox_sync(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Triggers retry of any pending outbox items when connectivity restores."""
    count = ConsentSyncService.process_outbox(db)
    return {"message": f"Synchronized {count} pending consent operation(s) with AIORI-3.", "synced": count}

