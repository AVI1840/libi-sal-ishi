# Data Models

## PostgreSQL Schemas

### Schema: `shared`

#### users

```sql
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
    preferences JSONB DEFAULT '{}',
    emergency_contacts JSONB DEFAULT '[]',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE
);
```

#### family_members

```sql
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

#### audit_log

```sql
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
    result VARCHAR(20)
);
```

---

### Schema: `ai_agent`

#### conversations

```sql
CREATE TABLE ai_agent.conversations (
    conversation_id UUID PRIMARY KEY,
    user_id UUID REFERENCES shared.users(user_id),
    channel VARCHAR(50) DEFAULT 'web',
    started_at TIMESTAMPTZ DEFAULT NOW(),
    ended_at TIMESTAMPTZ,
    summary TEXT,
    sentiment_avg FLOAT,
    metadata JSONB DEFAULT '{}'
);
```

#### messages

```sql
CREATE TABLE ai_agent.messages (
    message_id UUID PRIMARY KEY,
    conversation_id UUID REFERENCES ai_agent.conversations,
    role VARCHAR(20) NOT NULL,  -- user, assistant, system
    content TEXT NOT NULL,
    sentiment_score FLOAT,
    intent VARCHAR(100),
    entities JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### health_readings

```sql
CREATE TABLE ai_agent.health_readings (
    reading_id UUID PRIMARY KEY,
    user_id UUID REFERENCES shared.users(user_id),
    metric_type VARCHAR(50) NOT NULL,  -- heart_rate, steps, sleep_hours
    value FLOAT NOT NULL,
    unit VARCHAR(20),
    recorded_at TIMESTAMPTZ NOT NULL,
    source VARCHAR(50) DEFAULT 'manual'
);
```

#### alerts

```sql
CREATE TABLE ai_agent.alerts (
    alert_id UUID PRIMARY KEY,
    user_id UUID REFERENCES shared.users(user_id),
    alert_type VARCHAR(50) NOT NULL,  -- health, cognitive, loneliness
    severity VARCHAR(20) NOT NULL,    -- low, medium, high, critical
    title VARCHAR(255) NOT NULL,
    description TEXT,
    triggered_by JSONB,
    status VARCHAR(20) DEFAULT 'pending',
    notified_family BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    resolved_at TIMESTAMPTZ
);
```

---

### Schema: `marketplace`

#### wallets

```sql
CREATE TABLE marketplace.wallets (
    wallet_id UUID PRIMARY KEY,
    user_id UUID REFERENCES shared.users(user_id) UNIQUE,
    nursing_level INT CHECK (nursing_level BETWEEN 1 AND 6),
    total_units INT NOT NULL,
    available_units INT NOT NULL,
    reserved_units INT DEFAULT 0,
    optimal_aging_units INT DEFAULT 0,
    units_expire_at DATE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### vendors

```sql
CREATE TABLE marketplace.vendors (
    vendor_id UUID PRIMARY KEY,
    business_name VARCHAR(255) NOT NULL,
    license_number VARCHAR(100),
    contact_name VARCHAR(100),
    phone VARCHAR(20),
    email VARCHAR(255),
    service_areas VARCHAR[],
    bank_account JSONB,
    rating FLOAT DEFAULT 0,
    is_verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE
);
```

#### services

```sql
CREATE TABLE marketplace.services (
    service_id UUID PRIMARY KEY,
    vendor_id UUID REFERENCES marketplace.vendors,
    category VARCHAR(100) NOT NULL,
    title VARCHAR(255) NOT NULL,
    title_he VARCHAR(255),
    description TEXT,
    unit_cost INT NOT NULL,
    duration_minutes INT,
    is_optimal_aging BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE
);
```

#### bookings

```sql
CREATE TABLE marketplace.bookings (
    booking_id UUID PRIMARY KEY,
    user_id UUID REFERENCES shared.users(user_id),
    wallet_id UUID REFERENCES marketplace.wallets,
    service_id UUID REFERENCES marketplace.services,
    vendor_id UUID REFERENCES marketplace.vendors,
    status VARCHAR(30) DEFAULT 'pending',
    scheduled_datetime TIMESTAMPTZ NOT NULL,
    units_cost INT NOT NULL,
    ai_booked BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## Frontend Data Structures

### Client (TypeScript)

```typescript
interface Client {
  id: string;
  name: string;
  age: number;
  city: string;
  functionalProfile: FunctionalProfile;
  walletBalance: number;
  walletUsed: number;
  walletTotal: number;
  nursingLevel: number; // 1-6
  totalUnits: number;
  availableUnits: number;
  status: "green" | "yellow" | "red";
  lastActivity: string;
  preferences: string[];
  goals: string[];
  phone: string;
}

interface FunctionalProfile {
  mobility: FunctionalLevel;
  dailyFunction: FunctionalLevel;
  cognition: FunctionalLevel;
  emotional: FunctionalLevel;
}

type FunctionalLevel = "independent" | "partial" | "significant";
```

### Service (TypeScript)

```typescript
interface Service {
  id: string;
  name: string;
  shortDesc: string;
  longDesc: string;
  price: number;
  unitCost: number;
  fundingSource: "סל" | "ביטוח" | "פרטי" | "סל+ביטוח";
  category: "health" | "fitness" | "social" | "culture" | "prevention";
  tags: string[];
  rating: number;
  reviews: number;
  imageUrl: string;
  distanceMinutes: number;
  communityCount: number;
  vendorId?: string;
  vendorName?: string;
}
```

### Booking (TypeScript)

```typescript
interface Booking {
  id: string;
  serviceId: string;
  serviceName: string;
  clientId: string;
  clientName: string;
  vendorId: string;
  vendorName: string;
  date: string;
  time: string;
  scheduledDate: string; // ISO datetime
  status: "pending" | "confirmed" | "in_progress" | "completed" | "cancelled";
  price: number;
  unitsCost: number;
  notes?: string;
}
```

### Vendor (TypeScript)

```typescript
interface Vendor {
  id: string;
  businessName: string;
  contactName: string;
  email: string;
  phone: string;
  services: Service[];
  rating: number;
  totalBookings: number;
  pendingPayments: number;
  isVerified: boolean;
  serviceAreas: string[];
}
```

### Alert (TypeScript)

```typescript
interface Alert {
  id: string;
  clientId: string;
  type: "health" | "cognitive" | "loneliness" | "wallet" | "activity";
  severity: "low" | "medium" | "high" | "critical";
  title: string;
  description: string;
  createdAt: Date;
  isRead: boolean;
  isResolved: boolean;
}
```
