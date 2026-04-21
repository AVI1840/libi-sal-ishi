# API Reference

## Overview

All APIs follow RESTful conventions with JSON responses.

**Base URLs:**

- AI Agent: `http://localhost:8000/api/v1`
- Marketplace: `http://localhost:8001/api/v1`
- Integration Gateway: `http://localhost:8002/api/v1`

**Authentication:**
All endpoints require `Authorization: Bearer <jwt_token>` header (except `/auth/*`).

---

## AI Agent API (`/api/v1`)

### Conversations

#### Start Conversation

```http
POST /conversations
```

**Request:**

```json
{
  "channel": "web",
  "initial_message": "שלום"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "conversation_id": "uuid",
    "message": {
      "role": "assistant",
      "content": "שלום! מה שלומך היום?",
      "audio_url": "https://..."
    }
  }
}
```

#### Send Message

```http
POST /conversations/{conversation_id}/messages
```

**Request:**

```json
{
  "content": "אני מחפש פעילות גופנית",
  "audio_base64": "optional base64 audio"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "message": {
      "role": "assistant",
      "content": "יש לי כמה אפשרויות מצוינות...",
      "audio_url": "https://...",
      "recommendations": [...]
    },
    "intent": "search_services",
    "entities": {"category": "fitness"}
  }
}
```

### Health Monitoring

#### Get Health Summary

```http
GET /health/summary
```

**Response:**

```json
{
  "success": true,
  "data": {
    "status": "normal",
    "metrics": {
      "heart_rate": { "value": 72, "status": "normal" },
      "steps_today": { "value": 3500, "status": "low" },
      "sleep_hours": { "value": 7.5, "status": "normal" }
    },
    "alerts": []
  }
}
```

#### Report Health Reading

```http
POST /health/readings
```

**Request:**

```json
{
  "metric_type": "blood_pressure",
  "value": 120,
  "unit": "mmHg",
  "recorded_at": "2026-01-07T10:00:00Z"
}
```

### Alerts

#### Get Alerts

```http
GET /alerts?status=pending&severity=high
```

#### Acknowledge Alert

```http
POST /alerts/{alert_id}/acknowledge
```

---

## Limor API (`/api/v1/limor`)

### Chat

#### Chat with Limor

```http
POST /limor/chat
```

**Request:**

```json
{
  "message": "בוקר טוב, איך אפשר לעזור לי היום?",
  "conversation_id": "uuid (optional)",
  "context_override": {
    "preferred_name": "יעקב",
    "persona_type": "warm_grandchild",
    "meaning_tags": ["family", "nature"]
  }
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "message": "בוקר טוב, יעקב יקיר! 😊 שמחה לראות אותך...",
    "conversation_id": "uuid",
    "emotional_state": {
      "primary_emotion": "neutral",
      "intensity": 0.3,
      "loneliness_detected": false
    },
    "suggested_actions": [],
    "is_emergency": false,
    "metadata": {
      "persona": "warm_grandchild",
      "should_save_memory": false
    }
  }
}
```

### Morning Briefing

#### Get Morning Briefing

```http
GET /limor/morning-briefing
```

**Response:**

```json
{
  "success": true,
  "data": {
    "content": {
      "greeting": "בוקר טוב, יעקב יקיר! 😊",
      "date_display": "יום רביעי, 9 בינואר",
      "weather_summary": "נעים ושמשי, 22°C",
      "appointments_today": [{ "time": "10:00", "title": "תור לרופא משפחה" }],
      "wallet_balance": 150,
      "wallet_balance_nis": 1800.0,
      "suggestions": ["הליכה קצרה בפארק - מזג האוויר מושלם!"],
      "follow_up_question": "איך ישנת הלילה? 😊"
    },
    "message_text": "Full formatted message...",
    "should_show": true
  }
}
```

### Intake Wizard

#### Get All Questions (Form Mode)

```http
GET /limor/intake/questions
```

**Response:**

```json
{
  "success": true,
  "data": {
    "questions": [
      {
        "question_id": "name",
        "question_text_he": "איך אני קוראת לך?",
        "question_type": "free_text",
        "required": true
      },
      {
        "question_id": "persona",
        "question_text_he": "איך את/ה מעדיף/ה שאדבר איתך?",
        "question_type": "single_choice",
        "options": [
          {
            "value": "warm_grandchild",
            "label_he": "כמו נכד/ה חם/ה",
            "icon": "💙"
          }
        ]
      }
    ],
    "total": 7
  }
}
```

#### Complete Intake (Form Mode)

```http
POST /limor/intake/complete
```

**Request:**

```json
{
  "answers": [
    { "question_id": "name", "answer": "יעקב" },
    { "question_id": "persona", "answer": "warm_grandchild" },
    { "question_id": "meaning_tags", "answer": ["family", "nature"] }
  ],
  "mode": "standalone"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "limor_settings": {
      "persona_type": "warm_grandchild",
      "preferred_name": "יעקב",
      "use_emojis": true,
      "morning_briefing_enabled": true
    },
    "standalone_profile": {...},
    "message_he": "מצוין! יצרתי לך פרופיל אישי. נתחיל לדבר?"
  }
}
```

#### Conversational Intake

```http
POST /limor/intake/conversational
```

**Request (Start):**

```json
{
  "message": null,
  "context": {}
}
```

