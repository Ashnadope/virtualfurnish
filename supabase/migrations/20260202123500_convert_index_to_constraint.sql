-- Convert partial unique index to a table-level UNIQUE constraint
-- Generated: 2026-02-02 12:35:00

-- IMPORTANT: run during low-traffic window. Ensure no duplicate non-NULL gateway_transaction_id values exist.

BEGIN;

-- Drop the existing partial index (if present)
DROP INDEX IF EXISTS uniq_gateway_transaction_id;

-- Add table-level UNIQUE constraint (will block/wait for lock)
ALTER TABLE payment_transactions
ADD CONSTRAINT uniq_gateway_transaction_id UNIQUE (gateway_transaction_id);

COMMIT;
