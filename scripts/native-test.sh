#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
set -a
source .env
set +a
if [ -d /opt/homebrew/opt/openjdk@21 ]; then
  export JAVA_HOME=/opt/homebrew/opt/openjdk@21/libexec/openjdk.jdk/Contents/Home
fi
export SHOPAI_TEST_DB_URL="jdbc:postgresql://127.0.0.1:$POSTGRES_PORT/shopai_product_test"
mvn -B -f backend/product-service/pom.xml clean verify
ai-services/ai-orchestrator/.venv/bin/python -m pytest ai-services/ai-orchestrator/tests -q
npm --prefix frontend/shopai-web test
