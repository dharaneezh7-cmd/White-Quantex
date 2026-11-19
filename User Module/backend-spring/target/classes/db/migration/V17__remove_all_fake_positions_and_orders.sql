-- ============================================================================
-- White Quantex v2 — Remove Fake/Sample Corporate Positions & Orders
-- Migration: V17__remove_all_fake_positions_and_orders.sql
-- ============================================================================

-- Clear all synthetic sample positions so holdings start completely empty
-- Positions will only be populated when real users buy shares through the platform
DELETE FROM corporate_positions;
DELETE FROM corporate_orders;
