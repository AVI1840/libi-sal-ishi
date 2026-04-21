# Architecture Decisions Record (ADR)

## ADR-001: Monorepo Structure

**Decision**: Simple folders + shared package (no Nx/Turborepo)
**Rationale**: Easier for 5 developers, reduces tooling complexity for MVP timeline
**Status**: ✅ Implemented

---

## ADR-002: Unified Python Backend

**Decision**: Python for ALL backend services
**Rationale**: Unified stack enables faster development, easier code sharing, team expertise alignment
**Status**: ✅ Implemented

---

## ADR-003: Single PostgreSQL Database

**Decision**: One PostgreSQL database with separate schemas (shared, ai_agent, marketplace)
**Rationale**: Enables cross-schema queries, simpler ops, single connection management
**Schemas**:

- `shared` - Users, family members, audit logs
- `ai_agent` - Conversations, messages, health readings, alerts, memories
- `marketplace` - Wallets, vendors, services, bookings, transactions, payments

**Status**: ✅ Schema designed

---

## ADR-004: Cloud Provider Abstraction

**Decision**: Fully abstracted cloud layer controlled by environment variables
**Rationale**: Avoid vendor lock-in, enable deployment flexibility
**Supported**: AWS, GCP, Azure

**Status**: ✅ Interface designed

---

## ADR-005: Custom JWT Authentication

**Decision**: Build custom JWT auth instead of using Firebase/Auth0
**Rationale**: Portable, no vendor lock-in, full control over token structure
**Token Structure**:

```json
{
  "sub": "user_id (UUID)",
  "type": "access | refresh",
  "role": "senior | family | case_manager | vendor | admin",
  "permissions": ["read:own_data", "write:bookings"],
  "iat": timestamp,
  "exp": timestamp
}
```

**Status**: ✅ Implemented in shared/auth

---

## ADR-006: Multi-LLM Provider Support

**Decision**: Abstract LLM layer supporting Claude, GPT-4, Gemini
**Rationale**: Avoid single provider dependency, enable cost optimization, fallback support
**Exclusion**: No Ollama/local LLM for MVP

**Status**: ✅ Interface designed

---

## ADR-007: Google TTS for MVP

**Decision**: Use Google TTS as primary voice provider
**Rationale**: Good Hebrew support, cost-effective, well-documented API
**Future**: ElevenLabs abstraction ready for premium upgrade

**Status**: ✅ Interface designed

---

## ADR-008: Voice-First Design

**Decision**: Optimize all interactions for voice/audio
**Rationale**: Target users (elderly 70-95) have low digital literacy, voice is most accessible
**Implementation**: Large touch targets, simple UI, Hebrew RTL, audio feedback

**Status**: ✅ Implemented in frontend

---

## ADR-009: Frontend Shared UI Package

**Decision**: Create `@savta-ai/shared-ui` package for shared components
**Rationale**: Avoid code duplication across 3 frontend apps, consistent styling
**Apps**:

- web-client (seniors) - Port 8080
- case-manager-dashboard - Port 8081
- vendor-portal - Port 8082

**Status**: ✅ Implemented

---

## ADR-010: npm Workspaces for Frontend

**Decision**: Use npm workspaces for frontend monorepo
**Rationale**: Native npm support, simpler than pnpm/yarn workspaces for this scale
**Structure**: frontend/package.json manages all workspace packages

**Status**: ✅ Implemented

---

## ADR-011: Three-Tier Memory System

**Decision**: Implement hierarchical memory for AI agent
**Tiers**:

1. **Session Memory** (Redis) - Current conversation context
2. **Structured Memory** (PostgreSQL) - User facts, preferences, history
3. **Semantic Memory** (Pinecone/pgvector) - Embeddings for similarity search

**Rationale**: Enables personalized, context-aware conversations

**Status**: 🔄 Designed, not implemented

---

## ADR-012: Mock External Integrations

**Decision**: Mock all external APIs for MVP
**Mocked Services**:

- Bituach Leumi (social security) - Mock eligibility data
- HMO integration - Mock health data
- Payment gateway - Mock clearing house
- Wearables - Mock health readings

**Rationale**: Focus on core functionality, avoid external dependencies blocking demo

**Status**: ✅ Mock data implemented
