#!/usr/bin/env bash
set -euo pipefail

# db_repair.sh
# Helper to (1) test Supabase Postgres connectivity, (2) run repair_user_id_policies.sql, (3) verify results.
# Usage:
#   export PGPASSWORD='YOUR_DB_PASSWORD'
#   ./scripts/db_repair.sh
# Optional flags:
#   DB_HOST (default: db.qaemzribxkcvjhldpyto.supabase.co)
#   DB_NAME (default: postgres)
#   DB_USER (default: postgres)
#   SSLMODE (default: require)
#   NO_REPAIR=1 (skip repair step, only diagnostics)
#
# NOTE: Do NOT commit real passwords. PGPASSWORD in env is the safest quick path.

DB_HOST=${DB_HOST:-db.qaemzribxkcvjhldpyto.supabase.co}
DB_NAME=${DB_NAME:-postgres}
DB_USER=${DB_USER:-postgres}
SSLMODE=${SSLMODE:-require}
REPAIR_FILE="supabase/repair_user_id_policies.sql"

if [[ -z "${PGPASSWORD:-}" ]]; then
  echo "ERROR: PGPASSWORD not set. Export it first: export PGPASSWORD='your_db_password'" >&2
  exit 1
fi

if ! command -v psql >/dev/null 2>&1; then
  echo "ERROR: psql not found in PATH." >&2
  exit 1
fi

 echo "== 1. Testing connection =="
if ! psql "host=$DB_HOST port=5432 dbname=$DB_NAME user=$DB_USER sslmode=$SSLMODE" -c "select now();"; then
  echo "Connection test failed. Check password / host / firewall." >&2
  exit 2
fi

echo "== 2. Checking that repair file exists =="
if [[ ! -f "$REPAIR_FILE" ]]; then
  echo "ERROR: $REPAIR_FILE not found." >&2
  exit 3
fi

if [[ "${NO_REPAIR:-0}" != "1" ]]; then
  echo "== 3. Executing repair script ($REPAIR_FILE) =="
  psql "host=$DB_HOST port=5432 dbname=$DB_NAME user=$DB_USER sslmode=$SSLMODE" -v ON_ERROR_STOP=1 -f "$REPAIR_FILE"
else
  echo "Skipping repair (NO_REPAIR=1)"
fi

echo "== 4. Verification: policies still referencing user_id incorrectly (expect 0 rows) =="
psql "host=$DB_HOST port=5432 dbname=$DB_NAME user=$DB_USER sslmode=$SSLMODE" <<'SQL'
SELECT policyname, tablename
FROM pg_policies
WHERE schemaname='public'
  AND (coalesce(qual,'') LIKE '%user_id%' OR coalesce(with_check,'') LIKE '%user_id%')
  AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns c
    WHERE c.table_schema='public'
      AND c.table_name = pg_policies.tablename
      AND c.column_name='user_id'
  );
SQL

echo "== 5. Columns on profiles / user_profiles =="
psql "host=$DB_HOST port=5432 dbname=$DB_NAME user=$DB_USER sslmode=$SSLMODE" <<'SQL'
SELECT table_name, column_name
FROM information_schema.columns
WHERE table_schema='public'
  AND table_name IN ('profiles','user_profiles')
ORDER BY table_name, column_name;
SQL

echo "== 6. Relevant policies (profiles / user_profiles) =="
psql "host=$DB_HOST port=5432 dbname=$DB_NAME user=$DB_USER sslmode=$SSLMODE" <<'SQL'
SELECT policyname, tablename, cmd
FROM pg_policies
WHERE schemaname='public'
  AND tablename IN ('profiles','user_profiles')
ORDER BY tablename, policyname;
SQL

echo "All done."