-- =============================================================================
-- V10: Returns and Refunds Schema
-- SRS Section 23 / 106: Returns and Refunds lifecycle and refund record integrity
-- =============================================================================

CREATE TABLE IF NOT EXISTS return_requests (
    id             VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    order_id       VARCHAR(36) NOT NULL REFERENCES orders(id) ON DELETE RESTRICT,
    customer_id    UUID        NOT NULL REFERENCES users(id) ON DELETE RESTRICT,

    status         VARCHAR(30) NOT NULL DEFAULT 'PENDING',
    reason         VARCHAR(255) NOT NULL,
    notes          TEXT,

    requested_at   TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    reviewed_at    TIMESTAMP WITH TIME ZONE,
    completed_at   TIMESTAMP WITH TIME ZONE,

    refund_amount  NUMERIC(12,2) NOT NULL DEFAULT 0,
    refund_status  VARCHAR(30) NOT NULL DEFAULT 'PENDING',

    created_at     TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at     TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_return_requests_order_id     ON return_requests(order_id);
CREATE INDEX IF NOT EXISTS idx_return_requests_customer_id  ON return_requests(customer_id);
CREATE INDEX IF NOT EXISTS idx_return_requests_status       ON return_requests(status);

CREATE TABLE IF NOT EXISTS return_items (
    id                 VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    return_request_id  VARCHAR(36) NOT NULL REFERENCES return_requests(id) ON DELETE CASCADE,
    order_item_id      BIGINT NOT NULL,
    product_id         VARCHAR(100) NOT NULL,
    product_name       VARCHAR(255) NOT NULL,
    variant_id         UUID,
    variant_name       VARCHAR(255),
    sku                VARCHAR(100) NOT NULL,
    quantity           INTEGER NOT NULL CHECK (quantity > 0),
    unit_price         NUMERIC(12,2) NOT NULL CHECK (unit_price >= 0),
    line_total         NUMERIC(12,2) NOT NULL CHECK (line_total >= 0),
    created_at         TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_return_items_request_id ON return_items(return_request_id);
CREATE INDEX IF NOT EXISTS idx_return_items_order_item ON return_items(order_item_id);

CREATE TABLE IF NOT EXISTS refunds (
    id                  VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    return_request_id   VARCHAR(36) NOT NULL UNIQUE REFERENCES return_requests(id) ON DELETE CASCADE,
    order_id            VARCHAR(36) NOT NULL REFERENCES orders(id) ON DELETE RESTRICT,
    customer_id         UUID        NOT NULL REFERENCES users(id) ON DELETE RESTRICT,

    amount              NUMERIC(12,2) NOT NULL CHECK (amount >= 0),
    status              VARCHAR(30) NOT NULL DEFAULT 'PENDING',
    payment_provider    VARCHAR(100) NOT NULL DEFAULT 'MOCK',
    payment_reference   VARCHAR(255),
    notes               TEXT,

    initiated_at        TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    processed_at        TIMESTAMP WITH TIME ZONE,
    created_at          TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_refunds_return_request_id ON refunds(return_request_id);
CREATE INDEX IF NOT EXISTS idx_refunds_order_id           ON refunds(order_id);
CREATE INDEX IF NOT EXISTS idx_refunds_status             ON refunds(status);
