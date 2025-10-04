#!/usr/bin/env bash
# (Ensure executable: chmod +x scripts/apply_schema.sh)
set -euo pipefail

# apply_schema.sh
# Idempotently apply supabase/schema.sql to the target Postgres (Supabase) database.
# Features:
#  - Optional pre-apply logical backup (schema only or full data) using pg_dump
#  - Dry-run (syntax check) via psql --single-transaction + ROLLBACK (if DRY_RUN=1)
#  - Post-apply verification: list tables missing RLS but having policies; list failed functions.
#  - Abort on any error (ON_ERROR_STOP=1)
#
# Usage:
#   export PGPASSWORD='your_db_password'
#   ./scripts/apply_schema.sh           # apply
#   DRY_RUN=1 ./scripts/apply_schema.sh # parse & execute in a rolled-back txn
#   BACKUP=1 ./scripts/apply_schema.sh  # take pre-apply backup
#   BACKUP=1 BACKUP_SCOPE=data ./scripts/apply_schema.sh  # include data (default schema)
#
# Env Vars:
#   DB_HOST (default db.qaemzribxkcvjhldpyto.supabase.co)
#   DB_NAME (default postgres)
#   DB_USER (default postgres)
#   SSLMODE (default require)
#   SCHEMA_FILE (default supabase/schema.sql)
#   BACKUP (1 to enable)
#   BACKUP_SCOPE (schema|data) default schema
#   DRY_RUN (1 to run in rollback txn)
#
# Exit Codes:
#   0 success
#   1 missing prereq / password
#   2 backup failed
#   3 schema file missing
#   4 apply failed

DB_HOST=${DB_HOST:-db.qaemzribxkcvjhldpyto.supabase.co}
DB_NAME=${DB_NAME:-postgres}
DB_USER=${DB_USER:-postgres}
SSLMODE=${SSLMODE:-require}
SCHEMA_FILE=${SCHEMA_FILE:-supabase/schema.sql}
BACKUP_SCOPE=${BACKUP_SCOPE:-schema}

if [[ -z "${PGPASSWORD:-}" ]]; then
  echo "ERROR: PGPASSWORD not set." >&2
  exit 1
fi

if [[ ! -f "$SCHEMA_FILE" ]]; then
  echo "ERROR: Schema file $SCHEMA_FILE not found" >&2
  exit 3
fi

TS=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="backups"
mkdir -p "$BACKUP_DIR"

backup() {
  local mode=$1
  local file
  if [[ $mode == "data" ]]; then
    file="$BACKUP_DIR/backup_full_${TS}.sql.gz"
    echo "== Taking full (schema+data) backup to $file =="
    pg_dump -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" -w -F p | gzip > "$file" || { echo "Backup failed" >&2; return 2; }
  else
    file="$BACKUP_DIR/backup_schema_${TS}.sql.gz"
    echo "== Taking schema-only backup to $file =="
    pg_dump -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" -w -s -F p | gzip > "$file" || { echo "Backup failed" >&2; return 2; }
  fi
  echo "Backup saved: $file"
}

if [[ "${BACKUP:-0}" == "1" ]]; then
  backup "$BACKUP_SCOPE" || exit 2
fi

echo "== Syntax smoke (first 5 non-comment lines) =="
grep -vE '^[[:space:]]*--' "$SCHEMA_FILE" | grep -vE '^[[:space:]]*$' | head -5 || true

if [[ "${DRY_RUN:-0}" == "1" ]]; then
  echo "== DRY RUN: executing inside a rollback-only transaction =="
  psql "host=$DB_HOST port=5432 dbname=$DB_NAME user=$DB_USER sslmode=$SSLMODE" -v ON_ERROR_STOP=1 <<'SQL'
BEGIN;
\i supabase/schema.sql
ROLLBACK; -- Dry run
SQL
  echo "Dry run completed (rolled back)."
  exit 0
fi

echo "== Applying schema (idempotent) =="
if ! psql "host=$DB_HOST port=5432 dbname=$DB_NAME user=$DB_USER sslmode=$SSLMODE" -v ON_ERROR_STOP=1 -f "$SCHEMA_FILE"; then
  echo "ERROR: Schema apply failed" >&2
  exit 4
fi

echo "== Post-apply: tables with policies but RLS disabled (should be none) =="
psql "host=$DB_HOST port=5432 dbname=$DB_NAME user=$DB_USER sslmode=$SSLMODE" <<'SQL'
WITH policy_tables AS (
  SELECT DISTINCT tablename
  FROM pg_policies
  WHERE schemaname='public'
)
SELECT t.tablename AS table,
       (SELECT rowsecurity FROM pg_tables WHERE schemaname='public' AND tablename=t.tablename) AS rls_enabled
FROM policy_tables t
WHERE NOT (SELECT rowsecurity FROM pg_tables WHERE schemaname='public' AND tablename=t.tablename)
ORDER BY 1;
SQL

echo "== Post-apply: helper functions present =="
psql "host=$DB_HOST port=5432 dbname=$DB_NAME user=$DB_USER sslmode=$SSLMODE" <<'SQL'
SELECT p.proname as function, pg_get_functiondef(p.oid) LIKE '%security definer%' AS security_definer
FROM pg_proc p
JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname='public'
  AND p.proname IN ('has_project_access','has_project_admin','get_user_tenants','upsert_checklist_bundle');
SQL

echo "== Post-apply: projects RLS status =="
psql "host=$DB_HOST port=5432 dbname=$DB_NAME user=$DB_USER sslmode=$SSLMODE" -c "\
SELECT relname, relrowsecurity, relforcerowsecurity FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace WHERE n.nspname='public' AND c.relkind='r' AND relname='projects';\n"

echo "Done."