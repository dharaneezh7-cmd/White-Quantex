-- ============================================================================
-- White Quantex — Company Module Core Schema & Concurrency Management
-- Database: Shared PostgreSQL (WhiteQuantex-Financial-Database)
-- Flyway History Table: flyway_company_history
-- ============================================================================

-- 1. Alter companies table to add owner reference and optimistic locking version
ALTER TABLE companies
    ADD COLUMN IF NOT EXISTS owner_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS version BIGINT NOT NULL DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_companies_owner ON companies(owner_user_id);

-- 2. Alter ventures table to add owner reference and optimistic locking version
ALTER TABLE ventures
    ADD COLUMN IF NOT EXISTS owner_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS version BIGINT NOT NULL DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_ventures_owner ON ventures(owner_user_id);

-- 3. Company Memberships Table (Prevents Scenario 2: Concurrent duplicate memberships)
CREATE TABLE IF NOT EXISTS company_memberships (
    id UUID PRIMARY KEY,
    company_id UUID NOT NULL,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(32) NOT NULL DEFAULT 'MEMBER',
    title VARCHAR(128),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    invited_by UUID REFERENCES users(id),
    joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_company_membership UNIQUE (company_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_company_memberships_company ON company_memberships(company_id);
CREATE INDEX IF NOT EXISTS idx_company_memberships_user ON company_memberships(user_id);
CREATE INDEX IF NOT EXISTS idx_company_memberships_role ON company_memberships(company_id, role);

-- 4. Company Verifications Table (Workflow for SEC 506(c) & Institutional Clearance)
CREATE TABLE IF NOT EXISTS company_verifications (
    id UUID PRIMARY KEY,
    company_id UUID NOT NULL,
    request_type VARCHAR(64) NOT NULL DEFAULT 'STANDARD_VERIFICATION',
    verification_tier VARCHAR(32) NOT NULL DEFAULT 'GOLD',
    status VARCHAR(32) NOT NULL DEFAULT 'PENDING',
    business_registration_number VARCHAR(128),
    tax_id VARCHAR(64),
    incorporation_jurisdiction VARCHAR(128),
    submission_notes TEXT,
    reviewer_user_id UUID REFERENCES users(id),
    reviewer_notes TEXT,
    reviewed_at TIMESTAMP WITH TIME ZONE,
    submitted_by UUID NOT NULL REFERENCES users(id),
    submitted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    version BIGINT NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_company_verifications_company ON company_verifications(company_id);
CREATE INDEX IF NOT EXISTS idx_company_verifications_status ON company_verifications(status);

-- 5. Company Documents Table
CREATE TABLE IF NOT EXISTS company_documents (
    id UUID PRIMARY KEY,
    company_id UUID NOT NULL,
    title VARCHAR(255) NOT NULL,
    document_type VARCHAR(64) NOT NULL,
    file_url VARCHAR(500) NOT NULL,
    file_size_bytes BIGINT,
    mime_type VARCHAR(100),
    confidentiality_level VARCHAR(32) NOT NULL DEFAULT 'PRIVATE',
    verification_id UUID REFERENCES company_verifications(id) ON DELETE SET NULL,
    uploaded_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_company_documents_company ON company_documents(company_id);

-- 6. Company Audit Logs (Immutable audit trail for all company actions)
CREATE TABLE IF NOT EXISTS company_audit_logs (
    id UUID PRIMARY KEY,
    company_id UUID NOT NULL,
    actor_user_id UUID NOT NULL,
    action VARCHAR(64) NOT NULL,
    previous_state TEXT,
    new_state TEXT,
    ip_address VARCHAR(64),
    correlation_id VARCHAR(128),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_company_audit_logs_company ON company_audit_logs(company_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_company_audit_logs_actor ON company_audit_logs(actor_user_id);

-- 7. Idempotency Keys (Prevents Scenario 7: Network retries & duplicate mutations)
CREATE TABLE IF NOT EXISTS company_idempotency_keys (
    key VARCHAR(128) PRIMARY KEY,
    user_id UUID NOT NULL,
    endpoint VARCHAR(255) NOT NULL,
    response_status INT,
    response_body TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_idempotency_keys_user ON company_idempotency_keys(user_id);

-- 8. Seed Default Owner for existing top companies if users table has primary demo user
DO $$
DECLARE
    v_demo_user_id UUID := '55555555-5555-5555-5555-555555555555';
BEGIN
    IF EXISTS (SELECT 1 FROM users WHERE id = v_demo_user_id) THEN
        -- Link demo user as owner of ZEPR, VOCL, OCGN, TFLOW, VGRD if unassigned
        UPDATE companies SET owner_user_id = v_demo_user_id WHERE owner_user_id IS NULL AND ticker IN ('ZEPR', 'VOCL', 'OCGN', 'TFLOW', 'VGRD');

        -- Create owner memberships in company_memberships
        INSERT INTO company_memberships (id, company_id, user_id, role, title, is_active, joined_at)
        SELECT 
            gen_random_uuid(),
            c.id,
            v_demo_user_id,
            'OWNER',
            'Chief Executive Officer',
            TRUE,
            CURRENT_TIMESTAMP
        FROM companies c
        WHERE c.owner_user_id = v_demo_user_id
        ON CONFLICT (company_id, user_id) DO NOTHING;
    END IF;
END $$;
