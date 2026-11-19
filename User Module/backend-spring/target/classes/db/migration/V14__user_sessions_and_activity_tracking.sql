-- ============================================================================
-- White Quantex v2 — Session Authentication and Activity Tracking Schema
-- Migration: V14__user_sessions_and_activity_tracking.sql
-- Compatible with PostgreSQL and H2 databases
-- ============================================================================

CREATE TABLE IF NOT EXISTS user_sessions (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    session_token VARCHAR(500) NOT NULL UNIQUE,
    ip_address VARCHAR(100),
    user_agent TEXT,
    device_type VARCHAR(50) DEFAULT 'Desktop',
    browser VARCHAR(100) DEFAULT 'Unknown Browser',
    operating_system VARCHAR(100) DEFAULT 'Unknown OS',
    location VARCHAR(150) DEFAULT 'Local Network',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    login_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_activity_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL,
    logout_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_token ON user_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_user_sessions_active ON user_sessions(user_id, is_active);

CREATE TABLE IF NOT EXISTS user_session_activities (
    id UUID PRIMARY KEY,
    session_id UUID REFERENCES user_sessions(id) ON DELETE SET NULL,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    activity_type VARCHAR(50) NOT NULL,
    activity_name VARCHAR(255) NOT NULL,
    path VARCHAR(500),
    metadata TEXT,
    ip_address VARCHAR(100),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_user_activities_user_id ON user_session_activities(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_activities_session_id ON user_session_activities(session_id, created_at DESC);
