# Savta.AI + Personal Basket - Project Overview

## Project Summary

**סבתא.AI (Savta.AI)** is an agentic personal care companion platform for elderly Israelis (70-95 years old), combined with **הסל האישי (Personal Basket)** - a fintech marketplace for care services.

### Target Users

- Primary: Elderly Israelis with low digital literacy
- Secondary: Family members, case managers, service vendors
- Languages: Hebrew (primary), Arabic

### Timeline

- **MVP Deadline**: 90 days for investor demo
- **Team Size**: 5 developers

---

## Tech Stack

### Backend (Python)

| Component      | Technology                               |
| -------------- | ---------------------------------------- |
| Web Framework  | FastAPI (async)                          |
| Database       | PostgreSQL (single DB, multiple schemas) |
| Cache/Sessions | Redis                                    |
| Vector Store   | Pinecone/pgvector (semantic memory)      |
| Authentication | Custom JWT                               |

### Frontend (TypeScript/React)

| Component     | Technology                              |
| ------------- | --------------------------------------- |
| Framework     | React 18.3.1 + TypeScript               |
| Build Tool    | Vite                                    |
| Styling       | TailwindCSS 3.4 with custom LEV palette |
| UI Components | Radix UI primitives                     |
| Routing       | React Router DOM 6.30                   |
| State         | React Context + TanStack Query          |

### LLM Providers (Abstracted)

- Anthropic Claude 3.5 Sonnet (Primary)
- OpenAI GPT-4o (Fallback)
- Google Gemini 1.5 Pro (Alternative)

### Voice/TTS

- Google TTS (MVP default, good Hebrew)
- ElevenLabs (Premium option)

### Cloud (Abstracted)

- AWS, GCP, or Azure (configurable via env vars)

---

## Environment Setup

### Prerequisites

- Python 3.11+
- Node.js 18+
- PostgreSQL 15+
- Redis 7+

### Quick Start

```bash
# Frontend
cd frontend
npm install
npm run dev:client    # http://localhost:8080
npm run dev:manager   # http://localhost:8081
npm run dev:vendor    # http://localhost:8082

# Backend
cd packages/ai-agent && pip install -e .
cd packages/marketplace && pip install -e .
cd packages/integration && pip install -e .

# Run with uvicorn
uvicorn ai_agent.main:app --port 8000
uvicorn marketplace.main:app --port 8001
uvicorn integration.main:app --port 8002
```

### Environment Variables

See `.env.example` for full list. Key variables:

- `DATABASE_URL` - PostgreSQL connection
- `REDIS_URL` - Redis connection
- `LLM_PROVIDER` - anthropic/openai/google
- `CLOUD_PROVIDER` - aws/gcp/azure
- `TTS_PROVIDER` - google/elevenlabs

---

## Key Success Metrics

- Voice quality: Native Hebrew speaker rating 8/10+
- Response latency: <2 seconds
- Uptime: 99.9%
- Demo impact: Show value in 5 minutes

---

## MVP Scope Exclusions

❌ Bituach Leumi API integration (mock only)
❌ HMO integration (mock only)
❌ WhatsApp Business API
❌ Ollama/local LLM support
❌ Real payment processing (mock clearing house)
