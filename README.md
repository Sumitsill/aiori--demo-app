# FitPulse ⚡
### Enterprise Fitness Intelligence Platform with Authoritative Purpose-Based Consent Enforcement

> **Hackathon Edition:** Built for independent two-device live demonstration with **AIORI-3 (FitTrack Lite)**.  
> **Standards Compliance:** Kantara Initiative 7807 Consent Receipts • RFC 8785 JSON Canonicalization • DPDP Act 2023 §6 • Ed25519 Digital Checkpoints

---

## 🌟 Executive Summary

**FitPulse** is a full-featured fitness tracking web application that decouples core fitness domain operations (workouts, biometric goals, profile management, telemetry visualization) from **authoritative purpose-based consent recording and downstream enforcement**, which is handled exclusively by **AIORI-3**.

In a world where health data is highly sensitive, FitPulse demonstrates that a modern SaaS platform can remain agile and feature-rich while delegating cryptographic consent tracking, Kantara 7807 receipt generation, and immutable RFC 8785 SHA-256 audit chaining to an independent, verifiable trust authority.

---

## 🏛️ System Architecture

```
===================================================================================
                             DEVICE 1: FITPULSE (SaaS App)
===================================================================================
   [ React 18 + TS + Tailwind ]               [ FastAPI Application Gateway ]
   - Interactive Analytics Dashboard          - Port 8001 (Host 0.0.0.0)
   - Workouts & Goals Tracker                 - JWT Auth & Role-Based Access Control
   - Live Consent Center & Receipts           - MET-Calibrated Calorie Engine
             |                                              |
             +------------ (REST JSON / JWT) ---------------+
                                                            |
                                        +-------------------+-------------------+
                                        |                                       |
                           [ Relational Storage ]                 [ Consent Bridge ]
                           - PostgreSQL (Live Prod)               - Fail-Closed Outbox
                           - SQLite (Zero-Config Fallback)        - Idempotent Retry Logic
                                                                                |
                                                                                | HTTP REST
                                                                                | (LAN / WAN)
================================================================================|==
                             DEVICE 2: AIORI-3 (Trust Authority)                |
================================================================================|==
                                                                                v
   [ React 18 Auditor Dashboard ]             [ FastAPI Authoritative Ledger ]
   - Port 5173                                - Port 8000 (Host 0.0.0.0)
   - Real-Time Hash Chain Visualizer          - 10-Point Access Evaluation Pipeline
   - Ed25519 Signature Verifier               - Kantara 7807 Receipt Generator
                                              - Tamper-Evident SHA-256 Ledger
===================================================================================
```

---

## ✨ Features & Capabilities

### 1. Fitness Domain Management
- **Dashboard & Biometric Telemetry:** Step count progress, active calorie burn, simulated heart rate variability (HRV), and VO2 max trendlines with interactive SVG visualizers.
- **Workout Tracking:** Log running, cycling, strength, HIIT, yoga, swimming, and walking. Real-time calorie computation uses MET (Metabolic Equivalent of Task) values calibrated by user weight and duration.
- **Goal Setting & Milestone Tracking:** Create and monitor daily steps, active minutes, and calorie burn targets.
- **Biometric Profiles:** Dynamic BMI calculations, fitness level classifications, and activity preference tracking.

### 2. Authoritative Consent Lifecycle (AIORI-3 Integration)
- **Itemized Purposes:** Separately grant or withdraw consent for:
  1. `fitness_analytics`: Downstream analytics & metric computation.
  2. `marketing`: Wellness promotions and community event updates.
  3. `personalized_recommendations`: Tailored routine suggestions.
  4. `research_sharing`: De-identified academic sports science sharing.
- **Immediate Downstream Enforcement:** When a user withdraws consent for `fitness_analytics`, all external consumer access requests are instantly rejected with HTTP 403.
- **Fail-Closed Resilience:** If network connectivity to AIORI-3 is lost during withdrawal, FitPulse immediately blocks local data release, marks status `CONSENT_PENDING`, and queues the request in `integration_outbox` for background replay.
- **Cryptographic Kantara Receipts:** View and verify structured consent receipts signed by the AIORI-3 ledger.

### 3. Enterprise Security & RBAC
- **Strict User Isolation:** Users can only view and modify their own workouts and biometric records.
- **Admin Constraints:** Application administrators can inspect platform health, integration telemetry, and outbox queues, but **cannot** grant or withdraw consent on behalf of users.
- **Secure Consumer Keys:** Downstream consumer credentials (`X-Consumer-Key`) are managed strictly on the backend and never exposed to browser bundles.

---

## 📂 Repository Structure

