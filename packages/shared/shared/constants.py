"""
Common constants used across the Lev (לב) Optimal Aging OS.
Based on Israeli Government Decision for Optimal Aging.
"""

from enum import Enum


# ===========================================
# User Roles
# ===========================================

class UserRole(str, Enum):
    """User roles for RBAC."""
    SENIOR = "senior"
    FAMILY = "family"
    CASE_MANAGER = "case_manager"        # מתאמת שירות
    COMMUNITY_PROVIDER = "community_provider"  # ספק קהילה
    VENDOR = "vendor"
    AUTHORITY_MANAGER = "authority_manager"  # מנהל רשות
    SYSTEM_OPERATOR = "system_operator"      # מפעיל מערכת
    ADMIN = "admin"


# ===========================================
# Content Worlds (עולמות תוכן) - Per Government Decision
# ===========================================

class ContentWorld(str, Enum):
    """Content worlds based on Israeli Government Optimal Aging Decision."""
    BELONGING_MEANING = "belonging_meaning"          # שייכות ומשמעות
    HEALTH_FUNCTION = "health_function"              # בריאות ותפקוד
    RESILIENCE = "resilience"                        # חוסן ועצמאות
    ASSISTIVE_TECH = "assistive_tech"                # מוצרים וטכנולוגיה מסייעת
    HOME_SERVICES = "home_services"                  # שירותי בית


# Hebrew labels for content worlds (for UI display)
CONTENT_WORLD_LABELS_HE: dict[str, str] = {
    ContentWorld.BELONGING_MEANING.value: "שייכות ומשמעות",
    ContentWorld.HEALTH_FUNCTION.value: "בריאות ותפקוד",
    ContentWorld.RESILIENCE.value: "חוסן ועצמאות",
    ContentWorld.ASSISTIVE_TECH.value: "מוצרים וטכנולוגיה מסייעת",
    ContentWorld.HOME_SERVICES.value: "שירותי בית",
}


# ===========================================
# Subsidy Tiers (טיירי סבסוד)
# ===========================================

class SubsidyTier(str, Enum):
    """Subsidy tiers for the dynamic subsidy engine."""
    FULL = "full"           # 100% - Core prevention services (free)
    PARTIAL = "partial"     # 50% - Quality of life services
    MINIMAL = "minimal"     # 20% - Comfort/home services
    NONE = "none"           # 0% - Private/out-of-pocket


# Subsidy tier base percentages
SUBSIDY_TIER_PERCENTAGES: dict[str, float] = {
    SubsidyTier.FULL.value: 1.0,      # 100%
    SubsidyTier.PARTIAL.value: 0.5,   # 50%
    SubsidyTier.MINIMAL.value: 0.2,   # 20%
    SubsidyTier.NONE.value: 0.0,      # 0%
}


# Content world to default subsidy tier mapping
CONTENT_WORLD_DEFAULT_SUBSIDY: dict[str, str] = {
    ContentWorld.BELONGING_MEANING.value: SubsidyTier.FULL.value,
    ContentWorld.HEALTH_FUNCTION.value: SubsidyTier.FULL.value,
    ContentWorld.RESILIENCE.value: SubsidyTier.PARTIAL.value,
    ContentWorld.ASSISTIVE_TECH.value: SubsidyTier.PARTIAL.value,
    ContentWorld.HOME_SERVICES.value: SubsidyTier.MINIMAL.value,
}


# ===========================================
# Meaning Tags (תגיות משמעות)
# ===========================================

class MeaningTag(str, Enum):
    """Tags representing what brings meaning to the user's life."""
    MUSIC = "music"                    # מוזיקה
    NATURE = "nature"                  # טבע
    FAITH = "faith"                    # אמונה ורוחניות
    FAMILY = "family"                  # משפחה
    VOLUNTEERING = "volunteering"      # התנדבות
    ART = "art"                        # אומנות ויצירה
    LEARNING = "learning"              # למידה
    SOCIAL = "social"                  # חיים חברתיים
    COOKING = "cooking"                # בישול
    GARDENING = "gardening"            # גינון
    PETS = "pets"                      # חיות
    SPORTS = "sports"                  # ספורט
    TECHNOLOGY = "technology"          # טכנולוגיה
    GRANDCHILDREN = "grandchildren"    # נכדים


