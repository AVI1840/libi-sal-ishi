"""
Lev Profile Models - Core data structures for the Optimal Aging OS.

These models represent the user's profile data collected via the intake wizard,
and the derived data (personas, risk flags) used by the recommendation and CRM engines.
"""

from datetime import date, datetime

from pydantic import BaseModel, Field, field_validator

from shared.constants import (
    ContentWorld,
    DigitalLiteracyLevel,
    MeaningTag,
    MobilityLevel,
    PersonaType,
    RiskFlagType,
    SensoryLevel,
    KPI_THRESHOLDS,
)


# ===========================================
# ICF Profile (Simplified for non-clinical intake)
# ===========================================

class ICFProfile(BaseModel):
    """
    Simplified ICF (International Classification of Functioning) profile.

    Derived from simple intake questions, not clinical assessments.
    Used for safety filtering and service matching.
    """
    mobility: MobilityLevel = Field(
        default=MobilityLevel.INDEPENDENT,
        description="Walking capability level"
    )
    sensory: SensoryLevel = Field(
        default=SensoryLevel.INTACT,
        description="Hearing/vision status"
    )
    digital_literacy: DigitalLiteracyLevel = Field(
        default=DigitalLiteracyLevel.BASIC,
        description="Digital device usage capability"
    )

    # Additional simple assessments (1-5 scale)
    cognitive_score: int = Field(
        default=4,
        ge=1, le=5,
        description="Cognitive function self-assessment (1=difficulty, 5=excellent)"
    )
    social_score: int = Field(
        default=3,
        ge=1, le=5,
        description="Social engagement level (1=isolated, 5=very social)"
    )

    def is_suitable_for_physical_activity(self) -> bool:
        """Check if user can participate in physical activities."""
        return self.mobility in [MobilityLevel.INDEPENDENT, MobilityLevel.ASSISTED_DEVICE]

    def needs_accessibility_support(self) -> bool:
        """Check if user needs accessibility accommodations."""
        return (
            self.mobility == MobilityLevel.HUMAN_ASSISTED or
            self.sensory in [SensoryLevel.VISUAL_IMPAIRED, SensoryLevel.BOTH_IMPAIRED]
        )

    def needs_hearing_support(self) -> bool:
        """Check if user needs hearing accommodations."""
        return self.sensory in [SensoryLevel.HEARING_IMPAIRED, SensoryLevel.BOTH_IMPAIRED]


# ===========================================
# Intake Data (From Wizard)
# ===========================================

class IntakeData(BaseModel):
    """
    Data collected from the intake wizard.

    These are the user's expressed preferences, dreams, and concerns.
    Used by AI to generate persona and risk flags.
    """
    # What brings meaning to their life (visual card selection)
    meaning_tags: list[MeaningTag] = Field(
        default_factory=list,
        description="What brings meaning to this person's life"
    )

    # Free text about their core dream/wish
    core_dream: str | None = Field(
        default=None,
        max_length=500,
        description="What they would most like to achieve or experience"
    )

    # Loneliness assessment (1-10, lower is more lonely)
    loneliness_score: int = Field(
        default=7,
        ge=1, le=10,
        description="Self-reported loneliness level (1=very lonely, 10=not lonely at all)"
    )

    # Challenges and concerns (free text)
    main_challenges: str | None = Field(
        default=None,
        max_length=500,
        description="Main challenges or difficulties they face"
    )

    # Goals for the next period
    goals: list[str] = Field(
        default_factory=list,
        description="Personal goals (e.g., 'stay independent', 'meet new people')"
    )

    # Preferred activity times
    preferred_times: list[str] = Field(
        default_factory=lambda: ["morning"],
        description="Preferred times for activities: morning, afternoon, evening"
    )

    # Group vs individual preference
    prefers_group_activities: bool = Field(
        default=True,
        description="Whether they prefer group activities over individual"
    )

    # Completed at timestamp
    completed_at: datetime | None = Field(
        default=None,
        description="When the intake was completed"
    )

    @field_validator("meaning_tags")
    @classmethod
    def validate_meaning_tags(cls, v: list[MeaningTag]) -> list[MeaningTag]:
        """Limit meaning tags to reasonable number."""
        if len(v) > 5:
            return v[:5]  # Keep top 5
        return v