**Request (Continue):**

```json
{
  "message": "קוראים לי יעקב",
  "context": { "step": "name" }
}
```

### Settings

#### Get Limor Settings

```http
GET /limor/settings
```

#### Update Settings

```http
PATCH /limor/settings
```

**Request:**

```json
{
  "persona_type": "efficient_assistant",
  "use_emojis": false,
  "morning_briefing_enabled": true
}
```

### Alerts (Case Manager)

#### Get Limor Alerts

```http
GET /limor/alerts?status_filter=pending&limit=20
```

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "alert_id": "alert_001",
      "user_id": "user_123",
      "user_name": "משה כהן",
      "alert_type": "loneliness",
      "severity": "medium",
      "title": "זוהתה בדידות",
      "description": "המשתמש הביע רגשות של בדידות בשיחה",
      "detected_at": "2026-01-09T10:00:00Z",
      "recommended_action": "להציע פעילות חברתית",
      "status": "pending"
    }
  ]
}
```

#### Acknowledge Alert

```http
PATCH /limor/alerts/{alert_id}/acknowledge
```

#### Resolve Alert

```http
PATCH /limor/alerts/{alert_id}/resolve
```

**Request:**

```json
{
  "resolution_notes": "נוצר קשר עם המשתמש והוזמן לפעילות חברתית"
}
```

---

## Marketplace API (`/api/v1`)

### Wallets

#### Get Wallet

```http
GET /wallets/{user_id}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "wallet_id": "uuid",
    "nursing_level": 3,
    "total_units": 42,
    "available_units": 38,
    "reserved_units": 4,
    "optimal_aging_units": 2,
    "units_expire_at": "2026-02-01"
  }
}
```

#### Get Wallet Transactions

```http
GET /wallets/{wallet_id}/transactions?limit=20&offset=0
```

### Services

#### List Services

```http
GET /services?category=health&page=1&limit=20
```

**Query Parameters:**

- `category`: health, fitness, social, culture, prevention
- `min_nursing_level`: 1-6
- `is_optimal_aging`: true/false
- `search`: text search

**Response:**

```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "pages": 8
  }
}
```

#### Get Service Details

```http
GET /services/{service_id}
```

### Bookings

#### Create Booking

```http
POST /bookings
```

**Request:**

```json
{
  "service_id": "uuid",
  "scheduled_datetime": "2026-01-10T14:00:00Z",
  "notes": "optional notes"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "booking_id": "uuid",
    "status": "pending",
    "units_cost": 3,
    "wallet_balance_after": 35
  }
}
```

#### List User Bookings

```http
GET /bookings?status=confirmed&upcoming=true
```

#### Update Booking Status

```http
PATCH /bookings/{booking_id}
```

**Request:**

```json
{
  "status": "confirmed"
}
```

#### Cancel Booking

```http
POST /bookings/{booking_id}/cancel
```

### Vendors

#### Get Vendor Profile

```http
GET /vendors/{vendor_id}
```

#### List Vendor Services

```http
GET /vendors/{vendor_id}/services
```

#### Vendor Bookings (Vendor Auth)

```http
GET /vendors/me/bookings?status=pending
```

#### Update Booking (Vendor)

```http
POST /vendors/me/bookings/{booking_id}/confirm
POST /vendors/me/bookings/{booking_id}/complete
```

---

## Integration Gateway API (`/api/v1`)

### User Sync

#### Sync User Data

```http
POST /sync/users/{user_id}
```

### Webhooks

#### AI Agent Events

```http
POST /webhooks/ai-agent
```

**Events:**

- `alert.created`
- `conversation.ended`
- `recommendation.made`

#### Marketplace Events

```http
POST /webhooks/marketplace
```

**Events:**

- `booking.created`
- `booking.confirmed`
- `booking.completed`
- `wallet.low_balance`

---

## Authentication API

### Login

```http
POST /auth/login
```

**Request:**

```json
{
  "teudat_zehut": "123456789",
  "phone": "0501234567"
}
```

**Response:**

```json
{
  "access_token": "jwt...",
  "refresh_token": "jwt...",
  "token_type": "bearer",
  "expires_in": 3600
}
```

### Refresh Token

```http
POST /auth/refresh
```

**Request:**

```json
{
  "refresh_token": "jwt..."
}
```

### Logout

```http
POST /auth/logout
```

---

## Error Response Format

```json
{
  "success": false,
  "error": {
    "code": "INSUFFICIENT_UNITS",
    "message": "אין מספיק יחידות בארנק",
    "details": {
      "required": 5,
      "available": 3
    }
  },
  "meta": {
    "timestamp": "2026-01-07T10:00:00Z",
    "request_id": "uuid"
  }
}
```

## Common Error Codes

| Code                 | HTTP | Description              |
| -------------------- | ---- | ------------------------ |
| `UNAUTHORIZED`       | 401  | Missing or invalid token |
| `FORBIDDEN`          | 403  | Insufficient permissions |
| `NOT_FOUND`          | 404  | Resource not found       |
| `VALIDATION_ERROR`   | 422  | Invalid request data     |
| `INSUFFICIENT_UNITS` | 400  | Not enough wallet units  |
| `BOOKING_CONFLICT`   | 409  | Time slot unavailable    |
| `RATE_LIMITED`       | 429  | Too many requests        |
