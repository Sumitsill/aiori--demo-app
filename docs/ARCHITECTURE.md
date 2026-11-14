# FitPulse Architecture Specification

> **Document Version:** 1.0.0  
> **System Architecture:** Distributed Two-Tier Fitness SaaS + External Authoritative Consent Platform  
> **Regulatory Alignment:** Digital Personal Data Protection Act 2023 (DPDP Act §6), Kantara Initiative 7807

---

## 1. System Overview

FitPulse is an independent, modern fitness tracking platform designed to separate application-level fitness domain operations (workouts, biometric goals, profile settings, telemetry estimation) from **authoritative purpose-based consent recording, withdrawal, and audit verification**, which is delegated exclusively to **AIORI-3 (FitTrack Lite)**.

### Architectural Invariant
FitPulse **never** acts as an independent consent authority. It stores only synchronized representation records (`consent_sync_records`) and queues offline operations in a fail-closed outbox (`integration_outbox`). Downstream data access releases zero biometric telemetry without live cryptographic authorization from AIORI-3.

```
+------------------------------------------------------------------------------+
|                              DEVICE 1: FITPULSE                              |
|                                                                              |
|  +------------------------+             +---------------------------------+  |
|  |     React 18 + Vite    |  REST APIs  |         FastAPI Backend         |  |
|  |  Tailwind + SVG Charts | <---------> |      Port 8001 (Host 0.0.0.0)   |  |
|  +------------------------+             +----------------+----------------+  |
|                                                          |                   |
|                                         +----------------+----------------+  |
|                                         |  PostgreSQL Database (psycopg)  |  |
|                                         |  (Auto-fallback to SQLite)      |  |
|                                         +----------------+----------------+  |
|                                                          |                   |
|                                         +----------------+----------------+  |
|                                         |  AIORI-3 Integration Service    |  |
|                                         +----------------+----------------+  |
+----------------------------------------------------------|-------------------+
                                                           |
                                                           | HTTP REST (Backend-to-Backend)
                                                           | Headers: X-Consumer-Key, X-User-Id
                                                           v
+------------------------------------------------------------------------------+
|                              DEVICE 2: AIORI-3                               |
|                                                                              |
|  +------------------------------------------------------------------------+  |
|  |                         FastAPI Backend Gateway                        |  |
|  |                         Port 8000 (Host 0.0.0.0)                       |  |
|  +-----------------------------------+------------------------------------+  |
|                                      |                                       |
|     +--------------------------------+-------------------------------+       |
|     |                                |                               |       |
|  +--v------------------+  +----------v---------+  +------------------v----+  |
|  |   Consent Service   |  |  10-Point Runtime  |  |    Audit Ledger       |  |
|  |   & Kantara 7807    |  |  Access Evaluation |  | RFC 8785 SHA-256 Chain |  |
|  |      Receipts       |  |    Authorization   |  | Ed25519 Checkpoints    |  |
|  +---------------------+  +--------------------+  +-----------------------+  |
|                                      |                                       |
|                        +-------------v--------------+                        |
|                        |   SQLite Ledger Database   |                        |
|                        +----------------------------+                        |
+------------------------------------------------------------------------------+
```

---

## 2. FitPulse Data Models (PostgreSQL)

FitPulse maintains 10 structured relational tables in its database:

1. **`users`**: Identity, credentials (bcrypt hash), role (`USER` or `ADMIN`), AIORI-3 linked identifier (`aiori_user_id`).
2. **`user_profiles`**: Weight (kg), height (cm), age, gender, fitness level, preferred activity, and daily goals.
3. **`workouts`**: Category (`Running`, `Cycling`, `Strength`, `HIIT`, `Yoga`, `Swimming`, `Walking`), duration, MET-estimated calories, distance, simulated heart rate, notes.
4. **`fitness_metrics`**: Daily step count, active calories, active minutes, simulated heart rate variability, sleep score, VO2 max estimate, `is_synthetic` flag.
5. **`fitness_goals`**: Active target goals, milestones, unit measurements, and completion status.
6. **`activity_history`**: Audit log of workouts and milestone completions.
7. **`consent_sync_records`**: Cached status (`CONSENT_GRANTED`, `CONSENT_WITHDRAWN`, `CONSENT_PENDING`, `CONSENT_STALE`, `NO_CONSENT`), bound notice version and receipt IDs.
8. **`integration_events`**: Immutable local telemetry of all HTTP calls exchanged with AIORI-3.
9. **`integration_outbox`**: Fail-closed queue storing pending withdrawals if AIORI-3 connectivity drops, retrying with idempotency upon reconnect.
10. **`application_audit_logs`**: Internal administrative audit log tracking user logins, profile updates, and consent bridge actions.

---

## 3. Communication Patterns

- **FitPulse Frontend <-> FitPulse Backend**: Standard JWT-authenticated JSON REST calls.
- **FitPulse Backend <-> AIORI-3 Backend**: Secure backend-to-backend HTTP REST calls using pre-configured consumer credentials (`consumer_fitpulse` / `fitpulse_api_key_live_2026`) and user identification headers (`X-User-Id`).
- **Fail-Closed Semantics**: If AIORI-3 is unreachable during a withdrawal request, FitPulse immediately blocks local data sharing, marks the record `CONSENT_PENDING`, and queues the request in `integration_outbox`.