MEANING_TAG_LABELS_HE: dict[str, str] = {
    MeaningTag.MUSIC.value: "מוזיקה",
    MeaningTag.NATURE.value: "טבע",
    MeaningTag.FAITH.value: "אמונה ורוחניות",
    MeaningTag.FAMILY.value: "משפחה",
    MeaningTag.VOLUNTEERING.value: "התנדבות",
    MeaningTag.ART.value: "אומנות ויצירה",
    MeaningTag.LEARNING.value: "למידה",
    MeaningTag.SOCIAL.value: "חיים חברתיים",
    MeaningTag.COOKING.value: "בישול",
    MeaningTag.GARDENING.value: "גינון",
    MeaningTag.PETS.value: "חיות",
    MeaningTag.SPORTS.value: "ספורט",
    MeaningTag.TECHNOLOGY.value: "טכנולוגיה",
    MeaningTag.GRANDCHILDREN.value: "נכדים",
}


# ===========================================
# ICF Profile (International Classification of Functioning)
# Simplified for non-clinical intake
# ===========================================

class MobilityLevel(str, Enum):
    """ICF D450 - Walking capability (simplified)."""
    INDEPENDENT = "independent"        # הולך/ת בעצמאות
    ASSISTED_DEVICE = "assisted_device" # משתמש/ת בעזר הליכה
    HUMAN_ASSISTED = "human_assisted"  # צריך/ה עזרה מאדם


class SensoryLevel(str, Enum):
    """ICF D310 - Sensory capability (simplified)."""
    INTACT = "intact"                  # שמיעה/ראייה תקינה
    HEARING_IMPAIRED = "hearing_impaired"  # לקות שמיעה
    VISUAL_IMPAIRED = "visual_impaired"    # לקות ראייה
    BOTH_IMPAIRED = "both_impaired"    # שניהם


class DigitalLiteracyLevel(str, Enum):
    """Digital literacy level."""
    NONE = "none"                      # לא משתמש/ת בטכנולוגיה
    BASIC = "basic"                    # שימוש בסיסי (שיחות, הודעות)
    ADVANCED = "advanced"              # שימוש מתקדם


# ===========================================
# Personas (פרסונות) - For case manager view
# Generated from intake data, not shown to senior
# ===========================================

class PersonaType(str, Enum):
    """Persona types derived from intake data."""
    SOCIAL_BUTTERFLY = "social_butterfly"    # חברותי - אוהב פעילויות חברתיות
    SECURITY_SEEKER = "security_seeker"      # מעדיף ביטחון ושגרה
    INDEPENDENT_SPIRIT = "independent_spirit" # עצמאי - רוצה לשמור על עצמאות
    FAMILY_ORIENTED = "family_oriented"      # ממוקד משפחה
    LEARNER = "learner"                      # אוהב ללמוד דברים חדשים
    CAREGIVER = "caregiver"                  # אוהב לעזור לאחרים


# Non-offensive labels for case managers
PERSONA_DISPLAY_LABELS_HE: dict[str, str] = {
    PersonaType.SOCIAL_BUTTERFLY.value: "נהנה/ית מפעילות חברתית",
    PersonaType.SECURITY_SEEKER.value: "מעדיף/ה ביטחון ושגרה",
    PersonaType.INDEPENDENT_SPIRIT.value: "שואף/ת לשמור על עצמאות",
    PersonaType.FAMILY_ORIENTED.value: "קשר משפחתי חשוב מאוד",
    PersonaType.LEARNER.value: "אוהב/ת ללמוד דברים חדשים",
    PersonaType.CAREGIVER.value: "אוהב/ת לעזור לאחרים",
}


# ===========================================
# Risk Flags (דגלי סיכון)
# Non-offensive display labels
# ===========================================

