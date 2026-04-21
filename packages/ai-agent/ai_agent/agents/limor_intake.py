"""
Limor Intake Flow - Standalone and Basket-Connected modes.

Handles the intake wizard flow for collecting user preferences
and creating personalized Limor profiles.
"""

from datetime import datetime
from typing import Any
from uuid import uuid4

import structlog
from pydantic import BaseModel, Field

from shared.models.limor_persona import (
    LimorPersonaType,
    LimorSettings,
    LimorStandaloneIntake,
    LIMOR_PERSONA_LABELS_HE,
    LIMOR_PERSONA_DESCRIPTIONS_HE,
)
from shared.models.lev_profile import (
    IntakeData,
    ICFProfile,
    LevProfile,
    DEFAULT_INTAKE_QUESTIONS,
)
from shared.constants import (
    MeaningTag,
    MEANING_TAG_LABELS_HE,
    MobilityLevel,
    Language,
)


logger = structlog.get_logger()


# ===========================================
# Intake Questions for Limor
# ===========================================

class LimorIntakeQuestion(BaseModel):
    """A single intake question for Limor setup."""
    question_id: str
    question_text_he: str
    question_type: str  # "single_choice", "multi_choice", "scale", "free_text"
    options: list[dict] | None = None
    min_value: int | None = None
    max_value: int | None = None
    required: bool = True
    help_text_he: str | None = None


# Limor-specific intake questions
LIMOR_INTAKE_QUESTIONS: list[LimorIntakeQuestion] = [
    # Step 1: Name and greeting
    LimorIntakeQuestion(
        question_id="name",
        question_text_he="איך אני קוראת לך?",
        question_type="free_text",
        help_text_he="השם שאת/ה רוצה שאשתמש בו כשאני פונה אליך",
    ),

    # Step 2: Persona preference
    LimorIntakeQuestion(
        question_id="persona",
        question_text_he="איך את/ה מעדיף/ה שאדבר איתך?",
        question_type="single_choice",
        options=[
            {
                "value": LimorPersonaType.WARM_GRANDCHILD,
                "label_he": LIMOR_PERSONA_LABELS_HE[LimorPersonaType.WARM_GRANDCHILD],
                "description_he": LIMOR_PERSONA_DESCRIPTIONS_HE[LimorPersonaType.WARM_GRANDCHILD],
                "icon": "💙",
            },
            {
                "value": LimorPersonaType.EFFICIENT_ASSISTANT,
                "label_he": LIMOR_PERSONA_LABELS_HE[LimorPersonaType.EFFICIENT_ASSISTANT],
                "description_he": LIMOR_PERSONA_DESCRIPTIONS_HE[LimorPersonaType.EFFICIENT_ASSISTANT],
                "icon": "📋",
            },
            {
                "value": LimorPersonaType.MOTIVATIONAL_COACH,
                "label_he": LIMOR_PERSONA_LABELS_HE[LimorPersonaType.MOTIVATIONAL_COACH],
                "description_he": LIMOR_PERSONA_DESCRIPTIONS_HE[LimorPersonaType.MOTIVATIONAL_COACH],
                "icon": "💪",
            },
        ],
    ),

    # Step 3: What brings meaning
    LimorIntakeQuestion(
        question_id="meaning_tags",
        question_text_he="מה מביא לך הכי הרבה שמחה בחיים? (בחר/י עד 3)",
        question_type="multi_choice",
        options=[
            {"value": "music", "label_he": "🎵 מוזיקה", "icon": "🎵"},
            {"value": "nature", "label_he": "🌳 טבע וטיולים", "icon": "🌳"},
            {"value": "family", "label_he": "👨‍👩‍👧 משפחה", "icon": "👨‍👩‍👧"},
            {"value": "grandchildren", "label_he": "👶 נכדים", "icon": "👶"},
            {"value": "social", "label_he": "🤝 חברים ופעילות חברתית", "icon": "🤝"},
            {"value": "learning", "label_he": "📚 ללמוד דברים חדשים", "icon": "📚"},
            {"value": "art", "label_he": "🎨 יצירה ואומנות", "icon": "🎨"},
            {"value": "volunteering", "label_he": "💝 לעזור לאחרים", "icon": "💝"},
            {"value": "faith", "label_he": "🕯️ אמונה ורוחניות", "icon": "🕯️"},
            {"value": "sports", "label_he": "🏃 פעילות גופנית", "icon": "🏃"},
            {"value": "cooking", "label_he": "🍳 בישול", "icon": "🍳"},
            {"value": "gardening", "label_he": "🌻 גינון", "icon": "🌻"},
        ],
        help_text_he="זה עוזר לי להציע לך דברים שיעניינו אותך",
    ),

    # Step 4: Mobility
    LimorIntakeQuestion(
        question_id="mobility",
        question_text_he="איך את/ה מסתדר/ת בהליכה?",
        question_type="single_choice",
        options=[
            {
                "value": "independent",
                "label_he": "הולך/ת בעצמאות",
                "icon": "🚶",
            },
            {
                "value": "assisted_device",
                "label_he": "משתמש/ת במקל או הליכון",
                "icon": "🦯",
            },
            {
                "value": "human_assisted",
                "label_he": "צריך/ה עזרה מאדם אחר",
                "icon": "🤝",
            },
        ],
        help_text_he="זה עוזר לי להמליץ על פעילויות מתאימות",
    ),

    # Step 5: Emergency contact
    LimorIntakeQuestion(
        question_id="emergency_contact_name",
        question_text_he="למי לפנות במקרה חירום?",
        question_type="free_text",
        required=False,
        help_text_he="שם של בן משפחה או חבר קרוב",
    ),

    LimorIntakeQuestion(
        question_id="emergency_contact_phone",
        question_text_he="מספר הטלפון שלו/שלה",
        question_type="free_text",
        required=False,
    ),

    # Step 6: Main goal (optional)
    LimorIntakeQuestion(
        question_id="main_goal",
        question_text_he="מה היית הכי רוצה שאעזור לך בו?",
        question_type="free_text",
        required=False,
        help_text_he="למשל: לזכור תורים, למצוא פעילויות, סתם לדבר",
    ),
]


