# FitPulse Security & Access Control Model

---

## 1. Authentication & Credentials Security

- **Password Hashing**: Passwords are never stored in plaintext. Passwords are salted and hashed using standard `bcrypt` with automatic work factor.
- **JWT Protection**:
  - Tokens are signed with HS256 using an environment-isolated `JWT_SECRET_KEY` (minimum 32 bytes).
  - Explicit expiration (`exp`) and issued-at (`iat`) claims prevent stale token usage.
- **Consumer Secret Isolation**:
  - Downstream consumer API keys (`fitpulse_api_key_live_2026`) are strictly stored on the backend.
  - The FitPulse browser application **never** receives or handles the consumer API key. All access requests are proxied via backend-to-backend REST communication.

---

## 2. Insecure Direct Object Reference (IDOR) & Role Boundaries

- **User Ownership Enforcement**:
  - When accessing or modifying workouts, goals, profiles, or consent states, the backend evaluates `verify_user_ownership(target_user_id, current_user)`.
  - A user cannot modify another user's workout or consent record.
- **Role Boundary Matrix**:

| Operation | USER Role | FitPulse ADMIN Role | AIORI-3 AUDITOR Role |
|---|:---:|:---:|:---:|
| Log & Modify Personal Workouts | Allowed | Denied (unless self) | Denied |
| Grant / Withdraw Personal Consent | Allowed | **Strictly Blocked** | **Strictly Blocked** |
| Inspect Personal Consent Receipts | Allowed | Allowed | Allowed |
| View Platform Analytics | Denied | Allowed | Allowed |
| Modify Audit Hash Chain | **Strictly Blocked** | **Strictly Blocked** | **Strictly Blocked** |

---

## 3. Fail-Closed Privacy Guarantee

- If connectivity to AIORI-3 drops, FitPulse applies strict fail-closed semantics:
  1. No new sharing of fitness data is permitted.
  2. Withdrawals recorded locally immediately block local data release and transition to `CONSENT_PENDING`.
  3. Pending requests are saved in `integration_outbox` for idempotent synchronization upon reconnection.

