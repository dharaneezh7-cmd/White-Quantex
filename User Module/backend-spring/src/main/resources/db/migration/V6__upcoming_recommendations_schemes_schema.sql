-- White Quantex v2 — Upcoming Companies, WQ Recommendations, and Mutual Investment Schemes Schema
-- Compatible with PostgreSQL and H2 databases

CREATE TABLE IF NOT EXISTS upcoming_companies (
    id UUID PRIMARY KEY,
    ticker VARCHAR(20) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    short_name VARCHAR(100) NOT NULL,
    sector VARCHAR(100) NOT NULL,
    target_valuation VARCHAR(50) NOT NULL,
    expected_date VARCHAR(50) NOT NULL,
    readiness VARCHAR(50) NOT NULL DEFAULT 'Audit In Progress',
    trust_score INT NOT NULL DEFAULT 90,
    description TEXT,
    logo_bg VARCHAR(50) NOT NULL DEFAULT 'bg-indigo-600',
    legal_entity VARCHAR(150) NOT NULL DEFAULT 'Delaware C-Corp',
    headquarters VARCHAR(150) NOT NULL,
    ceo VARCHAR(150) NOT NULL,
    display_order INT NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS wq_recommendations (
    id UUID PRIMARY KEY,
    ticker VARCHAR(20) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    short_name VARCHAR(100) NOT NULL,
    sector VARCHAR(100) NOT NULL,
    rating VARCHAR(50) NOT NULL DEFAULT 'Strong Buy',
    upside VARCHAR(50) NOT NULL,
    quant_score INT NOT NULL DEFAULT 95,
    valuation VARCHAR(50) NOT NULL,
    annual_revenue VARCHAR(50) NOT NULL,
    thesis TEXT NOT NULL,
    logo_bg VARCHAR(50) NOT NULL DEFAULT 'bg-indigo-600',
    legal_entity VARCHAR(150) NOT NULL DEFAULT 'Delaware C-Corp',
    cik VARCHAR(50) NOT NULL,
    ceo VARCHAR(150) NOT NULL,
    display_order INT NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS mutual_investment_schemes (
    id UUID PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    strategy VARCHAR(100) NOT NULL,
    nav VARCHAR(50) NOT NULL,
    one_year_return VARCHAR(50) NOT NULL,
    min_investment VARCHAR(50) NOT NULL,
    aum VARCHAR(50) NOT NULL,
    risk_level VARCHAR(50) NOT NULL DEFAULT 'Moderate',
    manager VARCHAR(150) NOT NULL,
    top_holdings TEXT NOT NULL,
    description TEXT NOT NULL,
    benchmark VARCHAR(150) NOT NULL,
    expense_ratio VARCHAR(50) NOT NULL,
    display_order INT NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_upcoming_companies_order ON upcoming_companies(display_order);
CREATE INDEX IF NOT EXISTS idx_wq_recommendations_order ON wq_recommendations(display_order);
CREATE INDEX IF NOT EXISTS idx_mutual_schemes_order ON mutual_investment_schemes(display_order);
