CREATE TABLE IF NOT EXISTS cms_pages (
    id BIGSERIAL PRIMARY KEY,
    slug VARCHAR(120) NOT NULL UNIQUE,
    page_type VARCHAR(40) NOT NULL,
    title VARCHAR(200) NOT NULL,
    summary TEXT,
    content TEXT NOT NULL,
    seo_title VARCHAR(200),
    meta_description VARCHAR(500),
    status VARCHAR(20) NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'PUBLISHED', 'ARCHIVED')),
    show_in_navigation BOOLEAN NOT NULL DEFAULT FALSE,
    published_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS store_settings (
    id BIGSERIAL PRIMARY KEY,
    store_name VARCHAR(200) NOT NULL DEFAULT 'StyleMe Eyewear',
    support_email VARCHAR(255) DEFAULT 'hello@stylemeeyewear.com',
    support_phone VARCHAR(50) DEFAULT '+91 98765 43210',
    currency VARCHAR(10) NOT NULL DEFAULT 'INR',
    locale VARCHAR(20) NOT NULL DEFAULT 'en-IN',
    time_zone VARCHAR(50) NOT NULL DEFAULT 'Asia/Kolkata',
    free_shipping_threshold NUMERIC(10, 2) NOT NULL DEFAULT 0,
    shipping_policy TEXT,
    return_policy TEXT,
    privacy_policy TEXT,
    terms_and_conditions TEXT,
    announcement_message TEXT,
    contact_address TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO store_settings (
    store_name,
    support_email,
    support_phone,
    currency,
    locale,
    time_zone,
    free_shipping_threshold,
    shipping_policy,
    return_policy,
    privacy_policy,
    terms_and_conditions,
    announcement_message,
    contact_address
) VALUES (
    'StyleMe Eyewear',
    'hello@stylemeeyewear.com',
    '+91 98765 43210',
    'INR',
    'en-IN',
    'Asia/Kolkata',
    0.00,
    'We ship across India within 3-7 business days for in-stock items.',
    'Returns are accepted within 7 days of delivery for unused items in original packaging.',
    'We respect your privacy and use your data only to improve your shopping experience.',
    'By placing an order, you agree to our terms and conditions for purchases and support.',
    'Free shipping on orders above ₹2,500.',
    'StyleMe Eyewear, Bengaluru, Karnataka, India'
)
ON CONFLICT DO NOTHING;

INSERT INTO cms_pages (
    slug,
    page_type,
    title,
    summary,
    content,
    seo_title,
    meta_description,
    status,
    show_in_navigation,
    published_at
) VALUES (
    'about',
    'ABOUT',
    'About StyleMe',
    'Learn about our eyewear story and design philosophy.',
    '<h1>About StyleMe</h1><p>StyleMe Eyewear crafts premium frames for everyday confidence, comfort, and individuality.</p>',
    'About StyleMe Eyewear',
    'Discover StyleMe Eyewear, premium prescription and sunglasses crafted for a confident everyday fit.',
    'PUBLISHED',
    true,
    NOW()
) ON CONFLICT (slug) DO NOTHING;
