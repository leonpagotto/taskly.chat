-- Migration helper: remap legacy request statuses prior to enum cleanup
-- Safe to run multiple times. Adjust table/enum names if they differ in your project.

-- 1) Backfill legacy -> new statuses
-- new       -> open
-- triage    -> in_review
-- blocked   -> in_review
-- done      -> closed
-- cancelled -> closed

-- If your status is stored as text or enum, use CAST as needed.

UPDATE requests SET status = 'open'      WHERE status IN ('new');
UPDATE requests SET status = 'in_review' WHERE status IN ('triage','blocked');
UPDATE requests SET status = 'closed'    WHERE status IN ('done','cancelled');

-- 2) Optional: add a request_updates audit trail entry when changing status
-- Uncomment if you have request_updates table with requestId, author, action columns
-- INSERT INTO request_updates (id, request_id, author, action)
-- SELECT gen_random_uuid(), r.id, 'migration', 'Status remapped to ' || r.status
-- FROM requests r
-- WHERE r.status IN ('open','in_review','closed');

-- 3) After verifying data, you can alter the enum to drop deprecated labels
-- DO THIS ONLY AFTER ensuring no rows reference old values.
-- Example:
-- ALTER TYPE request_status RENAME VALUE 'done' TO 'closed_legacy'; -- Postgres doesn't support drop directly pre-13; prefer recreate path.
-- For production: create a new enum type, alter column type using USING clause, then drop old type.

-- This file is a guide intended for manual execution in production environments before applying enum changes.
