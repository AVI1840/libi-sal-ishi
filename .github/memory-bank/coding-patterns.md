# Coding Patterns & Conventions

## General Principles

1. **Hebrew First**: All user-facing text in Hebrew, RTL layout
2. **Accessibility**: Large touch targets (min 44px), high contrast
3. **Voice-Optimized**: Design for audio interaction
4. **Mock-Ready**: All external integrations are mockable

---

## TypeScript/React Patterns

### Component Template

```tsx
import { Button, Card } from "@savta-ai/shared-ui";
import { SomeIcon } from "lucide-react";
import { useState } from "react";
import { useApp } from "../contexts/AppContext";

interface Props {
  title: string;
  onAction?: () => void;
}

export default function ComponentName({ title, onAction }: Props) {
  const { someData } = useApp();
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = async () => {
    setIsLoading(true);
    try {
      await onAction?.();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="p-6">
      <h2 className="text-xl font-bold text-gray-900">{title}</h2>
      <Button onClick={handleClick} disabled={isLoading}>
        {isLoading ? "טוען..." : "לחץ כאן"}
      </Button>
    </Card>
  );
}
```

### Context Pattern

```tsx
import { createContext, ReactNode, useContext, useState } from "react";
import { clients, bookings } from "@savta-ai/shared-ui/data/mockData";

interface AppContextType {
  currentClient: (typeof clients)[0];
  bookings: typeof bookings;
  // Actions
  updateClient: (updates: Partial<(typeof clients)[0]>) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [client, setClient] = useState(clients[0]);

  const updateClient = (updates: Partial<(typeof clients)[0]>) => {
    setClient((prev) => ({ ...prev, ...updates }));
  };

  return (
    <AppContext.Provider
      value={{ currentClient: client, bookings, updateClient }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}
```

### Data Transformation Pattern

When shared-ui types don't match app needs:

```tsx
// Transform shared types to app-specific format
const transformBooking = (b: SharedBooking): AppBooking => ({
  id: b.id,
  scheduledDate: `${b.date}T${b.time}`,
  unitsCost: Math.ceil(b.price / 120),
  // ... other transformations
});

// Use in context
const [bookings] = useState(() => sharedBookings.map(transformBooking));
```

### List with Search/Filter Pattern

```tsx
const [searchQuery, setSearchQuery] = useState("");
const [statusFilter, setStatusFilter] = useState<string>("all");

const filteredItems = useMemo(() => {
  return items.filter((item) => {
    const matchesSearch = item.name.includes(searchQuery);
    const matchesStatus =
      statusFilter === "all" || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });
}, [items, searchQuery, statusFilter]);

return (
  <>
    <Input
      placeholder="חיפוש..."
      value={searchQuery}
      onChange={(e) => setSearchQuery(e.target.value)}
    />
    <Tabs value={statusFilter} onValueChange={setStatusFilter}>
      <TabsList>
        <TabsTrigger value="all">הכל</TabsTrigger>
        <TabsTrigger value="pending">ממתין</TabsTrigger>
        <TabsTrigger value="completed">הושלם</TabsTrigger>
      </TabsList>
    </Tabs>
    {filteredItems.map((item) => (
      <ItemCard key={item.id} item={item} />
    ))}
  </>
);
```

---

## Python/FastAPI Patterns

### FastAPI Router Template

```python
from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Optional
from pydantic import BaseModel

from shared.auth import get_current_user
from shared.models import User
from .service import SomeService

router = APIRouter(prefix="/items", tags=["items"])

class ItemCreate(BaseModel):
    name: str
    description: Optional[str] = None

class ItemResponse(BaseModel):
    id: str
    name: str
    description: Optional[str]

@router.get("/", response_model=List[ItemResponse])
async def list_items(
    skip: int = 0,
    limit: int = 20,
    current_user: User = Depends(get_current_user),
    service: SomeService = Depends(),
):
    return await service.list_items(user_id=current_user.id, skip=skip, limit=limit)

@router.post("/", response_model=ItemResponse, status_code=status.HTTP_201_CREATED)
async def create_item(
    item: ItemCreate,
    current_user: User = Depends(get_current_user),
    service: SomeService = Depends(),
):
    return await service.create_item(user_id=current_user.id, data=item)

@router.get("/{item_id}", response_model=ItemResponse)
async def get_item(
    item_id: str,
    current_user: User = Depends(get_current_user),
    service: SomeService = Depends(),
):
    item = await service.get_item(item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    return item
```

