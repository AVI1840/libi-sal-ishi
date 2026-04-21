# File Structure & Conventions

## Root Structure

```
savta-ai/
├── .github/                    # GitHub workflows, copilot instructions
├── .vscode/                    # VS Code settings, tasks.json
├── frontend/                   # All frontend applications
├── packages/                   # Python backend packages
├── infrastructure/             # Docker, Terraform, K8s
├── docs/                       # Documentation
├── scripts/                    # Utility scripts
└── pyproject.toml             # Root Python project config
```

---

## Frontend Structure

### Shared UI (`frontend/shared-ui/`)

```
shared-ui/
├── package.json
├── src/
│   ├── index.ts               # Main exports
│   ├── components/
│   │   ├── index.ts           # Component exports
│   │   └── ui/                # Radix-based UI primitives
│   │       ├── index.ts
│   │       ├── button.tsx
│   │       ├── card.tsx
│   │       ├── input.tsx
│   │       ├── badge.tsx
│   │       ├── tabs.tsx
│   │       ├── dialog.tsx
│   │       ├── sheet.tsx
│   │       ├── scroll-area.tsx
│   │       ├── progress.tsx
│   │       ├── avatar.tsx
│   │       ├── separator.tsx
│   │       └── tooltip.tsx
│   ├── hooks/
│   │   ├── index.ts
│   │   ├── use-mobile.tsx
│   │   └── use-toast.ts
│   ├── lib/
│   │   ├── index.ts
│   │   └── utils.ts           # cn(), calculateFitScore, getRecommendations
│   ├── data/
│   │   └── mockData.ts        # 75 clients, 30+ services, bookings
│   └── styles/
│       └── index.css          # Tailwind + LEV palette
```

### App Structure (web-client, case-manager, vendor-portal)

```
{app-name}/
├── package.json
├── vite.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── index.html
└── src/
    ├── main.tsx              # React entry point
    ├── App.tsx               # Router configuration
    ├── index.css             # App-specific styles
    ├── contexts/
    │   └── AppContext.tsx    # Global state
    ├── components/
    │   ├── Header.tsx        # (web-client)
    │   ├── BottomNav.tsx     # (web-client)
    │   └── Layout.tsx        # (dashboard apps)
    └── pages/
        ├── Index.tsx
        ├── NotFound.tsx
        └── ...               # App-specific pages
```

---

## Backend Structure

### Shared Package (`packages/shared/`)

```
shared/
├── pyproject.toml
└── shared/
    ├── __init__.py
    ├── config.py              # BaseSettings configuration
    ├── constants.py           # Enums, constants
    ├── exceptions.py          # Custom exceptions
    ├── utils.py               # Utility functions
    ├── auth/
    │   ├── __init__.py
    │   ├── jwt_handler.py     # Token create/verify
    │   └── permissions.py     # RBAC decorators
    ├── database/
    │   ├── __init__.py
    │   ├── connection.py      # AsyncPG pool
    │   └── base.py            # SQLAlchemy base
    ├── models/
    │   ├── __init__.py
    │   ├── user.py            # User Pydantic models
    │   ├── booking.py         # Booking models
    │   ├── wallet.py          # Wallet models
    │   └── health.py          # Health reading models
    ├── llm/
    │   ├── __init__.py
    │   ├── base.py            # Abstract LLM interface
    │   ├── anthropic_provider.py
    │   ├── openai_provider.py
    │   ├── google_provider.py
    │   └── factory.py         # LLMFactory.create()
    ├── cloud/
    │   ├── __init__.py
    │   ├── base.py            # Abstract cloud interface
    │   ├── aws_provider.py
    │   ├── gcp_provider.py
    │   ├── azure_provider.py
    │   └── factory.py         # CloudFactory.create()
    └── voice/
        ├── __init__.py
        ├── base.py            # Abstract TTS interface
        ├── google_tts.py
        ├── elevenlabs_tts.py
        └── factory.py         # TTSFactory.create()
```

### Service Package (ai-agent, marketplace, integration)

```
{service}/
├── pyproject.toml
└── {service}/
    ├── __init__.py
    ├── main.py               # FastAPI app entry
    ├── config.py             # Service-specific config
    ├── api/
    │   ├── __init__.py
    │   ├── dependencies.py   # FastAPI dependencies
    │   └── routes/
    │       └── *.py          # Route modules
    └── {domain}/             # Business logic modules
        ├── __init__.py
        └── service.py
```

---

## CSS Naming Conventions

### Tailwind Classes (Preferred)

Use Tailwind utility classes directly in components:

```tsx
<div className="flex items-center gap-4 p-6 bg-card rounded-2xl shadow-card">
```

### Custom CSS Classes (index.css)

For complex, reusable patterns, define in `@layer components`:

```css
@layer components {
  .wallet-header {
    @apply text-primary-foreground rounded-2xl p-6 shadow-elevated;
  }

  .service-card {
    @apply bg-card rounded-2xl shadow-card overflow-hidden;
  }

  .status-badge {
    @apply inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full;
  }
}
```

### Naming Pattern

- `.{component}-{element}` for component parts
- `.{state}-{descriptor}` for states
- Examples: `.wallet-header`, `.booking-card`, `.status-badge.success`

---

## Import Conventions

### Frontend

```typescript
// External libraries first
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, User } from "lucide-react";

// Shared UI components
import { Button, Card, Badge } from "@savta-ai/shared-ui";
import { Input } from "@savta-ai/shared-ui/components/ui/input";

// Local components
import { Header } from "../components/Header";

// Contexts and hooks
import { useApp } from "../contexts/AppContext";

// Types (if separate)
import type { Service, Booking } from "@savta-ai/shared-ui/data/mockData";
```

### Backend

```python
# Standard library
from datetime import datetime
from typing import Optional, List

# Third-party
from fastapi import FastAPI, Depends, HTTPException
from pydantic import BaseModel

# Shared package
from shared.auth import jwt_handler
from shared.models import User

# Local modules
from .config import settings
from .services import WalletService
```
