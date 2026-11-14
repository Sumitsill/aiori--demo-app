#!/usr/bin/env bash
# Start FitPulse React Frontend on Port 5174
set -e

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
cd "$DIR/frontend"

echo "=========================================================="
echo " Starting FitPulse Frontend on http://0.0.0.0:5174"
echo " Proxying /api to http://127.0.0.1:8001"
echo "=========================================================="

npx vite --host 0.0.0.0 --port 5174

