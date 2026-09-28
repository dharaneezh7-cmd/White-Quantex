-- White Quantex v2 — Seed All 25 Verified Corporate Issuers and Market Data

-- 1. Companies
INSERT INTO companies (id, ticker, name, short_name, legal_entity, cik, sector, sub_industry, headquarters, region, founded_year, ceo, employees, valuation, valuation_num, annual_revenue, annual_revenue_num, verification_level, trust_score, description, logo_color, status, exchange_tier)
VALUES
('00000000-0000-0000-0000-000000000001', 'TFLOW', 'TechFlow AI Solutions Inc.', 'TechFlow', 'Delaware C-Corp', 'CIK-0001948291', 'AI & ML', 'Enterprise Distributed Inference', 'Austin, TX', 'Southwest', 2023, 'Dr. Elena Rostova', 84, '$42.5M', 42500000.00, '$14.2M ARR', 14200000.00, 'PLATINUM', 98, 'Enterprise distributed neural inference platform for low-latency financial models and predictive fraud prevention across multi-cloud deployments.', 'bg-indigo-600', 'Active Trading', 'Tier-1 Institutional'),

('00000000-0000-0000-0000-000000000002', 'GGRID', 'GreenGrid Energy Systems', 'GreenGrid', 'Delaware C-Corp', 'CIK-0001892341', 'CleanTech', 'Autonomous Microgrid Optimization', 'Denver, CO', 'Mountain West', 2022, 'Marcus Vance', 42, '$18.0M', 18000000.00, '$8.4M ARR', 8400000.00, 'GOLD', 92, 'AI-directed energy dispatch and decentralized battery micro-storage architectures for industrial manufacturing facilities.', 'bg-emerald-600', 'Operating - Private', 'Tier-2 Growth'),

('00000000-0000-0000-0000-000000000003', 'NPAY', 'NovaPay Technologies Ltd.', 'NovaPay', 'Delaware C-Corp', 'CIK-0001889410', 'Fintech', 'Real-time Cross-border Settlement', 'New York, NY', 'East Coast', 2021, 'Sarah Chen', 118, '$65.0M', 65000000.00, '$22.8M ARR', 22800000.00, 'PLATINUM', 97, 'Next-generation ISO-20022 sovereign payment rail enabling instant treasury settlements and multi-currency liquidity routing.', 'bg-cyan-600', 'Active Trading', 'Tier-1 Institutional'),

('00000000-0000-0000-0000-000000000004', 'CARB', 'AeroCarbon Composite Materials', 'AeroCarbon', 'Washington Corp', 'CIK-0002011943', 'CleanTech', 'Ultra-lightweight Aerospace Resins', 'Seattle, WA', 'Pacific Northwest', 2023, 'David K. Holm', 31, '$24.0M', 24000000.00, '$5.9M ARR', 5900000.00, 'PLATINUM', 94, 'Patented carbon matrix composites engineered for commercial satellite buses and reusable rocket launch stages.', 'bg-slate-700', 'Operating - Private', 'Tier-2 Growth'),

('00000000-0000-0000-0000-000000000005', 'ORBD', 'Orbital Dynamics Space Systems', 'Orbital', 'Delaware C-Corp', 'CIK-0001874529', 'SpaceTech', 'LEO Telemetry & In-space Propulsion', 'Houston, TX', 'South', 2020, 'Commander James Sterling', 164, '$88.0M', 88000000.00, '$31.5M ARR', 31500000.00, 'PLATINUM', 99, 'Next-generation ion-thruster propulsion systems and satellite constellation attitude control hardware for space commercialization.', 'bg-amber-600', 'Active Trading', 'Tier-1 Institutional'),

('00000000-0000-0000-0000-000000000006', 'MEDS', 'MediSync Robotics Corp.', 'MediSync', 'Massachusetts C-Corp', 'CIK-0001948271', 'Biotech', 'Precision Surgical Micro-robotics', 'Boston, MA', 'East Coast', 2022, 'Dr. Aris Thorne', 57, '$35.0M', 35000000.00, '$11.2M ARR', 11200000.00, 'PLATINUM', 95, 'Robotic laparoscopic surgical platforms with sub-millimeter haptic feedback and real-time computer vision tumor boundary mapping.', 'bg-rose-600', 'Operating - Private', 'Tier-2 Growth'),

