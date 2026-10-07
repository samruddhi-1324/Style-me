-- =============================================================================
-- V6: Coupon and Pricing Schema
-- SRS Sections 28, 100, 101
-- =============================================================================

-- Discount types
-- PERCENTAGE: discount = (orderSubtotal * discountValue / 100), capped at maxDiscountAmount
-- FIXED:      discount = discountValue (flat amount off)
-- PRODUCT:    discount applied to specific products only
-- CATEGORY:   discount applied to products in specific categories only

CREATE TABLE IF NOT EXISTS coupons (
    id                  BIGSERIAL PRIMARY KEY,
    code                VARCHAR(50) NOT NULL UNIQUE,
    description         TEXT,
    discount_type       VARCHAR(20) NOT NULL,  -- PERCENTAGE, FIXED
    discount_value      NUMERIC(10,2) NOT NULL,
    max_discount_amount NUMERIC(10,2),         -- cap for PERCENTAGE type
    min_order_value     NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    max_uses            INT,                   -- NULL = unlimited
    max_uses_per_user   INT NOT NULL DEFAULT 1,
    current_uses        INT NOT NULL DEFAULT 0,
    is_active           BOOLEAN NOT NULL DEFAULT TRUE,
    valid_from          TIMESTAMP WITH TIME ZONE NOT NULL,
    valid_until         TIMESTAMP WITH TIME ZONE,             -- NULL = no expiry
    created_at          TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

    CONSTRAINT coupon_discount_value_positive CHECK (discount_value > 0),
    CONSTRAINT coupon_percentage_max CHECK (discount_type != 'PERCENTAGE' OR discount_value <= 100)
);

CREATE INDEX IF NOT EXISTS idx_coupons_code ON coupons(code);
CREATE INDEX IF NOT EXISTS idx_coupons_is_active ON coupons(is_active);

-- Coupon product restrictions: if rows exist for a coupon, coupon only applies to those products
CREATE TABLE IF NOT EXISTS coupon_product_restrictions (
    coupon_id   BIGINT NOT NULL REFERENCES coupons(id) ON DELETE CASCADE,
    product_id  VARCHAR(100) NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    PRIMARY KEY (coupon_id, product_id)
);

-- Coupon category restrictions: if rows exist for a coupon, coupon only applies to those categories
CREATE TABLE IF NOT EXISTS coupon_category_restrictions (
    coupon_id   BIGINT NOT NULL REFERENCES coupons(id) ON DELETE CASCADE,
    category_id BIGINT NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    PRIMARY KEY (coupon_id, category_id)
);

-- Coupon usage audit: one row per redemption
CREATE TABLE IF NOT EXISTS coupon_usages (
    id              BIGSERIAL PRIMARY KEY,
    coupon_id       BIGINT NOT NULL REFERENCES coupons(id) ON DELETE CASCADE,
    customer_id     UUID NOT NULL REFERENCES customers(user_id) ON DELETE CASCADE,
    order_id        VARCHAR(100),               -- Populated after order creation
    discount_applied NUMERIC(10,2) NOT NULL,
    used_at         TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

    CONSTRAINT coupon_usage_discount_non_negative CHECK (discount_applied >= 0)
);

CREATE INDEX IF NOT EXISTS idx_coupon_usages_coupon_id   ON coupon_usages(coupon_id);
CREATE INDEX IF NOT EXISTS idx_coupon_usages_customer_id ON coupon_usages(customer_id);

-- Audit log entry
INSERT INTO schema_audit_log (phase, description, executed_at)
VALUES ('V6', 'Created coupon, coupon restrictions, and coupon usage tables', NOW());