# ===========================================
# Intake Response Models
# ===========================================

class IntakeAnswer(BaseModel):
    """A single answer to an intake question."""
    question_id: str
    answer: Any  # str, list[str], int depending on question type


class IntakeProgress(BaseModel):
    """Progress tracking for intake wizard."""
    session_id: str
    current_step: int = 0
    total_steps: int = Field(default=len(LIMOR_INTAKE_QUESTIONS))
    answers: list[IntakeAnswer] = Field(default_factory=list)
    is_complete: bool = False
    started_at: datetime = Field(default_factory=datetime.now)
    completed_at: datetime | None = None


class IntakeResult(BaseModel):
    """Result of completed intake."""
    limor_settings: LimorSettings
    standalone_profile: LimorStandaloneIntake | None = None
    lev_profile: LevProfile | None = None
    message_he: str = "מצוין! יצרתי לך פרופיל אישי. נתחיל לדבר?"


# ===========================================
# Intake Flow Manager
# ===========================================

class LimorIntakeFlow:
    """
    Manages the Limor intake wizard flow.

    Supports two modes:
    1. Standalone: Creates a LimorStandaloneIntake profile
    2. Basket-connected: Creates/updates a full LevProfile
    """

    def __init__(self, mode: str = "standalone"):
        """
        Initialize intake flow.

        Args:
            mode: "standalone" or "basket" - determines profile type created
        """
        self.mode = mode
        self.questions = LIMOR_INTAKE_QUESTIONS

    def start_intake(self, user_id: str | None = None) -> IntakeProgress:
        """Start a new intake session."""
        return IntakeProgress(
            session_id=str(uuid4()),
            current_step=0,
            total_steps=len(self.questions),
        )

    def get_current_question(self, progress: IntakeProgress) -> LimorIntakeQuestion | None:
        """Get the current question based on progress."""
        if progress.current_step >= len(self.questions):
            return None
        return self.questions[progress.current_step]

    def submit_answer(
        self,
        progress: IntakeProgress,
        answer: IntakeAnswer,
    ) -> IntakeProgress:
        """
        Submit an answer and advance to next question.

        Returns updated progress.
        """
        # Validate answer matches current question
        current_q = self.get_current_question(progress)
        if not current_q:
            raise ValueError("Intake already complete")

        if answer.question_id != current_q.question_id:
            raise ValueError(f"Expected answer for {current_q.question_id}")

        # Store answer
        progress.answers.append(answer)
        progress.current_step += 1

        # Check if complete
        if progress.current_step >= len(self.questions):
            progress.is_complete = True
            progress.completed_at = datetime.now()

        return progress

    def skip_question(self, progress: IntakeProgress) -> IntakeProgress:
        """Skip the current question (if optional)."""
        current_q = self.get_current_question(progress)
        if not current_q:
            raise ValueError("Intake already complete")

        if current_q.required:
            raise ValueError("This question is required")

        progress.current_step += 1

        if progress.current_step >= len(self.questions):
            progress.is_complete = True
            progress.completed_at = datetime.now()

        return progress

    def complete_intake(self, progress: IntakeProgress) -> IntakeResult:
        """
        Complete the intake and create profiles.

        Returns the created profiles and settings.
        """
        if not progress.is_complete:
            # Allow early completion if all required questions answered
            required_ids = {q.question_id for q in self.questions if q.required}
            answered_ids = {a.question_id for a in progress.answers}
            if not required_ids.issubset(answered_ids):
                missing = required_ids - answered_ids
                raise ValueError(f"Missing required answers: {missing}")

        # Build answers dict
        answers_dict = {a.question_id: a.answer for a in progress.answers}

        # Create Limor settings
        limor_settings = self._build_limor_settings(answers_dict)

        # Create profile based on mode
        if self.mode == "standalone":
            standalone_profile = self._build_standalone_profile(answers_dict)
            return IntakeResult(
                limor_settings=limor_settings,
                standalone_profile=standalone_profile,
            )
        else:
            lev_profile = self._build_lev_profile(answers_dict)
            return IntakeResult(
                limor_settings=limor_settings,
                lev_profile=lev_profile,
            )

    def _build_limor_settings(self, answers: dict) -> LimorSettings:
        """Build LimorSettings from answers."""
        persona = answers.get("persona", LimorPersonaType.WARM_GRANDCHILD)
        preferred_name = answers.get("name")

        return LimorSettings(
            persona_type=persona,
            preferred_name=preferred_name,
            use_emojis=persona != LimorPersonaType.EFFICIENT_ASSISTANT,
            morning_briefing_enabled=True,
            emergency_auto_alert=True,
        )

    def _build_standalone_profile(self, answers: dict) -> LimorStandaloneIntake:
        """Build standalone profile from answers."""
        # Convert meaning tags
        meaning_tags_raw = answers.get("meaning_tags", [])

        # Get mobility
        mobility = answers.get("mobility", "independent")

        return LimorStandaloneIntake(
            user_name=answers.get("name", ""),
            phone="",  # Will be collected separately
            preferred_persona=answers.get("persona", LimorPersonaType.WARM_GRANDCHILD),
            meaning_tags=meaning_tags_raw,
            mobility_level=mobility,
            emergency_contact_name=answers.get("emergency_contact_name"),
            emergency_contact_phone=answers.get("emergency_contact_phone"),
            main_goal=answers.get("main_goal"),
        )

    def _build_lev_profile(self, answers: dict) -> LevProfile:
        """Build full Lev profile from answers (for basket-connected mode)."""
        # Convert meaning tags
        meaning_tags = []
        for tag_value in answers.get("meaning_tags", []):
            try:
                meaning_tags.append(MeaningTag(tag_value))
            except ValueError:
                pass

        # Build ICF profile
        mobility_map = {
            "independent": MobilityLevel.INDEPENDENT,
            "assisted_device": MobilityLevel.ASSISTED_DEVICE,
            "human_assisted": MobilityLevel.HUMAN_ASSISTED,
        }
        mobility = mobility_map.get(
            answers.get("mobility", "independent"),
            MobilityLevel.INDEPENDENT
        )

        icf_profile = ICFProfile(mobility=mobility)

        # Build intake data
        intake_data = IntakeData(
            meaning_tags=meaning_tags,
            core_dream=answers.get("main_goal"),
            completed_at=datetime.now(),
        )

        return LevProfile(
            user_id="",  # Will be set when saving
            intake_data=intake_data,
            icf_profile=icf_profile,
            intake_completed=True,
        )

    def get_progress_message(self, progress: IntakeProgress) -> str:
        """Get a friendly progress message."""
        if progress.is_complete:
            return "מעולה! סיימנו את ההיכרות 🎉"

        percent = int((progress.current_step / progress.total_steps) * 100)
        current_q = self.get_current_question(progress)

        if progress.current_step == 0:
            return "בוא/י נכיר! יש לי כמה שאלות קצרות..."
        elif percent < 50:
            return f"יופי, ממשיכים! ({percent}%)"
        elif percent < 80:
            return f"כמעט סיימנו! ({percent}%)"
        else:
            return f"שאלה אחרונה! ({percent}%)"


