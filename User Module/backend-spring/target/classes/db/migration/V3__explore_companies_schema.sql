-- White Quantex v2 — Explore Section & Corporate Issuer Registry Schema
-- Compatible with both PostgreSQL and H2 databases

CREATE TABLE IF NOT EXISTS companies (
    id UUID PRIMARY KEY,
    ticker VARCHAR(20) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    short_name VARCHAR(100) NOT NULL,
    legal_entity VARCHAR(150) NOT NULL DEFAULT 'Delaware C-Corp',
    cik VARCHAR(50) NOT NULL UNIQUE,
    sector VARCHAR(100) NOT NULL,
    sub_industry VARCHAR(150) NOT NULL,
    headquarters VARCHAR(150) NOT NULL,
    region VARCHAR(50) NOT NULL,
    founded_year INT NOT NULL,
    ceo VARCHAR(150) NOT NULL,
    employees INT NOT NULL DEFAULT 1,
    valuation VARCHAR(50) NOT NULL,
    valuation_num NUMERIC(18, 2) NOT NULL DEFAULT 0.00,
    annual_revenue VARCHAR(50) NOT NULL,
    annual_revenue_num NUMERIC(18, 2) NOT NULL DEFAULT 0.00,
    verification_level VARCHAR(50) NOT NULL DEFAULT 'PLATINUM',
    trust_score INT NOT NULL DEFAULT 90,
    description TEXT,
    logo_color VARCHAR(50) NOT NULL DEFAULT 'bg-emerald-600',
    status VARCHAR(50) NOT NULL DEFAULT 'Active Trading',
    exchange_tier VARCHAR(50) NOT NULL DEFAULT 'Tier-1 Institutional',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS company_market_metrics (
    id UUID PRIMARY KEY,
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    change_24h VARCHAR(20) NOT NULL DEFAULT '0.0%',
    change_percent NUMERIC(8, 2) NOT NULL DEFAULT 0.00,
    is_positive BOOLEAN NOT NULL DEFAULT TRUE,
    market_cap_gain_loss VARCHAR(50),
    invested_today VARCHAR(50),
    allocation_percent INT,
    trading_volume_today VARCHAR(50),
    is_52w_high BOOLEAN NOT NULL DEFAULT FALSE,
    rank_gainer INT,
    rank_loser INT,
    rank_most_invested INT,
    rank_least_invested INT,
    rank_most_active INT,
    rank_52w_high INT,
    rank_recently_viewed INT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS corporate_positions (
    id UUID PRIMARY KEY,
    user_id UUID,
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    shares BIGINT NOT NULL DEFAULT 0,
    share_class VARCHAR(100) NOT NULL DEFAULT 'Class A Common Stock',
    cost_basis NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    current_value NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    unrealized_pl NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    unrealized_pl_percent NUMERIC(8, 2) NOT NULL DEFAULT 0.00,
    ownership_percent NUMERIC(6, 3) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS corporate_orders (
    id UUID PRIMARY KEY,
    user_id UUID,
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    order_number VARCHAR(50) NOT NULL UNIQUE,
    type VARCHAR(20) NOT NULL DEFAULT 'BUY',
    share_class VARCHAR(100) NOT NULL DEFAULT 'Class A Common Stock',
    shares BIGINT NOT NULL,
    price_per_share NUMERIC(10, 2) NOT NULL,
    total_amount NUMERIC(15, 2) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'FILLED',
    settlement_status VARCHAR(50) NOT NULL DEFAULT 'SETTLED',
    executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS corporate_news (
    id UUID PRIMARY KEY,
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    category VARCHAR(100) NOT NULL,
    title VARCHAR(255) NOT NULL,
    snippet TEXT NOT NULL,
    sentiment VARCHAR(20) NOT NULL DEFAULT 'Bullish',
    impact_metric VARCHAR(100),
    source VARCHAR(100) NOT NULL DEFAULT 'SEC Statutory Wire',
    read_time VARCHAR(50) DEFAULT '3 min read',
    urgency VARCHAR(50) DEFAULT 'Medium',
    due_date VARCHAR(100),
    is_action_required BOOLEAN NOT NULL DEFAULT FALSE,
    action_label VARCHAR(100),
    action_type VARCHAR(50),
    published_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