# ===========================================
# Risk Flags
# ===========================================

class RiskFlags(BaseModel):
    """
    Risk flags derived from intake data and activity patterns.

    These are computed automatically but can be overridden by case managers.
    Displayed to case managers in non-offensive language.
    """
    is_lonely: bool = Field(
        default=False,
        description="Loneliness risk (loneliness_score < threshold)"
    )
    fall_risk: bool = Field(
        default=False,
        description="Fall risk based on mobility and history"
    )
    recent_hospitalization: bool = Field(
        default=False,
        description="Recent hospital stay (needs follow-up)"
    )
    cognitive_decline: bool = Field(
        default=False,
        description="Signs of cognitive decline"
    )
    financial_risk: bool = Field(
        default=False,
        description="Financial difficulties"
    )
    is_inactive: bool = Field(
        default=False,
        description="No activity for 21+ days"
    )

    # Override fields (set by case manager)
    manual_overrides: dict[str, bool] = Field(
        default_factory=dict,
        description="Manual overrides by case manager"
    )

    last_updated: datetime | None = Field(
        default=None,
        description="When flags were last computed/updated"
    )

    def get_active_flags(self) -> list[RiskFlagType]:
        """Get list of active risk flags."""
        flags = []
        if self.is_lonely:
            flags.append(RiskFlagType.LONELINESS)
        if self.fall_risk:
            flags.append(RiskFlagType.FALL_RISK)
        if self.recent_hospitalization:
            flags.append(RiskFlagType.RECENT_HOSPITALIZATION)
        if self.cognitive_decline:
            flags.append(RiskFlagType.COGNITIVE_DECLINE)
        if self.financial_risk:
            flags.append(RiskFlagType.FINANCIAL_RISK)
        if self.is_inactive:
            flags.append(RiskFlagType.INACTIVE)
        return flags

    @classmethod
    def compute_from_intake(
        cls,
        intake: IntakeData,
        icf: ICFProfile,
        last_activity_date: date | None = None,
    ) -> "RiskFlags":
        """
        Compute risk flags from intake data.

        This is the algorithmic determination, can be overridden manually.
        """
        from shared.utils import utc_now

        # Loneliness: score below threshold
        is_lonely = intake.loneliness_score < KPI_THRESHOLDS["loneliness_score_threshold"]

        # Fall risk: mobility issues or low cognitive score
        fall_risk = (
            icf.mobility == MobilityLevel.HUMAN_ASSISTED or
            icf.cognitive_score <= 2
        )

        # Cognitive decline: low cognitive score or keywords in challenges
        cognitive_keywords = ["שכחה", "זיכרון", "מבולבל", "שוכח"]
        has_cognitive_keywords = any(
            kw in (intake.main_challenges or "")
            for kw in cognitive_keywords
        )
        cognitive_decline = icf.cognitive_score <= 2 or has_cognitive_keywords

        # Inactive: no activity for 21+ days
        is_inactive = False
        if last_activity_date:
            days_inactive = (utc_now().date() - last_activity_date).days
            is_inactive = days_inactive >= KPI_THRESHOLDS["silent_user_days"]

        return cls(
            is_lonely=is_lonely,
            fall_risk=fall_risk,
            cognitive_decline=cognitive_decline,
            is_inactive=is_inactive,
            last_updated=utc_now(),
        )


# ===========================================
# Persona (Derived from data)
# ===========================================

