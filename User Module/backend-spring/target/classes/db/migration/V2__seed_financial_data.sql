-- Seed roles
INSERT INTO roles (name) VALUES ('INVESTOR');
INSERT INTO roles (name) VALUES ('FOUNDER');
INSERT INTO roles (name) VALUES ('COMPANY_FUNDRAISING');
INSERT INTO roles (name) VALUES ('CORPORATE_INVESTOR');
INSERT INTO roles (name) VALUES ('ADMIN');

-- Seed market benchmarks
INSERT INTO markets (symbol, name, category, current_value, change_percent, volume)
VALUES ('WQ-TECH', 'Tech Venture Index', 'Indices', 1420.50, 3.40, 15000000.00);

INSERT INTO markets (symbol, name, category, current_value, change_percent, volume)
VALUES ('WQ-AI', 'AI & ML Enterprise Basket', 'Sector', 890.10, 5.10, 8400000.00);

INSERT INTO markets (symbol, name, category, current_value, change_percent, volume)
VALUES ('WQ-FIN', 'Fintech Growth Benchmark', 'Sector', 1120.00, -0.80, 12000000.00);
