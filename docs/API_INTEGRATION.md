# FitPulse <-> AIORI-3 API Integration Guide

> **Document Version:** 1.0.0  
> **Target Audience:** Integration Engineers, Auditors, Downstream Data Consumers

---

## 1. Integration Credentials & Endpoints

FitPulse is registered as an authorized downstream enterprise consumer in AIORI-3 with the following credentials:

| Attribute | Configured Value |
|---|---|
| **Consumer ID** | `consumer_fitpulse` |
| **Consumer Name** | `FitPulse Analytics Platform` |
| **API Key (Plaintext)** | `fitpulse_api_key_live_2026` |
| **Authorized Purposes** | `fitness_analytics`, `personalized_recommendations` |
| **Target Gateway Base URL** | `http://<AIORI_IP>:8000` |

---

## 2. API Contract Mapping

### A. Authoritative Privacy Notice Synchronization
- **Endpoint**: `GET /api/notices/current?lang={en|hi|bn}`
- **Invoked By**: `FitPulse Backend -> AIORI-3`
- **Output**: Returns active notice version (`v1.0`), SHA-256 hash, title, content. FitPulse uses this exact notice to render in the Privacy & Consent Center.

### B. User Consent Lifecycle
- **Fetch Live State**: `GET /api/consent/state?user_id={id}&lang={lang}`
  - Returns `UserConsentSummary` with purpose states (`GRANTED`, `WITHDRAWN`, `NO_CONSENT`) and staleness flags (`is_stale`).
- **Grant Consent**: `POST /api/consent/grant`
  - Payload: `{ "user_id": "user_001", "purpose_id": "fitness_analytics", "language": "en" }`
  - Headers: `X-User-Id: user_001`
  - Generates Kantara 7807 structured receipt and appends to SHA-256 hash-chain audit ledger.
- **Withdraw Consent**: `POST /api/consent/withdraw`
  - Payload: `{ "user_id": "user_001", "purpose_id": "fitness_analytics", "language": "en" }`
  - Appends `WITHDRAW` event, issues withdrawal receipt, and blocks downstream access immediately.

### C. Kantara 7807 Receipts & Verification
- **List Receipts**: `GET /api/consent/receipts?user_id={id}`
- **Verify Receipt**: `GET /api/consent/receipts/{receipt_id}/verify`
  - Recomputes SHA-256 canonical hash of receipt JSON and validates cryptographic match against database ledger.

### D. Downstream Data Access Evaluation (Section 5)
- **Endpoint**: `POST /api/data/access`
- **Headers**: `X-Consumer-Key: fitpulse_api_key_live_2026`
- **Payload**: `{ "user_id": "user_001", "purpose": "fitness_analytics" }`

#### Expected Behavior Matrix

| Consent Status | Purpose Requested | API Key Used | HTTP Status | Response Payload |
|---|---|---|:---:|---|
| **Active Consent** | `fitness_analytics` | `fitpulse_api_key_live_2026` | `200 OK` | Synthetic telemetry released (`step_count`, `active_calories`, `heart_rate_avg`) |
| **Consent Withdrawn** | `fitness_analytics` | `fitpulse_api_key_live_2026` | `403 Forbidden` | RFC 9457 `CONSENT_WITHDRAWN` (Zero biometric data released) |
| **No Consent Given** | `fitness_analytics` | `fitpulse_api_key_live_2026` | `403 Forbidden` | RFC 9457 `NO_CONSENT` |
| **Scope Violation** | `marketing` | `fitpulse_api_key_live_2026` | `403 Forbidden` | RFC 9457 `UNAUTHORIZED_PURPOSE` |
| **Stale Notice** | `fitness_analytics` | `fitpulse_api_key_live_2026` | `403 Forbidden` | RFC 9457 `CONSENT_STALE` |
| **Invalid Key** | `fitness_analytics` | `invalid_key_999` | `401 Unauthorized` | RFC 9457 `UNKNOWN_CONSUMER` |
| **Gateway Offline** | Any | Any | `503 Unavailable` | Fail-Closed: Local data release blocked |

