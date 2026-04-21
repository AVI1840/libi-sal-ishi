# Savta.AI + Personal Basket - Development Guidelines

> **Project**: סבתא.AI (Savta.AI) - Agentic Personal Care Companion + הסל האישי (Personal Basket) Marketplace
> **Target Users**: Elderly Israelis (70-95), Hebrew/Arabic speakers, low digital literacy
> **Timeline**: MVP in 90 days for investor demo
> **Team Size**: 5 developers

---

## 📚 Memory Bank Protocol

**IMPORTANT**: This project uses a memory bank system to maintain context across sessions.

### At Session Start

Before starting any work, read the memory bank files in this order:

1. `.github/memory-bank/project-overview.md` - Understand the project context
2. `.github/memory-bank/implementation-progress.md` - See what's done and pending
3. `.github/memory-bank/architecture-decisions.md` - Review key technical decisions
4. `.github/memory-bank/data-models.md` - Understand data structures
5. `.github/memory-bank/file-structure.md` - Know the codebase layout
6. `.github/memory-bank/api-reference.md` - API endpoints documentation
7. `.github/memory-bank/coding-patterns.md` - Follow established patterns

### At Session End

After completing significant work, update the relevant memory bank files:

- **implementation-progress.md** - Mark completed tasks, add new pending items, update known issues
- **architecture-decisions.md** - Add new ADRs if architectural decisions were made
- **data-models.md** - Update if schemas or TypeScript interfaces changed
- **api-reference.md** - Update if new endpoints were added
- **coding-patterns.md** - Add new patterns if established

### Memory Bank File Purposes

| File                         | When to Update                                       |
| ---------------------------- | ---------------------------------------------------- |
| `project-overview.md`        | Rarely - only if tech stack or project scope changes |
| `architecture-decisions.md`  | When making significant technical decisions          |
| `implementation-progress.md` | Every session - track progress and issues            |
| `data-models.md`             | When database schemas or TypeScript types change     |
| `file-structure.md`          | When adding new directories or changing conventions  |
| `api-reference.md`           | When adding or modifying API endpoints               |
| `coding-patterns.md`         | When establishing new reusable patterns              |

---

## 🎯 Project Overview

### What We're Building

1. **Savta.AI (AI Agent)** - An autonomous care companion that:

   - Monitors health patterns and alerts families
   - Reduces loneliness through meaningful Hebrew conversation
   - Executes tasks (schedule appointments, order services)
   - Voice-first design optimized for elderly users

2. **Personal Basket (Marketplace)** - A fintech platform that:

   - Converts nursing benefit hours into digital credits
   - Two-sided marketplace for care services
   - Wallet management with transaction processing
   - Case manager dashboard for care coordination

3. **Integration Layer** - Secure API gateway connecting both systems

### Key Success Metrics

- Voice quality: Native Hebrew speaker must rate 8/10+
- Response latency: <2 seconds
- Uptime: 99.9%
- Demo impact: Show value in 5 minutes

---

## 🏗️ Architecture Decisions

### Confirmed Technical Choices

| Decision           | Choice                              | Rationale                                           |
| ------------------ | ----------------------------------- | --------------------------------------------------- |
| Monorepo Structure | Simple folders + shared package     | Easier for 5 developers, no Nx/Turborepo complexity |
| Backend Stack      | Python for ALL services             | Unified stack for faster MVP                        |
| Database           | Single PostgreSQL, separate schemas | Cross-schema queries, simpler ops                   |
| Cloud Provider     | Fully abstracted                    | Environment variable controls provider              |
| Authentication     | Custom JWT                          | Portable, no vendor lock-in                         |
| Voice TTS          | Google TTS (MVP)                    | Good Hebrew, cheap, abstraced for future swap       |
| LLM                | Multi-provider abstraction          | Claude, GPT-4, Gemini support (no Ollama)           |
| Web Framework      | FastAPI                             | Async, fast, great OpenAPI support                  |
| Frontend (MVP)     | Simple Web Interface                | WhatsApp deferred to Phase 2                        |