('00000000-0000-0000-0000-000000000007', 'CYBR', 'CyberShield Vault Inc.', 'CyberShield', 'Virginia Corp', 'CIK-0001962384', 'SaaS', 'Post-Quantum Hardware Security', 'McLean, VA', 'Mid-Atlantic', 2021, 'Nadia Al-Mansoor', 92, '$52.0M', 52000000.00, '$18.6M ARR', 18600000.00, 'PLATINUM', 96, 'Zero-trust cryptographic isolation enclaves engineered to safeguard cloud databases against Shor algorithm quantum decryption threats.', 'bg-blue-600', 'Active Trading', 'Tier-1 Institutional'),

('00000000-0000-0000-0000-000000000008', 'SHRV', 'SolarHarvest Materials Inc.', 'SolarHarvest', 'California Corp', 'CIK-0001923840', 'CleanTech', 'Perovskite Multi-junction Thin Films', 'San Jose, CA', 'West Coast', 2024, 'Dr. Raymond Zhao', 22, '$12.0M', 12000000.00, '$3.1M ARR', 3100000.00, 'GOLD', 89, 'High-efficiency flexible tandem solar films capturing diffuse infrared spectrum for building-integrated photovoltaic facades.', 'bg-amber-500', 'Operating - Private', 'Tier-3 Emerging'),

('00000000-0000-0000-0000-000000000009', 'OMNI', 'OmniLogic NeuroTech Ltd.', 'OmniLogic', 'Delaware C-Corp', 'CIK-0001977211', 'AI & ML', 'Non-invasive Neural Interfaces', 'Pittsburgh, PA', 'East Coast', 2023, 'Vikram Seth', 19, '$9.5M', 9500000.00, '$2.4M ARR', 2400000.00, 'SILVER', 86, 'High-density dry EEG spatial telemetry for industrial pilot cognitive load telemetry and operator fatigue prevention.', 'bg-purple-600', 'Operating - Private', 'Tier-3 Emerging'),

('00000000-0000-0000-0000-000000000010', 'TVLT', 'TerraVolt Storage Corp.', 'TerraVolt', 'Delaware C-Corp', 'CIK-0001947118', 'CleanTech', 'Solid-state Lithium Utility Batteries', 'Austin, TX', 'Southwest', 2023, 'Leona Martinez', 108, '$62.0M', 62000000.00, '$19.8M ARR', 19800000.00, 'PLATINUM', 98, 'Solid-state electrolyte lithium cells engineered for grid-scale renewable energy storage with zero thermal runaway hazard.', 'bg-orange-600', 'Active Trading', 'Tier-1 Institutional'),

('00000000-0000-0000-0000-000000000011', 'AETH', 'Aether Dynamics Inc.', 'Aether', 'Washington Corp', 'CIK-0001991823', 'SpaceTech', 'Autonomous Satellite Constellations', 'Seattle, WA', 'Pacific Northwest', 2024, 'Jonathan Frost', 72, '$48.0M', 48000000.00, '$12.4M ARR', 12400000.00, 'PLATINUM', 96, 'Autonomous low-earth orbit constellations providing high-throughput micro-payload deliveries and real-time planetary sensing.', 'bg-slate-700', 'Active Trading', 'Tier-1 Institutional'),

('00000000-0000-0000-0000-000000000012', 'BVGD', 'BioVanguard Labs Corp.', 'BioVanguard', 'Georgia Corp', 'CIK-0002003941', 'Biotech', 'Precision mRNA Cancer Vaccines', 'Atlanta, GA', 'South', 2023, 'Dr. Chloe Davenport', 54, '$31.0M', 31000000.00, '$9.2M ARR', 9200000.00, 'GOLD', 91, 'Personalized mRNA immunotherapies synthesizing tumor-specific neoantigen vaccines within 14 days of biopsy profiling.', 'bg-teal-600', 'Operating - Private', 'Tier-2 Growth'),