class UserPersona(BaseModel):
    """
    User persona derived from intake data and behavior patterns.

    Used internally for recommendations and displayed to case managers
    in non-offensive, empowering language.
    """
    primary_persona: PersonaType = Field(
        default=PersonaType.INDEPENDENT_SPIRIT,
        description="Primary persona type"
    )
    secondary_personas: list[PersonaType] = Field(
        default_factory=list,
        description="Secondary persona traits"
    )

    # Confidence scores for each persona (0-1)
    persona_scores: dict[str, float] = Field(
        default_factory=dict,
        description="Confidence scores for each persona type"
    )

    # Key characteristics derived from data
    key_traits: list[str] = Field(
        default_factory=list,
        description="Key personality traits in Hebrew"
    )

    # Recommendations for case manager
    engagement_tips: list[str] = Field(
        default_factory=list,
        description="Tips for engaging this user"
    )

    last_computed: datetime | None = None

    @classmethod
    def compute_from_profile(
        cls,
        intake: IntakeData,
        icf: ICFProfile,
        booking_history: list[dict] | None = None,
    ) -> "UserPersona":
        """
        Compute persona from intake data and behavior.

        This is a smart derivation based on multiple signals.
        """
        from shared.utils import utc_now

        scores: dict[str, float] = {
            PersonaType.SOCIAL_BUTTERFLY.value: 0.0,
            PersonaType.SECURITY_SEEKER.value: 0.0,
            PersonaType.INDEPENDENT_SPIRIT.value: 0.0,
            PersonaType.FAMILY_ORIENTED.value: 0.0,
            PersonaType.LEARNER.value: 0.0,
            PersonaType.CAREGIVER.value: 0.0,
        }

        # Score based on meaning tags
        social_tags = [MeaningTag.SOCIAL, MeaningTag.VOLUNTEERING]
        family_tags = [MeaningTag.FAMILY, MeaningTag.GRANDCHILDREN]
        learning_tags = [MeaningTag.LEARNING, MeaningTag.TECHNOLOGY, MeaningTag.ART]

        for tag in intake.meaning_tags:
            if tag in social_tags:
                scores[PersonaType.SOCIAL_BUTTERFLY.value] += 0.3
            if tag in family_tags:
                scores[PersonaType.FAMILY_ORIENTED.value] += 0.3
            if tag in learning_tags:
                scores[PersonaType.LEARNER.value] += 0.3
            if tag == MeaningTag.VOLUNTEERING:
                scores[PersonaType.CAREGIVER.value] += 0.3

        # Score based on loneliness and social preferences
        if intake.loneliness_score <= 4:
            scores[PersonaType.SOCIAL_BUTTERFLY.value] += 0.2  # Needs social

        if intake.prefers_group_activities:
            scores[PersonaType.SOCIAL_BUTTERFLY.value] += 0.2
        else:
            scores[PersonaType.INDEPENDENT_SPIRIT.value] += 0.2

        # Score based on ICF profile
        if icf.social_score >= 4:
            scores[PersonaType.SOCIAL_BUTTERFLY.value] += 0.2

        if icf.cognitive_score >= 4 and MeaningTag.LEARNING in intake.meaning_tags:
            scores[PersonaType.LEARNER.value] += 0.3

        # Security seeker: lower cognitive/mobility, prefers routine
        if icf.cognitive_score <= 3 or icf.mobility == MobilityLevel.HUMAN_ASSISTED:
            scores[PersonaType.SECURITY_SEEKER.value] += 0.3

        # Analyze goals for independence keywords
        independence_keywords = ["עצמאי", "לבד", "בכוחות עצמי"]
        if any(kw in " ".join(intake.goals) for kw in independence_keywords):
            scores[PersonaType.INDEPENDENT_SPIRIT.value] += 0.3

        # Find primary and secondary personas
        sorted_personas = sorted(scores.items(), key=lambda x: x[1], reverse=True)
        primary = PersonaType(sorted_personas[0][0])
        secondary = [
            PersonaType(p[0]) for p in sorted_personas[1:3]
            if p[1] > 0.2
        ]

        # Generate key traits
        key_traits = []
        if scores[PersonaType.SOCIAL_BUTTERFLY.value] > 0.3:
            key_traits.append("נהנה/ית מחברה")
        if scores[PersonaType.INDEPENDENT_SPIRIT.value] > 0.3:
            key_traits.append("שואף/ת לעצמאות")
        if scores[PersonaType.LEARNER.value] > 0.3:
            key_traits.append("אוהב/ת ללמוד")
        if scores[PersonaType.FAMILY_ORIENTED.value] > 0.3:
            key_traits.append("משפחה במרכז")
        if scores[PersonaType.SECURITY_SEEKER.value] > 0.3:
            key_traits.append("מעדיף/ה יציבות")

        # Generate engagement tips
        engagement_tips = cls._generate_engagement_tips(primary, intake, icf)

        return cls(
            primary_persona=primary,
            secondary_personas=secondary,
            persona_scores=scores,
            key_traits=key_traits,
            engagement_tips=engagement_tips,
            last_computed=utc_now(),
        )

    @staticmethod
    def _generate_engagement_tips(
        persona: PersonaType,
        intake: IntakeData,
        icf: ICFProfile,
    ) -> list[str]:
        """Generate engagement tips based on persona."""
        tips = []

        if persona == PersonaType.SOCIAL_BUTTERFLY:
            tips.append("להציע פעילויות קבוצתיות")
            tips.append("לשתף בהצלחות של אחרים בקבוצה")
        elif persona == PersonaType.SECURITY_SEEKER:
            tips.append("להדגיש יציבות ושגרה")
            tips.append("לתת מידע מפורט מראש")
        elif persona == PersonaType.INDEPENDENT_SPIRIT:
            tips.append("להדגיש אפשרויות בחירה")
            tips.append("לא ללחוץ או לדחוף")
        elif persona == PersonaType.FAMILY_ORIENTED:
            tips.append("לשתף את המשפחה בהצלחות")
            tips.append("להציע פעילויות עם נכדים")
        elif persona == PersonaType.LEARNER:
            tips.append("להציע קורסים וסדנאות")
            tips.append("לספק מידע מעמיק")
        elif persona == PersonaType.CAREGIVER:
            tips.append("להציע הזדמנויות התנדבות")
            tips.append("להדגיש את התרומה לאחרים")

        # Add sensory-specific tips
        if icf.needs_hearing_support():
            tips.append("לדבר ברור ולוודא הבנה")
        if icf.needs_accessibility_support():
            tips.append("לוודא נגישות במקום")

        return tips[:4]  # Limit to 4 tips