class RiskFlagType(str, Enum):
    """Risk flag types for proactive care."""
    LONELINESS = "loneliness"              # חשוד בדידות
    FALL_RISK = "fall_risk"                # סיכון נפילה
    RECENT_HOSPITALIZATION = "recent_hospitalization"  # אשפוז אחרון
    COGNITIVE_DECLINE = "cognitive_decline"  # ירידה קוגניטיבית
    FINANCIAL_RISK = "financial_risk"      # סיכון כלכלי
    INACTIVE = "inactive"                  # לא פעיל (21+ יום)


RISK_FLAG_DISPLAY_LABELS_HE: dict[str, str] = {
    RiskFlagType.LONELINESS.value: "ייהנה מפעילות חברתית",
    RiskFlagType.FALL_RISK.value: "חשוב לוודא נגישות",
    RiskFlagType.RECENT_HOSPITALIZATION.value: "דורש מעקב צמוד",
    RiskFlagType.COGNITIVE_DECLINE.value: "מתאים לפעילות קוגניטיבית",
    RiskFlagType.FINANCIAL_RISK.value: "כדאי לבדוק זכויות",
    RiskFlagType.INACTIVE.value: "דורש יצירת קשר",
}


# ===========================================
# CRM Action Types (פעולות מומלצות)
# ===========================================

class CRMActionType(str, Enum):
    """Types of proactive CRM actions."""
    SILENT_USER = "silent_user"            # משתמש שקט (21+ יום)
    LONELINESS_INTERVENTION = "loneliness_intervention"  # התערבות בדידות
    BIRTHDAY_GIFT = "birthday_gift"        # שובר מתנה ליום הולדת
    EXPIRING_BALANCE = "expiring_balance"  # יתרה עומדת לפוג
    LOW_BALANCE = "low_balance"            # יתרה נמוכה
    FOLLOW_UP = "follow_up"                # מעקב אחרי שירות
    REACTIVATION = "reactivation"          # הפעלה מחדש


CRM_ACTION_LABELS_HE: dict[str, str] = {
    CRMActionType.SILENT_USER.value: "משתמש שקט - ליצור קשר",
    CRMActionType.LONELINESS_INTERVENTION.value: "להציע פעילות חברתית",
    CRMActionType.BIRTHDAY_GIFT.value: "לשלוח שובר מתנה ליום הולדת",
    CRMActionType.EXPIRING_BALANCE.value: "יתרה עומדת לפוג",
    CRMActionType.LOW_BALANCE.value: "יתרה נמוכה",
    CRMActionType.FOLLOW_UP.value: "מעקב אחרי שירות",
    CRMActionType.REACTIVATION.value: "הפעלה מחדש של אזרח",
}


# ===========================================
# Nursing Levels
# ===========================================

class NursingLevel(int, Enum):
    """Israeli nursing care levels (1-6)."""
    LEVEL_1 = 1
    LEVEL_2 = 2
    LEVEL_3 = 3
    LEVEL_4 = 4
    LEVEL_5 = 5
    LEVEL_6 = 6


# Nursing level to monthly hours mapping (Bituach Leumi)
NURSING_LEVEL_HOURS: dict[int, float] = {
    1: 9.5,
    2: 16.0,
    3: 21.5,
    4: 30.0,   # Estimated for levels 4-6
    5: 40.0,
    6: 50.0,
}

# Nursing level to digital units conversion (2 hours = 1 unit, rounded up)
NURSING_LEVEL_UNITS: dict[int, int] = {
    1: 19,   # 9.5 hours -> 19 units
    2: 32,   # 16 hours -> 32 units
    3: 43,   # 21.5 hours -> 43 units
    4: 60,   # 30 hours -> 60 units
    5: 80,   # 40 hours -> 80 units
    6: 100,  # 50 hours -> 100 units
}


# ===========================================
# Service Categories (Legacy - for backward compatibility)
# ===========================================

