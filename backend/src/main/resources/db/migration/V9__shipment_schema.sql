-- =============================================================================
-- V9: Shipment Schema
-- SRS Section 105 (Shipping Domain)
-- =============================================================================

CREATE TABLE IF NOT EXISTS shipments (
    id                      VARCHAR(36)  PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    order_id                VARCHAR(36)  NOT NULL REFERENCES orders(id) ON DELETE RESTRICT,

    -- Status of this shipment
    -- PENDING, PROCESSING, DISPATCHED, IN_TRANSIT, OUT_FOR_DELIVERY, DELIVERED, FAILED, RETURNED
    status                  VARCHAR(30)  NOT NULL DEFAULT 'PENDING',

    -- Carrier / logistics provider name (e.g. Delhivery, BlueDart, Shiprocket, MOCK)
    carrier                 VARCHAR(100),

    -- Tracking number issued by the carrier
    tracking_reference      VARCHAR(255),

    -- Carrier-specific tracking URL (optional)
    tracking_url            TEXT,

    -- Shipping method selected at checkout (e.g. STANDARD, EXPRESS)
    shipping_method         VARCHAR(50),

    -- Destination address snapshot (copy from order at shipment creation time)
    recipient_name          VARCHAR(200),
    recipient_phone         VARCHAR(20),
    address_line1           VARCHAR(255),
    address_line2           VARCHAR(255),
    city                    VARCHAR(100),
    state                   VARCHAR(100),
    postal_code             VARCHAR(20),
    country                 VARCHAR(100) NOT NULL DEFAULT 'India',

    -- Fulfillment timestamps
    dispatched_at           TIMESTAMP WITH TIME ZONE,
    estimated_delivery_date DATE,
    delivered_at            TIMESTAMP WITH TIME ZONE,

    created_at              TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

    CONSTRAINT shipments_order_unique UNIQUE (order_id)
);

CREATE INDEX IF NOT EXISTS idx_shipments_order_id       ON shipments(order_id);
CREATE INDEX IF NOT EXISTS idx_shipments_status         ON shipments(status);
CREATE INDEX IF NOT EXISTS idx_shipments_tracking_ref   ON shipments(tracking_reference);

-- =============================================================================
-- Shipment Events / Tracking Timeline
-- SRS Section 105: Shipment events must come from backend records only.
-- Never fabricate tracking information.
-- =============================================================================

CREATE TABLE IF NOT EXISTS shipment_events (
    id              VARCHAR(36)  PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    shipment_id     VARCHAR(36)  NOT NULL REFERENCES shipments(id) ON DELETE CASCADE,

    -- Short description of the event (e.g. "Package picked up", "Arrived at hub")
    description     TEXT         NOT NULL,

    -- Location string where this event occurred (e.g. "Mumbai Hub")
    location        VARCHAR(255),

    -- When this event occurred (set by admin / integration; not derived from now())
    occurred_at     TIMESTAMP WITH TIME ZONE NOT NULL,

    created_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_shipment_events_shipment_id ON shipment_events(shipment_id);
CREATE INDEX IF NOT EXISTS idx_shipment_events_occurred_at ON shipment_events(shipment_id, occurred_at DESC);
