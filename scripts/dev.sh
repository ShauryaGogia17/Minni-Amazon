#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."

bash scripts/native-infra.sh
bash scripts/native-apps.sh --backend-only

set -a
source .env
set +a
export PRODUCT_SERVICE_URL="http://127.0.0.1:$PRODUCT_PORT"
export AI_SERVICE_URL="http://127.0.0.1:$AI_PORT"

echo 'Waiting for backend readiness...'
python3 - <<'PY'
import os
import time
import urllib.error
import urllib.request

checks = {
    "Product Service": os.environ["PRODUCT_SERVICE_URL"] + "/actuator/health/readiness",
    "AI Service": os.environ["AI_SERVICE_URL"] + "/health/ready",
}
deadline = time.monotonic() + 60
while checks:
    for name, url in list(checks.items()):
        try:
            with urllib.request.urlopen(url, timeout=2) as response:
                if response.status == 200:
                    print(f"{name} is ready.", flush=True)
                    del checks[name]
        except (OSError, urllib.error.URLError):
            pass
    if checks:
        if time.monotonic() >= deadline:
            raise SystemExit(
                "Backend startup failed: " + ", ".join(checks)
                + ". Check .local/product.log and .local/ai.log."
            )
        time.sleep(1)
PY

exec npm --prefix frontend/shopai-web run dev -- --port "$FRONTEND_PORT"