### Explicitly NOT Implementing (MVP Scope)

- ❌ Bituach Leumi API integration (mock only)
- ❌ HMO integration (mock only)
- ❌ WhatsApp Business API
- ❌ Ollama/local LLM support
- ❌ Real payment processing (mock clearing house)

---

## 📁 Project Structure

```
savta-ai/
├── .github/
│   ├── copilot-instructions.md    # This file
│   ├── workflows/                  # CI/CD pipelines
│   └── CODEOWNERS
│
├── packages/
│   ├── shared/                     # Shared code across all services
│   │   ├── pyproject.toml
│   │   ├── shared/
│   │   │   ├── __init__.py
│   │   │   ├── models/             # Pydantic models (shared DTOs)
│   │   │   │   ├── __init__.py
│   │   │   │   ├── user.py
│   │   │   │   ├── booking.py
│   │   │   │   ├── wallet.py
│   │   │   │   └── health.py
│   │   │   ├── database/           # Database utilities
│   │   │   │   ├── __init__.py
│   │   │   │   ├── connection.py
│   │   │   │   ├── base.py
│   │   │   │   └── migrations/
│   │   │   ├── auth/               # JWT authentication
│   │   │   │   ├── __init__.py
│   │   │   │   ├── jwt_handler.py
│   │   │   │   └── permissions.py
│   │   │   ├── llm/                # Multi-LLM abstraction
│   │   │   │   ├── __init__.py
│   │   │   │   ├── base.py
│   │   │   │   ├── anthropic_provider.py
│   │   │   │   ├── openai_provider.py
│   │   │   │   ├── google_provider.py
│   │   │   │   └── factory.py
│   │   │   ├── cloud/              # Cloud provider abstraction
│   │   │   │   ├── __init__.py
│   │   │   │   ├── base.py
│   │   │   │   ├── aws_provider.py
│   │   │   │   ├── gcp_provider.py
│   │   │   │   ├── azure_provider.py
│   │   │   │   └── factory.py
│   │   │   ├── voice/              # TTS abstraction
│   │   │   │   ├── __init__.py
│   │   │   │   ├── base.py
│   │   │   │   ├── google_tts.py
│   │   │   │   ├── elevenlabs_tts.py
│   │   │   │   └── factory.py
│   │   │   ├── constants.py
│   │   │   ├── exceptions.py
│   │   │   └── utils.py
│   │   └── tests/
│   │
│   ├── ai-agent/                   # Savta.AI Backend
│   │   ├── pyproject.toml
│   │   ├── ai_agent/
│   │   │   ├── __init__.py
│   │   │   ├── main.py             # FastAPI entry point
│   │   │   ├── config.py           # Environment configuration
│   │   │   ├── agents/             # LangGraph agents
│   │   │   │   ├── __init__.py
│   │   │   │   ├── orchestrator.py # Main agent router
│   │   │   │   ├── conversational.py
│   │   │   │   ├── health_monitor.py
│   │   │   │   ├── marketplace_coordinator.py
│   │   │   │   └── family_liaison.py
│   │   │   ├── memory/             # Three-tier memory system
│   │   │   │   ├── __init__.py
│   │   │   │   ├── session_memory.py    # Redis
│   │   │   │   ├── structured_memory.py # PostgreSQL
│   │   │   │   └── semantic_memory.py   # Pinecone/pgvector
│   │   │   ├── nlp/                # Hebrew NLP
│   │   │   │   ├── __init__.py
│   │   │   │   ├── sentiment.py
│   │   │   │   ├── entity_extraction.py
│   │   │   │   └── intent_classification.py
│   │   │   ├── safety/             # Safety systems
│   │   │   │   ├── __init__.py
│   │   │   │   ├── emergency_detection.py
│   │   │   │   ├── cognitive_monitoring.py
│   │   │   │   └── privacy_controls.py
│   │   │   ├── api/                # API routes
│   │   │   │   ├── __init__.py
│   │   │   │   ├── routes/
│   │   │   │   │   ├── conversation.py
│   │   │   │   │   ├── health.py
│   │   │   │   │   ├── webhooks.py
│   │   │   │   │   └── demo.py
│   │   │   │   └── dependencies.py
│   │   │   └── demo/               # Investor demo scenarios
│   │   │       ├── __init__.py
│   │   │       └── scenarios.py
│   │   └── tests/
│   │
│   ├── marketplace/                # Personal Basket Backend
│   │   ├── pyproject.toml
│   │   ├── marketplace/
│   │   │   ├── __init__.py
│   │   │   ├── main.py             # FastAPI entry point
│   │   │   ├── config.py
│   │   │   ├── wallet/             # Digital wallet engine
│   │   │   │   ├── __init__.py
│   │   │   │   ├── service.py
│   │   │   │   ├── conversion.py   # Hours → Units algorithm
│   │   │   │   └── validation.py
│   │   │   ├── services/           # Service marketplace
│   │   │   │   ├── __init__.py
│   │   │   │   ├── catalog.py
│   │   │   │   ├── search.py
│   │   │   │   └── matching.py
│   │   │   ├── bookings/           # Booking management
│   │   │   │   ├── __init__.py
│   │   │   │   ├── service.py
│   │   │   │   └── lifecycle.py
│   │   │   ├── payments/           # Clearing house (mock)
│   │   │   │   ├── __init__.py
│   │   │   │   ├── clearing_house.py
│   │   │   │   └── mock_gateway.py
│   │   │   ├── vendors/            # Vendor management
│   │   │   │   ├── __init__.py
│   │   │   │   └── service.py
│   │   │   ├── case_manager/       # Case manager features
│   │   │   │   ├── __init__.py
│   │   │   │   ├── dashboard.py
│   │   │   │   └── intake.py
│   │   │   └── api/
│   │   │       ├── __init__.py
│   │   │       └── routes/
│   │   │           ├── wallets.py
│   │   │           ├── services.py
│   │   │           ├── bookings.py
│   │   │           ├── vendors.py
│   │   │           └── dashboard.py
│   │   └── tests/
│   │
│   └── integration/                # API Gateway / Integration Layer
│       ├── pyproject.toml
│       ├── integration/
│       │   ├── __init__.py
│       │   ├── main.py
│       │   ├── config.py
│       │   ├── gateway/            # API Gateway logic
│       │   │   ├── __init__.py
│       │   │   ├── router.py
│       │   │   └── rate_limiter.py
│       │   ├── webhooks/           # Webhook handlers
│       │   │   ├── __init__.py
│       │   │   ├── marketplace_events.py
│       │   │   └── ai_agent_events.py
│       │   └── sync/               # Data synchronization
│       │       ├── __init__.py
│       │       └── user_sync.py
│       └── tests/
│
├── frontend/                       # Web interfaces (MVP)
│   ├── web-client/                 # Senior-facing web app
│   │   ├── package.json
│   │   └── src/
│   ├── case-manager-dashboard/     # Case manager web dashboard
│   │   ├── package.json
│   │   └── src/
│   └── vendor-portal/              # Vendor web portal
│       ├── package.json
│       └── src/
│
├── infrastructure/
│   ├── docker/
│   │   ├── Dockerfile.ai-agent
│   │   ├── Dockerfile.marketplace
│   │   ├── Dockerfile.integration
│   │   └── docker-compose.yml
│   ├── terraform/                  # Cloud-agnostic IaC
│   │   ├── modules/
│   │   ├── environments/
│   │   └── main.tf
│   └── kubernetes/                 # K8s manifests (optional)
│
├── docs/
│   ├── api/                        # OpenAPI specs
│   ├── architecture/               # Architecture diagrams
│   ├── database/                   # Schema documentation
│   └── demo/                       # Demo scripts
│
├── scripts/
│   ├── setup.sh
│   ├── seed_data.py
│   └── run_demo.py
│
├── pyproject.toml                  # Root project config
├── .env.example
├── .gitignore
└── README.md
```