('00000000-0000-0000-0000-000000000013', 'DFRG', 'DataForge Storage Networks', 'DataForge', 'Delaware C-Corp', 'CIK-0001984210', 'SaaS', 'Decentralized Encrypted File Storage', 'Chicago, IL', 'Midwest', 2022, 'Alexander Hayes', 48, '$28.0M', 28000000.00, '$7.5M ARR', 7500000.00, 'GOLD', 93, 'Geographically distributed Reed-Solomon erasure-coded cloud file infrastructure eliminating single-point data breaches.', 'bg-blue-700', 'Operating - Private', 'Tier-2 Growth'),

('00000000-0000-0000-0000-000000000014', 'FLED', 'FinLedger Enterprise Systems', 'FinLedger', 'New York Corp', 'CIK-0002029310', 'Fintech', 'Distributed General Ledger Systems', 'New York, NY', 'East Coast', 2022, 'Miriam Goldstein', 65, '$36.0M', 36000000.00, '$10.8M ARR', 10800000.00, 'PLATINUM', 95, 'High-concurrency triple-entry bookkeeping software enabling real-time GAAP-compliant continuous audits for multi-entity firms.', 'bg-indigo-700', 'Operating - Private', 'Tier-2 Growth'),

('00000000-0000-0000-0000-000000000015', 'HLIX', 'Helix BioLabs Inc.', 'Helix', 'Delaware C-Corp', 'CIK-0001897450', 'Biotech', 'CRISPR Cas13 Targeted Therapeutics', 'San Diego, CA', 'West Coast', 2022, 'Dr. Warren Price', 36, '$22.0M', 22000000.00, '$4.8M ARR', 4800000.00, 'GOLD', 90, 'Next-generation RNA-editing CRISPR Cas13 platforms designed for transient non-heritable gene regulation in neurodegenerative diseases.', 'bg-rose-700', 'Operating - Private', 'Tier-2 Growth'),

('00000000-0000-0000-0000-000000000016', 'CGNS', 'CogniSense AI Ltd.', 'CogniSense', 'California Corp', 'CIK-0001994502', 'AI & ML', 'Automated ERP Multimodal Reasoning', 'San Francisco, CA', 'West Coast', 2024, 'Sergei Voronov', 38, '$28.0M', 28000000.00, '$7.2M ARR', 7200000.00, 'PLATINUM', 94, 'Self-governing AI software agents that monitor, diagnose, and execute automated ERP workflows across supply chain operations.', 'bg-blue-700', 'Operating - Private', 'Tier-2 Growth'),

('00000000-0000-0000-0000-000000000017', 'AGRD', 'AgriDrone Sentinel Inc.', 'AgriDrone', 'Nebraska C-Corp', 'CIK-0002014881', 'CleanTech', 'Autonomous Multispectral Crop Drones', 'Lincoln, NE', 'Central', 2024, 'Thomas Wright', 24, '$16.5M', 16500000.00, '$3.9M ARR', 3900000.00, 'SILVER', 88, 'Fleet autonomous vertical take-off UAVs performing infrared vegetation index inspections and localized micro-nutrient spraying.', 'bg-emerald-700', 'Operating - Private', 'Tier-3 Emerging'),

('00000000-0000-0000-0000-000000000018', 'QMAT', 'Quantum Materials Corp', 'Quantum Materials', 'Delaware C-Corp', 'CIK-0001925661', 'SpaceTech', 'Superconducting Nanowafers', 'Albuquerque, NM', 'Southwest', 2022, 'Dr. Arthur Pendelton', 45, '$38.0M', 38000000.00, '$11.2M ARR', 11200000.00, 'PLATINUM', 96, 'High-temperature niobium-titanium superconducting substrate films tailored for fault-tolerant quantum logic processors.', 'bg-violet-600', 'Active Trading', 'Tier-1 Institutional'),

('00000000-0000-0000-0000-000000000019', 'SGLD', 'SolarGrid Utility Partners', 'SolarGrid', 'Nevada Corp', 'CIK-0001908234', 'CleanTech', 'Bifacial Utility Solar Arrays', 'Las Vegas, NV', 'Southwest', 2021, 'Hannah Becker', 51, '$31.0M', 31000000.00, '$10.5M ARR', 10500000.00, 'GOLD', 94, 'Utility-scale bifacial solar installations paired with automated tracker arrays and long-term municipal energy purchase agreements.', 'bg-emerald-500', 'Active Trading', 'Tier-1 Institutional'),

