-- =============================================================================
-- V7: Order Schema
-- SRS Sections 102 (Checkout Validation), 103 (Order State Integrity)
-- =============================================================================

-- Order state machine per SRS Section 103
-- Legal customer-facing states:   PLACED → CONFIRMED → PROCESSING → SHIPPED → OUT_FOR_DELIVERY → DELIVERED
-- Terminal/exception states:      CANCELLED, PAYMENT_FAILED, RETURN_REQUESTED, RETURNED, REFUND_INITIATED, REFUNDED

CREATE TABLE IF NOT EXISTS orders (
    id                  VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    order_number        VARCHAR(30) NOT NULL UNIQUE,     -- Human-readable, e.g. SM-20261005-00001
    customer_id         UUID NOT NULL REFERENCES customers(user_id) ON DELETE RESTRICT,

    -- State (SRS Section 103)
    status              VARCHAR(30) NOT NULL DEFAULT 'PLACED',

    -- Snapshot of pricing (authoritative — SRS Section 100)
    subtotal            NUMERIC(12,2) NOT NULL,
    discount_amount     NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    coupon_code         VARCHAR(50),
    tax_amount          NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    tax_rate            NUMERIC(5,4) NOT NULL DEFAULT 0.18,
    shipping_amount     NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    grand_total         NUMERIC(12,2) NOT NULL,

    -- Delivery address snapshot (immutable after order placed)
    shipping_name       VARCHAR(200) NOT NULL,
    shipping_phone      VARCHAR(20),
    shipping_line1      VARCHAR(255) NOT NULL,
    shipping_line2      VARCHAR(255),
    shipping_city       VARCHAR(100) NOT NULL,
    shipping_state      VARCHAR(100) NOT NULL,
    shipping_postal     VARCHAR(20) NOT NULL,
    shipping_country    VARCHAR(100) NOT NULL DEFAULT 'India',

    -- Notes
    notes               TEXT,

    -- Timestamps
    placed_at           TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

    CONSTRAINT order_subtotal_positive     CHECK (subtotal >= 0),
    CONSTRAINT order_grand_total_positive  CHECK (grand_total >= 0),
    CONSTRAINT order_discount_non_negative CHECK (discount_amount >= 0)
);

CREATE INDEX IF NOT EXISTS idx_orders_customer_id  ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_status       ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders(order_number);

-- Sequence for human-readable order numbers
CREATE SEQUENCE IF NOT EXISTS order_number_seq START 1;

-- Order line items (snapshot of product/variant at time of purchase)
CREATE TABLE IF NOT EXISTS order_items (
    id              BIGSERIAL PRIMARY KEY,
    order_id        VARCHAR(36) NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id      VARCHAR(100) NOT NULL,
    variant_id      UUID,
    product_name    VARCHAR(255) NOT NULL,
    variant_name    VARCHAR(255),
    sku             VARCHAR(100) NOT NULL,
    unit_price      NUMERIC(12,2) NOT NULL,
    quantity        INT NOT NULL,
    line_total      NUMERIC(12,2) NOT NULL,

    CONSTRAINT order_item_quantity_positive  CHECK (quantity > 0),
    CONSTRAINT order_item_unit_price_positive CHECK (unit_price >= 0),
    CONSTRAINT order_item_line_total_positive CHECK (line_total >= 0)
);

CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);

-- Audit log for order state transitions
CREATE TABLE IF NOT EXISTS order_status_history (
    id          BIGSERIAL PRIMARY KEY,
    order_id    VARCHAR(36) NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    from_status VARCHAR(30),
    to_status   VARCHAR(30) NOT NULL,
    changed_by  VARCHAR(100),
    notes       TEXT,
    changed_at  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_order_status_history_order_id ON order_status_history(order_id);
