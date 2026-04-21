"""
Conversational agent for natural dialogue.
"""

from typing import Any

import structlog

from shared.llm import LLMProvider


logger = structlog.get_logger()


class ConversationalAgent:
    """
    Agent specialized in natural conversation.

    Handles:
    - General chat and companionship
    - Personal stories and memories
    - Emotional support
    - Daily check-ins
    """

    def __init__(self, llm: LLMProvider):
        self.llm = llm

    async def handle(
        self,
        message: str,
        context: dict[str, Any] | None = None,
        user_preferences: dict[str, Any] | None = None,
    ) -> dict[str, Any]:
        """
        Handle a conversational message.

        Args:
            message: User message
            context: Conversation context (history, memories)
            user_preferences: User preferences (speech speed, topics)

        Returns:
            Response with content and metadata
        """
        # Build contextual prompt
        system_prompt = self._build_system_prompt(user_preferences)

        messages = [
            {"role": "system", "content": system_prompt},
        ]

        # Add relevant memories if available
        if context and context.get("memories"):
            memory_context = self._format_memories(context["memories"])
            messages.append({
                "role": "system",
                "content": f"זיכרונות רלוונטיים מהשיחות הקודמות:\n{memory_context}",
            })

        # Add conversation history
        if context and context.get("history"):
            for msg in context["history"][-10:]:  # Last 10 messages
                messages.append(msg)

        # Add current message
        messages.append({"role": "user", "content": message})

        try:
            response = await self.llm.complete(
                messages=messages,
                temperature=0.8,  # Slightly higher for more natural conversation
                max_tokens=300,
            )

            return {
                "content": response.content,
                "should_save_memory": self._should_save_memory(message, response.content),
                "sentiment_indicators": self._extract_sentiment_indicators(response.content),
            }

        except Exception as e:
            logger.error("Conversation error", error=str(e))
            return {
                "content": "סליחה, לא הבנתי. אפשר לחזור על מה שאמרת?",
                "error": str(e),
            }

    def _build_system_prompt(self, preferences: dict[str, Any] | None) -> str:
        """Build personalized system prompt."""
        base_prompt = """אתה סבתא.AI - חבר וירטואלי חם ואכפתי.

בשיחה:
- היה חם וסבלני
- התעניין באמת במה שהאדם אומר
- שאל שאלות המשך
- זכור פרטים אישיים
- שמור על טון מכבד ולא מתנשא"""

        if preferences:
            if preferences.get("topics_to_avoid"):
                avoid = ", ".join(preferences["topics_to_avoid"])
                base_prompt += f"\n\nהימנע מהנושאים הבאים: {avoid}"

            if preferences.get("interests"):
                interests = ", ".join(preferences["interests"])
                base_prompt += f"\n\nהאדם מתעניין ב: {interests}"

        return base_prompt

    def _format_memories(self, memories: list[dict]) -> str:
        """Format memories for context."""
        formatted = []
        for memory in memories[:5]:  # Top 5 relevant memories
            formatted.append(f"- {memory.get('content', '')}")
        return "\n".join(formatted)

    def _should_save_memory(self, user_message: str, response: str) -> bool:
        """Determine if this exchange should be saved as a memory."""
        # Save memories when user shares personal information
        memory_triggers = [
            "בן שלי", "בת שלי", "נכד", "נכדה",  # Family
            "אני אוהב", "אני אוהבת", "אני לא אוהב",  # Preferences
            "פעם", "כשהייתי", "בצעירותי",  # Stories
            "יום הולדת", "חג", "שנה",  # Events
        ]

        return any(trigger in user_message for trigger in memory_triggers)

    def _extract_sentiment_indicators(self, response: str) -> list[str]:
        """Extract sentiment indicators from the response."""
        indicators = []

        # Positive indicators
        if any(word in response for word in ["😊", "🎉", "💙", "מצוין", "נהדר"]):
            indicators.append("positive_tone")

        # Concern indicators
        if any(word in response for word in ["אני שומע", "אני מבין", "זה קשה"]):
            indicators.append("empathetic_response")

        return indicators