class ServiceCategory(str, Enum):
    """Service categories in the marketplace."""
    PHYSIOTHERAPY = "physiotherapy"
    SOCIAL_ACTIVITY = "social_activity"
    NURSING = "nursing"
    WELLNESS = "wellness"
    MEDICAL_DEVICE = "medical_device"
    TRANSPORTATION = "transportation"
    HOME_CARE = "home_care"
    MENTAL_HEALTH = "mental_health"
    # New categories for Lev
    FALL_PREVENTION = "fall_prevention"
    COGNITIVE_TRAINING = "cognitive_training"
    SOCIAL_CLUB = "social_club"
    VOLUNTEERING = "volunteering"
    EMERGENCY_TECH = "emergency_tech"


class ServiceSubcategory(str, Enum):
    """Service subcategories."""
    HOME_VISIT = "home_visit"
    CENTER_BASED = "center_based"
    DIGITAL = "digital"
    GROUP = "group"
    INDIVIDUAL = "individual"
    OUTDOOR = "outdoor"


# ===========================================
# Service Tags (for matching)
# ===========================================

class ServiceTag(str, Enum):
    """Tags for service matching and filtering."""
    SOCIAL = "social"
    PHYSICAL = "physical"
    COGNITIVE = "cognitive"
    EMOTIONAL = "emotional"
    PREVENTIVE = "preventive"
    HOME_BASED = "home_based"
    CENTER_BASED = "center_based"
    OUTDOOR = "outdoor"
    MORNING = "morning"
    EVENING = "evening"
    ACCESSIBLE = "accessible"
    HEARING_FRIENDLY = "hearing_friendly"
    VISION_FRIENDLY = "vision_friendly"


# ===========================================
# Booking Status
# ===========================================

class BookingStatus(str, Enum):
    """Booking lifecycle statuses."""
    PENDING = "pending"
    CONFIRMED = "confirmed"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    CANCELLED = "cancelled"
    NO_SHOW = "no_show"


# ===========================================
# Transaction Types
# ===========================================

class TransactionType(str, Enum):
    """Types of wallet transactions."""
    RESERVE = "reserve"         # Units reserved for pending booking
    COMPLETE = "complete"       # Units deducted after service completed
    CANCEL = "cancel"          # Reserved units returned
    REFUND = "refund"          # Units returned after dispute
    EXPIRE = "expire"          # Units expired
    ALLOCATE = "allocate"      # Monthly units allocated


class TransactionStatus(str, Enum):
    """Transaction statuses."""
    PENDING = "pending"
    COMPLETED = "completed"
    FAILED = "failed"
    REVERSED = "reversed"


# ===========================================
# Alert Types
# ===========================================

class AlertType(str, Enum):
    """Types of alerts from AI Agent."""
    HEALTH = "health"
    COGNITIVE = "cognitive"
    LONELINESS = "loneliness"
    EMERGENCY = "emergency"
    ACTIVITY = "activity"
    MEDICATION = "medication"


class AlertSeverity(str, Enum):
    """Alert severity levels."""
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class AlertStatus(str, Enum):
    """Alert statuses."""
    PENDING = "pending"
    ACKNOWLEDGED = "acknowledged"
    RESOLVED = "resolved"
    ESCALATED = "escalated"


# ===========================================
# Health Metrics
# ===========================================

class HealthMetricType(str, Enum):
    """Types of health metrics tracked."""
    HEART_RATE = "heart_rate"
    BLOOD_PRESSURE_SYSTOLIC = "blood_pressure_systolic"
    BLOOD_PRESSURE_DIASTOLIC = "blood_pressure_diastolic"
    BLOOD_GLUCOSE = "blood_glucose"
    STEPS = "steps"
    SLEEP_HOURS = "sleep_hours"
    WEIGHT = "weight"
    TEMPERATURE = "temperature"


# ===========================================
# Conversation
# ===========================================

class ConversationChannel(str, Enum):
    """Communication channels."""
    WEB = "web"
    WHATSAPP = "whatsapp"
    VOICE = "voice"
    SMS = "sms"


