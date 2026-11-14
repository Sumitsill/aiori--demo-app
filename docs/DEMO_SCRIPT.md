# Hackathon Demonstration Script: FitPulse + AIORI-3

> **Estimated Presentation Time:** 5 Minutes  
> **Judges Focus:** Cross-App Runtime Privacy Governance, Cryptographic Ledger Verification, Zero Biometric Leakage upon Consent Withdrawal.

---

## Step 1: Physical Device Setup (15 Seconds)
- **Laptop 1 Screen (FitPulse)**: `http://localhost:5174` (or `http://<DEVICE_1_IP>:5174`)
- **Laptop 2 Screen (AIORI-3)**: `http://localhost:5173` (or `http://<DEVICE_2_IP>:5173`)
- **Pitch**: *"Judges, we have two physically independent applications communicating across the network. FitPulse is our consumer fitness tracking SaaS, while AIORI-3 is our authoritative cryptographic consent authority."*

---

## Step 2: FitPulse Fitness Tracking (45 Seconds)
1. On Laptop 1, sign in as **Alex Morgan** (`user_001` / `password123`) or register a new user.
2. Show the **Dashboard**:
   - Point out daily steps, caloric expenditure, and the clearly labeled **Simulated Biometric Sensor** reading.
   - Show weekly trends on the interactive SVG charts.
3. Click **My Workouts**:
   - Log a quick workout (e.g. 30m Running).
   - Point out the **MET-based energy expenditure calculation** and updated metrics.

---

## Step 3: Authoritative Privacy Notice & Consent Grant (60 Seconds)
1. On Laptop 1, click **Privacy & Consent Center**:
   - Switch language to **Hindi** or **Bengali** to demonstrate multilingual notice transparency.
   - Point out that the notice version (`v1.0`) and SHA-256 hash are loaded live from AIORI-3.
2. Locate the **Fitness Analytics & Metrics** card:
   - Notice the status: `NO_CONSENT`.
3. Click **Grant Consent**:
   - Show the success confirmation. Status immediately transitions to `CONSENT_GRANTED`.

---

## Step 4: Verification on AIORI-3 (Laptop 2) (60 Seconds)
1. Look at Laptop 2 (AIORI-3):
   - Click **Consent Dashboard**: Show that `user_001` now has active consent for `fitness_analytics`.
   - Click **Audit Evidence Trail**: Show that an immutable audit log entry was appended to the SHA-256 hash chain in real time!
   - Click **Verify Signatures**: Show that all Ed25519 digital signature checkpoints cryptographically validate.

---

## Step 5: Downstream Consumer Access Simulation (60 Seconds)
1. On Laptop 1 (FitPulse), click **Fitness Analytics**:
   - Scroll down to the **Downstream Consumer Access Simulator**.
   - Select Purpose: `fitness_analytics`.
   - Click **Execute Downstream Access Request**.
   - **Result**: `HTTP 200 OK — Telemetry Access Authorized` with reason code `CONSENT_ACTIVE`. Telemetry is released.

---

## Step 6: Consent Withdrawal & Runtime Enforcement (60 Seconds)
1. On Laptop 1, return to **Privacy & Consent Center**:
   - Click **Withdraw Consent** on the `fitness_analytics` card.
   - Show the confirmation modal and instant status update to `CONSENT_WITHDRAWN`.
2. Return to the **Downstream Consumer Access Simulator**:
   - Re-execute the exact same request for `fitness_analytics`.
   - **Result**: Immediate **`HTTP 403 Forbidden`** with structured RFC 9457 Problem Details and reason code **`CONSENT_WITHDRAWN`**.
   - Highlight: **Zero biometric data is released.**
3. On Laptop 2 (AIORI-3):
   - Show that the denial event `DATA_ACCESS [DENY]` has been cryptographically recorded in the audit trail.
   - Conclude: *"FitPulse does not make permission decisions locally. Every access is validated at runtime against AIORI-3's authoritative ledger, guaranteeing immediate, tamper-evident revocation."*

