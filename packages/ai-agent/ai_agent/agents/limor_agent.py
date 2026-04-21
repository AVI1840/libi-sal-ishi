"""
Limor Agent - Lev AI Companion.

The main agent that handles personalized AI interactions with elderly users.
Supports multiple persona types and integrates with marketplace and standalone modes.
"""

from datetime import datetime, date
from typing import Any, AsyncGenerator
import calendar
import locale

import structlog

from shared.llm import LLMProvider, create_llm
from shared.models.limor_persona import (
    LimorPersonaType,
    LimorSettings,
    LimorContext,
    MorningBriefingContent,
    MorningBriefingResponse,
    EmotionalState,
    EmotionalSupportResponse,
    LimorAlert,
    LimorAlertType,
    LIMOR_SYSTEM_PROMPTS,
)
from shared.constants import (
    EMERGENCY_KEYWORDS_HEBREW,
    LONELINESS_KEYWORDS_HEBREW,
    COGNITIVE_KEYWORDS_HEBREW,
    MeaningTag,
    MEANING_TAG_LABELS_HE,
)


logger = structlog.get_logger()


# Hebrew day names
HEBREW_DAYS = ["שני", "שלישי", "רביעי", "חמישי", "שישי", "שבת", "ראשון"]
HEBREW_MONTHS = [
    "", "ינואר", "פברואר", "מרץ", "אפריל", "מאי", "יוני",
    "יולי", "אוגוסט", "ספטמבר", "אוקטובר", "נובמבר", "דצמבר"
]


