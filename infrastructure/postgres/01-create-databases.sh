#!/usr/bin/env bash
set -euo pipefail
# Executed by the official PostgreSQL entrypoint only on an empty data volume.
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname postgres \
  --set=product_user="$PRODUCT_DB_USER" --set=product_password="$PRODUCT_DB_PASSWORD" \
  --set=ai_user="$AI_DB_USER" --set=ai_password="$AI_DB_PASSWORD" <<'SQL'
CREATE ROLE :"product_user" LOGIN PASSWORD :'product_password';
CREATE ROLE :"ai_user" LOGIN PASSWORD :'ai_password';
CREATE DATABASE shopai_product OWNER :"product_user";
CREATE DATABASE shopai_ai OWNER :"ai_user";
REVOKE ALL ON DATABASE shopai_product FROM PUBLIC;
REVOKE ALL ON DATABASE shopai_ai FROM PUBLIC;
SQL
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname shopai_ai -c 'CREATE EXTENSION IF NOT EXISTS vector;'
