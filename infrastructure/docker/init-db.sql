-- Create schemas for Savta.AI
CREATE SCHEMA IF NOT EXISTS shared;
CREATE SCHEMA IF NOT EXISTS ai_agent;
CREATE SCHEMA IF NOT EXISTS marketplace;

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ======================
-- SHARED SCHEMA
-- ======================

-- Users table (single source of truth)
CREATE TABLE shared.users (
    user_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    teudat_zehut VARCHAR(9) UNIQUE NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    birth_date DATE NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(255),
    address JSONB,
    languages VARCHAR[] DEFAULT ARRAY['hebrew'],
    nursing_level INT CHECK (nursing_level BETWEEN 1 AND 6),
    preferences JSONB DEFAULT '{}',
    emergency_contacts JSONB DEFAULT '[]',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE
);

-- Family members
CREATE TABLE shared.family_members (
    family_member_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES shared.users(user_id),
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(255),
    relation VARCHAR(50),
    notification_preferences JSONB DEFAULT '{"alerts": true, "weekly_summary": true}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Audit log
CREATE TABLE shared.audit_log (
    log_id BIGSERIAL PRIMARY KEY,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    service VARCHAR(50) NOT NULL,
    user_id UUID,
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(50),
    resource_id UUID,
    details JSONB,
    ip_address VARCHAR(45),
    user_agent VARCHAR(500),
    result VARCHAR(20)
);

-- ======================
-- AI AGENT SCHEMA
-- ======================

-- Conversations
CREATE TABLE ai_agent.conversations (
    conversation_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES shared.users(user_id),
    channel VARCHAR(50) DEFAULT 'web',
    started_at TIMESTAMPTZ DEFAULT NOW(),
    ended_at TIMESTAMPTZ,
    summary TEXT,
    sentiment_avg FLOAT,
    metadata JSONB DEFAULT '{}'
);

-- Messages
CREATE TABLE ai_agent.messages (
    message_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID REFERENCES ai_agent.conversations(conversation_id),
    role VARCHAR(20) NOT NULL,
    content TEXT NOT NULL,
    sentiment_score FLOAT,
    intent VARCHAR(100),
    entities JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Health readings
CREATE TABLE ai_agent.health_readings (
    reading_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES shared.users(user_id),
    metric_type VARCHAR(50) NOT NULL,
    value FLOAT NOT NULL,
    unit VARCHAR(20),
    recorded_at TIMESTAMPTZ NOT NULL,
    source VARCHAR(50) DEFAULT 'manual',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Health baselines
CREATE TABLE ai_agent.health_baselines (
    user_id UUID REFERENCES shared.users(user_id),
    metric_type VARCHAR(50) NOT NULL,
    baseline_value FLOAT NOT NULL,
    std_deviation FLOAT,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (user_id, metric_type)
);

-- Alerts
CREATE TABLE ai_agent.alerts (
    alert_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES shared.users(user_id),
    alert_type VARCHAR(50) NOT NULL,
    severity VARCHAR(20) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    triggered_by JSONB,
    status VARCHAR(20) DEFAULT 'pending',
    notified_family BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    resolved_at TIMESTAMPTZ
);

-- Semantic memories
CREATE TABLE ai_agent.semantic_memories (
    memory_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES shared.users(user_id),
    content TEXT NOT NULL,
    memory_type VARCHAR(50),
    embedding_id VARCHAR(255),
    importance_score FLOAT DEFAULT 0.5,
    last_accessed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ======================
-- MARKETPLACE SCHEMA
-- ======================

-- Wallets
CREATE TABLE marketplace.wallets (
    wallet_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES shared.users(user_id) UNIQUE,
    nursing_level INT CHECK (nursing_level BETWEEN 1 AND 6),
    total_units INT NOT NULL,
    available_units INT NOT NULL,
    reserved_units INT DEFAULT 0,
    optimal_aging_units INT DEFAULT 0,
    units_expire_at DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Vendors
CREATE TABLE marketplace.vendors (
    vendor_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_name VARCHAR(255) NOT NULL,
    license_number VARCHAR(100),
    contact_name VARCHAR(100),
    phone VARCHAR(20),
    email VARCHAR(255),
    address JSONB,
    service_areas VARCHAR[],
    bank_account JSONB,
    rating FLOAT DEFAULT 0,
    reviews_count INT DEFAULT 0,
    is_verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Services
CREATE TABLE marketplace.services (
    service_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vendor_id UUID REFERENCES marketplace.vendors(vendor_id),
    category VARCHAR(100) NOT NULL,
    subcategory VARCHAR(100),
    title VARCHAR(255) NOT NULL,
    title_he VARCHAR(255),
    description TEXT,
    description_he TEXT,
    unit_cost INT NOT NULL,
    nis_equivalent DECIMAL(10,2),
    duration_minutes INT,
    min_nursing_level INT DEFAULT 1,
    max_nursing_level INT DEFAULT 6,
    requires_referral BOOLEAN DEFAULT FALSE,
    is_optimal_aging BOOLEAN DEFAULT FALSE,
    availability JSONB,
    locations JSONB,
    tags VARCHAR[],
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bookings
CREATE TABLE marketplace.bookings (
    booking_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES shared.users(user_id),
    wallet_id UUID REFERENCES marketplace.wallets(wallet_id),
    service_id UUID REFERENCES marketplace.services(service_id),
    vendor_id UUID REFERENCES marketplace.vendors(vendor_id),
    status VARCHAR(30) DEFAULT 'pending',
    scheduled_datetime TIMESTAMPTZ NOT NULL,
    units_cost INT NOT NULL,
    assigned_staff VARCHAR(100),
    notes TEXT,
    proof_of_service JSONB,
    ai_booked BOOLEAN DEFAULT FALSE,
    conversation_id UUID,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Transactions
CREATE TABLE marketplace.transactions (
    transaction_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    wallet_id UUID REFERENCES marketplace.wallets(wallet_id),
    booking_id UUID REFERENCES marketplace.bookings(booking_id),
    transaction_type VARCHAR(50) NOT NULL,
    units_amount INT NOT NULL,
    nis_equivalent DECIMAL(10,2),
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Vendor payments
CREATE TABLE marketplace.vendor_payments (
    payment_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vendor_id UUID REFERENCES marketplace.vendors(vendor_id),
    settlement_date DATE NOT NULL,
    gross_amount DECIMAL(10,2) NOT NULL,
    platform_fee DECIMAL(10,2) NOT NULL,
    net_amount DECIMAL(10,2) NOT NULL,
    transaction_count INT NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    payment_reference VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Unit allocations
CREATE TABLE marketplace.unit_allocations (
    allocation_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    wallet_id UUID REFERENCES marketplace.wallets(wallet_id),
    category VARCHAR(100) NOT NULL,
    allocated_units INT NOT NULL,
    month DATE NOT NULL,
    UNIQUE (wallet_id, category, month)
);

-- ======================
-- INDEXES
-- ======================

-- Shared schema indexes
CREATE INDEX idx_users_teudat_zehut ON shared.users(teudat_zehut);
CREATE INDEX idx_users_phone ON shared.users(phone);
CREATE INDEX idx_family_members_user ON shared.family_members(user_id);
CREATE INDEX idx_audit_log_user ON shared.audit_log(user_id);
CREATE INDEX idx_audit_log_timestamp ON shared.audit_log(timestamp);

-- AI Agent schema indexes
CREATE INDEX idx_conversations_user ON ai_agent.conversations(user_id);
CREATE INDEX idx_messages_conversation ON ai_agent.messages(conversation_id);
CREATE INDEX idx_health_readings_user ON ai_agent.health_readings(user_id);
CREATE INDEX idx_alerts_user ON ai_agent.alerts(user_id);
CREATE INDEX idx_alerts_status ON ai_agent.alerts(status);

-- Marketplace schema indexes
CREATE INDEX idx_wallets_user ON marketplace.wallets(user_id);
CREATE INDEX idx_services_category ON marketplace.services(category);
CREATE INDEX idx_services_vendor ON marketplace.services(vendor_id);
CREATE INDEX idx_bookings_user ON marketplace.bookings(user_id);
CREATE INDEX idx_bookings_vendor ON marketplace.bookings(vendor_id);
CREATE INDEX idx_bookings_status ON marketplace.bookings(status);
CREATE INDEX idx_transactions_wallet ON marketplace.transactions(wallet_id);

-- ======================
-- SEED DATA
-- ======================

-- ============================================================
-- DEMO DATA ONLY — All data below is fictional and for
-- demonstration purposes. No real personal information.
-- ============================================================

-- Insert demo user (fictional)
INSERT INTO shared.users (user_id, teudat_zehut, first_name, last_name, birth_date, phone, email, nursing_level, languages, preferences)
VALUES (
    '550e8400-e29b-41d4-a716-446655440000',
    '000000000',
    '[שם פרטי לדוגמה]',
    '[שם משפחה לדוגמה]',
    '1950-01-01',
    '050-0000000',
    'demo-user@example.com',
    3,
    ARRAY['hebrew'],
    '{"speech_speed": 0.85, "call_times": ["morning"], "interests": ["grandchildren", "cooking"]}'
);

-- Insert demo family member (fictional)
INSERT INTO shared.family_members (user_id, name, phone, email, relation)
VALUES (
    '550e8400-e29b-41d4-a716-446655440000',
    '[שם בן משפחה לדוגמה]',
    '052-0000000',
    'demo-family@example.com',
    'son'
);

-- Insert demo wallet
INSERT INTO marketplace.wallets (user_id, nursing_level, total_units, available_units, reserved_units, optimal_aging_units, units_expire_at)
VALUES (
    '550e8400-e29b-41d4-a716-446655440000',
    3,
    96,
    88,
    8,
    2,
    '2025-04-15'
);

-- Insert demo vendors
INSERT INTO marketplace.vendors (vendor_id, business_name, license_number, contact_name, phone, email, service_areas, rating, reviews_count, is_verified, is_active)
VALUES
    ('550e8400-e29b-41d4-a716-446655440001', 'ספק שירות לדוגמה א', 'FT-00001', '[שם איש קשר]', '050-0000001', 'vendor-a@example.com', ARRAY['תל אביב', 'רמת גן'], 4.8, 127, true, true),
    ('550e8400-e29b-41d4-a716-446655440002', 'ספק שירות לדוגמה ב', 'CC-00002', '[שם איש קשר]', '09-0000000', 'vendor-b@example.com', ARRAY['הרצליה', 'רעננה'], 4.9, 89, true, true);

-- Insert demo services
INSERT INTO marketplace.services (service_id, vendor_id, category, title, title_he, description, description_he, unit_cost, duration_minutes, is_optimal_aging, is_active)
VALUES
    ('550e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440001', 'physiotherapy', 'Home Physiotherapy', 'פיזיותרפיה בבית', 'Professional physiotherapy at home', 'פיזיותרפיה מקצועית בנוחות הבית', 2, 45, true, true),
    ('550e8400-e29b-41d4-a716-446655440011', '550e8400-e29b-41d4-a716-446655440002', 'social_activity', 'Coffee and Friends', 'קפה וחברים', 'Social gathering with games', 'מפגש חברתי עם משחקים', 1, 120, true, true);

COMMIT;
