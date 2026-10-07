-- =============================================================================
-- V5: Customer, Cart, and Wishlist Schema
-- SRS Sections 26
-- =============================================================================

-- Customer Profile: Extension of users table for commerce-specific data
CREATE TABLE IF NOT EXISTS customers (
    user_id                 UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    marketing_opt_in        BOOLEAN NOT NULL DEFAULT FALSE,
    preferences_json        JSONB,
    created_at              TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Addresses
CREATE TABLE IF NOT EXISTS addresses (
    id              BIGSERIAL PRIMARY KEY,
    customer_id     UUID NOT NULL REFERENCES customers(user_id) ON DELETE CASCADE,
    address_type    VARCHAR(20) NOT NULL, -- SHIPPING, BILLING
    first_name      VARCHAR(100) NOT NULL,
    last_name       VARCHAR(100) NOT NULL,
    phone_number    VARCHAR(30),
    line1           VARCHAR(255) NOT NULL,
    line2           VARCHAR(255),
    city            VARCHAR(100) NOT NULL,
    state           VARCHAR(100) NOT NULL,
    postal_code     VARCHAR(20) NOT NULL,
    country         VARCHAR(100) NOT NULL,
    is_default      BOOLEAN NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_addresses_customer_id ON addresses(customer_id);

-- Cart
CREATE TABLE IF NOT EXISTS carts (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id     UUID REFERENCES customers(user_id) ON DELETE CASCADE,
    session_id      VARCHAR(255), -- For guest carts
    created_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

    -- A cart must belong to either a customer or a session
    CONSTRAINT cart_owner_check CHECK (customer_id IS NOT NULL OR session_id IS NOT NULL),
    CONSTRAINT cart_customer_unique UNIQUE (customer_id)
);

CREATE INDEX IF NOT EXISTS idx_carts_session_id ON carts(session_id);

-- Cart Items
CREATE TABLE IF NOT EXISTS cart_items (
    id              BIGSERIAL PRIMARY KEY,
    cart_id         UUID NOT NULL REFERENCES carts(id) ON DELETE CASCADE,
    product_id      VARCHAR(100) NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    variant_id      UUID REFERENCES product_variants(id) ON DELETE CASCADE,
    quantity        INT NOT NULL DEFAULT 1,
    added_at        TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    
    CONSTRAINT cart_items_quantity_positive CHECK (quantity > 0),
    -- Prevent duplicate product/variant combinations in same cart
    CONSTRAINT cart_items_unique_product UNIQUE NULLS NOT DISTINCT (cart_id, product_id, variant_id)
);

-- Wishlist
CREATE TABLE IF NOT EXISTS wishlists (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id     UUID NOT NULL REFERENCES customers(user_id) ON DELETE CASCADE,
    created_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    
    CONSTRAINT wishlist_customer_unique UNIQUE (customer_id)
);

-- Wishlist Items
CREATE TABLE IF NOT EXISTS wishlist_items (
    id              BIGSERIAL PRIMARY KEY,
    wishlist_id     UUID NOT NULL REFERENCES wishlists(id) ON DELETE CASCADE,
    product_id      VARCHAR(100) NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    added_at        TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    
    CONSTRAINT wishlist_items_unique_product UNIQUE (wishlist_id, product_id)
);

-- Audit log entry
INSERT INTO schema_audit_log (phase, description, executed_at)
VALUES ('V5', 'Created customer profile, addresses, cart, and wishlist tables', NOW());
