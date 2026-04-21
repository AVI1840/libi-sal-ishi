"""
Mock Data Provider for MVP Demo.

Provides realistic demo data for elderly users in Israel.
All data is in Hebrew with appropriate cultural context.
"""

from datetime import datetime, date, timedelta
from typing import Any

from shared.constants import (
    MeaningTag,
    BookingStatus,
    ServiceCategory,
    AlertSeverity,
    HealthMetricType,
)
from ai_agent.memory.structured_memory import (
    UserMemory,
    FamilyMember,
    HealthBaseline,
    Preference,
    StructuredMemory,
    get_structured_memory,
)


# ===========================================
# Demo Users
# ===========================================

DEMO_USERS = {
    "user-sarah": {
        "user_id": "user-sarah",
        "first_name": "שרה",
        "preferred_name": "שרה'לה",
        "birth_date": datetime(1942, 3, 15),
        "city": "תל אביב",
        "nursing_level": 3,
        "preferred_language": "he",
        "speech_speed": 0.85,
        "meaning_tags": [MeaningTag.FAMILY, MeaningTag.HEALTH, MeaningTag.SOCIAL],
        "interests": ["סריגה", "בישול", "שיחות עם הנכדים", "צפייה בחדשות"],
        "topics_to_avoid": ["פוליטיקה", "מלחמה"],
        "preferred_call_times": ["09:00", "16:00"],
        "medical_conditions": ["יתר לחץ דם", "סוכרת סוג 2"],
        "medications": ["מטפורמין", "אמלודיפין"],
        "family_members": [
            {
                "name": "דני",
                "relation": "בן",
                "phone": "052-1234567",
                "notes": "מתקשר בדרך כלל בערב",
            },
            {
                "name": "מיכל",
                "relation": "בת",
                "phone": "054-9876543",
                "notes": "גרה בחיפה, מבקרת פעם בשבוע",
            },
            {
                "name": "יוסי",
                "relation": "נכד",
                "phone": None,
                "notes": "בן 12, אוהב לשחק במחשב",
            },
        ],
        "health_baselines": [
            {"metric_type": "heart_rate", "baseline_value": 72, "std_deviation": 8},
            {"metric_type": "blood_pressure_systolic", "baseline_value": 135, "std_deviation": 10},
            {"metric_type": "blood_pressure_diastolic", "baseline_value": 85, "std_deviation": 7},
            {"metric_type": "steps", "baseline_value": 3500, "std_deviation": 1000},
            {"metric_type": "sleep_hours", "baseline_value": 6.5, "std_deviation": 1},
        ],
        "memories": [
            {"content": "אוהבת לאכול ארוחת בוקר מוקדם, בערך ב-7 בבוקר", "category": "habit"},
            {"content": "הנכד יוסי יש לו יום הולדת ב-15 לפברואר", "category": "important_date"},
            {"content": "לא אוהבת לדבר על הבעל המנוח, נפטר לפני 3 שנים", "category": "sensitive"},
            {"content": "גדלה בטבריה ועברה לתל אביב אחרי החתונה", "category": "background"},
        ],
    },
    "user-yaakov": {
        "user_id": "user-yaakov",
        "first_name": "יעקב",
        "preferred_name": None,
        "birth_date": datetime(1938, 11, 22),
        "city": "הרצליה",
        "nursing_level": 4,
        "preferred_language": "he",
        "speech_speed": 0.8,
        "meaning_tags": [MeaningTag.INDEPENDENCE, MeaningTag.LEARNING, MeaningTag.LEGACY],
        "interests": ["שחמט", "קריאה", "היסטוריה", "שש-בש"],
        "topics_to_avoid": [],
        "preferred_call_times": ["10:00", "17:00"],
        "medical_conditions": ["אי ספיקת לב קלה", "כאבי גב כרוניים"],
        "medications": ["קונקור", "אופטלגין"],
        "family_members": [
            {
                "name": "רחל",
                "relation": "אישה",
                "phone": "050-5551234",
                "notes": "חיה יחד, סובלת מבעיות זיכרון קלות",
            },
            {
                "name": "אבי",
                "relation": "בן",
                "phone": "054-3332211",
                "notes": "גר בחו\"ל, מתקשר פעם בשבוע",
            },
        ],
        "health_baselines": [
            {"metric_type": "heart_rate", "baseline_value": 68, "std_deviation": 10},
            {"metric_type": "blood_pressure_systolic", "baseline_value": 145, "std_deviation": 12},
            {"metric_type": "steps", "baseline_value": 2000, "std_deviation": 800},
            {"metric_type": "sleep_hours", "baseline_value": 7, "std_deviation": 1.5},
        ],
        "memories": [
            {"content": "היה קצין בצבא, מאוד גאה בשירותו הצבאי", "category": "background"},
            {"content": "אוהב לשתות קפה טורקי בבוקר, בדיוק בשעה 8", "category": "habit"},
            {"content": "מרגיש בודד מאז שהבן עבר לחו\"ל לפני שנתיים", "category": "emotional"},
        ],
    },
    "user-miriam": {
        "user_id": "user-miriam",
        "first_name": "מרים",
        "preferred_name": "מירי",
        "birth_date": datetime(1945, 7, 8),
        "city": "רמת גן",
        "nursing_level": 2,
        "preferred_language": "he",
        "speech_speed": 0.95,
        "meaning_tags": [MeaningTag.CREATIVITY, MeaningTag.SOCIAL, MeaningTag.SPIRITUALITY],
        "interests": ["ציור", "גינון", "יוגה", "מפגשים חברתיים"],
        "topics_to_avoid": ["מחלות"],
        "preferred_call_times": ["08:00", "15:00"],
        "medical_conditions": ["אוסטאופורוזיס"],
        "medications": ["ויטמין D", "סידן"],
        "family_members": [
            {
                "name": "יונתן",
                "relation": "בן",
                "phone": "052-8887766",
                "notes": "גר קרוב, מבקר לעתים קרובות",
            },
            {
                "name": "נועה",
                "relation": "נכדה",
                "phone": "054-1112233",
                "notes": "סטודנטית לאמנות, מציירת יחד עם סבתא",
            },
        ],
        "health_baselines": [
            {"metric_type": "heart_rate", "baseline_value": 75, "std_deviation": 6},
            {"metric_type": "steps", "baseline_value": 5000, "std_deviation": 1200},
            {"metric_type": "sleep_hours", "baseline_value": 7.5, "std_deviation": 0.8},
        ],
        "memories": [
            {"content": "הייתה מורה לאמנות, יש לה תמונות בבית שציירה", "category": "background"},
            {"content": "הולכת ליוגה כל יום שלישי וחמישי בבוקר", "category": "routine"},
            {"content": "יום ההולדת שלה נחגג תמיד עם כל המשפחה בפארק הירקון", "category": "tradition"},
        ],
    },
}


