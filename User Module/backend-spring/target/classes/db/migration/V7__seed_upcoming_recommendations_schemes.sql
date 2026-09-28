-- White Quantex v2 — Seed Upcoming Companies, WQ Recommendations, and Mutual Investment Schemes

-- 1. Upcoming Companies (10 Verified Delaware Pipeline Issuers)
INSERT INTO upcoming_companies (id, ticker, name, short_name, sector, target_valuation, expected_date, readiness, trust_score, description, logo_bg, legal_entity, headquarters, ceo, display_order)
VALUES
('50000000-0000-0000-0000-000000000001', 'ONRL', 'OmniRelay Systems Inc.', 'OmniRelay', 'SpaceTech', '$38.0M', 'Expected Oct 2026', 'Institutional KYC', 94, 'Decentralized mesh telemetry routers for sovereign satellite edge constellations.', 'bg-indigo-600', 'Delaware C-Corp', 'Austin, TX', 'Marcus Vance', 1),

('50000000-0000-0000-0000-000000000002', 'SKTE', 'SkyTerra Clean Fuels', 'SkyTerra', 'CleanTech', '$55.0M', 'Expected Dec 2026', 'Audit Complete', 91, 'Direct air capture synthetic kerosene production for commercial airline decarbonization.', 'bg-emerald-600', 'Delaware C-Corp', 'Denver, CO', 'Elena Rostova', 2),

('50000000-0000-0000-0000-000000000003', 'VRTX', 'VortexBio Therapeutics', 'VortexBio', 'Biotech', '$72.0M', 'Expected Nov 2026', 'Tier-1 Verified', 96, 'Targeted CRISPR mRNA nanocarriers reversing hereditary cardiovascular cellular fibrosis in human trials.', 'bg-rose-600', 'Delaware C-Corp', 'Cambridge, MA', 'Dr. Marcus Thorne', 3),

('50000000-0000-0000-0000-000000000004', 'HYPR', 'Hyperion Fusion Systems', 'Hyperion', 'CleanTech', '$120.0M', 'Expected Dec 2026', 'Institutional KYC', 95, 'Compact pulsed-magnetic field aneutronic fusion reactors designed for decentralized zero-carbon industrial plants.', 'bg-cyan-600', 'Delaware C-Corp', 'Oak Ridge, TN', 'Sarah Sterling', 4),

('50000000-0000-0000-0000-000000000005', 'CXED', 'CortexEdge Robotics', 'CortexEdge', 'Robotics', '$44.0M', 'Expected Jan 2027', 'Audit Complete', 92, 'Multi-agent autonomous mobile warehouse sorting fleets with real-time millisecond spatial coordination.', 'bg-purple-600', 'Delaware C-Corp', 'Pittsburgh, PA', 'Liam O''Connor', 5),

('50000000-0000-0000-0000-000000000006', 'AGLD', 'AeroGlide Aviation', 'AeroGlide', 'CleanTech', '$60.0M', 'Expected Q2 2027', 'Statutory Review', 89, 'Liquid-hydrogen fuel cell powertrains engineered for regional zero-emission turboprop cargo aircraft.', 'bg-blue-600', 'Washington Corp', 'Seattle, WA', 'Claire Dubois', 6),

('50000000-0000-0000-0000-000000000007', 'VVLT', 'Veritas Vault Cyber', 'Veritas', 'Fintech', '$48.0M', 'Expected Nov 2026', 'Audit Complete', 93, 'NIST-compliant post-quantum lattice cryptography for multi-asset sovereign custody and clearing settlement.', 'bg-emerald-600', 'Delaware C-Corp', 'New York, NY', 'Alexander Wright', 7),

('50000000-0000-0000-0000-000000000008', 'NCAP', 'NanoCarbon Supercapacitors', 'NanoCarbon', 'CleanTech', '$32.0M', 'Expected Feb 2027', 'Tier-2 Ready', 90, 'Monolayer graphene energy storage units delivering 10x faster charging cycles for heavy industrial vehicles.', 'bg-slate-700', 'Delaware C-Corp', 'Austin, TX', 'Dmitri Volkov', 8),