---

## 🗄️ Database Schema

### Schema Organization

```
PostgreSQL Database: savta_ai_db
├── Schema: shared      # Cross-service data
├── Schema: ai_agent    # AI Agent specific
└── Schema: marketplace # Marketplace specific
```

### Shared Schema

```sql
-- shared.users (single source of truth for user identity)
CREATE TABLE shared.users (
    user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    teudat_zehut VARCHAR(9) UNIQUE NOT NULL,  -- Israeli ID
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    birth_date DATE NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(255),
    address JSONB,  -- {street, city, lat, lng}
    languages VARCHAR[] DEFAULT ARRAY['hebrew'],
    nursing_level INT CHECK (nursing_level BETWEEN 1 AND 6),
    preferences JSONB DEFAULT '{}',  -- speech_speed, call_times, topics_to_avoid
    emergency_contacts JSONB DEFAULT '[]',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE
);

-- shared.family_members (linked to users)
CREATE TABLE shared.family_members (
    family_member_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES shared.users(user_id),
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(255),
    relation VARCHAR(50),  -- son, daughter, spouse, caregiver
    notification_preferences JSONB DEFAULT '{"alerts": true, "weekly_summary": true}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### AI Agent Schema

```sql
-- ai_agent.conversations
CREATE TABLE ai_agent.conversations (
    conversation_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES shared.users(user_id),
    channel VARCHAR(50) DEFAULT 'web',  -- web, whatsapp, voice
    started_at TIMESTAMPTZ DEFAULT NOW(),
    ended_at TIMESTAMPTZ,
    summary TEXT,
    sentiment_avg FLOAT,
    metadata JSONB DEFAULT '{}'
);

