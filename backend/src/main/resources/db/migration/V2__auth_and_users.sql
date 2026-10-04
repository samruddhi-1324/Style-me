-- StyleMe Eyewear E-Commerce Platform
-- Database Migration V2: Authentication and RBAC Schema
-- Author: StyleMe Engineering Team

-- Roles Table
CREATE TABLE IF NOT EXISTS roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    description VARCHAR(255)
);

-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone_number VARCHAR(30),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    is_email_verified BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- User-Roles Join Table
CREATE TABLE IF NOT EXISTS user_roles (
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role_id INT NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, role_id)
);

-- Seed System Roles
INSERT INTO roles (name, description) VALUES
    ('ROLE_CUSTOMER', 'Standard registered customer with shopping, checkout, and profile access'),
    ('ROLE_ADMIN', 'Store administrator with management capabilities'),
    ('ROLE_SUPER_ADMIN', 'Super administrator with full system-wide permissions'),
    ('ROLE_CATALOG_MANAGER', 'Staff member managing products, categories, variants, and inventory'),
    ('ROLE_ORDER_MANAGER', 'Staff member managing order lifecycle, fulfillment, and refunds'),
    ('ROLE_SUPPORT_AGENT', 'Customer support agent handling customer inquiries and review moderation')
ON CONFLICT (name) DO NOTHING;

-- Audit Log Record
INSERT INTO schema_audit_log (phase, description)
VALUES ('PHASE_2', 'Authentication and RBAC tables created: users, roles, user_roles');