# ===========================================
# Quick Intake (Conversational)
# ===========================================

class ConversationalIntake:
    """
    Conversational-style intake using LLM.

    Instead of a form wizard, conducts a natural conversation
    to collect the necessary information.
    """

    INTRO_MESSAGE = """שלום! 👋 אני לימור, העוזרת האישית שלך מ-לב.

לפני שנתחיל, אשמח להכיר אותך קצת.
איך קוראים לך? 😊"""

    PERSONA_SELECTION_MESSAGE = """נעים מאוד, {name}!

עכשיו, יש לי שאלה חשובה - איך את/ה מעדיף/ה שאדבר איתך?

💙 **חם ואישי** - כמו נכד/ה שאוהב/ת אותך
📋 **תכליתי ויעיל** - ישר לעניין
💪 **מעודד ומוטיבציוני** - עם הרבה אנרגיה

מה מתאים לך?"""

    async def start_conversation(self) -> str:
        """Start the intake conversation."""
        return self.INTRO_MESSAGE

    async def process_response(
        self,
        response: str,
        context: dict,
    ) -> tuple[str, dict, bool]:
        """
        Process user response and return next message.

        Returns:
            (next_message, updated_context, is_complete)
        """
        step = context.get("step", "name")

        if step == "name":
            # Store name, ask about persona
            context["name"] = response.strip()
            context["step"] = "persona"
            return (
                self.PERSONA_SELECTION_MESSAGE.format(name=context["name"]),
                context,
                False,
            )

        elif step == "persona":
            # Parse persona selection
            persona = self._parse_persona_response(response)
            context["persona"] = persona
            context["step"] = "meaning"

            return (
                f"""מעולה!

עכשיו ספר/י לי - מה מביא לך הכי הרבה שמחה בחיים?
למשל: משפחה, מוזיקה, טבע, חברים, ללמוד דברים חדשים...""",
                context,
                False,
            )

        elif step == "meaning":
            # Parse meaning tags
            tags = self._parse_meaning_response(response)
            context["meaning_tags"] = tags
            context["step"] = "complete"

            # Complete the intake
            return (
                f"""תודה רבה, {context['name']}! 💙

עכשיו אני מכירה אותך הרבה יותר טוב.
אני כאן בשבילך - לעזור, לדבר, או סתם להיות חברה.

במה אוכל לעזור לך היום?""",
                context,
                True,
            )

        return ("", context, True)

    def _parse_persona_response(self, response: str) -> str:
        """Parse persona selection from natural language."""
        response_lower = response.lower()

        if any(w in response_lower for w in ["חם", "אישי", "נכד", "אוהב"]):
            return LimorPersonaType.WARM_GRANDCHILD
        elif any(w in response_lower for w in ["יעיל", "תכליתי", "עניין", "קצר"]):
            return LimorPersonaType.EFFICIENT_ASSISTANT
        elif any(w in response_lower for w in ["מעודד", "אנרגי", "מוטיב"]):
            return LimorPersonaType.MOTIVATIONAL_COACH
        else:
            # Default
            return LimorPersonaType.WARM_GRANDCHILD

    def _parse_meaning_response(self, response: str) -> list[str]:
        """Parse meaning tags from natural language."""
        tags = []
        response_lower = response.lower()

        tag_keywords = {
            "music": ["מוזיקה", "שיר", "נגן"],
            "nature": ["טבע", "טיול", "הליכה", "פארק"],
            "family": ["משפחה", "ילדים"],
            "grandchildren": ["נכד", "נכדים", "נכדה"],
            "social": ["חבר", "חברים", "אנשים"],
            "learning": ["ללמוד", "לימוד", "קורס", "חדש"],
            "art": ["אומנות", "יצירה", "ציור"],
            "volunteering": ["התנדבות", "לעזור", "תרומה"],
            "faith": ["אמונה", "דת", "תפילה"],
            "sports": ["ספורט", "התעמלות", "תרגיל"],
            "cooking": ["בישול", "מטבח", "אוכל"],
            "gardening": ["גינון", "גינה", "פרחים"],
        }

        for tag, keywords in tag_keywords.items():
            if any(kw in response_lower for kw in keywords):
                tags.append(tag)

        return tags[:3]  # Limit to 3

    def build_profile_from_context(self, context: dict) -> IntakeResult:
        """Build profile from conversation context."""
        limor_settings = LimorSettings(
            persona_type=context.get("persona", LimorPersonaType.WARM_GRANDCHILD),
            preferred_name=context.get("name"),
            use_emojis=context.get("persona") != LimorPersonaType.EFFICIENT_ASSISTANT,
        )

        standalone_profile = LimorStandaloneIntake(
            user_name=context.get("name", ""),
            phone="",
            preferred_persona=context.get("persona", LimorPersonaType.WARM_GRANDCHILD),
            meaning_tags=context.get("meaning_tags", []),
        )

        return IntakeResult(
            limor_settings=limor_settings,
            standalone_profile=standalone_profile,
        )