-- ai_agent.messages
CREATE TABLE ai_agent.messages (
    message_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID REFERENCES ai_agent.conversations(conversation_id),
    role VARCHAR(20) NOT NULL,  -- user, assistant, system
    content TEXT NOT NULL,
    sentiment_score FLOAT,  -- -1 to 1
    intent VARCHAR(100),
    entities JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ai_agent.health_readings (from wearables - mock for MVP)
CREATE TABLE ai_agent.health_readings (
    reading_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES shared.users(user_id),
    metric_type VARCHAR(50) NOT NULL,  -- heart_rate, steps, sleep_hours, blood_pressure
    value FLOAT NOT NULL,
    unit VARCHAR(20),
    recorded_at TIMESTAMPTZ NOT NULL,
    source VARCHAR(50) DEFAULT 'manual',  -- manual, fitbit, withings
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ai_agent.health_baselines (for anomaly detection)
CREATE TABLE ai_agent.health_baselines (
    user_id UUID REFERENCES shared.users(user_id),
    metric_type VARCHAR(50) NOT NULL,
    baseline_value FLOAT NOT NULL,
    std_deviation FLOAT,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (user_id, metric_type)
);

-- ai_agent.alerts
CREATE TABLE ai_agent.alerts (
    alert_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES shared.users(user_id),
    alert_type VARCHAR(50) NOT NULL,  -- health, cognitive, loneliness, emergency
    severity VARCHAR(20) NOT NULL,  -- low, medium, high, critical
    title VARCHAR(255) NOT NULL,
    description TEXT,
    triggered_by JSONB,  -- what caused the alert
    status VARCHAR(20) DEFAULT 'pending',  -- pending, acknowledged, resolved
    notified_family BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    resolved_at TIMESTAMPTZ
);

-- ai_agent.semantic_memories (for Pinecone/pgvector - store metadata here)
CREATE TABLE ai_agent.semantic_memories (
    memory_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES shared.users(user_id),
    content TEXT NOT NULL,
    memory_type VARCHAR(50),  -- preference, fact, event, relationship
    embedding_id VARCHAR(255),  -- ID in vector store
    importance_score FLOAT DEFAULT 0.5,
    last_accessed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Marketplace Schema

```sql
-- marketplace.wallets
CREATE TABLE marketplace.wallets (
    wallet_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES shared.users(user_id) UNIQUE,
    nursing_level INT CHECK (nursing_level BETWEEN 1 AND 6),
    total_units INT NOT NULL,
    available_units INT NOT NULL,
    reserved_units INT DEFAULT 0,
    optimal_aging_units INT DEFAULT 0 CHECK (optimal_aging_units >= 0),
    units_expire_at DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- marketplace.vendors
CREATE TABLE marketplace.vendors (
    vendor_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_name VARCHAR(255) NOT NULL,
    license_number VARCHAR(100),
    contact_name VARCHAR(100),
    phone VARCHAR(20),
    email VARCHAR(255),
    address JSONB,
    service_areas VARCHAR[],  -- cities/regions served
    bank_account JSONB,  -- for payments
    rating FLOAT DEFAULT 0,
    reviews_count INT DEFAULT 0,
    is_verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- marketplace.services
CREATE TABLE marketplace.services (
    service_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vendor_id UUID REFERENCES marketplace.vendors(vendor_id),
    category VARCHAR(100) NOT NULL,  -- physiotherapy, social_activity, nursing, wellness
    subcategory VARCHAR(100),  -- home_visit, center_based, digital
    title VARCHAR(255) NOT NULL,
    title_he VARCHAR(255),  -- Hebrew title
    description TEXT,
    description_he TEXT,
    unit_cost INT NOT NULL,  -- digital units
    nis_equivalent DECIMAL(10,2),
    duration_minutes INT,
    min_nursing_level INT DEFAULT 1,
    max_nursing_level INT DEFAULT 6,
    requires_referral BOOLEAN DEFAULT FALSE,
    is_optimal_aging BOOLEAN DEFAULT FALSE,  -- qualifies for mandatory 2 units
    availability JSONB,  -- {days: [], times: []}
    locations JSONB,  -- [{city, lat, lng}]
    tags VARCHAR[],
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- marketplace.bookings
CREATE TABLE marketplace.bookings (
    booking_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES shared.users(user_id),
    wallet_id UUID REFERENCES marketplace.wallets(wallet_id),
    service_id UUID REFERENCES marketplace.services(service_id),
    vendor_id UUID REFERENCES marketplace.vendors(vendor_id),
    status VARCHAR(30) DEFAULT 'pending',  -- pending, confirmed, in_progress, completed, cancelled
    scheduled_datetime TIMESTAMPTZ NOT NULL,
    units_cost INT NOT NULL,
    assigned_staff VARCHAR(100),
    notes TEXT,
    proof_of_service JSONB,  -- {photo_url, signature_url, completed_at}
    ai_booked BOOLEAN DEFAULT FALSE,  -- was this booked via AI Agent?
    conversation_id UUID,  -- link to AI conversation if applicable
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- marketplace.transactions
CREATE TABLE marketplace.transactions (
    transaction_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wallet_id UUID REFERENCES marketplace.wallets(wallet_id),
    booking_id UUID REFERENCES marketplace.bookings(booking_id),
    transaction_type VARCHAR(50) NOT NULL,  -- reserve, complete, cancel, refund, expire
    units_amount INT NOT NULL,
    nis_equivalent DECIMAL(10,2),
    status VARCHAR(20) DEFAULT 'pending',  -- pending, completed, failed
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- marketplace.vendor_payments (clearing house records)
CREATE TABLE marketplace.vendor_payments (
    payment_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vendor_id UUID REFERENCES marketplace.vendors(vendor_id),
    settlement_date DATE NOT NULL,
    gross_amount DECIMAL(10,2) NOT NULL,
    platform_fee DECIMAL(10,2) NOT NULL,  -- 7%
    net_amount DECIMAL(10,2) NOT NULL,
    transaction_count INT NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',  -- pending, processed, failed
    payment_reference VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- marketplace.unit_allocations (monthly tracking)
CREATE TABLE marketplace.unit_allocations (
    allocation_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wallet_id UUID REFERENCES marketplace.wallets(wallet_id),
    category VARCHAR(100) NOT NULL,  -- traditional_nursing, optimal_aging, wellness
    allocated_units INT NOT NULL,
    month DATE NOT NULL,
    UNIQUE (wallet_id, category, month)
);
```

### Audit Schema (Cross-Service)

```sql
-- shared.audit_log
CREATE TABLE shared.audit_log (
    log_id BIGSERIAL PRIMARY KEY,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    service VARCHAR(50) NOT NULL,  -- ai_agent, marketplace, integration
    user_id UUID,
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(50),
    resource_id UUID,
    details JSONB,
    ip_address VARCHAR(45),
    user_agent VARCHAR(500),
    result VARCHAR(20)  -- success, failed, denied
);
```

---

## 🔐 Authentication & Authorization

### JWT Token Structure

```python
{
    "sub": "user_id (UUID)",
    "type": "access" | "refresh",
    "role": "senior" | "family" | "case_manager" | "vendor" | "admin",
    "permissions": ["read:own_data", "write:bookings", ...],
    "iat": timestamp,
    "exp": timestamp
}
```

### Role-Based Access Control (RBAC)

| Role           | Permissions                                             |
| -------------- | ------------------------------------------------------- |
| `senior`       | Read/write own profile, wallet, bookings                |
| `family`       | Read assigned senior's data (based on privacy settings) |
| `case_manager` | Read/write assigned clients, create bookings on behalf  |
| `vendor`       | Read/write own services, manage own bookings            |
| `admin`        | Full access                                             |

### API Authentication

- All endpoints require `Authorization: Bearer <jwt_token>` header
- Tokens expire in 1 hour (access) / 7 days (refresh)
- Refresh tokens stored in HttpOnly cookies for web clients

---

## 🤖 LLM Provider Abstraction

### Supported Providers

1. **Anthropic** (Claude 3.5 Sonnet) - Primary
2. **OpenAI** (GPT-4o) - Fallback
3. **Google** (Gemini 1.5 Pro) - Alternative

### Configuration

```python
# Environment variables
LLM_PROVIDER=anthropic  # anthropic | openai | google
LLM_MODEL=claude-3-5-sonnet-20241022
LLM_FALLBACK_PROVIDER=openai
LLM_FALLBACK_MODEL=gpt-4o

ANTHROPIC_API_KEY=your-anthropic-key-here
OPENAI_API_KEY=your-openai-key-here
GOOGLE_API_KEY=your-google-key-here
```

### Usage Pattern

```python
from shared.llm import LLMFactory

# Get provider based on config
llm = LLMFactory.create()

# Simple completion
response = await llm.complete(
    messages=[{"role": "user", "content": "שלום, מה שלומך?"}],
    temperature=0.7,
    max_tokens=500
)

# Streaming
async for chunk in llm.stream(messages):
    yield chunk
```

---

## ☁️ Cloud Provider Abstraction

### Supported Providers

1. **AWS** - S3, Secrets Manager, RDS
2. **GCP** - Cloud Storage, Secret Manager, Cloud SQL
3. **Azure** - Blob Storage, Key Vault, Azure SQL

### Configuration

```python
# Environment variables
CLOUD_PROVIDER=gcp  # aws | gcp | azure

# AWS
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_REGION=eu-west-1

# GCP
GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account.json
GCP_PROJECT_ID=savta-ai

# Azure
AZURE_STORAGE_CONNECTION_STRING=...
```

### Abstracted Services

```python
from shared.cloud import CloudFactory

cloud = CloudFactory.create()

# Storage
await cloud.storage.upload(bucket, key, data)
await cloud.storage.download(bucket, key)

# Secrets
secret = await cloud.secrets.get("database-password")

# All providers implement the same interface
```

---

## 🔊 Voice/TTS Abstraction

### Supported Providers

1. **Google TTS** (MVP default) - Good Hebrew, cheap
2. **ElevenLabs** (Premium) - Best quality

### Configuration

```python
TTS_PROVIDER=google  # google | elevenlabs
TTS_LANGUAGE=he-IL
TTS_VOICE=he-IL-Wavenet-A  # or specific ElevenLabs voice ID

GOOGLE_TTS_API_KEY=...
ELEVENLABS_API_KEY=...
```

### Usage

```python
from shared.voice import TTSFactory

tts = TTSFactory.create()
audio_bytes = await tts.synthesize(
    text="שלום, מה שלומך היום?",
    language="he-IL",
    speed=0.85  # Slower for elderly
)
```

---

## 🇮🇱 Hebrew NLP Guidelines

### Text Direction

- Always store text in logical order (LTR internally)
- Apply RTL rendering only in UI layer
- Use Unicode BIDI marks when mixing Hebrew/English

### Entity Recognition

```python
# Hebrew date formats to recognize
"כ\"ה בכסלו תשפ\"ה"  # Hebrew calendar
"25 לדצמבר 2025"      # Hebrew with Gregorian
"25/12/2025"          # Numeric

# Medication names
"אקמול"               # Hebrew brand
"Acamol"              # English brand
"Paracetamol"         # Generic

# Body parts (common elderly complaints)
"הברך כואבת"          # knee hurts
"כאב בחזה"            # chest pain (EMERGENCY!)
"סחרחורת"             # dizziness
```

### Sentiment Analysis

- Use Hebrew-specific sentiment library
- Account for Israeli directness (not always negative)
- Detect loneliness markers: "לבד", "אף אחד לא מתקשר", "משעמם"

### Emergency Keywords (Immediate Alert)

```python
EMERGENCY_KEYWORDS = [
    "חזה כואב",         # chest pain
    "לא יכול לנשום",    # can't breathe
    "נפלתי",            # I fell
    "לא רוצה לחיות",    # don't want to live (suicide risk)
    "עזרה",             # help
]
```

---

## 🧪 Testing Guidelines

### Test Structure

```
packages/{package}/tests/
├── unit/           # Pure unit tests, mocked dependencies
├── integration/    # Tests with real DB/Redis
└── conftest.py     # Shared fixtures
```

### Coverage Requirements (MVP)

- Unit tests: Required for all business logic
- Integration tests: Deferred to post-MVP
- E2E tests: Deferred to post-MVP

### Running Tests

```bash
# All tests
pytest

# Specific package
pytest packages/ai-agent/tests/

# With coverage
pytest --cov=ai_agent --cov-report=html
```

### Test Naming Convention

```python
def test_{function_name}_{scenario}_{expected_result}():
    # test_calculate_units_level2_returns_32_units
    pass
```

---

## 📡 API Design Standards

### URL Conventions

```
# Resources are nouns, plural
GET    /api/v1/wallets/{wallet_id}
POST   /api/v1/bookings
PUT    /api/v1/bookings/{booking_id}
DELETE /api/v1/bookings/{booking_id}

# Actions use verbs
POST   /api/v1/bookings/{booking_id}/confirm
POST   /api/v1/bookings/{booking_id}/cancel
```

### Response Format

```python
# Success
{
    "success": True,
    "data": { ... },
    "meta": {
        "timestamp": "2025-01-15T10:00:00Z",
        "request_id": "uuid"
    }
}

# Error
{
    "success": False,
    "error": {
        "code": "INSUFFICIENT_UNITS",
        "message": "אין מספיק יחידות בארנק",  # Hebrew for user
        "details": { ... }
    },
    "meta": { ... }
}
```

### Pagination

```python
GET /api/v1/services?page=1&limit=20

{
    "success": True,
    "data": [...],
    "pagination": {
        "page": 1,
        "limit": 20,
        "total": 150,
        "pages": 8
    }
}
```

---

## 🛡️ Security Requirements

### Data Encryption

- At rest: PostgreSQL with encryption enabled
- In transit: TLS 1.3 for all connections
- Sensitive fields: AES-256 encryption for PII

### PII Fields (Must Encrypt)

- `teudat_zehut` (Israeli ID)
- `phone`
- `email`
- `address`
- Medical conditions
- Health readings

### Audit Logging

Every API call must log:

- Timestamp
- User ID
- Action performed
- Resource accessed
- IP address
- Result (success/failure)

### Rate Limiting

- 100 requests/minute per user
- 1000 requests/minute per IP
- Stricter limits on auth endpoints (10/minute)

---

## 🚀 Demo Scenarios (For Investors)

### Scenario A: Morning Check-In

1. AI initiates call at 8 AM
2. "בוקר טוב, איך ישנת?" (Good morning, how did you sleep?)
3. User says "הגב כואב" (back hurts)
4. AI offers physiotherapy from marketplace
5. Books appointment, confirms in calendar

### Scenario B: Loneliness Intervention

1. AI detects low sentiment for 3 days
2. No family calls logged
3. Suggests community activity
4. Checks wallet balance
5. Registers user, notifies family

### Scenario C: Service Booking Flow

1. Senior logs into web app
2. Sees wallet balance (32 units)
3. Browses "Wellness" category
4. Books physiotherapy (2 units)
5. Receives confirmation

---

## 🔧 Development Workflow

### Git Branching

```
main              # Production-ready
├── develop       # Integration branch
├── feature/*     # New features
├── bugfix/*      # Bug fixes
└── hotfix/*      # Production hotfixes
```

### Commit Messages

```
feat(ai-agent): add Hebrew sentiment analysis
fix(marketplace): correct unit calculation for level 3
docs(api): update OpenAPI specification
test(shared): add JWT token validation tests
```

### PR Requirements

- All tests pass
- At least 1 code review
- No linting errors
- Updated documentation if needed

---

## 📊 Environment Variables

### Required for All Services

```bash
# Database
DATABASE_URL=postgresql://user:pass@host:5432/savta_ai_db

# Redis (session storage)
REDIS_URL=redis://localhost:6379/0

# JWT
JWT_SECRET_KEY=your-256-bit-secret
JWT_ALGORITHM=HS256

# Cloud
CLOUD_PROVIDER=gcp  # aws | gcp | azure

# LLM
LLM_PROVIDER=anthropic
ANTHROPIC_API_KEY=your-anthropic-key-here

# TTS
TTS_PROVIDER=google
GOOGLE_TTS_API_KEY=...
```

### AI Agent Specific

```bash
# Pinecone (semantic memory)
PINECONE_API_KEY=...
PINECONE_ENVIRONMENT=us-east-1
PINECONE_INDEX=savta-memories

# Safety
EMERGENCY_PHONE=911
ENABLE_EMERGENCY_DETECTION=true
```

### Marketplace Specific

```bash
# Payments (mock for MVP)
PAYMENT_GATEWAY=mock
PLATFORM_FEE_PERCENT=7

# Unit conversion
UNIT_VALUE_NIS=120
```

---

## 📅 90-Day MVP Timeline

### Phase 1: Foundation (Weeks 1-3)

- [ ] Set up monorepo structure
- [ ] Implement shared package (auth, LLM, cloud abstractions)
- [ ] Database schema + migrations
- [ ] Basic FastAPI scaffolding for all services

### Phase 2: Core Features (Weeks 4-8)

- [ ] AI Agent: Conversational agent with Hebrew NLP
- [ ] AI Agent: Health monitoring + alerts
- [ ] Marketplace: Wallet engine + unit conversion
- [ ] Marketplace: Service catalog + search
- [ ] Marketplace: Booking flow

### Phase 3: Integration (Weeks 9-10)

- [ ] API Gateway between services
- [ ] Webhook system
- [ ] User data synchronization

### Phase 4: Polish & Demo (Weeks 11-12)

- [ ] 3 demo scenarios fully working
- [ ] Simple web UI for demo
- [ ] Performance optimization
- [ ] Security audit
- [ ] Documentation

---

## ⚠️ Known Limitations (MVP)

1. **No real payments** - Mock clearing house only
2. **No Bituach Leumi integration** - Mock eligibility data
3. **No HMO integration** - Mock data
4. **No WhatsApp** - Web interface only
5. **No mobile app** - Web responsive only
6. **Limited Hebrew NLP** - Basic sentiment + entity extraction
7. **No real wearable integration** - Mock health data

---

## 📞 Support & Contacts

- **Technical Lead**: [TBD]
- **Product Owner**: [TBD]
- **Design**: [TBD]

---

_Last Updated: December 28, 2025_