('50000000-0000-0000-0000-000000000009', 'SYNG', 'Synthia Genomics', 'Synthia', 'Biotech', '$52.0M', 'Expected Q1 2027', 'Audit Complete', 94, 'Algorithmic biocatalyst synthesis optimizing industrial microbial pathways for biodegradable bio-polymers.', 'bg-orange-600', 'Delaware C-Corp', 'Boston, MA', 'Dr. Evelyn Zhao', 9),

('50000000-0000-0000-0000-000000000010', 'DSAM', 'DeepSpace Asteroid Mining', 'DeepSpace', 'SpaceTech', '$85.0M', 'Expected Q3 2027', 'Statutory Review', 88, 'Autonomous orbital spectrometry probes prospecting near-Earth metallic asteroids for platinum group elements.', 'bg-indigo-700', 'Delaware C-Corp', 'Houston, TX', 'Commander Neil Adams', 10)
ON CONFLICT (id) DO NOTHING;

-- 2. WQ Recommendation Companies (10 Quant-Rated Corporate Issuers)
INSERT INTO wq_recommendations (id, ticker, name, short_name, sector, rating, upside, quant_score, valuation, annual_revenue, thesis, logo_bg, legal_entity, cik, ceo, display_order)
VALUES
('60000000-0000-0000-0000-000000000001', 'TFLOW', 'TechFlow AI Solutions Inc.', 'TechFlow', 'AI & ML', 'Strong Buy', '+38.5% Upside', 98, '$42.5M', '$15.2M ARR', 'Rule of 40 operational velocity with 82% gross margins and high contract retention across enterprise clouds.', 'bg-indigo-600', 'Delaware C-Corp', 'CIK-0001948291', 'Dr. Aris Thorne', 1),

('60000000-0000-0000-0000-000000000002', 'QMAT', 'QuantumMatrix Computing', 'QuantumMatrix', 'DeepTech', 'Top Pick', '+44.0% Upside', 99, '$110.0M', '$28.4M ARR', 'Proprietary sub-Kelvin photonic quantum computing architecture with defensible national defense contracts.', 'bg-purple-600', 'Delaware C-Corp', 'CIK-0001859302', 'Dr. Victor Vance', 2),

('60000000-0000-0000-0000-000000000003', 'NPAY', 'NovaPay Technologies Ltd.', 'NovaPay', 'Fintech', 'Strong Buy', '+29.2% Upside', 96, '$65.0M', '$22.8M ARR', 'Rapidly expanding ISO-20022 real-time cross-border settlement rail with zero historical transaction settlement failures.', 'bg-cyan-600', 'Delaware C-Corp', 'CIK-0001889410', 'Sarah Chen', 3),

('60000000-0000-0000-0000-000000000004', 'CSHL', 'CyberShield Defense Systems', 'CyberShield', 'Cybersecurity', 'High Conviction', '+31.8% Upside', 97, '$54.0M', '$18.9M ARR', 'Multi-year Department of Energy zero-trust edge protection agreements with 135% net recurring revenue expansion.', 'bg-blue-600', 'Virginia Corp', 'CIK-0001934812', 'Col. James Sterling', 4),

('60000000-0000-0000-0000-000000000005', 'BPUL', 'BioPulse Therapeutics', 'BioPulse', 'Biotech', 'Growth Outperformer', '+52.4% Upside', 95, '$48.0M', '$9.8M ARR', 'Phase-3 oncology therapeutic clearance pending, supported by $12M non-dilutive milestone escrow receipts.', 'bg-rose-600', 'Delaware C-Corp', 'CIK-0001962381', 'Dr. Maya Lin', 5),