# ===========================================
# Complete Lev Profile
# ===========================================

class LevProfile(BaseModel):
    """
    Complete Lev profile combining all user data.

    This is the comprehensive profile used by all engines.
    """
    user_id: str

    # From intake wizard
    intake_data: IntakeData = Field(default_factory=IntakeData)

    # Derived from simple questions
    icf_profile: ICFProfile = Field(default_factory=ICFProfile)

    # Computed risk flags
    risk_flags: RiskFlags = Field(default_factory=RiskFlags)

    # Derived persona
    persona: UserPersona | None = None

    # Demographics (from user record)
    nursing_level: int = Field(default=1, ge=1, le=6)
    has_income_supplement: bool = Field(
        default=False,
        description="Receives income supplement (affects subsidy)"
    )

    # Location for proximity calculations
    lat: float | None = None
    lng: float | None = None
    city: str | None = None

    # Profile metadata
    created_at: datetime | None = None
    updated_at: datetime | None = None
    intake_completed: bool = False

    # Verification status
    icf_verified: bool = Field(
        default=False,
        description="Whether ICF profile was verified by case manager"
    )
    icf_verified_by: str | None = Field(
        default=None,
        description="Case manager who verified the ICF profile"
    )
    icf_verified_at: datetime | None = None

    persona_verified: bool = Field(
        default=False,
        description="Whether persona was verified/approved by case manager"
    )
    persona_verified_by: str | None = None
    persona_override: str | None = Field(
        default=None,
        description="Case manager override of algorithmic persona"
    )
    persona_verification_notes: str | None = None

    def refresh_computed_data(
        self,
        last_activity_date: date | None = None,
        booking_history: list[dict] | None = None,
    ) -> None:
        """Refresh computed fields (risk flags and persona)."""
        self.risk_flags = RiskFlags.compute_from_intake(
            self.intake_data,
            self.icf_profile,
            last_activity_date,
        )
        self.persona = UserPersona.compute_from_profile(
            self.intake_data,
            self.icf_profile,
            booking_history,
        )

    def get_subsidy_boosters(self) -> list[str]:
        """Get applicable subsidy boosters for this user."""
        boosters = []
        if self.has_income_supplement:
            boosters.append("income_supplement")
        if self.risk_flags.is_lonely:
            boosters.append("loneliness_group")
        return boosters


# ===========================================
# Intake Question Models (For dynamic wizard)
# ===========================================

class IntakeQuestion(BaseModel):
    """A single intake question with conditional logic."""
    question_id: str
    question_text: str
    question_text_he: str
    question_type: str  # "single_choice", "multi_choice", "scale", "free_text"
    options: list[dict] | None = None  # For choice questions
    min_value: int | None = None  # For scale questions
    max_value: int | None = None

    # Conditional display
    depends_on: str | None = None  # Question ID this depends on
    show_if_value: str | None = None  # Show only if dependent answer matches

    # Mapping to profile field
    maps_to_field: str  # Which LevProfile/IntakeData field this updates


