-- ============================================================================
-- White Quantex — Real-Time Financial Price, History & Candles Schema
-- Migration: V12__market_data_price_history_and_candles.sql
-- ============================================================================

-- 1. Authoritative Current Price (Single source of truth for latest accepted price)
CREATE TABLE IF NOT EXISTS company_price_current (
    id UUID PRIMARY KEY,
    company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
    instrument_id VARCHAR(64) NOT NULL,
    symbol VARCHAR(32) NOT NULL UNIQUE,
    latest_price NUMERIC(19, 4) NOT NULL,
    currency VARCHAR(10) NOT NULL DEFAULT 'USD',
    price_timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    provider VARCHAR(64) NOT NULL DEFAULT 'INSTITUTIONAL_WQX',
    data_status VARCHAR(32) NOT NULL DEFAULT 'LIVE',
    market_status VARCHAR(32) NOT NULL DEFAULT 'OPEN',
    day_open NUMERIC(19, 4),
    day_high NUMERIC(19, 4),
    day_low NUMERIC(19, 4),
    prev_close NUMERIC(19, 4),
    change_amount NUMERIC(19, 4),
    change_percent NUMERIC(9, 4),
    volume_shares BIGINT NOT NULL DEFAULT 0,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_price_current_symbol ON company_price_current(symbol);
CREATE INDEX IF NOT EXISTS idx_price_current_company ON company_price_current(company_id);

-- 2. Permanent Timestamped Price History (Preserves all accepted price points)
CREATE TABLE IF NOT EXISTS company_price_history (
    id UUID PRIMARY KEY,
    company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
    instrument_id VARCHAR(64) NOT NULL,
    symbol VARCHAR(32) NOT NULL,
    price NUMERIC(19, 4) NOT NULL,
    volume BIGINT NOT NULL DEFAULT 0,
    currency VARCHAR(10) NOT NULL DEFAULT 'USD',
    source VARCHAR(64) NOT NULL DEFAULT 'INSTITUTIONAL_WQX',
    source_event_id VARCHAR(128),
    price_timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    received_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    data_status VARCHAR(32) NOT NULL DEFAULT 'HISTORICAL',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_price_history_sym_time ON company_price_history(symbol, price_timestamp ASC);
CREATE INDEX IF NOT EXISTS idx_price_history_company ON company_price_history(company_id, price_timestamp ASC);
CREATE INDEX IF NOT EXISTS idx_price_history_source_event ON company_price_history(symbol, source, source_event_id);

-- 3. Aggregated Candlestick Records (OHLCV for 1m, 5m, 15m, 1h, 1D, 1W, 1M)
CREATE TABLE IF NOT EXISTS company_price_candles (
    id UUID PRIMARY KEY,
    instrument_id VARCHAR(64) NOT NULL,
    symbol VARCHAR(32) NOT NULL,
    candle_interval VARCHAR(16) NOT NULL,
    candle_start TIMESTAMP WITH TIME ZONE NOT NULL,
    candle_end TIMESTAMP WITH TIME ZONE NOT NULL,
    open_price NUMERIC(19, 4) NOT NULL,
    high_price NUMERIC(19, 4) NOT NULL,
    low_price NUMERIC(19, 4) NOT NULL,
    close_price NUMERIC(19, 4) NOT NULL,
    volume BIGINT NOT NULL DEFAULT 0,
    currency VARCHAR(10) NOT NULL DEFAULT 'USD',
    source VARCHAR(64) NOT NULL DEFAULT 'INSTITUTIONAL_WQX',
    is_final BOOLEAN NOT NULL DEFAULT TRUE,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_candle_symbol_interval_start UNIQUE (symbol, candle_interval, candle_start)
);

CREATE INDEX IF NOT EXISTS idx_candles_sym_int_time ON company_price_candles(symbol, candle_interval, candle_start ASC);

-- 4. Market Data Ingestion Log (Operational audit trail of ingestion batches)
CREATE TABLE IF NOT EXISTS market_data_ingestion_log (
    id UUID PRIMARY KEY,
    provider VARCHAR(64) NOT NULL,
    instrument_id VARCHAR(64),
    symbol VARCHAR(32),
    operation VARCHAR(64) NOT NULL,
    started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE,
    records_received INT NOT NULL DEFAULT 0,
    records_accepted INT NOT NULL DEFAULT 0,
    records_rejected INT NOT NULL DEFAULT 0,
    records_deduplicated INT NOT NULL DEFAULT 0,
    status VARCHAR(32) NOT NULL DEFAULT 'SUCCESS',
    error_details TEXT
);

CREATE INDEX IF NOT EXISTS idx_ingest_log_provider ON market_data_ingestion_log(provider, started_at DESC);

-- 5. Market Data Synchronization & Backfill State
CREATE TABLE IF NOT EXISTS market_data_sync_state (
    id UUID PRIMARY KEY,
    provider VARCHAR(64) NOT NULL,
    instrument_id VARCHAR(64),
    symbol VARCHAR(32) NOT NULL UNIQUE,
    last_successful_timestamp TIMESTAMP WITH TIME ZONE,
    last_sync_started_at TIMESTAMP WITH TIME ZONE,
    last_sync_completed_at TIMESTAMP WITH TIME ZONE,
    next_sync_at TIMESTAMP WITH TIME ZONE,
    sync_status VARCHAR(32) NOT NULL DEFAULT 'IDLE',
    retry_count INT NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_sync_state_symbol ON market_data_sync_state(symbol);

-- 6. Price Alerts Table (Integrated with user notification engine)
CREATE TABLE IF NOT EXISTS price_alerts (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    symbol VARCHAR(32) NOT NULL,
    alert_type VARCHAR(32) NOT NULL,
    target_price NUMERIC(19, 4) NOT NULL,
    enabled BOOLEAN NOT NULL DEFAULT TRUE,
    triggered_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_price_alerts_user ON price_alerts(user_id);
CREATE INDEX IF NOT EXISTS idx_price_alerts_symbol ON price_alerts(symbol, enabled);
