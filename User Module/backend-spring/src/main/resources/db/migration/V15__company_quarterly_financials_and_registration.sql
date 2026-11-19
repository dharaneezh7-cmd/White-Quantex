-- ============================================================================
-- White Quantex v2 — Company Quarterly Financials & Earnings Schema
-- Migration: V15__company_quarterly_financials_and_registration.sql
-- ============================================================================

CREATE TABLE IF NOT EXISTS company_quarterly_financials (
    id UUID PRIMARY KEY,
    company_id UUID NOT NULL,
    ticker VARCHAR(20) NOT NULL,
    quarter VARCHAR(20) NOT NULL,
    fiscal_year INT NOT NULL,
    quarter_number INT NOT NULL,
    revenue NUMERIC(18, 2) NOT NULL DEFAULT 0.00,
    profit NUMERIC(18, 2) NOT NULL DEFAULT 0.00,
    expenses NUMERIC(18, 2) NOT NULL DEFAULT 0.00,
    growth_rate NUMERIC(8, 2) DEFAULT 0.00,
    profit_margin NUMERIC(8, 2) DEFAULT 0.00,
    milestones TEXT,
    reported_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_company_quarter UNIQUE (company_id, quarter)
);

CREATE INDEX IF NOT EXISTS idx_quarterly_financials_ticker ON company_quarterly_financials(ticker, fiscal_year, quarter_number);
CREATE INDEX IF NOT EXISTS idx_quarterly_financials_company ON company_quarterly_financials(company_id);

-- Add support columns to companies table if not present
ALTER TABLE companies ADD COLUMN IF NOT EXISTS quarterly_revenue NUMERIC(18, 2) DEFAULT 0.00;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS quarterly_profit NUMERIC(18, 2) DEFAULT 0.00;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS last_financial_update TIMESTAMP WITH TIME ZONE;

-- Seed quarterly financials for top institutional issuers
INSERT INTO company_quarterly_financials (id, company_id, ticker, quarter, fiscal_year, quarter_number, revenue, profit, expenses, growth_rate, profit_margin, milestones, reported_date)
SELECT 
    gen_random_uuid(),
    c.id,
    c.ticker,
    'Q1 2026',
    2026,
    1,
    c.annual_revenue_num * 0.23,
    c.annual_revenue_num * 0.23 * 0.22,
    c.annual_revenue_num * 0.23 * 0.78,
    14.50,
    22.00,
    'Completed commercial deployment of next-generation sovereign infrastructure and expanded Delaware enterprise contracts.',
    CURRENT_TIMESTAMP - INTERVAL '6 MONTHS'
FROM companies c
WHERE c.ticker IN ('ZEPR', 'VOCL', 'OCGN', 'TFLOW', 'VGRD', 'HETH', 'ONSY')
ON CONFLICT (company_id, quarter) DO NOTHING;

INSERT INTO company_quarterly_financials (id, company_id, ticker, quarter, fiscal_year, quarter_number, revenue, profit, expenses, growth_rate, profit_margin, milestones, reported_date)
SELECT 
    gen_random_uuid(),
    c.id,
    c.ticker,
    'Q2 2026',
    2026,
    2,
    c.annual_revenue_num * 0.26,
    c.annual_revenue_num * 0.26 * 0.25,
    c.annual_revenue_num * 0.26 * 0.75,
    18.20,
    25.00,
    'Achieved 28% ARR expansion with automated institutional order clearing across Tier-1 secondary markets.',
    CURRENT_TIMESTAMP - INTERVAL '3 MONTHS'
FROM companies c
WHERE c.ticker IN ('ZEPR', 'VOCL', 'OCGN', 'TFLOW', 'VGRD', 'HETH', 'ONSY')
ON CONFLICT (company_id, quarter) DO NOTHING;

INSERT INTO company_quarterly_financials (id, company_id, ticker, quarter, fiscal_year, quarter_number, revenue, profit, expenses, growth_rate, profit_margin, milestones, reported_date)
SELECT 
    gen_random_uuid(),
    c.id,
    c.ticker,
    'Q3 2026',
    2026,
    3,
    c.annual_revenue_num * 0.29,
    c.annual_revenue_num * 0.29 * 0.28,
    c.annual_revenue_num * 0.29 * 0.72,
    22.80,
    28.00,
    'Surpassed annualized profitability targets with sovereign syndicate allocation and SEC compliance clearance.',
    CURRENT_TIMESTAMP - INTERVAL '15 DAYS'
FROM companies c
WHERE c.ticker IN ('ZEPR', 'VOCL', 'OCGN', 'TFLOW', 'VGRD', 'HETH', 'ONSY')
ON CONFLICT (company_id, quarter) DO NOTHING;
