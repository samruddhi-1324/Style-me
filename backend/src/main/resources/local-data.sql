INSERT INTO categories (id, name, slug, description, image_url, display_order, is_active, created_at, updated_at)
VALUES
  (1, 'Eyeglasses', 'eyeglasses', 'Premium prescription and optical frames engineered for daily clarity', '/images/categories/eyeglasses.jpg', 1, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (2, 'Sunglasses', 'sunglasses', '100% UV-protected polarized and tinted designer sunglasses', '/images/categories/sunglasses.jpg', 2, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (3, 'Blue-light', 'blue-light', 'Advanced digital eye-strain protection lenses for screens', '/images/categories/bluelight.jpg', 3, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (4, 'Kids', 'kids', 'Durable, lightweight and flexible eyewear designed for young wearers', '/images/categories/kids.jpg', 4, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO products (
    id, sku, name, category_id, price, original_price, rating, review_count,
    size, material, frame_shape, frame_color, gender, weight, prescription_range, warranty,
    frame_width, lens_height, bridge_width, temple_length, fit, fit_note,
    description, in_stock, is_new, is_featured, is_ai_pick, status, created_at, updated_at
) VALUES
    ('frame-001', 'SKU-WILLOW-TORTOISE', 'Willow Tortoise', 1, 3299.00, 4499.00, 4.7, 112, 'Medium', 'Acetate', 'Rectangle', 'Tortoise', 'Unisex', '18g', '-8.00 to +6.00', '1 Year', 142, 48, 20, 145, 'Good', 'This frame is approximately 2 mm wider than your recommended fit.', 'The Willow Tortoise brings together timeless style and everyday comfort. Made from premium acetate, it is lightweight, durable and designed for all-day wear.', TRUE, FALSE, TRUE, TRUE, 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('frame-009', 'SKU-AERO-AVIATOR', 'Aero Aviator Gold', 2, 4199.00, 5299.00, 4.9, 148, 'Large', 'Titanium', 'Aviator', 'Gold', 'Men', '16g', '-4.00 to +4.00', '2 Years', 146, 52, 18, 148, 'Good', 'Balanced fit suitable for medium to broad facial profiles.', 'Precision-engineered ultra-light titanium aviator sunglasses featuring polarized lenses and anti-glare coating.', TRUE, TRUE, TRUE, FALSE, 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('frame-013', 'SKU-ORBIT-BLUE', 'Orbit Blue Light', 3, 2799.00, 3599.00, 4.6, 86, 'Medium', 'Polycarbonate', 'Round', 'Blue', 'Unisex', '15g', 'All prescriptions', '1 Year', 140, 50, 19, 142, 'Excellent', 'Optimized for screen time with a relaxed, comfortable fit.', 'A modern blue-light frame designed for long digital workdays with lightweight comfort and a clean silhouette.', TRUE, FALSE, TRUE, TRUE, 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('frame-016', 'SKU-SPARK-KIDS', 'Spark Kids Frame', 4, 1999.00, 2499.00, 4.5, 41, 'Small', 'TR90', 'Round', 'Pink', 'Kids', '11g', 'All prescriptions', '6 Months', 118, 42, 14, 124, 'Good', 'Built-to-last children’s frame with a flexible fit for active play.', 'A playful kids frame with strong flexibility and a secure fit for everyday school and playwear.', TRUE, TRUE, TRUE, FALSE, 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('frame-020', 'SKU-NOVA-RECTANGLE', 'Nova Rectangle', 1, 3499.00, 4799.00, 4.8, 95, 'Medium', 'Acetate', 'Rectangle', 'Black', 'Women', '17g', '-6.00 to +4.00', '1 Year', 141, 49, 19, 144, 'Excellent', 'A sharp, feminine silhouette with premium comfort and confidence.', 'The Nova Rectangle pairs a minimal profile with subtle statement details and all-day refined comfort.', TRUE, FALSE, TRUE, TRUE, 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO product_variants (id, product_id, sku, color_name, color_hex, stock_quantity, is_in_stock, created_at)
VALUES
    ('11111111-1111-1111-1111-111111111111', 'frame-001', 'SKU-WILLOW-001', 'Tortoise', '#8B5E3C', 45, TRUE, CURRENT_TIMESTAMP),
    ('22222222-2222-2222-2222-222222222222', 'frame-001', 'SKU-WILLOW-002', 'Raven Black', '#292626', 30, TRUE, CURRENT_TIMESTAMP),
    ('33333333-3333-3333-3333-333333333333', 'frame-009', 'SKU-AERO-001', 'Gold', '#B8860B', 20, TRUE, CURRENT_TIMESTAMP),
    ('44444444-4444-4444-4444-444444444444', 'frame-013', 'SKU-ORBIT-001', 'Blue', '#4A90E2', 26, TRUE, CURRENT_TIMESTAMP),
    ('55555555-5555-5555-5555-555555555555', 'frame-020', 'SKU-NOVA-001', 'Black', '#111111', 18, TRUE, CURRENT_TIMESTAMP);

INSERT INTO product_images (product_id, image_url, display_order, is_primary)
VALUES
    ('frame-001', '/frames/willow-1.jpg', 1, TRUE),
    ('frame-001', '/frames/willow-2.jpg', 2, FALSE),
    ('frame-009', '/frames/aero-1.jpg', 1, TRUE),
    ('frame-013', '/frames/orbit-1.jpg', 1, TRUE),
    ('frame-020', '/frames/nova-1.jpg', 1, TRUE);

INSERT INTO product_badges (product_id, badge)
VALUES
    ('frame-001', 'Prescription-ready'),
    ('frame-001', 'AI Recommended'),
    ('frame-009', 'Polarized'),
    ('frame-013', 'Blue Light'),
    ('frame-020', 'Premium');

INSERT INTO product_face_shapes (product_id, face_shape)
VALUES
    ('frame-001', 'Oval'),
    ('frame-001', 'Heart'),
    ('frame-009', 'Square'),
    ('frame-013', 'Oval'),
    ('frame-020', 'Round');
