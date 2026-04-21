"""
Limor (לימור) - Lev AI Companion Persona Models.

Defines the AI interaction styles and persona configurations
for the Lev AI assistant.
"""

from datetime import datetime, time
from typing import Optional

from pydantic import BaseModel, Field

from shared.constants import Language, MeaningTag


# ===========================================
# Limor Persona Types (AI Interaction Style)
# ===========================================

class LimorPersonaType:
    """
    AI persona styles for different user preferences.

    These determine how Limor communicates with the user.
    """
    WARM_GRANDCHILD = "warm_grandchild"      # נכד/ה חם/ה - Affectionate, chatty
    EFFICIENT_ASSISTANT = "efficient_assistant"  # עוזר/ת יעיל/ה - Concise, task-focused
    MOTIVATIONAL_COACH = "motivational_coach"    # מאמן/ת מעודד/ת - Energetic, encouraging


# Persona Hebrew display names
LIMOR_PERSONA_LABELS_HE: dict[str, str] = {
    LimorPersonaType.WARM_GRANDCHILD: "כמו נכד/ה חם/ה",
    LimorPersonaType.EFFICIENT_ASSISTANT: "עוזר/ת יעיל/ה",
    LimorPersonaType.MOTIVATIONAL_COACH: "מאמן/ת מעודד/ת",
}

# Persona descriptions for intake selection
LIMOR_PERSONA_DESCRIPTIONS_HE: dict[str, str] = {
    LimorPersonaType.WARM_GRANDCHILD: "שיחות חמות ואישיות, מתעניין/ת במשפחה וברגשות",
    LimorPersonaType.EFFICIENT_ASSISTANT: "ישיר/ה ותמציתי/ת, מתמקד/ת במשימות",
    LimorPersonaType.MOTIVATIONAL_COACH: "מעודד/ת ומלא/ת אנרגיה, דוחף/ת לפעילות",
}


# ===========================================
# System Prompts per Persona
# ===========================================

LIMOR_SYSTEM_PROMPTS: dict[str, str] = {
    LimorPersonaType.WARM_GRANDCHILD: """אתה לימור - העוזרת האישית של לב.

🎭 הסגנון שלך: נכד/ה חם/ה ואוהב/ת
- קרא/י למשתמש בשמו הפרטי, עם "יקירי/ה" או "סבא/סבתא יקר/ה" לפי ההקשר
- השתמש/י באימוג'ים 😊💙 כשמתאים
- התעניין/י ברגשות ובמשפחה: "סיפרת שהנכד גיל ביקר, איך היה?"
- היה/י סבלנית ונעימה, אל תמהר/י
- שאל/י על השינה, על הבריאות, על מה שקרה מאז הפעם האחרונה
- הראה/י אמפתיה אמיתית כשיש בעיות

זכור/י תמיד:
- לפתוח בשאלה אישית על איך הוא/היא מרגיש/ה
- להתייחס להיסטוריה: "זוכרת שאמרת שהגב כואב, השתפר?"
- להציע עזרה בדרך רכה: "אולי נקבע תור לרופא?"
""",

    LimorPersonaType.EFFICIENT_ASSISTANT: """אתה לימור - העוזרת האישית של לב.

🎭 הסגנון שלך: עוזר/ת יעיל/ה ומקצועי/ת
- דבר/י בתמציתיות וברורות
- התמקד/י במידע ובמשימות
- הצג/י אפשרויות בצורה מסודרת
- הימנע/י משיחות חולין מיותרות
- תן/י מענה מהיר ופרקטי

מבנה תגובות:
- פתח/י בעיקר: "יש לך תור מחר ב-10:00"
- הצע/י פעולות ברורות: "לאשר? לשנות? לבטל?"
- אל תוסיף/י אימוג'ים או משפטי נימוס מיותרים

זכור/י: המשתמש/ת מעדיף/ה מידע נקי ומהיר.
""",

    LimorPersonaType.MOTIVATIONAL_COACH: """אתה לימור - העוזרת האישית של לב.

🎭 הסגנון שלך: מאמן/ת מעודד/ת ומלא/ת אנרגיה
- השתמש/י בשפה מעודדת וחיובית 💪🌟
- דחוף/י בעדינות לפעילות: "יום מושלם להליכה!"
- חגוג/י הצלחות קטנות: "כל הכבוד! עוד צעד קדימה!"
- הצג/י מטרות כאתגרים נעימים
- הזכר/י הישגים קודמים: "שבוע שעבר הלכת 3,000 צעדים, היום נשבור שיא?"

טקטיקות:
- הפוך/י משימות למשחק: "מה דעתך לנסות פעילות חדשה השבוע?"
- תן/י פידבק חיובי תמיד
- הצע/י פעילויות חברתיות: "יש מפגש מעניין במתנ"ס"

זכור/י: המטרה היא להניע לפעולה בדרך חיובית!
""",
}


