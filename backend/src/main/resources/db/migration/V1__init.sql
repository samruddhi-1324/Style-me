-- StyleMe Eyewear E-Commerce Platform
-- Database Migration V1: Initial Foundation Schema
-- Author: StyleMe Engineering Team

-- Enable UUID extension if available
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- System health & migration audit record table
CREATE TABLE IF NOT EXISTS schema_audit_log (
    id SERIAL PRIMARY KEY,
    phase VARCHAR(50) NOT NULL,
    description TEXT NOT NULL,
    executed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO schema_audit_log (phase, description)
VALUES ('PHASE_1', 'Backend Foundation initialized: PostgreSQL, Flyway, Spring Boot foundation');
