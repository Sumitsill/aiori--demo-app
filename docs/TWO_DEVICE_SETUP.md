# Two-Device Physical Demonstration Setup Guide

This guide describes how to deploy **FitPulse** on Device 1 and **AIORI-3 (FitTrack Lite)** on Device 2 connected over the same local area network (Wi-Fi or Ethernet).

---

## 1. Network Discovery & IP Addressing

Both laptops must be connected to the same Wi-Fi network or local router.

### Step 1: Find Device 2 (AIORI-3) Local IP Address

#### On macOS / Linux:
```bash
ifconfig | grep "inet " | grep -v 127.0.0.1
# Example output: inet 192.168.1.50 netmask 0xffffff00 broadcast 192.168.1.255
# Device 2 IP: 192.168.1.50
```

#### On Windows:
```powershell
ipconfig
# Look for "IPv4 Address" under your active Wi-Fi or Ethernet adapter:
# Example: 192.168.1.50
```

---

## 2. Starting Device 2: AIORI-3 (Consent Platform)

On Laptop 2:

### Start AIORI-3 Backend (Port 8000, Host 0.0.0.0):
```bash
cd A3-PS002-TC320-main/src/backend
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

### Start AIORI-3 Frontend (Port 5173, Host 0.0.0.0):
```bash
cd A3-PS002-TC320-main/src/frontend
npm run dev -- --host 0.0.0.0 --port 5173
```

Verify from Device 1 by opening `http://192.168.1.50:8000/api/health` in a browser. It should return status `healthy`.

---

## 3. Configuring & Starting Device 1: FitPulse (Fitness Application)

On Laptop 1:

### Step 1: Update `.env` with Device 2 IP Address
In `Fitpulse/backend/.env`:
```env
AIORI_BASE_URL=http://192.168.1.50:8000
AIORI_CONSUMER_API_KEY=fitpulse_api_key_live_2026
AIORI_CONSUMER_ID=consumer_fitpulse
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/fitpulse
FALLBACK_SQLITE_URL=sqlite:///./fitpulse.db
PORT=8001
HOST=0.0.0.0
```

### Step 2: Start FitPulse Backend (Port 8001):
```bash
cd Fitpulse/backend
uvicorn app.main:app --host 0.0.0.0 --port 8001
```

### Step 3: Start FitPulse Frontend (Port 5174):
```bash
cd Fitpulse/frontend
npm run dev -- --host 0.0.0.0 --port 5174
```

---

## 4. Single-Device Demonstration (Fallback)

If you are demonstrating on a single laptop:
- AIORI-3 runs on `http://localhost:8000` (API) and `http://localhost:5173` (UI).
- FitPulse runs on `http://localhost:8001` (API) and `http://localhost:5174` (UI).
- FitPulse connects to AIORI-3 via `AIORI_BASE_URL=http://127.0.0.1:8000`.