# ===========================================
# Demo Health Readings
# ===========================================

def generate_health_readings(user_id: str, days: int = 7) -> list[dict]:
    """Generate mock health readings for a user."""
    import random

    user_data = DEMO_USERS.get(user_id)
    if not user_data:
        return []

    baselines = {b["metric_type"]: b for b in user_data.get("health_baselines", [])}
    readings = []

    for day_offset in range(days):
        reading_date = datetime.now() - timedelta(days=day_offset)

        for metric_type, baseline in baselines.items():
            base = baseline["baseline_value"]
            std = baseline["std_deviation"]

            # Generate realistic value with some variance
            value = base + random.gauss(0, std)

            # Add some anomalies for demo (10% chance)
            if random.random() < 0.1:
                value = base + (std * random.choice([-2.5, 2.5]))

            readings.append({
                "reading_id": f"reading-{user_id}-{day_offset}-{metric_type}",
                "user_id": user_id,
                "metric_type": metric_type,
                "value": round(value, 1),
                "recorded_at": reading_date.isoformat(),
                "source": "mock_wearable",
            })

    return readings


# ===========================================
# Demo Appointments
# ===========================================

DEMO_APPOINTMENTS = {
    "user-sarah": [
        {
            "id": "apt-001",
            "title": "פיזיותרפיה בבית",
            "time": "10:00",
            "provider": "יוסי כהן",
            "type": "health",
        },
        {
            "id": "apt-002",
            "title": "שיחת וידאו עם הנכד",
            "time": "16:00",
            "provider": "יוסי (נכד)",
            "type": "family",
        },
    ],
    "user-yaakov": [
        {
            "id": "apt-003",
            "title": "קבוצת שש-בש",
            "time": "14:00",
            "provider": "מתנ\"ס הרצליה",
            "type": "social",
        },
    ],
    "user-miriam": [
        {
            "id": "apt-004",
            "title": "שיעור יוגה",
            "time": "09:00",
            "provider": "סטודיו שלווה",
            "type": "wellness",
        },
        {
            "id": "apt-005",
            "title": "סדנת ציור",
            "time": "15:00",
            "provider": "בית יד לבנים",
            "type": "creative",
        },
    ],
}


# ===========================================
# Demo Wallet Data
# ===========================================

