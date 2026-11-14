import json
import logging
from datetime import datetime
from typing import Optional, List, Dict, Any, Tuple
from sqlalchemy.orm import Session

from app.models.consent_sync import ConsentSyncRecord, IntegrationOutbox
from app.models.integration import ApplicationAuditLog
from app.schemas.consent import PurposeConsentState, UserConsentOverview, NoticeRead
from app.services.aiori_client import aiori_client

logger = logging.getLogger("fitpulse.consent_sync")

STANDARD_PURPOSES = [
    {
        "id": "fitness_analytics",
        "name": "Fitness Analytics & Metrics",
        "description": "Collection and processing of daily steps, heart rate variability, calorie burn, and exercise patterns to compute performance insights.",
        "category": "telemetry",
    },
    {
        "id": "personalized_recommendations",
        "name": "Personalized Recommendations",
        "description": "Analysis of biometric activity data to deliver tailored workout routines, recovery suggestions, and nutrition guidelines.",
        "category": "enhancement",
    },
    {
        "id": "marketing",
        "name": "Marketing & Wellness Communications",
        "description": "Transmission of promotional updates, fitness gear discounts, and community event invitations.",
        "category": "commercial",
    },
    {
        "id": "research_sharing",
        "name": "Research & Partner Sharing",
        "description": "Sharing de-identified, aggregated cardiovascular and endurance data with academic sports science partners.",
        "category": "research",
    },
]

