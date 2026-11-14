import json
import logging
from datetime import datetime
from typing import Optional, Dict, Any, List, Tuple
import httpx
from sqlalchemy.orm import Session

from app.core.config import settings
from app.models.integration import IntegrationEvent

logger = logging.getLogger("fitpulse.aiori_client")

class AIORIClient:
    def __init__(self, base_url: Optional[str] = None, consumer_key: Optional[str] = None):
        self.base_url = (base_url or settings.AIORI_BASE_URL).rstrip("/")
        self.consumer_key = consumer_key or settings.AIORI_CONSUMER_API_KEY
        self.timeout = settings.AIORI_TIMEOUT_SECONDS

    def _log_event(
        self,
        db: Optional[Session],
        user_id: Optional[str],
        event_type: str,
        purpose_id: Optional[str],
        target_url: str,
        status_code: Optional[int],
        request_payload: Optional[Any],
        response_payload: Optional[Any],
        error_detail: Optional[str] = None,
    ):
        if db is None:
            return
        try:
            event = IntegrationEvent(
                user_id=user_id,
                event_type=event_type,
                purpose_id=purpose_id,
                target_url=target_url,
                status_code=status_code,
                request_payload=json.dumps(request_payload) if request_payload else None,
                response_payload=json.dumps(response_payload) if response_payload else None,
                error_detail=error_detail,
                created_at=datetime.utcnow(),
            )
            db.add(event)
            db.commit()
        except Exception as e:
            logger.warning(f"Could not persist integration event log: {e}")

    def check_health(self) -> Tuple[bool, Dict[str, Any]]:
        url = f"{self.base_url}/api/health"
        try:
            with httpx.Client(timeout=self.timeout) as client:
                resp = client.get(url)
                if resp.status_code == 200:
                    return True, resp.json()
                return False, {"error": f"HTTP {resp.status_code}", "detail": resp.text}
        except Exception as e:
            logger.debug(f"AIORI health probe failed: {e}")
            return False, {"error": "Connection failed", "detail": str(e)}

    def get_current_notice(self, lang: str = "en", db: Optional[Session] = None) -> Optional[Dict[str, Any]]:
        url = f"{self.base_url}/api/notices/current"
        try:
            with httpx.Client(timeout=self.timeout) as client:
                resp = client.get(url, params={"lang": lang})
                self._log_event(
                    db=db,
                    user_id=None,
                    event_type="NOTICE_FETCH",
                    purpose_id=None,
                    target_url=url,
                    status_code=resp.status_code,
                    request_payload={"lang": lang},
                    response_payload=resp.json() if resp.status_code == 200 else None,
                )
                if resp.status_code == 200:
                    return resp.json()
                return None
        except Exception as e:
            logger.error(f"Failed to fetch notice from AIORI: {e}")
            self._log_event(db, None, "NOTICE_FETCH", None, url, None, {"lang": lang}, None, str(e))
            return None

    def publish_notice(
        self,
        version: str,
        title: str,
        content: str,
        language: str = "en",
        db: Optional[Session] = None,
    ) -> Tuple[bool, Dict[str, Any]]:
        """
        Publishes a new privacy notice to the AIORI-3 authoritative platform.
        Requires administrative key (X-Admin-Key).
        Returns (success: bool, response_dict: Dict).
        """
        url = f"{self.base_url}/api/notices"
        headers = {
            "Content-Type": "application/json",
            "X-Admin-Key": settings.AIORI_ADMIN_API_KEY,
        }
        payload = {
            "version": version,
            "title": title,
            "content": content,
            "language": language,
        }
        try:
            with httpx.Client(timeout=self.timeout) as client:
                resp = client.post(url, json=payload, headers=headers)
                data = resp.json() if resp.headers.get("content-type", "").startswith("application/json") else {"detail": resp.text}
                self._log_event(
                    db=db,
                    user_id="admin_fitpulse",
                    event_type="NOTICE_PUBLISH",
                    purpose_id=None,
                    target_url=url,
                    status_code=resp.status_code,
                    request_payload=payload,
                    response_payload=data,
                )
                if resp.status_code in [200, 201]:
                    return True, data
                return False, data
        except Exception as e:
            logger.error(f"Failed to publish notice to AIORI: {e}")
            self._log_event(
                db=db,
                user_id="admin_fitpulse",
                event_type="NOTICE_PUBLISH",
                purpose_id=None,
                target_url=url,
                status_code=None,
                request_payload=payload,
                response_payload=None,
                error_detail=str(e),
            )
            return False, {"detail": f"AIORI-3 connection error: {str(e)}"}

    def get_purposes(self, db: Optional[Session] = None) -> List[Dict[str, Any]]:
        url = f"{self.base_url}/api/purposes"
        try:
            with httpx.Client(timeout=self.timeout) as client:
                resp = client.get(url)
                if resp.status_code == 200:
                    return resp.json()
                return []
        except Exception as e:
            logger.error(f"Failed to fetch purposes from AIORI: {e}")
            return []

    def ensure_user_synced(
        self,
        user_id: str,
        name: str,
        email: str,
        password: str = "password123",
        db: Optional[Session] = None,
    ) -> Optional[str]:
        """
        Ensures user exists in AIORI-3 so that consent operations succeed.
        Attempts login first; if 401 or not found, registers the user.
        Returns the user's AIORI JWT token.
        """
        # Try login
        login_url = f"{self.base_url}/api/auth/login"
        try:
            with httpx.Client(timeout=self.timeout) as client:
                login_resp = client.post(
                    login_url,
                    json={"username_or_email": user_id, "password": password},
                )
                if login_resp.status_code == 200:
                    return login_resp.json().get("access_token")

                # If login failed, attempt to register
                register_url = f"{self.base_url}/api/auth/register"
                reg_payload = {
                    "id": user_id,
                    "name": name,
                    "email": email,
                    "password": password,
                    "role": "USER",
                }
                reg_resp = client.post(register_url, json=reg_payload)
                self._log_event(
                    db=db,
                    user_id=user_id,
                    event_type="USER_SYNC",
                    purpose_id=None,
                    target_url=register_url,
                    status_code=reg_resp.status_code,
                    request_payload={"id": user_id, "name": name, "email": email},
                    response_payload=reg_resp.json() if reg_resp.status_code in [200, 201] else None,
                )
                if reg_resp.status_code in [200, 201]:
                    return reg_resp.json().get("access_token")
                return None
        except Exception as e:
            logger.warning(f"Failed to synchronize user '{user_id}' with AIORI-3: {e}")
            return None

    def get_user_consent_state(
        self,
        user_id: str,
        lang: str = "en",
        db: Optional[Session] = None,
    ) -> Optional[Dict[str, Any]]:
        """Queries live authoritative consent state from AIORI-3."""
        url = f"{self.base_url}/api/consent/state"
        headers = {"X-User-Id": user_id}
        try:
            with httpx.Client(timeout=self.timeout) as client:
                resp = client.get(url, params={"user_id": user_id, "lang": lang}, headers=headers)
                self._log_event(
                    db=db,
                    user_id=user_id,
                    event_type="CONSENT_STATE_QUERY",
                    purpose_id=None,
                    target_url=url,
                    status_code=resp.status_code,
                    request_payload={"user_id": user_id, "lang": lang},
                    response_payload=resp.json() if resp.status_code == 200 else None,
                )
                if resp.status_code == 200:
                    return resp.json()
                return None
        except Exception as e:
            logger.error(f"Error fetching consent state for {user_id}: {e}")
            self._log_event(db, user_id, "CONSENT_STATE_QUERY", None, url, None, {"user_id": user_id}, None, str(e))
            return None

    def grant_consent(
        self,
        user_id: str,
        purpose_id: str,
        language: str = "en",
        db: Optional[Session] = None,
    ) -> Tuple[bool, Dict[str, Any]]:
        """Submits a grant consent action to AIORI-3."""
        url = f"{self.base_url}/api/consent/grant"
        payload = {"user_id": user_id, "purpose_id": purpose_id, "language": language}
        headers = {"X-User-Id": user_id}
        try:
            with httpx.Client(timeout=self.timeout) as client:
                resp = client.post(url, json=payload, headers=headers)
                body = resp.json() if resp.text else {}
                self._log_event(
                    db=db,
                    user_id=user_id,
                    event_type="CONSENT_GRANT",
                    purpose_id=purpose_id,
                    target_url=url,
                    status_code=resp.status_code,
                    request_payload=payload,
                    response_payload=body,
                )
                if resp.status_code in [200, 201]:
                    return True, body
                return False, body
        except Exception as e:
            logger.error(f"Failed to submit grant consent for {user_id}/{purpose_id}: {e}")
            self._log_event(db, user_id, "CONSENT_GRANT", purpose_id, url, None, payload, None, str(e))
            return False, {"error": "Connection failed", "detail": str(e)}

    def withdraw_consent(
        self,
        user_id: str,
        purpose_id: str,
        language: str = "en",
        db: Optional[Session] = None,
    ) -> Tuple[bool, Dict[str, Any]]:
        """Submits an authoritative withdraw consent action to AIORI-3."""
        url = f"{self.base_url}/api/consent/withdraw"
        payload = {"user_id": user_id, "purpose_id": purpose_id, "language": language}
        headers = {"X-User-Id": user_id}
        try:
            with httpx.Client(timeout=self.timeout) as client:
                resp = client.post(url, json=payload, headers=headers)
                body = resp.json() if resp.text else {}
                self._log_event(
                    db=db,
                    user_id=user_id,
                    event_type="CONSENT_WITHDRAW",
                    purpose_id=purpose_id,
                    target_url=url,
                    status_code=resp.status_code,
                    request_payload=payload,
                    response_payload=body,
                )
                if resp.status_code in [200, 201]:
                    return True, body
                return False, body
        except Exception as e:
            logger.error(f"Failed to submit withdraw consent for {user_id}/{purpose_id}: {e}")
            self._log_event(db, user_id, "CONSENT_WITHDRAW", purpose_id, url, None, payload, None, str(e))
            return False, {"error": "Connection failed", "detail": str(e)}

    def list_receipts(
        self,
        user_id: Optional[str] = None,
        limit: int = 50,
        db: Optional[Session] = None,
    ) -> List[Dict[str, Any]]:
        """Fetches Kantara 7807 receipts from AIORI-3."""
        url = f"{self.base_url}/api/consent/receipts"
        params = {"limit": limit}
        if user_id:
            params["user_id"] = user_id
        headers = {"X-User-Id": user_id} if user_id else {}
        try:
            with httpx.Client(timeout=self.timeout) as client:
                resp = client.get(url, params=params, headers=headers)
                if resp.status_code == 200:
                    return resp.json()
                return []
        except Exception as e:
            logger.error(f"Failed to list receipts from AIORI: {e}")
            return []

    def get_receipt(self, receipt_id: str, db: Optional[Session] = None) -> Optional[Dict[str, Any]]:
        url = f"{self.base_url}/api/consent/receipts/{receipt_id}"
        try:
            with httpx.Client(timeout=self.timeout) as client:
                resp = client.get(url)
                if resp.status_code == 200:
                    return resp.json()
                return None
        except Exception as e:
            logger.error(f"Failed to fetch receipt {receipt_id} from AIORI: {e}")
            return None

    def verify_receipt(self, receipt_id: str, db: Optional[Session] = None) -> Tuple[bool, Dict[str, Any]]:
        """Cryptographically verifies a Kantara receipt via AIORI-3."""
        url = f"{self.base_url}/api/consent/receipts/{receipt_id}/verify"
        try:
            with httpx.Client(timeout=self.timeout) as client:
                resp = client.get(url)
                body = resp.json() if resp.text else {}
                if resp.status_code == 200:
                    return True, body
                return False, body
        except Exception as e:
            logger.error(f"Failed to verify receipt {receipt_id} on AIORI: {e}")
            return False, {"error": "Connection failed", "detail": str(e)}

    def simulate_downstream_data_access(
        self,
        user_id: str,
        purpose: str,
        consumer_key: Optional[str] = None,
        db: Optional[Session] = None,
    ) -> Tuple[int, Dict[str, Any]]:
        """
        Executes downstream consumer request against AIORI-3 /api/data/access.
        Uses FitPulse consumer key (or custom key for demonstration testing).
        """
        url = f"{self.base_url}/api/data/access"
        payload = {"user_id": user_id, "purpose": purpose}
        key_to_use = consumer_key if consumer_key is not None else self.consumer_key
        headers = {
            "Content-Type": "application/json",
            "X-Consumer-Key": key_to_use,
        }
        try:
            with httpx.Client(timeout=self.timeout) as client:
                resp = client.post(url, json=payload, headers=headers)
                body = resp.json() if resp.text else {}
                self._log_event(
                    db=db,
                    user_id=user_id,
                    event_type="DOWNSTREAM_DATA_ACCESS",
                    purpose_id=purpose,
                    target_url=url,
                    status_code=resp.status_code,
                    request_payload={"user_id": user_id, "purpose": purpose, "key_used": key_to_use[:16] + "..."},
                    response_payload=body,
                )
                return resp.status_code, body
        except Exception as e:
            logger.error(f"Failed downstream data access against AIORI: {e}")
            error_resp = {
                "status": "DENIED",
                "reason_code": "SERVICE_UNAVAILABLE",
                "message": f"FitPulse could not reach AIORI-3 authorization gateway: {e}",
                "user_id": user_id,
                "purpose": purpose,
            }
            self._log_event(db, user_id, "DOWNSTREAM_DATA_ACCESS", purpose, url, 503, payload, error_resp, str(e))
            return 503, error_resp


aiori_client = AIORIClient()