### Service Layer Pattern

```python
from typing import Optional, List
from shared.database import get_db_pool

class WalletService:
    def __init__(self, db=None):
        self.db = db

    async def get_wallet(self, user_id: str) -> Optional[dict]:
        query = """
            SELECT * FROM marketplace.wallets
            WHERE user_id = $1
        """
        async with self.db.acquire() as conn:
            return await conn.fetchrow(query, user_id)

    async def reserve_units(self, wallet_id: str, units: int) -> bool:
        query = """
            UPDATE marketplace.wallets
            SET available_units = available_units - $2,
                reserved_units = reserved_units + $2
            WHERE wallet_id = $1
              AND available_units >= $2
            RETURNING wallet_id
        """
        async with self.db.acquire() as conn:
            result = await conn.fetchrow(query, wallet_id, units)
            return result is not None
```

### Provider Abstraction Pattern

```python
from abc import ABC, abstractmethod
from typing import List, AsyncIterator

class BaseLLMProvider(ABC):
    @abstractmethod
    async def complete(
        self,
        messages: List[dict],
        temperature: float = 0.7,
        max_tokens: int = 500
    ) -> str:
        pass

    @abstractmethod
    async def stream(
        self,
        messages: List[dict]
    ) -> AsyncIterator[str]:
        pass

class AnthropicProvider(BaseLLMProvider):
    def __init__(self, api_key: str, model: str = "claude-3-5-sonnet-20241022"):
        self.client = Anthropic(api_key=api_key)
        self.model = model

    async def complete(self, messages, temperature=0.7, max_tokens=500):
        response = await self.client.messages.create(
            model=self.model,
            messages=messages,
            temperature=temperature,
            max_tokens=max_tokens,
        )
        return response.content[0].text

class LLMFactory:
    @staticmethod
    def create(provider: str = None) -> BaseLLMProvider:
        provider = provider or settings.LLM_PROVIDER
        if provider == "anthropic":
            return AnthropicProvider(api_key=settings.ANTHROPIC_API_KEY)
        elif provider == "openai":
            return OpenAIProvider(api_key=settings.OPENAI_API_KEY)
        raise ValueError(f"Unknown provider: {provider}")
```

---

## Testing Patterns

### Python Unit Test Template

```python
import pytest
from unittest.mock import AsyncMock, patch

from marketplace.wallet.service import WalletService

@pytest.fixture
def wallet_service():
    return WalletService(db=AsyncMock())

@pytest.mark.asyncio
async def test_reserve_units_success(wallet_service):
    # Arrange
    wallet_service.db.acquire.return_value.__aenter__.return_value.fetchrow.return_value = {"wallet_id": "123"}

    # Act
    result = await wallet_service.reserve_units("wallet-123", 5)

    # Assert
    assert result is True

@pytest.mark.asyncio
async def test_reserve_units_insufficient_balance(wallet_service):
    # Arrange
    wallet_service.db.acquire.return_value.__aenter__.return_value.fetchrow.return_value = None

    # Act
    result = await wallet_service.reserve_units("wallet-123", 100)

    # Assert
    assert result is False
```

### Test Naming Convention

```python
def test_{function_name}_{scenario}_{expected_result}():
    # test_calculate_units_level2_returns_32_units
    # test_reserve_units_insufficient_balance_returns_false
    pass
```

---

## Hebrew Text Conventions

### User-Facing Messages

```typescript
const messages = {
  loading: "טוען...",
  error: "אירעה שגיאה, נסה שוב",
  success: "הפעולה בוצעה בהצלחה",
  confirm: "האם אתה בטוח?",
  cancel: "ביטול",
  save: "שמור",
  search: "חיפוש...",
  noResults: "לא נמצאו תוצאות",
};
```

### Status Labels

```typescript
const statusLabels = {
  pending: "ממתין",
  confirmed: "מאושר",
  in_progress: "בביצוע",
  completed: "הושלם",
  cancelled: "בוטל",
};
```

### Category Labels

```typescript
const categoryLabels = {
  health: "בריאות",
  fitness: "כושר גופני",
  social: "חברתי",
  culture: "תרבות",
  prevention: "מניעה",
};
```

---

## Git Commit Convention

```
feat(ai-agent): add Hebrew sentiment analysis
fix(marketplace): correct unit calculation for level 3
docs(api): update OpenAPI specification
test(shared): add JWT token validation tests
refactor(frontend): extract ServiceCard component
chore(deps): update React to 18.3.1
```
