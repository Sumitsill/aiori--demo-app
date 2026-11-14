#!/usr/bin/env bash
# Start FitPulse FastAPI Backend on Port 8001
set -e

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
cd "$DIR/backend"

echo "=========================================================="
echo " Starting FitPulse Backend on http://0.0.0.0:8001"
echo " Target AIORI-3 URL: ${AIORI_BASE_URL:-http://localhost:8000}"
echo "=========================================================="

export AIORI_BASE_URL="${AIORI_BASE_URL:-http://localhost:8000}"
export PYTHONPATH="."

python3 -m uvicorn app.main:app --host 0.0.0.0 --port 8001 --reload