```
Fitpulse/
├── backend/                        # FastAPI Python 3.15 Backend
│   ├── app/
│   │   ├── api/                    # REST Route Controllers
│   │   │   ├── auth.py             # User registration & JWT login
│   │   │   ├── workouts.py         # Workout CRUD & MET calculations
│   │   │   ├── profile.py          # User profile & BMI calculation
│   │   │   ├── analytics.py        # Fitness telemetry & trends
│   │   │   ├── consent.py          # AIORI-3 consent bridge
│   │   │   ├── consumer.py         # Third-party data access simulator
│   │   │   ├── admin.py            # Administrative telemetry
│   │   │   └── health.py           # System & bridge health check
│   │   ├── core/                   # Security, bcrypt, config settings
│   │   ├── db/                     # DB session & initialization fixtures
│   │   ├── models/                 # 10 SQLAlchemy relational entities
│   │   ├── schemas/                # Pydantic request/response schemas
│   │   ├── services/               # Core business logic & AIORI client
│   │   └── main.py                 # Application entry point
│   ├── tests/                      # Automated test suite (13 passing tests)
│   └── requirements.txt            # Python dependencies
│
├── frontend/                       # React 18 + Vite + Tailwind Frontend
│   ├── src/
│   │   ├── components/             # Reusable UI components & SVG charts
│   │   ├── context/                # Authentication context & storage
│   │   ├── pages/                  # 10 Application pages & dashboards
│   │   │   ├── LoginPage.tsx       # Secure user/admin authentication
│   │   │   ├── RegisterPage.tsx    # User onboarding
│   │   │   ├── DashboardPage.tsx   # Fitness overview & metrics
│   │   │   ├── WorkoutsPage.tsx    # Workout log & MET calculator
│   │   │   ├── AnalyticsPage.tsx   # Visual trend analytics
│   │   │   ├── GoalsPage.tsx       # Milestone & target manager
│   │   │   ├── ProfilePage.tsx     # Biometric profile & preferences
│   │   │   ├── ConsentCenterPage.tsx# Purpose-based consent manager
│   │   │   ├── ReceiptsPage.tsx    # Kantara 7807 receipt inspector
│   │   │   └── SettingsPage.tsx    # Account & theme settings
│   │   ├── services/api.ts         # Axios client with interceptors
│   │   └── App.tsx                 # Router & protected route wrappers
│   ├── package.json                # Frontend dependencies
│   └── vite.config.ts              # Vite config (proxies /api to 8001)
│
└── docs/                           # Comprehensive Engineering Docs
    ├── ARCHITECTURE.md             # Detailed system architecture
    ├── API_INTEGRATION.md          # AIORI-3 integration contracts
    ├── SECURITY.md                 # RBAC and compliance controls
    ├── TWO_DEVICE_SETUP.md         # Step-by-step hackathon setup
    ├── DEMO_SCRIPT.md              # 5-minute live presentation script
    └── TESTING.md                  # Test suites & verification guide
```

---

## 🚀 Quick Start Guide

### Prerequisites
- Python 3.10+ (Tested on Python 3.15)
- Node.js 18+ and npm
- AIORI-3 running on port 8000

---

### Single-Machine Local Demonstration

#### 1. Start AIORI-3 Backend (Port 8000)
```bash
cd /Users/anupamraj/Documents/A3-PS002-TC320-main/src/backend
PYTHONPATH=. uvicorn app.main:app --host 0.0.0.0 --port 8000
```

#### 2. Start FitPulse Backend (Port 8001)
```bash
cd /Users/anupamraj/Documents/Fitpulse/backend
AIORI_BASE_URL=http://localhost:8000 PYTHONPATH=. uvicorn app.main:app --host 0.0.0.0 --port 8001
```

#### 3. Start FitPulse Frontend (Port 5174)
```bash
cd /Users/anupamraj/Documents/Fitpulse/frontend
npx vite --port 5174 --host 0.0.0.0
```

#### 4. Open in Browser
- **FitPulse Application:** [http://localhost:5174](http://localhost:5174)
- **AIORI-3 Consent Ledger:** [http://localhost:5173](http://localhost:5173)

---

### Pre-Configured Demo Credentials

| Role | Username / Email | Password | Description |
|---|---|---|---|
| **FitPulse User** | `user_001` (or `user_001@example.com`) | `password123` | Pre-seeded user with active workouts, profile, and synced AIORI identity. |
| **FitPulse Admin**| `admin_fitpulse` (or `admin@fitpulse.internal`) | `adminpass123` | Platform administrative monitor. |
| **AIORI-3 Auditor** | `auditor_001` | `password123` | CERT-In Auditor with full ledger inspection privileges. |

---

## 🌐 Two-Device Hackathon Setup

To run across two laptops connected to the same Wi-Fi or mobile hotspot:

1. **Laptop 2 (AIORI-3 Ledger):**
   - IP address: `192.168.1.100` (example)
   - Run backend: `uvicorn app.main:app --host 0.0.0.0 --port 8000`
   - Run frontend: `npx vite --host 0.0.0.0 --port 5173`

2. **Laptop 1 (FitPulse SaaS):**
   - Point to Laptop 2 in `.env`: `AIORI_BASE_URL=http://192.168.1.100:8000`
   - Run backend: `uvicorn app.main:app --host 0.0.0.0 --port 8001`
   - Run frontend: `npx vite --host 0.0.0.0 --port 5174`

For full step-by-step firewall and hotspot instructions, see [`docs/TWO_DEVICE_SETUP.md`](docs/TWO_DEVICE_SETUP.md).

---

## 🧪 Automated Testing

Both applications have complete, automated test suites:

```bash
# Run FitPulse tests (13 tests)
cd /Users/anupamraj/Documents/Fitpulse/backend
PYTHONPATH=. pytest tests/

# Run AIORI-3 tests (37 tests)
cd /Users/anupamraj/Documents/A3-PS002-TC320-main/src/backend
PYTHONPATH=. pytest tests/
```
**Total:** 50/50 tests passing with 100% success rate. See [`docs/TESTING.md`](docs/TESTING.md) for full coverage breakdown.

---

## 📑 Live Demo Script

A complete 5-minute presentation script demonstrating:
1. Fitness tracking & MET calculation
2. Consent granting with Kantara receipt generation
3. Live downstream analytics authorization
4. Instant consent withdrawal and HTTP 403 blocking
5. Audit trail verification in AIORI-3's SHA-256 hash ledger

See [`docs/DEMO_SCRIPT.md`](docs/DEMO_SCRIPT.md) for the verbatim talk track and sequence of steps.