class LimorAgent:
    """
    Limor - The Lev AI Companion Agent.

    Handles:
    - Personalized conversations based on persona preference
    - Morning briefings
    - Emotional support and loneliness intervention
    - Service booking recommendations
    - Emergency detection and alerts
    """

    def __init__(self, llm: LLMProvider | None = None):
        self.llm = llm or create_llm()
        self._alert_callbacks: list[callable] = []

    def register_alert_callback(self, callback: callable) -> None:
        """Register a callback to be called when alerts are generated."""
        self._alert_callbacks.append(callback)

    async def _emit_alert(self, alert: LimorAlert) -> None:
        """Emit an alert to all registered callbacks."""
        for callback in self._alert_callbacks:
            try:
                await callback(alert)
            except Exception as e:
                logger.error("Alert callback failed", error=str(e))

    # ===========================================
    # Main Conversation Handler
    # ===========================================

    async def handle_message(
        self,
        message: str,
        context: LimorContext,
        settings: LimorSettings | None = None,
        conversation_history: list[dict] | None = None,
    ) -> dict[str, Any]:
        """
        Handle a user message with personalized response.

        Args:
            message: User's message
            context: Full context about the user
            settings: Limor settings (persona, preferences)
            conversation_history: Previous messages in this conversation

        Returns:
            Response with content, detected emotions, suggested actions
        """
        settings = settings or LimorSettings()
        conversation_history = conversation_history or []

        # Step 1: Safety checks
        emergency_check = self._check_emergency(message, context)
        if emergency_check["is_emergency"]:
            return await self._handle_emergency(message, context, emergency_check)

        # Step 2: Detect emotional state
        emotional_state = self._detect_emotional_state(message, context)

        # Step 3: Check for service booking intent
        booking_intent = self._detect_booking_intent(message)

        # Step 4: Build personalized prompt
        system_prompt = self._build_system_prompt(context, settings)

        # Step 5: Generate response
        messages = [
            {"role": "system", "content": system_prompt},
        ]

        # Add context as system message
        context_prompt = self._build_context_prompt(context, emotional_state)
        if context_prompt:
            messages.append({"role": "system", "content": context_prompt})

        # Add conversation history
        for msg in conversation_history[-10:]:
            messages.append(msg)

        # Add current message
        messages.append({"role": "user", "content": message})

        try:
            response = await self.llm.complete(
                messages=messages,
                temperature=0.8,
                max_tokens=400,
            )

            response_text = response.content

            # Post-process based on settings
            if not settings.use_emojis:
                response_text = self._remove_emojis(response_text)

            # Generate alerts if needed
            await self._generate_alerts_if_needed(message, response_text, context, emotional_state)

            return {
                "content": response_text,
                "emotional_state": emotional_state.model_dump(),
                "booking_intent": booking_intent,
                "actions": self._suggest_actions(emotional_state, booking_intent, context),
                "should_save_memory": self._should_save_memory(message),
            }

        except Exception as e:
            logger.error("Limor response error", error=str(e))
            return {
                "content": self._get_fallback_response(settings.persona_type),
                "error": str(e),
            }

    # ===========================================
    # Morning Briefing
    # ===========================================

    async def generate_morning_briefing(
        self,
        context: LimorContext,
        settings: LimorSettings | None = None,
    ) -> MorningBriefingResponse:
        """
        Generate a personalized morning briefing.

        Called when user opens the app in the morning.
        """
        settings = settings or LimorSettings()

        # Build content
        content = MorningBriefingContent(
            greeting=self._generate_greeting(context, settings),
            date_display=self._format_hebrew_date(datetime.now()),
            weather_summary=context.weather_summary,
            appointments_today=context.today_appointments,
            wallet_balance=context.wallet_balance_units if context.has_wallet else None,
            wallet_balance_nis=context.wallet_balance_nis if context.has_wallet else None,
            suggestions=self._generate_daily_suggestions(context, settings),
            follow_up_question=self._generate_follow_up_question(context, settings),
        )

        # Format full message
        message_text = await self._format_morning_briefing_message(content, context, settings)

        return MorningBriefingResponse(
            content=content,
            message_text=message_text,
            should_show=True,
        )

    async def _format_morning_briefing_message(
        self,
        content: MorningBriefingContent,
        context: LimorContext,
        settings: LimorSettings,
    ) -> str:
        """Format the morning briefing as a natural message."""

        parts = []

        # Greeting
        parts.append(content.greeting)
        parts.append("")  # Empty line

        # Date
        parts.append(f"📅 היום {content.date_display}")

        # Weather
        if content.weather_summary:
            parts.append(f"🌤️ {content.weather_summary}")

        parts.append("")

        # Appointments
        if content.appointments_today:
            parts.append("📋 מה יש לך היום:")
            for apt in content.appointments_today[:3]:
                time_str = apt.get("time", "")
                title = apt.get("title", "פגישה")
                parts.append(f"  • {time_str} - {title}")
        else:
            parts.append("📋 אין לך פגישות מתוכננות להיום")

        parts.append("")

        # Wallet balance (if connected to basket)
        if content.wallet_balance is not None:
            parts.append(f"💰 יתרה בארנק: {content.wallet_balance} יחידות")

        # Suggestions
        if content.suggestions:
            parts.append("")
            parts.append("💡 מה דעתך על:")
            for suggestion in content.suggestions[:2]:
                parts.append(f"  • {suggestion}")

        parts.append("")
        parts.append(content.follow_up_question)

        return "\n".join(parts)

    def _generate_greeting(self, context: LimorContext, settings: LimorSettings) -> str:
        """Generate personalized greeting based on persona."""
        name = context.preferred_name or context.user_name
        hour = datetime.now().hour

        if hour < 12:
            time_greeting = "בוקר טוב"
        elif hour < 17:
            time_greeting = "צהריים טובים"
        else:
            time_greeting = "ערב טוב"

        if settings.persona_type == LimorPersonaType.WARM_GRANDCHILD:
            return f"{time_greeting}, {name} יקיר/ה! 😊"
        elif settings.persona_type == LimorPersonaType.EFFICIENT_ASSISTANT:
            return f"{time_greeting}, {name}."
        else:  # MOTIVATIONAL_COACH
            return f"{time_greeting}, {name}! 💪 יום חדש = הזדמנויות חדשות!"

    def _format_hebrew_date(self, dt: datetime) -> str:
        """Format date in Hebrew."""
        day_name = HEBREW_DAYS[dt.weekday()]
        month_name = HEBREW_MONTHS[dt.month]
        return f"יום {day_name}, {dt.day} ב{month_name}"

    def _generate_daily_suggestions(
        self,
        context: LimorContext,
        settings: LimorSettings,
    ) -> list[str]:
        """Generate personalized daily suggestions."""
        suggestions = []

        # Based on meaning tags
        if MeaningTag.NATURE in context.meaning_tags and context.is_good_weather_for_walk:
            suggestions.append("הליכה קצרה בפארק - מזג האוויר מושלם!")

        if MeaningTag.SOCIAL in context.meaning_tags:
            suggestions.append("לבדוק אם יש פעילות חברתית במתנ\"ס")

        if MeaningTag.LEARNING in context.meaning_tags:
            suggestions.append("סדנה חדשה בקורס שהתעניינת בו")

        # Based on loneliness
        if context.is_lonely:
            suggestions.append("לקבוע שיחה עם מישהו שלא דיברת איתו זמן רב")

        # Based on inactivity
        if context.days_since_activity > 7:
            suggestions.append("לקבוע פעילות קטנה לשבוע הזה")

        # Default suggestion
        if not suggestions:
            suggestions.append("תרגילי בוקר קצרים לבריאות")

        return suggestions[:3]

    def _generate_follow_up_question(
        self,
        context: LimorContext,
        settings: LimorSettings,
    ) -> str:
        """Generate a follow-up question based on context."""

        # Check if there's relevant history to reference
        if context.last_conversation_summary:
            # Reference previous conversation
            return "איך היה לך מאז שדיברנו?"

        if context.recent_topics:
            # Reference recent topic
            topic = context.recent_topics[0]
            if "כאב" in topic or "בריאות" in topic:
                return "איך אתה מרגיש היום? השתפר משהו?"

        # Default questions based on persona
        if settings.persona_type == LimorPersonaType.WARM_GRANDCHILD:
            return "איך ישנת הלילה? 😊"
        elif settings.persona_type == LimorPersonaType.MOTIVATIONAL_COACH:
            return "מה המטרה שלך להיום? 🎯"
        else:
            return "יש משהו שאוכל לעזור לך בו היום?"

    # ===========================================
    # Emotional Support
    # ===========================================

    async def handle_emotional_support(
        self,
        message: str,
        context: LimorContext,
        emotional_state: EmotionalState,
        settings: LimorSettings | None = None,
    ) -> EmotionalSupportResponse:
        """
        Handle a message requiring emotional support.

        Validates feelings, bridges to action, suggests interventions.
        """
        settings = settings or LimorSettings()

        # Generate validation message using LLM
        validation_prompt = f"""המשתמש אמר: "{message}"

המצב הרגשי שזוהה: {emotional_state.primary_emotion}
עוצמה: {emotional_state.intensity}
בדידות: {"כן" if emotional_state.loneliness_detected else "לא"}

כתוב תגובה מאמתת רגשות בעברית, בסגנון {settings.persona_type}.
התגובה צריכה:
1. לאמת את הרגש ("אני שומע/ת שקשה לך...")
2. להראות אמפתיה
3. לא לתת עצות מיד

תגובה קצרה (2-3 משפטים):"""

        try:
            response = await self.llm.complete(
                messages=[{"role": "user", "content": validation_prompt}],
                temperature=0.7,
                max_tokens=150,
            )
            validation_message = response.content
        except Exception:
            validation_message = "אני שומע/ת שלא קל לך עכשיו. אני כאן איתך."

        # Generate bridge question
        bridge_question = self._generate_bridge_question(context, emotional_state)

        # Generate suggested actions
        suggested_actions = self._generate_emotional_support_actions(context, emotional_state)

        # Determine if case manager escalation needed
        escalate = emotional_state.intensity > 0.8 or emotional_state.distress_detected

        return EmotionalSupportResponse(
            validation_message=validation_message,
            bridge_question=bridge_question,
            suggested_actions=suggested_actions,
            escalate_to_case_manager=escalate,
        )

    def _generate_bridge_question(
        self,
        context: LimorContext,
        emotional_state: EmotionalState,
    ) -> str | None:
        """Generate a question to bridge from validation to action."""

        if emotional_state.loneliness_detected:
            if context.family_contacts:
                family_member = context.family_contacts[0].get("name", "המשפחה")
                return f"מתי דיברת לאחרונה עם {family_member}?"
            return "יש מישהו שהיית רוצה לדבר איתו?"

        if emotional_state.primary_emotion == "sad":
            return "יש משהו ספציפי שהעציב אותך?"

        if emotional_state.primary_emotion == "anxious":
            return "מה הכי מדאיג אותך עכשיו?"

        return None

    def _generate_emotional_support_actions(
        self,
        context: LimorContext,
        emotional_state: EmotionalState,
    ) -> list[dict]:
        """Generate suggested actions for emotional support."""
        actions = []

        if emotional_state.loneliness_detected:
            # Suggest calling family
            if context.family_contacts:
                family = context.family_contacts[0]
                actions.append({
                    "type": "call_family",
                    "label_he": f"להתקשר ל{family.get('name', 'משפחה')}",
                    "data": {"contact": family},
                })

            # Suggest social activity
            actions.append({
                "type": "find_activity",
                "label_he": "לחפש פעילות חברתית קרובה",
                "data": {"category": "social"},
            })

        if emotional_state.primary_emotion in ["sad", "anxious"]:
            actions.append({
                "type": "talk_more",
                "label_he": "לדבר על מה שמטריד",
                "data": {},
            })

        return actions

    # ===========================================
    # Safety & Emergency
    # ===========================================

    def _check_emergency(self, message: str, context: LimorContext) -> dict:
        """Check for emergency situations."""
        result = {
            "is_emergency": False,
            "type": None,
            "keywords_found": [],
        }

        message_lower = message.lower()

        # Check emergency keywords
        for kw in EMERGENCY_KEYWORDS_HEBREW:
            if kw in message_lower:
                result["is_emergency"] = True
                result["type"] = "medical"
                result["keywords_found"].append(kw)

        # Check for cognitive confusion
        for kw in COGNITIVE_KEYWORDS_HEBREW:
            if kw in message_lower:
                if result["type"] is None:
                    result["type"] = "cognitive"
                result["keywords_found"].append(kw)

        return result

    async def _handle_emergency(
        self,
        message: str,
        context: LimorContext,
        emergency_check: dict,
    ) -> dict[str, Any]:
        """Handle emergency situation."""

        emergency_type = emergency_check.get("type", "medical")

        # Generate alert
        alert = LimorAlert(
            alert_id=f"alert_{datetime.now().timestamp()}",
            user_id=context.user_id,
            user_name=context.user_name,
            alert_type=LimorAlertType.EMERGENCY,
            severity="critical",
            title="זוהה מצב חירום אפשרי",
            description=f"המשתמש אמר: \"{message}\"",
            detected_at=datetime.now(),
            context={
                "message": message,
                "keywords": emergency_check.get("keywords_found", []),
                "emergency_type": emergency_type,
            },
            recommended_action="ליצור קשר מיידי עם המשתמש",
            auto_actions_taken=["alert_generated"],
        )

        await self._emit_alert(alert)

        # Generate emergency response
        response = """🚨 אני מזהה שאתה לא מרגיש טוב.

אני כאן איתך. אנא:
1. שב במקום בטוח
2. נשום לאט ועמוק
3. אם זה מצב חירום רפואי, חייג 101 מיד

אני שולח עכשיו התראה למשפחה ולמתאמת השירות שלך.

האם יש לך:
• כאב בחזה?
• קושי לנשום?
• סחרחורת?"""

        return {
            "content": response,
            "is_emergency": True,
            "emergency_type": emergency_type,
            "alert_generated": True,
            "actions": [
                {"type": "emergency_call", "label_he": "חייג 101", "data": {"phone": "101"}},
            ],
        }

    # ===========================================
    # Service Booking
    # ===========================================

    def _detect_booking_intent(self, message: str) -> dict | None:
        """Detect if user wants to book a service."""
        booking_keywords = {
            "תור": "appointment",
            "הזמנה": "booking",
            "לקבוע": "schedule",
            "פיזיותרפיה": "physiotherapy",
            "ספר": "haircut",
            "תספורת": "haircut",
            "מסאג'": "massage",
            "עיסוי": "massage",
            "רופא": "doctor",
            "מנקה": "cleaning",
            "ניקיון": "cleaning",
            "הסעה": "transportation",
            "פעילות": "activity",
        }

        message_lower = message.lower()

        for keyword, service_type in booking_keywords.items():
            if keyword in message_lower:
                return {
                    "detected": True,
                    "service_type": service_type,
                    "keyword": keyword,
                }

        return None

    # ===========================================
    # Helper Methods
    # ===========================================

    def _build_system_prompt(
        self,
        context: LimorContext,
        settings: LimorSettings,
    ) -> str:
        """Build the full system prompt for LLM."""

        base_prompt = LIMOR_SYSTEM_PROMPTS.get(
            settings.persona_type,
            LIMOR_SYSTEM_PROMPTS[LimorPersonaType.WARM_GRANDCHILD]
        )

        # Add user-specific instructions
        additions = []

        if context.preferred_name:
            additions.append(f"קרא למשתמש: {context.preferred_name}")

        if context.meaning_tags:
            tags = ", ".join(
                MEANING_TAG_LABELS_HE.get(tag.value, tag.value)
                for tag in context.meaning_tags[:3]
            )
            additions.append(f"מה חשוב למשתמש: {tags}")

        if context.mobility_level == "human_assisted":
            additions.append("המשתמש זקוק לעזרה בהליכה - אל תציע פעילויות שדורשות הליכה ממושכת")

        if additions:
            base_prompt += "\n\nמידע חשוב על המשתמש:\n" + "\n".join(f"- {a}" for a in additions)

        return base_prompt

    def _build_context_prompt(
        self,
        context: LimorContext,
        emotional_state: EmotionalState,
    ) -> str | None:
        """Build context information for the LLM."""
        return context.to_prompt_context()

    def _detect_emotional_state(
        self,
        message: str,
        context: LimorContext,
    ) -> EmotionalState:
        """Detect emotional state from message."""

        message_lower = message.lower()

        # Check for loneliness
        loneliness_detected = any(kw in message_lower for kw in LONELINESS_KEYWORDS_HEBREW)

        # Check for distress keywords
        distress_keywords = ["רע", "נורא", "לא יכול", "אין לי כוח", "מתייאש"]
        distress_detected = any(kw in message_lower for kw in distress_keywords)

        # Determine primary emotion
        if loneliness_detected:
            primary_emotion = "lonely"
            intensity = 0.7
        elif distress_detected:
            primary_emotion = "sad"
            intensity = 0.6
        elif any(kw in message_lower for kw in ["שמח", "טוב", "מצוין", "נהדר"]):
            primary_emotion = "happy"
            intensity = 0.6
        else:
            primary_emotion = "neutral"
            intensity = 0.3

        needs_intervention = loneliness_detected or (distress_detected and intensity > 0.7)

        return EmotionalState(
            primary_emotion=primary_emotion,
            intensity=intensity,
            loneliness_detected=loneliness_detected,
            distress_detected=distress_detected,
            needs_intervention=needs_intervention,
        )

    async def _generate_alerts_if_needed(
        self,
        message: str,
        response: str,
        context: LimorContext,
        emotional_state: EmotionalState,
    ) -> None:
        """Generate alerts if needed based on conversation."""

        if emotional_state.loneliness_detected and emotional_state.intensity > 0.6:
            alert = LimorAlert(
                alert_id=f"alert_{datetime.now().timestamp()}",
                user_id=context.user_id,
                user_name=context.user_name,
                alert_type=LimorAlertType.LONELINESS,
                severity="medium",
                title="זוהתה בדידות",
                description=f"המשתמש הביע רגשות של בדידות",
                detected_at=datetime.now(),
                context={"message": message},
                recommended_action="להציע פעילות חברתית או שיחה עם המשפחה",
            )
            await self._emit_alert(alert)

    def _suggest_actions(
        self,
        emotional_state: EmotionalState,
        booking_intent: dict | None,
        context: LimorContext,
    ) -> list[dict]:
        """Suggest actions based on conversation analysis."""
        actions = []

        if booking_intent:
            actions.append({
                "type": "search_services",
                "label_he": f"חיפוש שירותי {booking_intent.get('service_type', '')}",
                "data": booking_intent,
            })

        if emotional_state.needs_intervention:
            actions.append({
                "type": "emotional_support",
                "label_he": "תמיכה רגשית",
                "data": {"state": emotional_state.model_dump()},
            })

        return actions

    def _should_save_memory(self, message: str) -> bool:
        """Determine if this message should be saved to memory."""
        memory_triggers = [
            "בן שלי", "בת שלי", "נכד", "נכדה",
            "אני אוהב", "אני אוהבת", "אני לא אוהב",
            "פעם", "כשהייתי", "בצעירותי",
            "יום הולדת", "חג", "שנה",
            "מת ", "נפטר", "איבדתי",
        ]
        return any(trigger in message for trigger in memory_triggers)

    def _remove_emojis(self, text: str) -> str:
        """Remove emojis from text."""
        import re
        emoji_pattern = re.compile(
            "["
            "\U0001F600-\U0001F64F"
            "\U0001F300-\U0001F5FF"
            "\U0001F680-\U0001F6FF"
            "\U0001F1E0-\U0001F1FF"
            "\U00002702-\U000027B0"
            "\U000024C2-\U0001F251"
            "]+",
            flags=re.UNICODE,
        )
        return emoji_pattern.sub("", text)

    def _get_fallback_response(self, persona_type: str) -> str:
        """Get fallback response when LLM fails."""
        if persona_type == LimorPersonaType.WARM_GRANDCHILD:
            return "סליחה יקיר/ה, לא הבנתי. אפשר לנסות שוב? 😊"
        elif persona_type == LimorPersonaType.EFFICIENT_ASSISTANT:
            return "לא הבנתי. אפשר לנסח אחרת?"
        else:
            return "אופס, בוא ננסה שוב! 💪"


# Singleton instance
_limor_agent: LimorAgent | None = None


def get_limor_agent() -> LimorAgent:
    """Get the global Limor agent instance."""
    global _limor_agent
    if _limor_agent is None:
        _limor_agent = LimorAgent()
    return _limor_agent
