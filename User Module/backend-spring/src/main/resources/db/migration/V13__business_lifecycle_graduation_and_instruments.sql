-- ============================================================================
-- White Quantex — Three Core Sections: Business Lifecycle, Graduation & Market Instruments
-- Migration: V13__business_lifecycle_graduation_and_instruments.sql
-- ============================================================================

-- 1. Alter companies to enforce explicit lifecycle classification and market listing
ALTER TABLE companies
    ADD COLUMN IF NOT EXISTS lifecycle_classification VARCHAR(32) NOT NULL DEFAULT 'ESTABLISHED_COMPANY',
    ADD COLUMN IF NOT EXISTS lifecycle_status VARCHAR(32) NOT NULL DEFAULT 'ACTIVE',
    ADD COLUMN IF NOT EXISTS graduation_date TIMESTAMP WITH TIME ZONE,
    ADD COLUMN IF NOT EXISTS market_listing_status VARCHAR(32) NOT NULL DEFAULT 'LISTED';

CREATE INDEX IF NOT EXISTS idx_companies_lifecycle ON companies(lifecycle_classification, lifecycle_status);

-- 2. Alter ventures to enforce explicit startup classification and graduation tracking
ALTER TABLE ventures
    ADD COLUMN IF NOT EXISTS lifecycle_classification VARCHAR(32) NOT NULL DEFAULT 'STARTUP',
    ADD COLUMN IF NOT EXISTS lifecycle_status VARCHAR(32) NOT NULL DEFAULT 'ACTIVE',
    ADD COLUMN IF NOT EXISTS graduation_eligible BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS is_graduated BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS market_listing_status VARCHAR(32) NOT NULL DEFAULT 'UNLISTED',
    ADD COLUMN IF NOT EXISTS problem_statement TEXT,
    ADD COLUMN IF NOT EXISTS solution_description TEXT,
    ADD COLUMN IF NOT EXISTS product_stage VARCHAR(64) DEFAULT 'MVP Deployed';

CREATE INDEX IF NOT EXISTS idx_ventures_lifecycle ON ventures(lifecycle_classification, lifecycle_status, is_graduated);

