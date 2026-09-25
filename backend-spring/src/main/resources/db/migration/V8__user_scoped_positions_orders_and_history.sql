-- White Quantex v2 — User-Scoped Multi-User Isolation Migration

-- 1. Create table for user-scoped recently viewed companies
CREATE TABLE IF NOT EXISTS user_recently_viewed (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL,
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    viewed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_user_company_viewed UNIQUE (user_id, company_id)
);

CREATE INDEX IF NOT EXISTS idx_user_recently_viewed_user ON user_recently_viewed(user_id, viewed_at DESC);

-- 2. Scope existing sample corporate positions to Demo Investor (Alexander Vance)
UPDATE corporate_positions
SET user_id = '55555555-5555-5555-5555-555555555555'
WHERE user_id IS NULL;

-- 3. Scope existing sample secondary orders to Demo Investor (Alexander Vance)
UPDATE corporate_orders
SET user_id = '55555555-5555-5555-5555-555555555555'
WHERE user_id IS NULL;

-- 4. Seed initial recently viewed companies for Demo Investor
INSERT INTO user_recently_viewed (id, user_id, company_id, viewed_at)
VALUES
('50000000-0000-0000-0000-000000000001', '55555555-5555-5555-5555-555555555555', '00000000-0000-0000-0000-000000000001', CURRENT_TIMESTAMP - INTERVAL '10 minutes'),
('50000000-0000-0000-0000-000000000002', '55555555-5555-5555-5555-555555555555', '00000000-0000-0000-0000-000000000002', CURRENT_TIMESTAMP - INTERVAL '25 minutes'),
('50000000-0000-0000-0000-000000000003', '55555555-5555-5555-5555-555555555555', '00000000-0000-0000-0000-000000000018', CURRENT_TIMESTAMP - INTERVAL '40 minutes'),
('50000000-0000-0000-0000-000000000004', '55555555-5555-5555-5555-555555555555', '00000000-0000-0000-0000-000000000005', CURRENT_TIMESTAMP - INTERVAL '55 minutes')
ON CONFLICT (id) DO NOTHING;
