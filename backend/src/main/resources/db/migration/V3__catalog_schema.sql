-- StyleMe Eyewear E-Commerce Platform
-- Database Migration V3: Category, Product, and Variant Schema
-- Author: StyleMe Engineering Team

-- Categories Table
CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    image_url VARCHAR(500),
    display_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);

-- Products Table
CREATE TABLE IF NOT EXISTS products (
    id VARCHAR(64) PRIMARY KEY,
    sku VARCHAR(100) UNIQUE,
    name VARCHAR(255) NOT NULL,
    category_id INT NOT NULL REFERENCES categories(id),
    price NUMERIC(10, 2) NOT NULL,
    original_price NUMERIC(10, 2),
    rating NUMERIC(3, 2) DEFAULT 0.0,
    review_count INT DEFAULT 0,
    size VARCHAR(20) NOT NULL,
    material VARCHAR(100) NOT NULL,
    frame_shape VARCHAR(50) NOT NULL,
    frame_color VARCHAR(100),
    gender VARCHAR(20) NOT NULL,
    weight VARCHAR(30),
    prescription_range VARCHAR(50),
    warranty VARCHAR(50),
    frame_width INT,
    lens_height INT,
    bridge_width INT,
    temple_length INT,
    fit VARCHAR(20) DEFAULT 'Good',
    fit_note TEXT,
    description TEXT,
    in_stock BOOLEAN DEFAULT TRUE,
    is_new BOOLEAN DEFAULT FALSE,
    is_featured BOOLEAN DEFAULT FALSE,
    is_ai_pick BOOLEAN DEFAULT FALSE,
    status VARCHAR(30) DEFAULT 'ACTIVE',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_shape ON products(frame_shape);
CREATE INDEX IF NOT EXISTS idx_products_material ON products(material);
CREATE INDEX IF NOT EXISTS idx_products_gender ON products(gender);
CREATE INDEX IF NOT EXISTS idx_products_price ON products(price);
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);

-- Product Variants Table (SKU, Color, Hex, Stock)
CREATE TABLE IF NOT EXISTS product_variants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id VARCHAR(64) NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    sku VARCHAR(100) NOT NULL UNIQUE,
    color_name VARCHAR(100) NOT NULL,
    color_hex VARCHAR(30),
    stock_quantity INT DEFAULT 0,
    is_in_stock BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_variants_product ON product_variants(product_id);

-- Product Images Table
CREATE TABLE IF NOT EXISTS product_images (
    id SERIAL PRIMARY KEY,
    product_id VARCHAR(64) NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    image_url VARCHAR(500) NOT NULL,
    display_order INT DEFAULT 0,
    is_primary BOOLEAN DEFAULT FALSE
);

CREATE INDEX IF NOT EXISTS idx_images_product ON product_images(product_id);

-- Product Badges Table
CREATE TABLE IF NOT EXISTS product_badges (
    id SERIAL PRIMARY KEY,
    product_id VARCHAR(64) NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    badge VARCHAR(100) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_badges_product ON product_badges(product_id);

-- Product Face Shapes Table
CREATE TABLE IF NOT EXISTS product_face_shapes (
    id SERIAL PRIMARY KEY,
    product_id VARCHAR(64) NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    face_shape VARCHAR(50) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_face_shapes_product ON product_face_shapes(product_id);

-- Seed Categories
INSERT INTO categories (name, slug, description, display_order) VALUES
    ('Eyeglasses', 'eyeglasses', 'Premium prescription and optical frames engineered for daily clarity', 1),
    ('Sunglasses', 'sunglasses', '100% UV-protected polarized and tinted designer sunglasses', 2),
    ('Blue-light', 'blue-light', 'Advanced digital eye-strain protection lenses for screens', 3),
    ('Kids', 'kids', 'Durable, lightweight and flexible eyewear designed for young wearers', 4)
ON CONFLICT (name) DO NOTHING;

-- Seed Sample Products
INSERT INTO products (
    id, sku, name, category_id, price, original_price, rating, review_count,
    size, material, frame_shape, frame_color, gender, weight, prescription_range, warranty,
    frame_width, lens_height, bridge_width, temple_length, fit, fit_note,
    description, in_stock, is_new, is_featured, is_ai_pick, status
) VALUES (
    'frame-001', 'SKU-WILLOW-TORTOISE', 'Willow Tortoise', 1, 3299.00, 4499.00, 4.7, 112,
    'Medium', 'Acetate', 'Rectangle', 'Tortoise', 'Unisex', '18g', '-8.00 to +6.00', '1 Year',
    142, 48, 20, 145, 'Good', 'This frame is approximately 2 mm wider than your recommended fit.',
    'The Willow Tortoise brings together timeless style and everyday comfort. Made from premium acetate, it is lightweight, durable and designed for all-day wear.',
    TRUE, FALSE, TRUE, TRUE, 'ACTIVE'
), (
    'frame-009', 'SKU-AERO-AVIATOR', 'Aero Aviator Gold', 2, 4199.00, 5299.00, 4.9, 148,
    'Large', 'Titanium', 'Aviator', 'Gold', 'Men', '16g', '-4.00 to +4.00', '2 Years',
    146, 52, 18, 148, 'Good', 'Balanced fit suitable for medium to broad facial profiles.',
    'Precision-engineered ultra-light titanium aviator sunglasses featuring polarized polarized lenses and anti-glare coating.',
    TRUE, TRUE, TRUE, FALSE, 'ACTIVE'
) ON CONFLICT (id) DO NOTHING;

-- Seed Sample Variants for Willow Tortoise
INSERT INTO product_variants (product_id, sku, color_name, color_hex, stock_quantity, is_in_stock) VALUES
    ('frame-001', 'SKU-WILLOW-001', 'Tortoise', '#8B5E3C', 45, TRUE),
    ('frame-001', 'SKU-WILLOW-002', 'Raven Black', '#292626', 30, TRUE),
    ('frame-001', 'SKU-WILLOW-003', 'Forest Green', '#4A7C59', 15, TRUE)
ON CONFLICT (sku) DO NOTHING;

-- Seed Sample Images
INSERT INTO product_images (product_id, image_url, display_order, is_primary) VALUES
    ('frame-001', '/frames/willow-1.jpg', 1, TRUE),
    ('frame-001', '/frames/willow-2.jpg', 2, FALSE),
    ('frame-009', '/frames/aero-1.jpg', 1, TRUE)
ON CONFLICT DO NOTHING;

-- Seed Sample Badges
INSERT INTO product_badges (product_id, badge) VALUES
    ('frame-001', 'Prescription-ready'),
    ('frame-001', 'AI Recommended'),
    ('frame-009', 'Bestseller'),
    ('frame-009', 'Polarized')
ON CONFLICT DO NOTHING;

-- Seed Sample Face Shapes
INSERT INTO product_face_shapes (product_id, face_shape) VALUES
    ('frame-001', 'Oval'),
    ('frame-001', 'Heart'),
    ('frame-009', 'Square'),
    ('frame-009', 'Oval')
ON CONFLICT DO NOTHING;

-- Record Phase 3 in schema_audit_log
INSERT INTO schema_audit_log (phase, description)
VALUES ('PHASE_3', 'Category, Product, Variant, Image, Badge, and Face Shape tables created with initial seed data');
