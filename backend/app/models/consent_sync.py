from datetime import datetime
from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, DateTime, Text
from sqlalchemy.orm import relationship
from app.db.session import Base

class ConsentSyncRecord(Base):
    __tablename__ = "consent_sync_records"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(String(64), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    purpose_id = Column(String(64), nullable=False, index=True)
    local_status = Column(String(32), default="NO_CONSENT", nullable=False)
    # Statuses: CONSENT_GRANTED, CONSENT_WITHDRAWN, CONSENT_PENDING, CONSENT_STALE, NO_CONSENT
    is_stale = Column(Boolean, default=False, nullable=False)
    aiori_notice_version = Column(String(32), nullable=True)
    aiori_notice_hash = Column(String(64), nullable=True)
    aiori_receipt_id = Column(String(64), nullable=True)
    last_synced_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    sync_message = Column(String(256), nullable=True)

    user = relationship("User", back_populates="sync_records")

class IntegrationOutbox(Base):
    __tablename__ = "integration_outbox"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(String(64), nullable=False, index=True)
    action = Column(String(32), nullable=False)  # "GRANT", "WITHDRAW"
    purpose_id = Column(String(64), nullable=False)
    payload_json = Column(Text, nullable=False)
    attempts = Column(Integer, default=0, nullable=False)
    max_attempts = Column(Integer, default=5, nullable=False)
    status = Column(String(32), default="PENDING", nullable=False)  # "PENDING", "COMPLETED", "FAILED"
    last_attempt_at = Column(DateTime, nullable=True)
    error_message = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