('00000000-0000-0000-0000-000000000020', 'FUSE', 'Hyperion Fusion Systems', 'Hyperion', 'Delaware C-Corp', 'CIK-0001859102', 'SpaceTech', 'Magnetic Confinement Fusion', 'Oak Ridge, TN', 'South', 2021, 'Dr. Nathan Cross', 135, '$105.0M', 105000000.00, '$14.0M ARR', 14000000.00, 'PLATINUM', 99, 'Compact high-field spherical tokamaks powered by high-temperature superconducting magnets targeting net-positive commercial grid power.', 'bg-red-600', 'Operating - Private', 'Tier-1 Institutional'),

('00000000-0000-0000-0000-000000000021', 'PULSE', 'PulseWave Health Corp.', 'PulseWave', 'Georgia Corp', 'CIK-0001968840', 'Biotech', 'Continuous Biosensing Implants', 'Atlanta, GA', 'South', 2023, 'Dr. Marcus Brody', 29, '$19.8M', 19800000.00, '$4.7M ARR', 4700000.00, 'GOLD', 91, 'Subcutaneous micro-sensors providing continuous multi-analyte blood chemistry telemetry for chronic cardiovascular monitoring.', 'bg-cyan-700', 'Operating - Private', 'Tier-2 Growth'),

('00000000-0000-0000-0000-000000000022', 'SYNT', 'Synthetix Bio Systems', 'Synthetix', 'Delaware C-Corp', 'CIK-0001912845', 'Biotech', 'Enzymatic DNA Synthesis', 'Cambridge, MA', 'East Coast', 2023, 'Dr. Rachel Kim', 41, '$26.5M', 26500000.00, '$6.8M ARR', 6800000.00, 'PLATINUM', 95, 'High-throughput benchtop enzymatic oligonucleotide printers enabling same-day de novo gene synthesis for biotech laboratories.', 'bg-purple-700', 'Active Trading', 'Tier-2 Growth'),

('00000000-0000-0000-0000-000000000023', 'RBCD', 'RoboCore Dynamics Corp.', 'RoboCore', 'Michigan Corp', 'CIK-0001918349', 'SaaS', 'Factory Floor Autonomous AMR Fleets', 'Detroit, MI', 'Central', 2022, 'Bradley Cooper', 63, '$41.0M', 41000000.00, '$13.6M ARR', 13600000.00, 'PLATINUM', 96, 'Autonomous mobile robotics fleets utilizing SLAM lidar navigation for automated inventory transport across manufacturing plants.', 'bg-zinc-700', 'Active Trading', 'Tier-1 Institutional'),

('00000000-0000-0000-0000-000000000024', 'EXOA', 'ExoArmor Systems Corp.', 'ExoArmor', 'Delaware C-Corp', 'CIK-0001929482', 'SaaS', 'Industrial Heavy Exoskeletons', 'Detroit, MI', 'Central', 2022, 'Bradley Cooper', 63, '$41.0M', 41000000.00, '$13.6M ARR', 13600000.00, 'PLATINUM', 96, 'Electromechanical powered ergonomic exoskeletons boosting human operator payload lifting capacity by 80kg in heavy logistics.', 'bg-zinc-700', 'Active Trading', 'Tier-1 Institutional')
ON CONFLICT (id) DO NOTHING;

