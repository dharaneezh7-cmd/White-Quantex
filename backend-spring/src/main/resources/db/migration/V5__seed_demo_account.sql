-- White Quantex v2 — Seed Demo Account and Issuer 25 (Vortex Logistics AI)

-- 1. Demo Investor Account
INSERT INTO users (
    id,
    email,
    password_hash,
    first_name,
    last_name,
    username,
    display_name,
    headline,
    bio,
    avatar_url,
    location,
    country,
    primary_role,
    account_type,
    verification_level,
    kyc_status,
    trust_score,
    two_factor_enabled,
    is_email_verified,
    is_active
) VALUES (
    '55555555-5555-5555-5555-555555555555',
    'demo@whitequantex.com',
    '$2a$10$w6z/eMfZ/zJ0b3o0eW.W4.E7zU0BwB71e2x4vQfH0N.yVj3Y0Yx9O',
    'Alexander',
    'Vance',
    'demo_investor',
    'Alexander Vance',
    'Managing Partner · Quantex Sovereign Capital',
    'Accredited institutional investor and venture capitalist specializing in AI inference infrastructure, orbital robotics, and quantum computing materials.',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    'San Francisco, CA',
    'United States',
    'INVESTOR',
    'institutional',
    'PLATINUM',
    'APPROVED',
    98,
    FALSE,
    TRUE,
    TRUE
) ON CONFLICT (id) DO NOTHING;

-- 2. Link Demo User to INVESTOR Role
INSERT INTO user_roles (user_id, role_id)
SELECT '55555555-5555-5555-5555-555555555555', r.id
FROM roles r
WHERE r.name = 'INVESTOR'
ON CONFLICT DO NOTHING;

-- 3. Company 25: Vortex Logistics AI
INSERT INTO companies (
    id,
    ticker,
    name,
    short_name,
    legal_entity,
    cik,
    sector,
    sub_industry,
    headquarters,
    region,
    founded_year,
    ceo,
    employees,
    valuation,
    valuation_num,
    annual_revenue,
    annual_revenue_num,
    verification_level,
    trust_score,
    description,
    logo_color,
    status,
    exchange_tier
) VALUES (
    '00000000-0000-0000-0000-000000000025',
    'VRTX',
    'Vortex Logistics AI Systems',
    'Vortex',
    'Texas Corp',
    'CIK-0001954318',
    'AI & ML',
    'Dynamic Fleet Route Optimization',
    'Dallas, TX',
    'South',
    2023,
    'Jackson Cole',
    47,
    '$34.5M',
    34500000.00,
    '$11.0M ARR',
    11000000.00,
    'GOLD',
    93,
    'Reinforcement learning logistics software recalculating intermodal freight routes in real-time to avoid transit bottlenecks and reduce fuel expenditure.',
    'bg-indigo-700',
    'Active Trading',
    'Tier-2 Growth'
) ON CONFLICT (id) DO NOTHING;

-- 4. Market Metrics for Vortex Logistics AI
INSERT INTO company_market_metrics (
    id,
    company_id,
    change_24h,
    change_percent,
    is_positive,
    market_cap_gain_loss,
    invested_today,
    allocation_percent,
    trading_volume_today,
    is_52w_high
) VALUES (
    '10000000-0000-0000-0000-000000000025',
    '00000000-0000-0000-0000-000000000025',
    '+7.8%',
    7.80,
    TRUE,
    '+$2.5M',
    '+$480K Inflow',
    62,
    '$1.1M Vol',
    FALSE
) ON CONFLICT (id) DO NOTHING;
