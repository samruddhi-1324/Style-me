-- Align the restriction key with categories.id, which uses PostgreSQL SERIAL/INTEGER.
ALTER TABLE coupon_category_restrictions
    ALTER COLUMN category_id TYPE INTEGER
    USING category_id::INTEGER;