class IntakeWizardConfig(BaseModel):
    """Configuration for the intake wizard."""
    questions: list[IntakeQuestion]
    welcome_message_he: str = "שלום! נשמח להכיר אותך טוב יותר"
    completion_message_he: str = "תודה! יצרנו לך פרופיל אישי"
    estimated_minutes: int = 5


# Pre-configured intake questions
DEFAULT_INTAKE_QUESTIONS: list[IntakeQuestion] = [
    IntakeQuestion(
        question_id="q_mobility",
        question_text="How do you usually get around?",
        question_text_he="איך את/ה מסתדר/ת בהליכה?",
        question_type="single_choice",
        options=[
            {"value": "independent", "label_he": "הולך/ת לבד בלי בעיה"},
            {"value": "assisted_device", "label_he": "משתמש/ת במקל או הליכון"},
            {"value": "human_assisted", "label_he": "צריך/ה עזרה מאדם אחר"},
        ],
        maps_to_field="icf_profile.mobility",
    ),
    IntakeQuestion(
        question_id="q_sensory",
        question_text="How is your hearing and vision?",
        question_text_he="מה מצב השמיעה והראייה?",
        question_type="single_choice",
        options=[
            {"value": "intact", "label_he": "שומע/ת ורואה טוב"},
            {"value": "hearing_impaired", "label_he": "קשה לי לשמוע"},
            {"value": "visual_impaired", "label_he": "קשה לי לראות"},
            {"value": "both_impaired", "label_he": "קשה לי גם לשמוע וגם לראות"},
        ],
        maps_to_field="icf_profile.sensory",
    ),
    IntakeQuestion(
        question_id="q_meaning",
        question_text="What brings you joy? (Choose up to 3)",
        question_text_he="מה מביא לך הכי הרבה שמחה? (בחר/י עד 3)",
        question_type="multi_choice",
        options=[
            {"value": "music", "label_he": "🎵 מוזיקה", "icon": "🎵"},
            {"value": "nature", "label_he": "🌳 טבע", "icon": "🌳"},
            {"value": "family", "label_he": "👨‍👩‍👧 משפחה", "icon": "👨‍👩‍👧"},
            {"value": "social", "label_he": "🤝 חברים", "icon": "🤝"},
            {"value": "learning", "label_he": "📚 ללמוד דברים חדשים", "icon": "📚"},
            {"value": "art", "label_he": "🎨 יצירה ואומנות", "icon": "🎨"},
            {"value": "volunteering", "label_he": "💝 לעזור לאחרים", "icon": "💝"},
            {"value": "faith", "label_he": "🕯️ אמונה ורוחניות", "icon": "🕯️"},
            {"value": "grandchildren", "label_he": "👶 נכדים", "icon": "👶"},
            {"value": "sports", "label_he": "🏃 פעילות גופנית", "icon": "🏃"},
        ],
        maps_to_field="intake_data.meaning_tags",
    ),
    IntakeQuestion(
        question_id="q_loneliness",
        question_text="How often do you feel lonely?",
        question_text_he="כמה פעמים את/ה מרגיש/ה לבד?",
        question_type="scale",
        min_value=1,
        max_value=10,
        options=[
            {"value": 1, "label_he": "הרבה פעמים"},
            {"value": 10, "label_he": "כמעט אף פעם"},
        ],
        maps_to_field="intake_data.loneliness_score",
    ),
    IntakeQuestion(
        question_id="q_group_pref",
        question_text="Do you prefer group or individual activities?",
        question_text_he="מה את/ה מעדיף/ה?",
        question_type="single_choice",
        options=[
            {"value": "true", "label_he": "פעילות עם אנשים אחרים"},
            {"value": "false", "label_he": "פעילות אישית/לבד"},
        ],
        maps_to_field="intake_data.prefers_group_activities",
    ),
    IntakeQuestion(
        question_id="q_dream",
        question_text="What would you most like to do or experience?",
        question_text_he="מה היית הכי רוצה לעשות או לחוות?",
        question_type="free_text",
        maps_to_field="intake_data.core_dream",
    ),
]
