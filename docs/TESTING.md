# FitPulse & AIORI-3 Test Suite Documentation

> **Test Suite Status:** 50/50 Tests Passing (100% Pass Rate)  
> **FitPulse Backend:** 13 Passed (Python 3.15 / FastAPI / pytest)  
> **AIORI-3 Backend:** 37 Passed (FastAPI / SQLite RFC 8785 Hash Chain / pytest)  
> **Frontends:** 2 Clean Production Builds (Vite / TypeScript / React 18)

---

## 1. Quick Verification Commands

### A. FitPulse Backend Test Suite (13 Tests)
```bash
cd /Users/anupamraj/Documents/Fitpulse/backend
PYTHONPATH=. pytest tests/ -v
```

### B. AIORI-3 Backend Test Suite (37 Tests)
```bash
cd /Users/anupamraj/Documents/A3-PS002-TC320-main/src/backend
PYTHONPATH=. pytest tests/ -v
```

### C. FitPulse Frontend Production Build
```bash
cd /Users/anupamraj/Documents/Fitpulse/frontend
npx vite build
```

### D. AIORI-3 Frontend Production Build
```bash
cd /Users/anupamraj/Documents/A3-PS002-TC320-main/src/frontend
npx vite build
```

---

## 2. FitPulse Test Coverage Matrix

| Test Module | Test Name | Invariant Verified |
|---|---|---|
| `test_auth.py` | `test_register_and_login_flow` | Validates registration, password hashing (bcrypt), token issuance, profile creation, and duplicate email prevention (400). |
| `test_auth.py` | `test_invalid_credentials_rejected` | Confirms HTTP 401 on incorrect password or nonexistent email. |
| `test_auth.py` | `test_get_current_user_profile` | Verifies JWT Bearer token authentication and user profile retrieval. |
| `test_workouts.py` | `test_create_and_list_workouts` | Tests MET-calibrated calorie calculations (Running vs Yoga vs Strength) and list retrieval. |
| `test_workouts.py` | `test_update_and_delete_workout` | Tests workout modification, calorie re-estimation on duration change, and hard deletion. |
| `test_profile_goals.py` | `test_profile_and_goals_crud` | Verifies height/weight/BMI calculation and goal tracking (target vs current progress). |
| `test_consent_integration.py` | `test_consent_overview_and_grant_withdraw` | Tests live consent bridge: fetching AIORI-3 notices, sending grant consent, receiving Kantara 7807 receipt, and immediate withdrawal enforcement. |
| `test_consent_integration.py` | `test_consumer_access_simulation` | Simulates third-party data consumer access: releases telemetry when consent is `GRANTED`; returns HTTP 403 when consent is `WITHDRAWN`. |
| `test_consent_integration.py` | `test_fail_closed_outbox_when_aiori_unreachable` | Verifies that if AIORI-3 network is down during withdrawal, FitPulse marks local state `CONSENT_PENDING`, enqueues to `integration_outbox`, and immediately blocks data release (fail-closed). |
| `test_security_rbac.py` | `test_ownership_enforcement` | Confirms User A cannot read or modify User B's workouts (HTTP 404/403). |
| `test_security_rbac.py` | `test_admin_cannot_grant_user_consent` | Verifies ADMIN cannot impersonate a regular user or grant consent through user consent APIs. |
| `test_security_rbac.py` | `test_user_cannot_access_admin_endpoints` | Confirms regular USER receives HTTP 403 on `/api/admin/*` administrative routes. |
| `test_security_rbac.py` | `test_admin_access_allowed` | Confirms ADMIN can view platform health, integration logs, and outbox queue status. |

---

## 3. AIORI-3 Test Coverage Matrix

The authoritative consent backend (`A3-PS002-TC320-main`) provides 37 automated tests:

1. **`test_audit_checkpoints.py`**: Verifies Ed25519 digital signature creation, public key export, checkpoint verification, and tamper detection.
2. **`test_auth_rbac.py`**: Tests authentication and role enforcement across `USER`, `ADMIN`, `AUDITOR`, and `DATA_CONSUMER`.
3. **`test_concurrency.py`**: Proves that concurrent withdrawal requests and downstream data access requests are serialized cleanly with zero race condition leakage.
4. **`test_consent_flow.py`**: Validates the end-to-end lifecycle: notice issuance -> consent grant -> audit logging -> withdrawal -> notice revision -> stale consent invalidation (`CONSENT_STALE`).
5. **`test_consent_receipts.py`**: Verifies Kantara 7807 structured receipt generation and cryptographic hash verification.
6. **`test_consumer_enforcement.py`**: Validates 10-point authorization pipeline for data consumers using API keys (`X-Consumer-Key`).
7. **`test_data_retention.py`**: Tests automated data retention expiry policies.
8. **`test_multilingual_notices.py`**: Validates notice localization in English, Hindi, and Bengali.

---

## 4. End-to-End Integration Test Procedure

To verify real HTTP communication between the two running services:

### Step 1: Start AIORI-3
```bash
cd /Users/anupamraj/Documents/A3-PS002-TC320-main/src/backend
PYTHONPATH=. uvicorn app.main:app --host 0.0.0.0 --port 8000
```

### Step 2: Start FitPulse
```bash
cd /Users/anupamraj/Documents/Fitpulse/backend
AIORI_BASE_URL=http://localhost:8000 PYTHONPATH=. uvicorn app.main:app --host 0.0.0.0 --port 8001
```

### Step 3: Test Health & Connectivity
```bash
# Check FitPulse health & AIORI-3 bridge
curl -s http://localhost:8001/api/health | jq .

# Output will indicate:
# {
#   "status": "healthy",
#   "aiori_integration": "connected",
#   "database": "sqlite_fallback" (or "postgresql")
# }
```

### Step 4: Test Downstream Access Simulation
```bash
# Attempt data access as FitPulse Analytics Consumer
curl -X POST http://localhost:8001/api/consumer/simulate-access \
  -H "Content-Type: application/json" \
  -d '{"user_id": "user_001", "purpose_id": "fitness_analytics"}' | jq .
```
- If consent is active: returns status `ALLOWED` with steps, heart rate, and calories.
- If consent is withdrawn: returns status `DENIED` (HTTP 403) with denial reason.

