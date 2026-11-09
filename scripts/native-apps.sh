#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
set -a
source .env
set +a
mkdir -p .local
if [ "${1:-start}" = stop ]; then
  for app in frontend product ai; do
    if [ -f ".local/$app.pid" ]; then
      kill "$(cat ".local/$app.pid")" 2>/dev/null || true
      rm ".local/$app.pid"
    fi
  done
  exit 0
fi
if [ -d /opt/homebrew/opt/openjdk@21 ]; then
  export JAVA_HOME=/opt/homebrew/opt/openjdk@21/libexec/openjdk.jdk/Contents/Home
fi
java_bin="${JAVA_HOME:+$JAVA_HOME/bin/}java"
start() {
  local name="$1"; shift
  if [ -f ".local/$name.pid" ] && kill -0 "$(cat ".local/$name.pid")" 2>/dev/null; then
    echo "$name is already running."
  else
    nohup "$@" > ".local/$name.log" 2>&1 &
    echo $! > ".local/$name.pid"
  fi
}
test -f backend/product-service/target/product-service-0.1.0.jar || { echo 'Run make build first.'; exit 1; }
test -x ai-services/ai-orchestrator/.venv/bin/uvicorn || { echo 'Run make install first.'; exit 1; }
if [ ! -f .local/product.pid ] || ! kill -0 "$(cat .local/product.pid)" 2>/dev/null; then
  # Keep the runtime JAR separate so a later Maven rebuild cannot corrupt live class loading.
  cp backend/product-service/target/product-service-0.1.0.jar .local/product-runtime.jar
fi
start product "$java_bin" -jar .local/product-runtime.jar
start ai bash -c 'cd ai-services/ai-orchestrator && exec .venv/bin/uvicorn main:app --host 127.0.0.1 --port "$AI_PORT" --no-server-header'
if [ "${1:-start}" = --backend-only ]; then
  echo 'Started backend processes. Logs: .local/product.log, .local/ai.log'
  exit 0
fi
export AI_SERVICE_URL="http://127.0.0.1:$AI_PORT"
start frontend bash -c 'cd frontend/shopai-web && exec node node_modules/vite/bin/vite.js --host 127.0.0.1 --port "$FRONTEND_PORT"'
echo "Started application processes. Open http://localhost:$FRONTEND_PORT after make smoke succeeds."
echo 'Logs: .local/product.log, .local/ai.log, .local/frontend.log'
