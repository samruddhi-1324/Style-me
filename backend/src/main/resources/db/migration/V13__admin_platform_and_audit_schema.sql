CREATE TABLE IF NOT EXISTS admin_audit_logs (
    id BIGSERIAL PRIMARY KEY,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(100) NOT NULL,
    entity_id VARCHAR(100),
    performed_by VARCHAR(100) NOT NULL,
    result VARCHAR(50) NOT NULL,
    details TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_admin_audit_logs_created_at ON admin_audit_logs (created_at DESC);