-- 3. Business Lifecycle History (Immutable audit trail of transitions)
CREATE TABLE IF NOT EXISTS business_lifecycle_history (
    id UUID PRIMARY KEY,
    business_id UUID NOT NULL,
    business_name VARCHAR(255) NOT NULL,
    previous_classification VARCHAR(32) NOT NULL,
    new_classification VARCHAR(32) NOT NULL,
    previous_status VARCHAR(32),
    new_status VARCHAR(32),
    transition_reason TEXT,
    approval_reference VARCHAR(128),
    performed_by VARCHAR(128) NOT NULL,
    effective_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_lifecycle_history_biz ON business_lifecycle_history(business_id, effective_at DESC);

-- 4. Graduation Applications Table (Workflow for Startup -> Established Company)
CREATE TABLE IF NOT EXISTS graduation_applications (
    id UUID PRIMARY KEY,
    business_id UUID NOT NULL,
    business_name VARCHAR(255) NOT NULL,
    ticker VARCHAR(32) NOT NULL,
    application_status VARCHAR(32) NOT NULL DEFAULT 'SUBMITTED',
    product_maturity_summary TEXT,
    revenue_run_rate VARCHAR(64),
    customer_count INT DEFAULT 0,
    compliance_notes TEXT,
    evidence_documents TEXT,
    submitted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    reviewed_at TIMESTAMP WITH TIME ZONE,
    reviewed_by VARCHAR(128),
    decision VARCHAR(32),
    decision_reason TEXT,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_grad_app_status ON graduation_applications(application_status);
CREATE INDEX IF NOT EXISTS idx_grad_app_biz ON graduation_applications(business_id);

-- 5. Graduation Policies Configuration
CREATE TABLE IF NOT EXISTS graduation_policies (
    id UUID PRIMARY KEY,
    policy_name VARCHAR(128) NOT NULL,
    version VARCHAR(32) NOT NULL,
    min_operating_months INT NOT NULL DEFAULT 12,
    requires_legal_incorporation BOOLEAN NOT NULL DEFAULT TRUE,
    min_revenue_threshold NUMERIC(18, 2) DEFAULT 500000.00,
    requires_sec_or_statutory_filing BOOLEAN NOT NULL DEFAULT TRUE,
    approval_authority VARCHAR(64) NOT NULL DEFAULT 'WQ_ADMIN_BOARD',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Seed default policy
INSERT INTO graduation_policies (id, policy_name, version, min_operating_months, requires_legal_incorporation, min_revenue_threshold, requires_sec_or_statutory_filing, approval_authority, is_active)
VALUES (
    '00000000-0000-0000-0003-000000000001',
    'White Quantex Standard Venture Graduation Policy',
    'v2.0',
    12,
    TRUE,
    500000.00,
    TRUE,
    'WQ_ADMIN_BOARD',
    TRUE
) ON CONFLICT DO NOTHING;

-- 6. Market Instruments (Financial assets traded on exchanges, distinct from business entities)
CREATE TABLE IF NOT EXISTS market_instruments (
    id UUID PRIMARY KEY,
    instrument_type VARCHAR(32) NOT NULL DEFAULT 'STOCK',
    symbol VARCHAR(32) NOT NULL UNIQUE,
    instrument_name VARCHAR(255) NOT NULL,
    exchange_name VARCHAR(64) NOT NULL DEFAULT 'WQX Institutional Exchange',
    exchange_mic VARCHAR(16) NOT NULL DEFAULT 'XWQX',
    country VARCHAR(10) NOT NULL DEFAULT 'US',
    currency VARCHAR(10) NOT NULL DEFAULT 'USD',
    issuer_business_id UUID,
    listing_status VARCHAR(32) NOT NULL DEFAULT 'LISTED',
    lot_size INT NOT NULL DEFAULT 1,
    is_actively_traded BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_instruments_sym ON market_instruments(symbol);
CREATE INDEX IF NOT EXISTS idx_instruments_issuer ON market_instruments(issuer_business_id);

-- Seed initial instruments from established corporate issuers
INSERT INTO market_instruments (id, instrument_type, symbol, instrument_name, exchange_name, exchange_mic, country, currency, issuer_business_id, listing_status, lot_size, is_actively_traded)
SELECT 
    gen_random_uuid(),
    'STOCK',
    c.ticker,
    c.name,
    'WQX Institutional Exchange',
    'XWQX',
    'US',
    'USD',
    c.id,
    'LISTED',
    1,
    TRUE
FROM companies c
WHERE c.ticker IS NOT NULL
ON CONFLICT (symbol) DO NOTHING;

-- Seed market indices into instruments
INSERT INTO market_instruments (id, instrument_type, symbol, instrument_name, exchange_name, exchange_mic, country, currency, issuer_business_id, listing_status, lot_size, is_actively_traded)
VALUES 
    (gen_random_uuid(), 'INDEX', 'WQ100', 'WQ Composite 100 Index', 'White Quantex Index Bureau', 'XWQX', 'US', 'USD', NULL, 'LISTED', 1, TRUE),
    (gen_random_uuid(), 'INDEX', 'WQAI', 'WQ DeepTech AI 50 Index', 'White Quantex Index Bureau', 'XWQX', 'US', 'USD', NULL, 'LISTED', 1, TRUE),
    (gen_random_uuid(), 'INDEX', 'WQXF', 'WQ Fintech 25 Index', 'White Quantex Index Bureau', 'XWQX', 'US', 'USD', NULL, 'LISTED', 1, TRUE),
    (gen_random_uuid(), 'INDEX', 'WQGRN', 'WQ CleanEnergy Index', 'White Quantex Index Bureau', 'XWQX', 'US', 'USD', NULL, 'LISTED', 1, TRUE)
ON CONFLICT (symbol) DO NOTHING;
