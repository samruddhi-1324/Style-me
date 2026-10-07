-- =============================================================================
-- V11: Reviews and Ratings
-- SRS Section 27 / Review moderation and verified purchase support
-- =============================================================================

CREATE TABLE IF NOT EXISTS reviews (
    id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id           VARCHAR(64) NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    customer_id          UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    order_id             VARCHAR(36) REFERENCES orders(id) ON DELETE SET NULL,

    rating               INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
    title                VARCHAR(150),
    comment              TEXT NOT NULL,
    status               VARCHAR(20) NOT NULL DEFAULT 'APPROVED',
    is_verified_purchase BOOLEAN NOT NULL DEFAULT FALSE,
    moderation_note      TEXT,

    created_at           TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at           TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

    CONSTRAINT reviews_customer_product_unique UNIQUE (product_id, customer_id)
);

CREATE INDEX IF NOT EXISTS idx_reviews_product_id ON reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_reviews_customer_id ON reviews(customer_id);
CREATE INDEX IF NOT EXISTS idx_reviews_status ON reviews(status);
CREATE INDEX IF NOT EXISTS idx_reviews_product_status ON reviews(product_id, status);
