from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, Text
from app.db.session import Base

class IntegrationEvent(Base):
    __tablename__ = "integration_events"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(String(64), nullable=True, index=True)
    event_type = Column(String(64), nullable=False)  # "NOTICE_FETCH", "CONSENT_GRANT", "CONSENT_WITHDRAW", "RECEIPT_FETCH", "DOWNSTREAM_DATA_ACCESS"
    purpose_id = Column(String(64), nullable=True)
    target_url = Column(String(256), nullable=False)
    status_code = Column(Integer, nullable=True)
    request_payload = Column(Text, nullable=True)
    response_payload = Column(Text, nullable=True)
    error_detail = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)

class ApplicationAuditLog(Base):
    __tablename__ = "application_audit_logs"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(String(64), nullable=True, index=True)
    action = Column(String(64), nullable=False)
    actor_id = Column(String(64), nullable=False)
    actor_role = Column(String(32), nullable=False)
    status = Column(String(32), nullable=False)  # "SUCCESS", "DENIED", "FAILED"
    details_json = Column(Text, nullable=True)
    ip_address = Column(String(64), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)

