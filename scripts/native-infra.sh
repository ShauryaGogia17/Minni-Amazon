#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
python3 scripts/init-env.py
set -a
source .env
set +a
mkdir -p .local
if command -v brew >/dev/null; then
  export PATH="$(brew --prefix postgresql@17)/bin:$(brew --prefix redis)/bin:$PATH"
fi
if [ "${1:-start}" = stop ]; then
  if [ -f .local/postgres/postmaster.pid ]; then pg_ctl -D .local/postgres stop -m fast; fi
  if [ -f .local/redis.pid ]; then kill "$(cat .local/redis.pid)"; fi
  exit 0
fi
command -v initdb >/dev/null || { echo 'Install PostgreSQL 17 first (see docs/setup-guide.md).'; exit 1; }
command -v redis-server >/dev/null || { echo 'Install Redis first (see docs/setup-guide.md).'; exit 1; }
if [ ! -f .local/postgres/PG_VERSION ]; then
  password_file=$(mktemp)
  chmod 600 "$password_file"
  trap 'rm -f "$password_file"' EXIT
  printf '%s' "$POSTGRES_PASSWORD" > "$password_file"
  initdb -D .local/postgres --username="$POSTGRES_USER" --auth=scram-sha-256 --pwfile="$password_file" --encoding=UTF8 --locale=C > .local/initdb.log
  rm -f "$password_file"
fi
if ! pg_ctl -D .local/postgres status >/dev/null 2>&1; then
  pg_ctl -D .local/postgres -l "$PWD/.local/postgres.log" -o "-h 127.0.0.1 -p $POSTGRES_PORT" start
fi
export PGPASSWORD="$POSTGRES_PASSWORD" PGHOST=127.0.0.1 PGPORT="$POSTGRES_PORT" PGUSER="$POSTGRES_USER"
# Check each resource independently so startup also recovers from partial setup.
# ON_ERROR_STOP prevents connection/query failures from being treated as missing data.
psql -X -d postgres -v ON_ERROR_STOP=1 \
  --set=product_user="$PRODUCT_DB_USER" --set=product_password="$PRODUCT_DB_PASSWORD" \
  --set=ai_user="$AI_DB_USER" --set=ai_password="$AI_DB_PASSWORD" <<'SQL'
SELECT format('CREATE ROLE %I LOGIN PASSWORD %L', :'product_user', :'product_password')
WHERE NOT EXISTS (SELECT FROM pg_roles WHERE rolname = :'product_user') \gexec
SELECT format('CREATE ROLE %I LOGIN PASSWORD %L', :'ai_user', :'ai_password')
WHERE NOT EXISTS (SELECT FROM pg_roles WHERE rolname = :'ai_user') \gexec
SELECT format('CREATE DATABASE shopai_product OWNER %I', :'product_user')
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'shopai_product') \gexec
SELECT format('CREATE DATABASE shopai_product_test OWNER %I', :'product_user')
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'shopai_product_test') \gexec
SELECT format('CREATE DATABASE shopai_ai OWNER %I', :'ai_user')
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'shopai_ai') \gexec
REVOKE ALL ON DATABASE shopai_product FROM PUBLIC;
REVOKE ALL ON DATABASE shopai_product_test FROM PUBLIC;
REVOKE ALL ON DATABASE shopai_ai FROM PUBLIC;
SQL
vector_available=$(psql -X -d shopai_ai -v ON_ERROR_STOP=1 -tAc "SELECT EXISTS (SELECT FROM pg_available_extensions WHERE name='vector')")
if [ "$vector_available" = t ]; then
  psql -X -d shopai_ai -v ON_ERROR_STOP=1 -c 'CREATE EXTENSION IF NOT EXISTS vector;'
else
  echo 'pgvector is not installed for this PostgreSQL runtime; no embeddings are used in Phase 1.'
fi
if [ ! -f .local/redis.pid ] || ! kill -0 "$(cat .local/redis.pid)" 2>/dev/null; then
  # Private configuration avoids placing the Redis password in command arguments.
  umask 077
  cat > .local/redis.conf <<EOF
bind 127.0.0.1
protected-mode yes
port $REDIS_PORT
requirepass $REDIS_PASSWORD
appendonly yes
dir "$PWD/.local"
daemonize yes
pidfile "$PWD/.local/redis.pid"
logfile "$PWD/.local/redis.log"
EOF
  redis-server "$PWD/.local/redis.conf"
fi
echo 'Local PostgreSQL and Redis started. Data stays under .local/.'