-- 2. Market Metrics (Top Gainers, Losers, Inflow, etc.)
INSERT INTO company_market_metrics (id, company_id, change_24h, change_percent, is_positive, market_cap_gain_loss, invested_today, allocation_percent, trading_volume_today, is_52w_high, rank_gainer, rank_loser, rank_most_invested, rank_least_invested, rank_most_active, rank_52w_high, rank_recently_viewed)
VALUES
('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', '+14.2%', 14.20, TRUE, '+$5.3M', '+$1.42M Inflow', 88, '$1.8M Vol', TRUE, 3, NULL, 1, NULL, NULL, 3, 1),
('10000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000002', '+6.8%', 6.80, TRUE, '+$1.2M', '+$580K Inflow', 58, '$920K Vol', FALSE, NULL, NULL, 5, NULL, NULL, NULL, 2),
('10000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000003', '+3.1%', 3.10, TRUE, '+$2.0M', '+$720K Inflow', 68, '$4.8M Vol', FALSE, NULL, NULL, NULL, NULL, 1, NULL, 3),
('10000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000004', '+4.6%', 4.60, TRUE, '+$1.1M', '+$890K Inflow', 74, '$640K Vol', FALSE, NULL, NULL, 2, NULL, NULL, NULL, 4),
('10000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000005', '+22.5%', 22.50, TRUE, '+$16.2M', '+$410K Inflow', 52, '$2.1M Vol', TRUE, 1, NULL, NULL, NULL, 5, 1, 5),
('10000000-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000006', '+5.4%', 5.40, TRUE, '+$1.9M', '+$640K Inflow', 65, '$780K Vol', FALSE, NULL, NULL, 4, NULL, NULL, NULL, 7),
('10000000-0000-0000-0000-000000000007', '00000000-0000-0000-0000-000000000007', '+8.2%', 8.20, TRUE, '+$3.9M', '+$1.10M Inflow', 92, '$3.2M Vol', TRUE, 5, NULL, 3, NULL, 3, 5, 6),
('10000000-0000-0000-0000-000000000008', '00000000-0000-0000-0000-000000000008', '-3.5%', -3.50, FALSE, '-$430K', 'Low Inflow', 18, '$45K Vol', FALSE, NULL, 3, NULL, 1, NULL, NULL, NULL),
('10000000-0000-0000-0000-000000000009', '00000000-0000-0000-0000-000000000009', '-1.8%', -1.80, FALSE, '-$170K', 'Low Inflow', 24, '$62K Vol', FALSE, NULL, NULL, NULL, 2, NULL, NULL, NULL),
('10000000-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000010', '+11.8%', 11.80, TRUE, '+$6.6M', '+$520K Inflow', 60, '$1.4M Vol', TRUE, 4, NULL, NULL, NULL, NULL, 4, 8),
('10000000-0000-0000-0000-000000000011', '00000000-0000-0000-0000-000000000011', '+18.9%', 18.90, TRUE, '+$7.6M', '+$380K Inflow', 48, '$1.6M Vol', TRUE, 2, NULL, NULL, NULL, NULL, 2, NULL),
('10000000-0000-0000-0000-000000000012', '00000000-0000-0000-0000-000000000012', '-2.1%', -2.10, FALSE, '-$470K', 'Low Inflow', 26, '$110K Vol', FALSE, NULL, 5, NULL, NULL, NULL, NULL, NULL),
('10000000-0000-0000-0000-000000000013', '00000000-0000-0000-0000-000000000013', '-4.8%', -4.80, FALSE, '-$700K', 'Low Inflow', 38, '$84K Vol', FALSE, NULL, 2, NULL, 4, NULL, NULL, NULL),
('10000000-0000-0000-0000-000000000014', '00000000-0000-0000-0000-000000000014', '-1.2%', -1.20, FALSE, '-$430K', 'Low Inflow', 44, '$98K Vol', FALSE, NULL, NULL, NULL, 5, NULL, NULL, NULL),
('10000000-0000-0000-0000-000000000015', '00000000-0000-0000-0000-000000000015', '-6.4%', -6.40, FALSE, '-$2.0M', 'Low Inflow', 20, '$55K Vol', FALSE, NULL, 1, NULL, NULL, NULL, NULL, NULL),
('10000000-0000-0000-0000-000000000017', '00000000-0000-0000-0000-000000000017', '-2.9%', -2.90, FALSE, '-$490K', 'Low Inflow', 31, '$72K Vol', FALSE, NULL, 4, NULL, 3, NULL, NULL, NULL),
('10000000-0000-0000-0000-000000000018', '00000000-0000-0000-0000-000000000018', '+9.4%', 9.40, TRUE, '+$3.2M', '+$650K Inflow', 70, '$2.6M Vol', FALSE, NULL, NULL, NULL, NULL, 4, NULL, NULL),
('10000000-0000-0000-0000-000000000020', '00000000-0000-0000-0000-000000000020', '+1.5%', 1.50, TRUE, '+$1.5M', '+$1.80M Inflow', 85, '$3.9M Vol', FALSE, NULL, NULL, NULL, NULL, 2, NULL, NULL)
ON CONFLICT (id) DO NOTHING;

