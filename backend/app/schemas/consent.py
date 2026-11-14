from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field

class ConsentActionRequest(BaseModel):
    purpose_id: str = Field(..., description="Target purpose ID: fitness_analytics, personalized_recommendations, marketing, research_sharing")
    language: Optional[str] = Field("en", description="Notice language code: en, hi, bn")

class NoticeRead(BaseModel):
    version: str
    hash_sha256: str
    title: str
    content: str
    language: str

class PurposeInfo(BaseModel):
    id: str
    name: str
    description: str
    category: str
    is_active: bool

class PurposeConsentState(BaseModel):
    purpose_id: str
    purpose_name: str
    purpose_description: str
    status: str  # "CONSENT_GRANTED", "CONSENT_WITHDRAWN", "CONSENT_PENDING", "CONSENT_STALE", "NO_CONSENT"
    raw_status: str  # "GRANTED", "WITHDRAWN", "NO_CONSENT"
    is_stale: bool
    notice_version: Optional[str] = None
    notice_hash: Optional[str] = None
    language: Optional[str] = "en"
    last_updated: Optional[datetime] = None
    latest_receipt_id: Optional[str] = None
    is_pending_outbox: bool = False

class UserConsentOverview(BaseModel):
    user_id: str
    current_notice: Optional[NoticeRead] = None
    purposes: List[PurposeConsentState]
    aiori_connected: bool
    last_synced_at: Optional[datetime] = None
    error_message: Optional[str] = None

class ReceiptRead(BaseModel):
    receipt_id: str
    consent_event_id: str
    user_id: str
    purpose_id: str
    purpose_name: str
    action: str
    notice_version: str
    notice_hash: str
    language: str
    data_categories: List[str]
    timestamp_utc: datetime
    collection_channel: str
    actor_id: str
    actor_type: str
    application_id: str
    receipt_hash: str

class ReceiptVerifyResult(BaseModel):
    receipt_id: str
    is_valid: bool
    computed_hash: str
    stored_hash: str
    verified_at: datetime
    notice_hash_matched: bool
    error_message: Optional[str] = None