('60000000-0000-0000-0000-000000000006', 'GGRID', 'GreenGrid Energy Systems', 'GreenGrid', 'CleanTech', 'Value Buy', '+26.0% Upside', 93, '$18.0M', '$8.4M ARR', 'Decentralized microgrid battery dispatch contracts experiencing 40% margin expansion and minimal capital churn.', 'bg-emerald-600', 'Delaware C-Corp', 'CIK-0001892341', 'Marcus Vance', 6),

('60000000-0000-0000-0000-000000000007', 'CARB', 'AeroCarbon Composite Materials', 'AeroCarbon', 'Aerospace', 'High Conviction', '+33.5% Upside', 94, '$24.0M', '$5.9M ARR', 'Commercial satellite bus structural carbon contract backlog secured through fiscal year 2028.', 'bg-slate-700', 'Washington Corp', 'CIK-0002011943', 'David K. Holm', 7),

('60000000-0000-0000-0000-000000000008', 'TVLT', 'TerraVolt Power Systems', 'TerraVolt', 'CleanTech', 'Growth Outperformer', '+37.0% Upside', 92, '$34.0M', '$7.2M ARR', 'Next-gen lithium-iron grid container systems gaining traction across municipal utility storage buildouts.', 'bg-amber-600', 'Delaware C-Corp', 'CIK-0001984210', 'Thomas Reed', 8),

('60000000-0000-0000-0000-000000000009', 'ORBD', 'Orbital Dynamics Space Systems', 'Orbital', 'SpaceTech', 'Top Pick', '+41.2% Upside', 96, '$88.0M', '$19.5M ARR', 'Rapid reusable launch vehicle manifests fully pre-booked with positive operational cash flows.', 'bg-orange-600', 'Delaware C-Corp', 'CIK-0001874529', 'Garrison Fox', 9),

('60000000-0000-0000-0000-000000000010', 'HDNA', 'HelixDNA Synthetics', 'HelixDNA', 'Biotech', 'Strong Buy', '+35.8% Upside', 94, '$36.0M', '$11.4M ARR', 'Enzymatic DNA synthesis platform drastically reducing gene assembly costs for global pharmaceutical partners.', 'bg-emerald-700', 'Delaware C-Corp', 'CIK-0001955310', 'Dr. Karen Bell', 10)
ON CONFLICT (id) DO NOTHING;

-- 3. Mutual Investment Schemes (10 Pooled Secondary Corporate Vehicles)
INSERT INTO mutual_investment_schemes (id, code, name, strategy, nav, one_year_return, min_investment, aum, risk_level, manager, top_holdings, description, benchmark, expense_ratio, display_order)
VALUES
('70000000-0000-0000-0000-000000000001', 'WQ-ATGB', 'WQ Alpha Tech Growth Basket', 'Aggressive Growth', '$142.80', '+34.2%', '$2,500', '$48.5M', 'Medium-High', 'WQ Institutional Quantitative Desk', '["TFLOW (28%)", "QMAT (24%)", "CSHL (20%)"]', 'Curated high-growth Delaware software and deep-tech equity holdings with disciplined quarterly rebalancing.', 'Nasdaq Private Benchmark +12%', '0.65%', 1),

('70000000-0000-0000-0000-000000000002', 'WQ-DCTP', 'Delaware Sovereign CleanTech Pool', 'Sustainable Value', '$118.40', '+24.6%', '$1,000', '$32.0M', 'Moderate', 'Green Horizon Asset Management', '["GGRID (32%)", "CARB (26%)", "TVLT (22%)"]', 'ESG-screened operating infrastructure and renewable storage developers with auditable recurring energy contracts.', 'Delaware Green Index +8%', '0.55%', 2),

('70000000-0000-0000-0000-000000000003', 'WQ-SFYT', 'Sovereign Fintech & Yield Trust', 'Capital Preservation', '$104.90', '+18.4%', '$5,000', '$64.2M', 'Low-Medium', 'White Quantex Treasury Rail', '["NPAY (35%)", "VVLT (25%)", "TFLOW (18%)"]', 'Institutional cross-border payment networks, treasury settlement rails, and automated escrow liquidity pools.', 'Fed Funds Rate +7.5%', '0.40%', 3),