-- 3. Sample Corporate Positions (for Portfolio Tab)
INSERT INTO corporate_positions (id, company_id, shares, share_class, cost_basis, current_value, unrealized_pl, unrealized_pl_percent, ownership_percent)
VALUES
('20000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 8500, 'Class A Common Stock', 27625.00, 42500.00, 14875.00, 53.85, 0.085),
('20000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000002', 4000, 'Corporate Senior Preferred', 12000.00, 13600.00, 1600.00, 13.33, 0.040),
('20000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000018', 2500, 'Class A Common Stock', 7500.00, 8425.00, 925.00, 12.33, 0.025)
ON CONFLICT (id) DO NOTHING;

-- 4. Sample Secondary Orders (for Orders Tab)
INSERT INTO corporate_orders (id, company_id, order_number, type, share_class, shares, price_per_share, total_amount, status, settlement_status)
VALUES
('30000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'ORD-2026-0841', 'BUY', 'Class A Common Stock', 2500, 5.00, 12500.00, 'FILLED', 'SETTLED'),
('30000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000002', 'ORD-2026-0842', 'BUY', 'Corporate Senior Preferred', 1000, 3.40, 3400.00, 'FILLED', 'SETTLED'),
('30000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000018', 'ORD-2026-0843', 'BUY', 'Class A Common Stock', 1000, 3.37, 3370.00, 'FILLED', 'SETTLED'),
('30000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000007', 'ORD-2026-0844', 'BUY', 'Institutional Common Shares', 1500, 5.65, 8475.00, 'PENDING', 'ESCROW_VERIFYING')
ON CONFLICT (id) DO NOTHING;

-- 5. Sample Corporate News & Statutory Notifications
INSERT INTO corporate_news (id, company_id, category, title, snippet, sentiment, impact_metric, source, read_time, urgency, due_date, is_action_required, action_label, action_type)
VALUES
('40000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000018', 'Shareholder Proxy Vote', 'Annual General Meeting (AGM) Proxy Ballot: 2026 Board Slate & Equity Pool', 'Your official shareholder proxy ballot is open for the upcoming Annual General Meeting. As an authenticated shareholder, you have the statutory right to cast your vote on: (1) Re-election of 4 independent board members, and (2) Authorization of a 10% unallocated employee stock option pool.', 'Bullish', 'Action Required', 'SEC Statutory Wire', '3 min read', 'High', 'Closes Oct 15, 2026', TRUE, 'Cast Proxy Vote', 'vote'),

('40000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'Contract Expansion', 'TechFlow AI Closes $40M Enterprise Cloud Inference Deal; ARR Exceeds $15M', 'TechFlow AI signed a 3-year enterprise cloud compute agreement with a Fortune 50 consortium. Annual recurring revenue (ARR) surged past $15.2M (+112% YoY), reinforcing strong momentum leading into its upcoming Series B pricing round.', 'Bullish', '+18.4% Valuation Uplift', 'TechCrunch Venture', '3 min read', 'Medium', 'Informational', FALSE, 'Review Facility Summary', 'info'),

('40000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000002', 'Municipal EPC Contract', 'GreenLeaf Energy Secures $30M Municipal Solar Microgrid Contract in Nevada', 'Nevada Clean Energy District awarded GreenLeaf Energy the primary EPC and operations contract for 45MWh modular storage installations. Long-term energy off-take agreements guarantee recurring cash yields through 2038.', 'Positive', '+12.5% Revenue Growth', 'CleanTech Investor Daily', '2 min read', 'Medium', 'Informational', FALSE, 'View Filing', 'info')
ON CONFLICT (id) DO NOTHING;
