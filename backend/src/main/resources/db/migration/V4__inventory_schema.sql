-- =============================================================================
-- V4: Inventory Management Schema
-- SRS Sections 24, 25, 99
-- Concurrency-safe: uses DB-level quantity constraints and optimistic-locking
-- version column for JPA @Version optimistic locking
-- =============================================================================

-- Inventory table: one row per product variant (or product if no variant)
CREATE TABLE IF NOT EXISTS inventory (
    id              BIGSERIAL PRIMARY KEY,
    product_id      VARCHAR(100)    NOT NULL,
    variant_id      UUID          REFERENCES product_variants(id) ON DELETE SET NULL,
    sku             VARCHAR(100)    NOT NULL UNIQUE,
    quantity        INT             NOT NULL DEFAULT 0,
    reserved        INT             NOT NULL DEFAULT 0,
    low_stock_threshold INT         NOT NULL DEFAULT 5,
    version         BIGINT          NOT NULL DEFAULT 0,
    created_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

    -- Prevent negative total stock
    CONSTRAINT inventory_quantity_non_negative CHECK (quantity >= 0),
    -- Prevent reserved exceeding available
    CONSTRAINT inventory_reserved_non_negative CHECK (reserved >= 0),
    CONSTRAINT inventory_reserved_lte_quantity  CHECK (reserved <= quantity),

    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_inventory_product_id   ON inventory(product_id);
CREATE INDEX IF NOT EXISTS idx_inventory_variant_id   ON inventory(variant_id);
CREATE INDEX IF NOT EXISTS idx_inventory_sku          ON inventory(sku);

-- Inventory movements: full audit trail of all stock events
-- SRS Section 25: Purchase, Reservation, Cancellation, Return, Restock, Manual Adjustment, Damaged, Transfer
CREATE TABLE IF NOT EXISTS inventory_movements (
    id              BIGSERIAL PRIMARY KEY,
    inventory_id    BIGINT          NOT NULL REFERENCES inventory(id) ON DELETE CASCADE,
    movement_type   VARCHAR(30)     NOT NULL,  -- PURCHASE, RESERVATION, CANCELLATION, RETURN, RESTOCK, ADJUSTMENT, DAMAGED, TRANSFER, DEDUCTION, RELEASE
    quantity_delta  INT             NOT NULL,  -- positive = stock in, negative = stock out
    quantity_before INT             NOT NULL,
    quantity_after  INT             NOT NULL,
    reference_id    VARCHAR(100),              -- order_id, return_id, etc.
    reference_type  VARCHAR(50),               -- ORDER, RETURN, MANUAL, etc.
    note            TEXT,
    performed_by    UUID            REFERENCES users(id) ON DELETE SET NULL,
    performed_at    TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_inv_movements_inventory_id   ON inventory_movements(inventory_id);
CREATE INDEX IF NOT EXISTS idx_inv_movements_movement_type  ON inventory_movements(movement_type);
CREATE INDEX IF NOT EXISTS idx_inv_movements_reference_id   ON inventory_movements(reference_id);

-- Audit log entry
INSERT INTO schema_audit_log (phase, description, executed_at)
VALUES ('V4', 'Created inventory and inventory_movements tables with concurrency constraints', NOW());
