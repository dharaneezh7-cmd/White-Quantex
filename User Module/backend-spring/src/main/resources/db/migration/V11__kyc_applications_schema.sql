-- White Quantex v2 — Individual User KYC Verification & Compliance Schema
-- Migration: V11__kyc_applications_schema.sql
-- Compatible with PostgreSQL and H2 databases

CREATE TABLE IF NOT EXISTS kyc_applications (
    id UUID PRIMARY KEY,
    application_id VARCHAR(50) NOT NULL UNIQUE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    legal_first_name VARCHAR(100) NOT NULL,
    legal_last_name VARCHAR(100) NOT NULL,
    date_of_birth VARCHAR(50) NOT NULL,
    residential_address TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    state_province VARCHAR(100) NOT NULL,
    postal_code VARCHAR(50) NOT NULL,
    country VARCHAR(100) NOT NULL,
    nationality VARCHAR(100) NOT NULL,
    id_type VARCHAR(50) NOT NULL,
    id_number_masked VARCHAR(100) NOT NULL,
    id_number_hash VARCHAR(255) NOT NULL,
    phone_number VARCHAR(50),
    document_type VARCHAR(50) NOT NULL,
    document_file_name VARCHAR(255) NOT NULL,
    document_mime_type VARCHAR(100),
    document_file_size BIGINT,
    document_storage_path VARCHAR(500) NOT NULL,
    proof_of_address_file_name VARCHAR(255),
    proof_of_address_storage_path VARCHAR(500),
    declaration_accepted BOOLEAN NOT NULL DEFAULT FALSE,
    consent_accepted BOOLEAN NOT NULL DEFAULT FALSE,
    status VARCHAR(50) NOT NULL DEFAULT 'NOT_STARTED',
    verification_source VARCHAR(100),
    reviewer_id VARCHAR(100),
    reviewer_notes TEXT,
    action_required_reason TEXT,
    rejection_reason TEXT,
    audit_log TEXT,
    submitted_at TIMESTAMP,
    reviewed_at TIMESTAMP,
    approved_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_kyc_user_id ON kyc_applications(user_id);
CREATE INDEX IF NOT EXISTS idx_kyc_status ON kyc_applications(status);