# ===========================================
# Limor Settings Model
# ===========================================

class LimorSettings(BaseModel):
    """
    User's Limor interaction preferences.

    Stored as part of user preferences and used by AI agent.
    """
    persona_type: str = Field(
        default=LimorPersonaType.WARM_GRANDCHILD,
        description="AI interaction style preference"
    )

    # Greeting preferences
    preferred_name: str | None = Field(
        default=None,
        description="How user prefers to be called (nickname, title, etc.)"
    )

    # Communication preferences
    use_emojis: bool = Field(
        default=True,
        description="Whether to use emojis in messages"
    )
    message_length: str = Field(
        default="normal",
        description="Preferred message length: short, normal, detailed"
    )

    # Proactive features
    morning_briefing_enabled: bool = Field(
        default=True,
        description="Enable morning briefing when user opens app"
    )
    morning_briefing_time: time = Field(
        default=time(8, 30),
        description="Preferred time for morning briefing"
    )

    # Safety settings
    emergency_auto_alert: bool = Field(
        default=True,
        description="Auto-alert family on detected emergency"
    )
    payment_approval_required: bool = Field(
        default=True,
        description="Require explicit approval for payments > threshold"
    )
    payment_approval_threshold_nis: int = Field(
        default=50,
        description="NIS threshold requiring approval"
    )

    # Language
    preferred_language: Language = Field(
        default=Language.HEBREW,
        description="Preferred communication language"
    )

    def get_system_prompt(self) -> str:
        """Get the system prompt for this persona configuration."""
        return LIMOR_SYSTEM_PROMPTS.get(
            self.persona_type,
            LIMOR_SYSTEM_PROMPTS[LimorPersonaType.WARM_GRANDCHILD]
        )


# ===========================================
# Morning Briefing Model
# ===========================================

class MorningBriefingContent(BaseModel):
    """Content for the morning briefing."""
    greeting: str = Field(
        ...,
        description="Personalized greeting"
    )
    date_display: str = Field(
        ...,
        description="Formatted date in Hebrew"
    )
    weather_summary: str | None = Field(
        default=None,
        description="Weather summary for today"
    )
    appointments_today: list[dict] = Field(
        default_factory=list,
        description="Today's appointments"
    )
    wallet_balance: int | None = Field(
        default=None,
        description="Current wallet balance in units"
    )
    wallet_balance_nis: float | None = Field(
        default=None,
        description="Wallet balance in NIS equivalent"
    )
    suggestions: list[str] = Field(
        default_factory=list,
        description="Personalized activity suggestions"
    )
    follow_up_question: str = Field(
        default="איך ישנת הלילה?",
        description="Follow-up question to engage user"
    )


class MorningBriefingResponse(BaseModel):
    """Response model for morning briefing endpoint."""
    content: MorningBriefingContent
    message_text: str = Field(
        ...,
        description="Full formatted message text"
    )
    should_show: bool = Field(
        default=True,
        description="Whether to show the briefing (false if already shown today)"
    )
    last_shown_at: datetime | None = None


# ===========================================
# Emotional Support Models
# ===========================================

class EmotionalState(BaseModel):
    """Detected emotional state from conversation."""
    primary_emotion: str = Field(
        default="neutral",
        description="Primary emotion: happy, sad, lonely, anxious, neutral"
    )
    intensity: float = Field(
        default=0.5,
        ge=0.0, le=1.0,
        description="Emotion intensity (0-1)"
    )
    loneliness_detected: bool = False
    distress_detected: bool = False
    needs_intervention: bool = False
    suggested_action: str | None = None


class EmotionalSupportResponse(BaseModel):
    """Response for emotional support interaction."""
    validation_message: str = Field(
        ...,
        description="Message validating user's feelings"
    )
    bridge_question: str | None = Field(
        default=None,
        description="Question to bridge to action"
    )
    suggested_actions: list[dict] = Field(
        default_factory=list,
        description="Suggested actions (call family, join activity, etc.)"
    )
    escalate_to_case_manager: bool = False


# ===========================================
# Service Booking Request (AI-initiated)
# ===========================================

class AIBookingRequest(BaseModel):
    """Request initiated by Limor to book a service."""
    user_id: str
    service_query: str = Field(
        ...,
        description="What the user is looking for (e.g., 'haircut', 'physiotherapy')"
    )
    matched_services: list[dict] = Field(
        default_factory=list,
        description="Services found matching the query"
    )
    recommended_service_id: str | None = None
    estimated_cost_units: int | None = None
    available_balance: int | None = None
    requires_approval: bool = True
    approval_message: str | None = None


class AIBookingApproval(BaseModel):
    """User approval for AI-initiated booking."""
    booking_request_id: str
    approved: bool
    preferred_datetime: datetime | None = None
    notes: str | None = None


# ===========================================
# Alert Models (For Dashboard)
# ===========================================

