-- V2: Company Lifecycle and Graduation Schema
CREATE TABLE IF NOT EXISTS graduation_applications (
    id UUID PRIMARY KEY,
    business_id UUID NOT NULL,
    current_classification VARCHAR(32) NOT NULL DEFAULT 'STARTUP',
    requested_classification VARCHAR(32) NOT NULL DEFAULT 'ESTABLISHED_COMPANY',
    application_status VARCHAR(32) NOT NULL DEFAULT 'PENDING',
    maturity_summary TEXT NOT NULL,
    revenue_run_rate NUMERIC(18, 2) NOT NULL DEFAULT 0.00,
    customer_count INT NOT NULL DEFAULT 0,
    applicant_user_id UUID NOT NULL REFERENCES users(id),
    reviewer_user_id UUID REFERENCES users(id),
    decision VARCHAR(32),
    reviewer_notes TEXT,
    reviewed_at TIMESTAMP WITH TIME ZONE,
    version BIGINT NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_graduation_applications_business ON graduation_applications(business_id);
CREATE INDEX IF NOT EXISTS idx_graduation_applications_status ON graduation_applications(application_status);

CREATE TABLE IF NOT EXISTS business_lifecycle_history (
    id UUID PRIMARY KEY,
    business_id UUID NOT NULL,
    previous_classification VARCHAR(32) NOT NULL,
    new_classification VARCHAR(32) NOT NULL,
    graduation_application_id UUID REFERENCES graduation_applications(id) ON DELETE SET NULL,
    reason TEXT,
    authorized_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_lifecycle_history_business ON business_lifecycle_history(business_id, created_at DESC);