class ConsentSyncService:
    @staticmethod
    def get_user_consent_overview(
        db: Session,
        user_id: str,
        lang: str = "en",
    ) -> UserConsentOverview:
        """
        Derives the complete consent overview for a FitPulse user:
        1. Checks AIORI-3 connection
        2. Retrieves live authoritative consent state from AIORI-3
        3. Falls back gracefully to locally synchronized records if AIORI-3 is temporarily down
        """
        is_healthy, _ = aiori_client.check_health()
        current_notice_data = aiori_client.get_current_notice(lang=lang, db=db) if is_healthy else None

        current_notice = None
        if current_notice_data:
            current_notice = NoticeRead(
                version=current_notice_data.get("version", "v1.0"),
                hash_sha256=current_notice_data.get("hash_sha256", ""),
                title=current_notice_data.get("title", "Privacy Notice"),
                content=current_notice_data.get("content", ""),
                language=current_notice_data.get("language", lang),
            )

        aiori_state = None
        if is_healthy:
            aiori_state = aiori_client.get_user_consent_state(user_id=user_id, lang=lang, db=db)

        # Map purposes
        purposes_overview: List[PurposeConsentState] = []
        pending_outbox = db.query(IntegrationOutbox).filter(
            IntegrationOutbox.user_id == user_id,
            IntegrationOutbox.status == "PENDING",
        ).all()
        pending_map = {item.purpose_id: item.action for item in pending_outbox}

        if aiori_state and "states" in aiori_state:
            # Synchronize into local database
            for s in aiori_state["states"]:
                pid = s["purpose_id"]
                raw_status = s["status"]  # "GRANTED", "WITHDRAWN", "NO_CONSENT"
                is_stale = s.get("is_stale", False)

                # Determine display status
                if pending_map.get(pid) == "WITHDRAW":
                    display_status = "CONSENT_PENDING"
                elif raw_status == "GRANTED" and is_stale:
                    display_status = "CONSENT_STALE"
                elif raw_status == "GRANTED":
                    display_status = "CONSENT_GRANTED"
                elif raw_status == "WITHDRAWN":
                    display_status = "CONSENT_WITHDRAWN"
                else:
                    display_status = "NO_CONSENT"

                # Update or create local sync record
                record = db.query(ConsentSyncRecord).filter(
                    ConsentSyncRecord.user_id == user_id,
                    ConsentSyncRecord.purpose_id == pid,
                ).first()

                if not record:
                    record = ConsentSyncRecord(
                        user_id=user_id,
                        purpose_id=pid,
                        local_status=display_status,
                        is_stale=is_stale,
                        aiori_notice_version=s.get("notice_version"),
                        aiori_notice_hash=s.get("notice_hash"),
                        aiori_receipt_id=s.get("latest_receipt_id"),
                        last_synced_at=datetime.utcnow(),
                    )
                    db.add(record)
                else:
                    record.local_status = display_status
                    record.is_stale = is_stale
                    record.aiori_notice_version = s.get("notice_version")
                    record.aiori_notice_hash = s.get("notice_hash")
                    record.aiori_receipt_id = s.get("latest_receipt_id")
                    record.last_synced_at = datetime.utcnow()

                purposes_overview.append(
                    PurposeConsentState(
                        purpose_id=pid,
                        purpose_name=s.get("purpose_name", pid),
                        purpose_description=s.get("purpose_description", ""),
                        status=display_status,
                        raw_status=raw_status,
                        is_stale=is_stale,
                        notice_version=s.get("notice_version"),
                        notice_hash=s.get("notice_hash"),
                        language=s.get("language", lang),
                        last_updated=s.get("last_updated"),
                        latest_receipt_id=s.get("latest_receipt_id"),
                        is_pending_outbox=pid in pending_map,
                    )
                )
            db.commit()
        else:
            # Fallback to local sync records
            for default_p in STANDARD_PURPOSES:
                pid = default_p["id"]
                record = db.query(ConsentSyncRecord).filter(
                    ConsentSyncRecord.user_id == user_id,
                    ConsentSyncRecord.purpose_id == pid,
                ).first()

                if record:
                    display_status = record.local_status
                    purposes_overview.append(
                        PurposeConsentState(
                            purpose_id=pid,
                            purpose_name=default_p["name"],
                            purpose_description=default_p["description"],
                            status=display_status,
                            raw_status="GRANTED" if "GRANTED" in display_status else "WITHDRAWN" if "WITHDRAWN" in display_status else "NO_CONSENT",
                            is_stale=record.is_stale,
                            notice_version=record.aiori_notice_version,
                            notice_hash=record.aiori_notice_hash,
                            language=lang,
                            last_updated=record.last_synced_at,
                            latest_receipt_id=record.aiori_receipt_id,
                            is_pending_outbox=pid in pending_map,
                        )
                    )
                else:
                    purposes_overview.append(
                        PurposeConsentState(
                            purpose_id=pid,
                            purpose_name=default_p["name"],
                            purpose_description=default_p["description"],
                            status="NO_CONSENT",
                            raw_status="NO_CONSENT",
                            is_stale=False,
                            notice_version=None,
                            notice_hash=None,
                            language=lang,
                            is_pending_outbox=pid in pending_map,
                        )
                    )

        return UserConsentOverview(
            user_id=user_id,
            current_notice=current_notice,
            purposes=purposes_overview,
            aiori_connected=is_healthy,
            last_synced_at=datetime.utcnow(),
            error_message=None if is_healthy else "AIORI-3 platform is temporarily unreachable; displaying cached consent state.",
        )

    @staticmethod
    def grant_consent(
        db: Session,
        user_id: str,
        purpose_id: str,
        language: str = "en",
    ) -> Tuple[bool, str, Dict[str, Any]]:
        """
        Submits grant consent to AIORI-3.
        Only marks locally as GRANTED when AIORI-3 confirms success.
        """
        ok, res = aiori_client.grant_consent(user_id=user_id, purpose_id=purpose_id, language=language, db=db)
        if ok:
            record = db.query(ConsentSyncRecord).filter(
                ConsentSyncRecord.user_id == user_id,
                ConsentSyncRecord.purpose_id == purpose_id,
            ).first()
            if not record:
                record = ConsentSyncRecord(
                    user_id=user_id,
                    purpose_id=purpose_id,
                    local_status="CONSENT_GRANTED",
                    is_stale=False,
                    aiori_notice_version=res.get("notice_version"),
                    aiori_notice_hash=res.get("notice_hash"),
                    last_synced_at=datetime.utcnow(),
                    sync_message="Successfully granted and recorded in AIORI-3 ledger.",
                )
                db.add(record)
            else:
                record.local_status = "CONSENT_GRANTED"
                record.is_stale = False
                record.aiori_notice_version = res.get("notice_version")
                record.aiori_notice_hash = res.get("notice_hash")
                record.last_synced_at = datetime.utcnow()
                record.sync_message = "Successfully granted and recorded in AIORI-3 ledger."

            # Log audit
            audit = ApplicationAuditLog(
                user_id=user_id,
                action="CONSENT_GRANT_SYNCED",
                actor_id=user_id,
                actor_role="USER",
                status="SUCCESS",
                details_json=json.dumps({"purpose_id": purpose_id, "event_id": res.get("event_id")}),
                created_at=datetime.utcnow(),
            )
            db.add(audit)
            db.commit()
            return True, "Consent successfully granted and recorded in AIORI-3 cryptographic ledger.", res
        else:
            return False, f"AIORI-3 consent registration failed: {res.get('detail') or res.get('error') or 'Service unavailable'}", res

    @staticmethod
    def withdraw_consent(
        db: Session,
        user_id: str,
        purpose_id: str,
        language: str = "en",
    ) -> Tuple[bool, str, Dict[str, Any]]:
        """
        Submits authoritative consent withdrawal to AIORI-3.
        If AIORI-3 is unreachable, fails closed: marks status as CONSENT_PENDING,
        enqueues an outbox record, and blocks local data release.
        """
        ok, res = aiori_client.withdraw_consent(user_id=user_id, purpose_id=purpose_id, language=language, db=db)
        if ok:
            record = db.query(ConsentSyncRecord).filter(
                ConsentSyncRecord.user_id == user_id,
                ConsentSyncRecord.purpose_id == purpose_id,
            ).first()
            if not record:
                record = ConsentSyncRecord(
                    user_id=user_id,
                    purpose_id=purpose_id,
                    local_status="CONSENT_WITHDRAWN",
                    is_stale=False,
                    last_synced_at=datetime.utcnow(),
                    sync_message="Withdrawal confirmed and recorded in AIORI-3 audit ledger.",
                )
                db.add(record)
            else:
                record.local_status = "CONSENT_WITHDRAWN"
                record.is_stale = False
                record.last_synced_at = datetime.utcnow()
                record.sync_message = "Withdrawal confirmed and recorded in AIORI-3 audit ledger."

            audit = ApplicationAuditLog(
                user_id=user_id,
                action="CONSENT_WITHDRAW_SYNCED",
                actor_id=user_id,
                actor_role="USER",
                status="SUCCESS",
                details_json=json.dumps({"purpose_id": purpose_id, "event_id": res.get("event_id")}),
                created_at=datetime.utcnow(),
            )
            db.add(audit)
            db.commit()
            return True, "Consent successfully withdrawn and recorded in AIORI-3 audit ledger.", res
        else:
            # Network failure or AIORI-3 down: fail-closed outbox pattern
            outbox_item = IntegrationOutbox(
                user_id=user_id,
                action="WITHDRAW",
                purpose_id=purpose_id,
                payload_json=json.dumps({"user_id": user_id, "purpose_id": purpose_id, "language": language}),
                attempts=1,
                status="PENDING",
                last_attempt_at=datetime.utcnow(),
                error_message=str(res),
                created_at=datetime.utcnow(),
            )
            db.add(outbox_item)

            record = db.query(ConsentSyncRecord).filter(
                ConsentSyncRecord.user_id == user_id,
                ConsentSyncRecord.purpose_id == purpose_id,
            ).first()
            if record:
                record.local_status = "CONSENT_PENDING"
                record.sync_message = "Withdrawal pending synchronization with AIORI-3. Data sharing is blocked."
            else:
                record = ConsentSyncRecord(
                    user_id=user_id,
                    purpose_id=purpose_id,
                    local_status="CONSENT_PENDING",
                    sync_message="Withdrawal pending synchronization with AIORI-3. Data sharing is blocked.",
                )
                db.add(record)

            db.commit()
            return True, "Withdrawal recorded locally (fail-closed: sharing immediately blocked). Queued for synchronization with AIORI-3.", {"status": "PENDING_SYNC"}

    @staticmethod
    def process_outbox(db: Session) -> int:
        """Processes any pending outbox items when connectivity restores."""
        pending = db.query(IntegrationOutbox).filter(IntegrationOutbox.status == "PENDING").all()
        synced_count = 0
        for item in pending:
            payload = json.loads(item.payload_json)
            if item.action == "WITHDRAW":
                ok, _ = aiori_client.withdraw_consent(
                    user_id=item.user_id,
                    purpose_id=item.purpose_id,
                    language=payload.get("language", "en"),
                    db=db,
                )
                if ok:
                    item.status = "COMPLETED"
                    synced_count += 1
                else:
                    item.attempts += 1
                    if item.attempts >= item.max_attempts:
                        item.status = "FAILED"
            db.commit()
        return synced_count

    @staticmethod
    def publish_notice_and_invalidate_consents(
        db: Session,
        version: str,
        title: str,
        content: str,
        language: str = "en",
        admin_id: str = "admin_fitpulse",
    ) -> Tuple[bool, str, Dict[str, Any]]:
        """
        Publishes a new privacy notice to AIORI-3.
        Upon successful publication in AIORI-3's RFC 8785 hash ledger:
        1. All prior user consents granted under older notice versions are marked CONSENT_STALE.
        2. Downstream third-party access is immediately blocked.
        3. Audit record is written to FitPulse database.
        """
        ok, res = aiori_client.publish_notice(
            version=version,
            title=title,
            content=content,
            language=language,
            db=db,
        )
        if not ok:
            raw_err = res.get("detail") or res.get("error") or "Failed to publish notice to AIORI-3."
            if "already exists" in str(raw_err):
                err = (
                    f"Notice version '{version}' already exists in the AIORI-3 ledger. "
                    f"Under cryptographic ledger standards, published notice versions are immutable. "
                    f"Please enter a new version number (e.g., v2.1 or v3.0)."
                )
            else:
                err = f"AIORI-3 rejected publication: {raw_err}"
            return False, err, res

        # Invalidate existing granted consents in FitPulse local cache
        records = db.query(ConsentSyncRecord).all()
        invalidated_count = 0
        for r in records:
            if r.aiori_notice_version != version:
                r.is_stale = True
                if r.local_status == "CONSENT_GRANTED":
                    r.local_status = "CONSENT_STALE"
                    r.sync_message = f"Superseded by notice {version}. Prior consent invalidated; re-consent required."
                    invalidated_count += 1
                r.last_synced_at = datetime.utcnow()

        # Log platform audit event
        audit = ApplicationAuditLog(
            user_id=admin_id,
            action="NOTICE_REVISION_PUBLISHED",
            actor_id=admin_id,
            actor_role="ADMIN",
            status="SUCCESS",
            details_json=json.dumps({
                "new_version": version,
                "title": title,
                "hash_sha256": res.get("hash_sha256"),
                "invalidated_user_consents": invalidated_count,
            }),
            created_at=datetime.utcnow(),
        )
        db.add(audit)
        db.commit()

        msg = (
            f"Notice {version} published successfully to AIORI-3 cryptographic ledger. "
            f"{invalidated_count} active user consent(s) invalidated (CONSENT_STALE). "
            f"Downstream data access is now blocked until users re-consent."
        )
        return True, msg, res