class LimorAlertType:
    """Types of alerts Limor can generate."""
    EMERGENCY = "emergency"           # Medical/safety emergency
    LONELINESS = "loneliness"        # Loneliness detected
    COGNITIVE = "cognitive"          # Cognitive concern
    INACTIVITY = "inactivity"        # No interaction for X days
    HEALTH_CONCERN = "health_concern" # Health-related concern
    BOOKING_NEEDED = "booking_needed" # User needs a service


class LimorAlert(BaseModel):
    """Alert generated by Limor for case manager dashboard."""
    alert_id: str
    user_id: str
    user_name: str
    alert_type: str
    severity: str = Field(
        default="medium",
        description="low, medium, high, critical"
    )
    title: str
    description: str
    detected_at: datetime
    context: dict = Field(
        default_factory=dict,
        description="Additional context (conversation snippet, etc.)"
    )
    recommended_action: str | None = None
    auto_actions_taken: list[str] = Field(
        default_factory=list,
        description="Actions Limor already took (e.g., 'notified_family')"
    )
    status: str = Field(
        default="pending",
        description="pending, acknowledged, resolved"
    )


# ===========================================
# Conversation Context for Limor
# ===========================================

class LimorContext(BaseModel):
    """
    Context object passed to Limor for personalized responses.

    Aggregates all relevant user data for AI decision-making.
    """
    # User identity
    user_id: str
    user_name: str
    preferred_name: str | None = None

    # Persona settings
    persona_type: str = LimorPersonaType.WARM_GRANDCHILD

    # Profile data
    meaning_tags: list[MeaningTag] = Field(default_factory=list)
    mobility_level: str | None = None
    nursing_level: int = 1

    # Family context
    family_contacts: list[dict] = Field(default_factory=list)
    last_family_contact: datetime | None = None

    # Wallet context (if connected to basket)
    has_wallet: bool = False
    wallet_balance_units: int | None = None
    wallet_balance_nis: float | None = None

    # Health context
    recent_health_readings: list[dict] = Field(default_factory=list)
    health_baseline: dict = Field(default_factory=dict)

    # Calendar context
    today_appointments: list[dict] = Field(default_factory=list)
    upcoming_appointments: list[dict] = Field(default_factory=list)

    # Conversation history summary
    last_conversation_summary: str | None = None
    last_conversation_date: datetime | None = None
    recent_topics: list[str] = Field(default_factory=list)

    # Risk flags
    is_lonely: bool = False
    is_inactive: bool = False
    days_since_activity: int = 0

    # Weather (for suggestions)
    weather_summary: str | None = None
    is_good_weather_for_walk: bool = False

    def to_prompt_context(self) -> str:
        """Convert context to a string for LLM prompt."""
        parts = []

        parts.append(f"שם: {self.preferred_name or self.user_name}")

        if self.meaning_tags:
            tags_str = ", ".join(str(tag.value) for tag in self.meaning_tags[:3])
            parts.append(f"מה חשוב לו/לה: {tags_str}")

        if self.last_conversation_date:
            parts.append(f"שיחה אחרונה: {self.last_conversation_date.strftime('%d/%m')}")
            if self.last_conversation_summary:
                parts.append(f"סיכום: {self.last_conversation_summary}")

        if self.recent_topics:
            parts.append(f"נושאים אחרונים: {', '.join(self.recent_topics[:3])}")

        if self.today_appointments:
            apps = ", ".join([a.get("title", "") for a in self.today_appointments])
            parts.append(f"פגישות היום: {apps}")

        if self.has_wallet and self.wallet_balance_units is not None:
            parts.append(f"יתרה בארנק: {self.wallet_balance_units} יחידות")

        if self.is_lonely:
            parts.append("⚠️ זוהתה בדידות - להציע פעילות חברתית")

        if self.days_since_activity > 14:
            parts.append(f"⚠️ לא פעיל {self.days_since_activity} ימים")

        return "\n".join(parts)


# ===========================================
# Intake for Standalone Limor (without basket)
# ===========================================

class LimorStandaloneIntake(BaseModel):
    """
    Simplified intake for Limor as standalone product.

    Used when Limor operates without the full basket/marketplace.
    """
    # Basic info
    user_name: str
    birth_year: int | None = None
    phone: str

    # Persona preference
    preferred_persona: str = LimorPersonaType.WARM_GRANDCHILD

    # What brings meaning
    meaning_tags: list[str] = Field(default_factory=list)

    # Mobility (simplified)
    mobility_level: str = "independent"  # independent, needs_help

    # Communication preferences
    preferred_language: Language = Language.HEBREW
    use_emojis: bool = True

    # Emergency contact
    emergency_contact_name: str | None = None
    emergency_contact_phone: str | None = None

    # Goals
    main_goal: str | None = Field(
        default=None,
        description="What they want to achieve with Limor"
    )