('70000000-0000-0000-0000-000000000004', 'WQ-BCBP', 'BioTech Breakthrough Scheme', 'High Alpha Biotech', '$168.20', '+46.8%', '$2,500', '$29.4M', 'High', 'Apex BioVentures Partners', '["BPUL (34%)", "VRTX (26%)", "SYNG (20%)"]', 'Diversified exposure across Phase-2 and Phase-3 commercial clinical biotherapeutics and genetic therapies.', 'S&P Biotech Index +18%', '0.85%', 4),

('70000000-0000-0000-0000-000000000005', 'WQ-SBCS', 'Private Secondary Blue Chip Scheme', 'Tier-1 Blue Chip', '$128.50', '+28.9%', '$10,000', '$95.0M', 'Low-Medium', 'Delaware Statutory Custody', '["QMAT (30%)", "TFLOW (28%)", "ORBD (22%)"]', 'Premier capitalization entities possessing certified audited financial statements and strong free cash flow.', 'Bloomberg Private Core +10%', '0.50%', 5),

('70000000-0000-0000-0000-000000000006', 'WQ-ARAB', 'Autonomous Robotics & AI Syndicate', 'Disruptive Tech', '$135.10', '+39.5%', '$2,000', '$22.8M', 'High', 'WQ Algorithmic Allocator', '["CXED (30%)", "ONRL (28%)", "TFLOW (22%)"]', 'Targeted co-investment pool dedicated to industrial robotics, edge compute silicon, and multi-agent AI logistics.', 'Global Robotics Index +15%', '0.75%', 6),

('70000000-0000-0000-0000-000000000007', 'WQ-SILF', 'Space Infrastructure & Launch Fund', 'Frontier Tech', '$152.00', '+31.7%', '$5,000', '$37.6M', 'High', 'Orbital Alpha Capital', '["ORBD (36%)", "CARB (28%)", "DSAM (16%)"]', 'Aerospace logistics, satellite manufacturing, and commercial launch infrastructure operating across North America.', 'Aerospace & Defense Benchmark +14%', '0.80%', 7),

('70000000-0000-0000-0000-000000000008', 'WQ-DLTB', 'Delaware Liquid Treasury Balanced Scheme', 'Fixed Yield & Escrow', '$102.30', '+11.2%', '$1,000', '$110.0M', 'Low', 'Delaware Trust Escrow Corp', '["US-T-Bills (50%)", "WQ-Escrow (30%)", "NPAY (20%)"]', 'Low-volatility cash management vehicle blending short-duration statutory escrow deposits with fintech settlement rails.', 'SOFR Overnight Benchmark +3.5%', '0.25%', 8),

('70000000-0000-0000-0000-000000000009', 'WQ-GCBP', 'Global Cross-Border Commerce Pool', 'Trade Finance', '$114.70', '+21.4%', '$3,000', '$41.3M', 'Moderate', 'Meridian Global Clearing', '["NPAY (32%)", "CARB (24%)", "TFLOW (20%)"]', 'Supply-chain clearing liquidity and cross-border receivable factoring for accredited international exporters.', 'Global Trade Finance Index +6%', '0.60%', 9),

('70000000-0000-0000-0000-000000000010', 'WQ-ETMS', 'Energy Transition Microgrid Scheme', 'Infrastructure Income', '$122.60', '+23.1%', '$2,500', '$36.0M', 'Moderate', 'CleanPower Infrastructure', '["GGRID (34%)", "SKTE (24%)", "NCAP (20%)"]', 'Long-term revenue generating microgrid battery installations and high-voltage grid interconnection assets.', 'US Infrastructure Index +9%', '0.58%', 10)
ON CONFLICT (id) DO NOTHING;
