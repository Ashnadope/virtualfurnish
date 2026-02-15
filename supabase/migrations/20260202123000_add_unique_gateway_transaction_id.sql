-- Add unique index to enforce idempotency for gateway_transaction_id
-- Generated: 2026-02-02 12:30:00

-- Creates a unique partial index so NULL gateway_transaction_id values are allowed
CREATE UNIQUE INDEX IF NOT EXISTS uniq_gateway_transaction_id
ON payment_transactions (gateway_transaction_id)
WHERE gateway_transaction_id IS NOT NULL;
