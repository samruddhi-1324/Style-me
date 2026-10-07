-- =============================================================================
-- V8: Payment Schema
-- SRS Section 104 (Payment Domain Separation)
-- =============================================================================

CREATE TABLE IF NOT EXISTS payments (
    id                  VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    order_id            VARCHAR(36) NOT NULL REFERENCES orders(id) ON DELETE RESTRICT,
    customer_id         UUID NOT NULL REFERENCES customers(user_id) ON DELETE RESTRICT,
    
    amount              NUMERIC(12,2) NOT NULL,
    currency            VARCHAR(3) NOT NULL DEFAULT 'INR',
    
    -- e.g. INITIATED, PENDING, SUCCESS, FAILED, CANCELLED, REFUNDED, PARTIALLY_REFUNDED
    status              VARCHAR(30) NOT NULL DEFAULT 'INITIATED',
    
    -- The external provider name, e.g. 'MOCK', 'STRIPE', 'RAZORPAY'
    provider            VARCHAR(50) NOT NULL,
    
    -- The transaction ID from the external provider
    provider_transaction_id VARCHAR(255),
    
    -- Optional fields for webhooks / payment verification
    payment_method      VARCHAR(50),
    error_message       TEXT,
    
    -- Idempotency key supplied by client to prevent duplicate payments
    idempotency_key     VARCHAR(100) UNIQUE,
    
    created_at          TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

    CONSTRAINT payment_amount_positive CHECK (amount > 0)
);

CREATE INDEX IF NOT EXISTS idx_payments_order_id ON payments(order_id);
CREATE INDEX IF NOT EXISTS idx_payments_customer_id ON payments(customer_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_provider_tx_id ON payments(provider_transaction_id);
