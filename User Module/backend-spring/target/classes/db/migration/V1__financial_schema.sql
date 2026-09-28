-- White Quantex v2 — Financial & Identity Schema
-- Compatible with both PostgreSQL and H2 Databases

CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    username VARCHAR(100) UNIQUE,
    display_name VARCHAR(200),
    headline VARCHAR(255),
    bio TEXT,
    avatar_url VARCHAR(500),
    cover_image_url VARCHAR(500),
    location VARCHAR(200),
    website VARCHAR(255),
    linkedin_url VARCHAR(255),
    twitter_url VARCHAR(255),
    github_url VARCHAR(255),
    phone VARCHAR(50),
    country VARCHAR(100),
    primary_role VARCHAR(50) NOT NULL DEFAULT 'FOUNDER',
    account_type VARCHAR(50) NOT NULL DEFAULT 'individual',
    verification_level VARCHAR(50) NOT NULL DEFAULT 'NONE',
    kyc_status VARCHAR(50) NOT NULL DEFAULT 'NONE',
    trust_score INT NOT NULL DEFAULT 50,
    two_factor_enabled BOOLEAN NOT NULL DEFAULT FALSE,
    is_email_verified BOOLEAN NOT NULL DEFAULT FALSE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS roles (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS user_roles (
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role_id BIGINT NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, role_id)
);

CREATE TABLE IF NOT EXISTS businesses (
    id UUID PRIMARY KEY,
    owner_id UUID NOT NULL REFERENCES users(id),
    type VARCHAR(50) NOT NULL DEFAULT 'STARTUP',
    name VARCHAR(255) NOT NULL,
    legal_name VARCHAR(255),
    tagline VARCHAR(255),
    description TEXT,
    industry VARCHAR(100) NOT NULL,
    stage VARCHAR(50) NOT NULL DEFAULT 'SEED',
    location VARCHAR(200),
    website VARCHAR(255),
    logo_url VARCHAR(500),
    cover_image_url VARCHAR(500),
    verification_level VARCHAR(50) NOT NULL DEFAULT 'NONE',
    trust_score INT NOT NULL DEFAULT 50,
    funding_raised NUMERIC(15, 2) DEFAULT 0.00,
    valuation NUMERIC(15, 2) DEFAULT 0.00,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS fundraising_campaigns (
    id UUID PRIMARY KEY,
    business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    target_amount NUMERIC(15, 2) NOT NULL,
    raised_amount NUMERIC(15, 2) DEFAULT 0.00,
    min_investment NUMERIC(15, 2) NOT NULL DEFAULT 1000.00,
    max_investment NUMERIC(15, 2),
    equity_offered NUMERIC(5, 2) NOT NULL,
    share_price NUMERIC(10, 2) NOT NULL,
    total_shares BIGINT NOT NULL,
    available_shares BIGINT NOT NULL,
    start_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    end_date TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS investments (
    id UUID PRIMARY KEY,
    investor_id UUID NOT NULL REFERENCES users(id),
    business_id UUID NOT NULL REFERENCES businesses(id),
    campaign_id UUID NOT NULL REFERENCES fundraising_campaigns(id),
    amount NUMERIC(15, 2) NOT NULL,
    shares BIGINT NOT NULL,
    equity_percentage NUMERIC(5, 2) NOT NULL,
    share_price NUMERIC(10, 2) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'CONFIRMED',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS markets (
    symbol VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    current_value NUMERIC(15, 2) NOT NULL,
    change_percent NUMERIC(5, 2) NOT NULL,
    volume NUMERIC(20, 2),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS audit_logs (
    id BIGSERIAL PRIMARY KEY,
    actor_id UUID NOT NULL,
    action VARCHAR(100) NOT NULL,
    resource VARCHAR(100) NOT NULL,
    details TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