class MessageRole(str, Enum):
    """Message roles in conversation."""
    USER = "user"
    ASSISTANT = "assistant"
    SYSTEM = "system"


# ===========================================
# Languages
# ===========================================

class Language(str, Enum):
    """Supported languages."""
    HEBREW = "hebrew"
    ARABIC = "arabic"
    ENGLISH = "english"
    RUSSIAN = "russian"


# Default language
DEFAULT_LANGUAGE = Language.HEBREW


# ===========================================
# Hebrew Emergency Keywords
# ===========================================

EMERGENCY_KEYWORDS_HEBREW = [
    "חזה כואב",          # chest pain
    "כאב בחזה",          # pain in chest
    "לא יכול לנשום",     # can't breathe
    "קשה לנשום",         # hard to breathe
    "נפלתי",             # I fell
    "נפילה",             # fall
    "לא רוצה לחיות",     # don't want to live
    "רוצה למות",         # want to die
    "עזרה",              # help
    "הצילו",             # save me
    "שבץ",               # stroke
    "התקף לב",           # heart attack
    "אני מדמם",          # I'm bleeding
    "דימום",             # bleeding
    "איבדתי הכרה",       # lost consciousness
    "התעלפתי",           # I fainted
]

# Loneliness indicators
LONELINESS_KEYWORDS_HEBREW = [
    "לבד",               # alone
    "בודד",              # lonely
    "אף אחד לא מתקשר",   # no one calls
    "משעמם",             # boring
    "אין לי עם מי לדבר", # no one to talk to
    "גלמוד",             # isolated
    "עצוב",              # sad
    "מדוכא",             # depressed
]

# Cognitive concern indicators
COGNITIVE_KEYWORDS_HEBREW = [
    "שכחתי",             # I forgot
    "לא זוכר",           # don't remember
    "מבולבל",            # confused
    "איפה אני",          # where am I
    "מי את",             # who are you (female)
    "מי אתה",            # who are you (male)
    "איזה יום היום",     # what day is it
]


# ===========================================
# API Pagination
# ===========================================

DEFAULT_PAGE_SIZE = 20
MAX_PAGE_SIZE = 100


# ===========================================
# Rate Limiting
# ===========================================

RATE_LIMIT_PER_USER = 100      # requests per minute
RATE_LIMIT_PER_IP = 1000       # requests per minute
RATE_LIMIT_AUTH = 10           # auth attempts per minute


# ===========================================
# KPI Thresholds (for dashboard)
# ===========================================

KPI_THRESHOLDS = {
    "silent_user_days": 21,         # Days without activity to flag as silent
    "low_balance_percentage": 0.15, # 15% remaining balance triggers alert
    "expiring_balance_days": 14,    # Days before expiry to alert
    "loneliness_score_threshold": 4,  # Score below this triggers lonely flag
    "vendor_rating_warning": 3.5,   # Vendor rating below this triggers review
    "prevention_target_percentage": 0.6,  # Target 60% prevention services
    "escalation_urgent_hours": 72,  # 72 hours (3 days) for URGENT escalation
    "escalation_high_hours": 168,   # 168 hours (1 week) for HIGH escalation
}


# ===========================================
# Recommendation Weights
# ===========================================

RECOMMENDATION_WEIGHTS = {
    "prevention_value": 0.40,      # Prevention services get highest weight
    "meaning_match": 0.30,         # Match with user's meaning tags
    "proximity": 0.20,             # Distance from user's location
    "social_proof": 0.10,          # Community popularity
}

RECOMMENDATION_WEIGHTS_MEANING_MULTIPLIER = 1.5  # Meaning tags get 50% boost


# ===========================================
# Subsidy Booster Amounts
# ===========================================

SUBSIDY_BOOSTERS = {
    "income_supplement": 0.20,     # +20% for income supplement recipients
    "loneliness_group": 0.20,      # +20% for lonely users on group activities
}

SUBSIDY_MAX_PERCENTAGE = 1.0  # Cap at 100%