DEMO_WALLETS = {
    "user-sarah": {
        "wallet_id": "wallet-sarah",
        "user_id": "user-sarah",
        "nursing_level": 3,
        "total_units": 96,
        "available_units": 88,
        "reserved_units": 8,
        "optimal_aging_units": 2,
        "units_expire_at": "2025-04-15",
    },
    "user-yaakov": {
        "wallet_id": "wallet-yaakov",
        "user_id": "user-yaakov",
        "nursing_level": 4,
        "total_units": 128,
        "available_units": 115,
        "reserved_units": 13,
        "optimal_aging_units": 2,
        "units_expire_at": "2025-04-15",
    },
    "user-miriam": {
        "wallet_id": "wallet-miriam",
        "user_id": "user-miriam",
        "nursing_level": 2,
        "total_units": 64,
        "available_units": 58,
        "reserved_units": 6,
        "optimal_aging_units": 2,
        "units_expire_at": "2025-04-15",
    },
}


# ===========================================
# Demo Alerts
# ===========================================

DEMO_ALERTS = [
    {
        "alert_id": "alert-001",
        "user_id": "user-yaakov",
        "alert_type": "loneliness",
        "severity": "medium",
        "title": "ירידה במצב הרוח",
        "description": "זוהתה ירידה ברמת המעורבות וביטויי בדידות בשיחות האחרונות",
        "triggered_by": {"days_detected": 3, "sentiment_avg": -0.4},
        "status": "pending",
        "created_at": datetime.now() - timedelta(hours=6),
    },
    {
        "alert_id": "alert-002",
        "user_id": "user-sarah",
        "alert_type": "health",
        "severity": "low",
        "title": "כאבי גב חוזרים",
        "description": "שרה דיווחה על כאבי גב במשך 3 ימים רצופים",
        "triggered_by": {"symptom": "back_pain", "days": 3},
        "status": "acknowledged",
        "created_at": datetime.now() - timedelta(days=1),
    },
]


# ===========================================
# Mock Data Provider
# ===========================================

class MockDataProvider:
    """
    Provides mock data for the MVP demo.

    Populates the memory systems with realistic demo data.
    """

    def __init__(self):
        self._initialized = False

    def initialize(self) -> None:
        """Initialize mock data in memory systems."""
        if self._initialized:
            return

        memory = get_structured_memory()

        for user_id, user_data in DEMO_USERS.items():
            user = UserMemory(
                user_id=user_id,
                first_name=user_data["first_name"],
                preferred_name=user_data.get("preferred_name"),
                birth_date=user_data.get("birth_date"),
                city=user_data.get("city"),
                nursing_level=user_data.get("nursing_level"),
                preferred_language=user_data.get("preferred_language", "he"),
                speech_speed=user_data.get("speech_speed", 0.9),
                meaning_tags=user_data.get("meaning_tags", []),
                interests=user_data.get("interests", []),
                topics_to_avoid=user_data.get("topics_to_avoid", []),
                preferred_call_times=user_data.get("preferred_call_times", []),
                medical_conditions=user_data.get("medical_conditions", []),
                medications=user_data.get("medications", []),
            )

            # Add family members
            for fm_data in user_data.get("family_members", []):
                user.family_members.append(FamilyMember(
                    name=fm_data["name"],
                    relation=fm_data["relation"],
                    phone=fm_data.get("phone"),
                    notes=fm_data.get("notes"),
                ))

            # Add health baselines
            for hb_data in user_data.get("health_baselines", []):
                user.health_baselines.append(HealthBaseline(
                    metric_type=hb_data["metric_type"],
                    baseline_value=hb_data["baseline_value"],
                    std_deviation=hb_data.get("std_deviation", 0),
                ))

            # Add memories
            for mem in user_data.get("memories", []):
                user.add_memory(mem["content"], mem.get("category", "fact"))

            memory.update_user(user)

        self._initialized = True

    def get_user_appointments(self, user_id: str) -> list[dict]:
        """Get today's appointments for a user."""
        return DEMO_APPOINTMENTS.get(user_id, [])

    def get_user_wallet(self, user_id: str) -> dict | None:
        """Get wallet data for a user."""
        return DEMO_WALLETS.get(user_id)

    def get_health_readings(self, user_id: str, days: int = 7) -> list[dict]:
        """Get health readings for a user."""
        return generate_health_readings(user_id, days)

    def get_alerts(self, user_id: str | None = None) -> list[dict]:
        """Get alerts, optionally filtered by user."""
        if user_id:
            return [a for a in DEMO_ALERTS if a["user_id"] == user_id]
        return DEMO_ALERTS

    def get_demo_user_ids(self) -> list[str]:
        """Get list of demo user IDs."""
        return list(DEMO_USERS.keys())


# Global instance
_mock_provider: MockDataProvider | None = None


def get_mock_provider() -> MockDataProvider:
    """Get the global mock data provider."""
    global _mock_provider
    if _mock_provider is None:
        _mock_provider = MockDataProvider()
        _mock_provider.initialize()
    return _mock_provider
