"""
Main orchestrator agent that routes requests to specialized agents.

Integrates with Limor (לימור) - the Lev AI Companion for personalized interactions.
"""

from functools import lru_cache
from typing import Any, AsyncGenerator
import time

import structlog
from langgraph.graph import StateGraph, END
from typing_extensions import TypedDict

from shared.llm import create_llm
from shared.config import get_settings
from shared.constants import EMERGENCY_KEYWORDS_HEBREW, LONELINESS_KEYWORDS_HEBREW, MeaningTag
from shared.models.limor_persona import (
    LimorPersonaType,
    LimorSettings,
    LimorContext,
)
from ai_agent.config import DEFAULT_SYSTEM_PROMPT_HEBREW, MAX_CONTEXT_MESSAGES
from ai_agent.agents.limor_agent import LimorAgent, get_limor_agent


logger = structlog.get_logger()


class ConversationState(TypedDict):
    """State for conversation graph."""
    user_id: str
    conversation_id: str
    message: str
    context: dict | None
    messages: list[dict]
    intent: str | None
    sentiment: float | None
    response: str | None
    actions: list[str]
    is_emergency: bool
    needs_health_check: bool
    needs_marketplace: bool
    # Limor integration
    limor_context: LimorContext | None
    limor_settings: LimorSettings | None
    use_limor: bool


class Orchestrator:
    """
    Main orchestrator that coordinates between specialized agents.

    Uses LangGraph for stateful conversation management.
    Integrates with Limor for personalized interactions.
    """

    def __init__(self):
        self.settings = get_settings()
        self.llm = create_llm()
        self.limor = get_limor_agent()
        self.graph = self._build_graph()

    def _build_graph(self) -> StateGraph:
        """Build the LangGraph conversation graph."""

        # Define the graph
        workflow = StateGraph(ConversationState)

        # Add nodes
        workflow.add_node("classify_intent", self._classify_intent)
        workflow.add_node("check_emergency", self._check_emergency)
        workflow.add_node("handle_conversation", self._handle_conversation)
        workflow.add_node("handle_health", self._handle_health)
        workflow.add_node("handle_marketplace", self._handle_marketplace)
        workflow.add_node("handle_limor", self._handle_limor)
        workflow.add_node("generate_response", self._generate_response)

        # Set entry point
        workflow.set_entry_point("classify_intent")

        # Add edges
        workflow.add_edge("classify_intent", "check_emergency")

        # Conditional routing after emergency check
        workflow.add_conditional_edges(
            "check_emergency",
            self._route_after_emergency,
            {
                "emergency": "generate_response",  # Fast path for emergencies
                "limor": "handle_limor",           # Limor for personalized conversations
                "health": "handle_health",
                "marketplace": "handle_marketplace",
                "conversation": "handle_conversation",
            }
        )

        # All handlers lead to response generation
        workflow.add_edge("handle_conversation", "generate_response")
        workflow.add_edge("handle_health", "generate_response")
        workflow.add_edge("handle_marketplace", "generate_response")
        workflow.add_edge("handle_limor", "generate_response")
        workflow.add_edge("generate_response", END)

        return workflow.compile()

    def _route_after_emergency(self, state: ConversationState) -> str:
        """Route based on state after emergency check."""
        if state["is_emergency"]:
            return "emergency"
        # Use Limor for personalized conversations when context is available
        if state.get("use_limor") and state.get("limor_context"):
            return "limor"
        if state["needs_health_check"]:
            return "health"
        if state["needs_marketplace"]:
            return "marketplace"
        return "conversation"

    async def _classify_intent(self, state: ConversationState) -> ConversationState:
        """Classify the user's intent."""
        message = state["message"].lower()

        # Simple keyword-based classification for MVP
        # TODO: Use LLM for better classification

        intent = "conversation"  # Default

        # Health-related keywords
        health_keywords = ["כאב", "דופק", "לחץ דם", "שינה", "תרופות", "רופא"]
        if any(kw in message for kw in health_keywords):
            intent = "health"
            state["needs_health_check"] = True

        # Marketplace keywords
        marketplace_keywords = ["שירות", "הזמנה", "תור", "פיזיותרפיה", "ארנק", "יחידות"]
        if any(kw in message for kw in marketplace_keywords):
            intent = "marketplace"
            state["needs_marketplace"] = True

        state["intent"] = intent

        logger.debug(
            "Classified intent",
            intent=intent,
            message_snippet=message[:50],
        )

        return state

    async def _check_emergency(self, state: ConversationState) -> ConversationState:
        """Check for emergency situations."""
        message = state["message"]

        # Check for emergency keywords
        is_emergency = any(kw in message for kw in EMERGENCY_KEYWORDS_HEBREW)

        if is_emergency:
            logger.critical(
                "Emergency detected",
                user_id=state["user_id"],
                message=message,
            )
            state["is_emergency"] = True
            state["actions"].append("emergency_protocol")

            # Generate immediate emergency response
            state["response"] = self._generate_emergency_response(message)

        # Check for loneliness indicators
        loneliness_detected = any(kw in message for kw in LONELINESS_KEYWORDS_HEBREW)
        if loneliness_detected:
            state["sentiment"] = -0.5  # Indicate negative sentiment
            state["actions"].append("loneliness_flagged")

        return state

    def _generate_emergency_response(self, message: str) -> str:
        """Generate immediate emergency response."""
        return """🚨 אני מזהה שאתה לא מרגיש טוב.

אני כאן איתך. אנא:
1. שב במקום בטוח
2. נשום לאט ועמוק
3. אם אתה מרגיש שזה מצב חירום רפואי, חייג 101 מיד

אני שולח עכשיו התראה למשפחה שלך.

יש לך כאב בחזה? קושי לנשום? סחרחורת?"""

    async def _handle_conversation(self, state: ConversationState) -> ConversationState:
        """Handle general conversation."""
        # This is the default conversational flow
        # The response will be generated in generate_response
        return state

    async def _handle_health(self, state: ConversationState) -> ConversationState:
        """Handle health-related queries."""
        state["actions"].append("health_context_loaded")
        # TODO: Load health context, recent readings, baselines
        return state

    async def _handle_marketplace(self, state: ConversationState) -> ConversationState:
        """Handle marketplace queries."""
        state["actions"].append("marketplace_context_loaded")
        # TODO: Load wallet balance, available services
        return state

    async def _handle_limor(self, state: ConversationState) -> ConversationState:
        """Handle conversation through Limor for personalized responses."""
        limor_context = state.get("limor_context")
        limor_settings = state.get("limor_settings")

        if not limor_context:
            # Fallback to regular conversation if no context
            return state

        try:
            result = await self.limor.handle_message(
                message=state["message"],
                context=limor_context,
                settings=limor_settings,
                conversation_history=state.get("messages", []),
            )

            state["response"] = result.get("content", "")
            state["actions"].extend(result.get("actions", []))

            # Check if emergency was detected by Limor
            if result.get("is_emergency"):
                state["is_emergency"] = True

            # Extract sentiment from emotional state
            emotional_state = result.get("emotional_state", {})
            if emotional_state.get("primary_emotion") == "happy":
                state["sentiment"] = 0.7
            elif emotional_state.get("loneliness_detected"):
                state["sentiment"] = -0.5
            elif emotional_state.get("distress_detected"):
                state["sentiment"] = -0.7

            logger.info(
                "Limor handled message",
                user_id=state["user_id"],
                persona=limor_settings.persona_type if limor_settings else "default",
                emotional_state=emotional_state.get("primary_emotion"),
            )

        except Exception as e:
            logger.error("Limor handler error", error=str(e))
            # Fall through to regular response generation

        return state

    async def _generate_response(self, state: ConversationState) -> ConversationState:
        """Generate the final response using LLM."""
        # Skip if emergency response already generated
        if state.get("response"):
            return state

        # Build messages for LLM
        messages = [
            {"role": "system", "content": DEFAULT_SYSTEM_PROMPT_HEBREW},
        ]

        # Add conversation history
        for msg in state.get("messages", [])[-MAX_CONTEXT_MESSAGES:]:
            messages.append(msg)

        # Add current message
        messages.append({"role": "user", "content": state["message"]})

        # Add context if available
        if state.get("context"):
            context_str = f"\n\nהקשר נוסף: {state['context']}"
            messages[-1]["content"] += context_str

        try:
            response = await self.llm.complete(
                messages=messages,
                temperature=0.7,
                max_tokens=500,
            )

            state["response"] = response.content

        except Exception as e:
            logger.error("LLM error", error=str(e))
            state["response"] = "סליחה, יש לי בעיה טכנית כרגע. אפשר לנסות שוב?"

        return state

    async def process_message(
        self,
        user_id: str,
        conversation_id: str,
        message: str,
        context: dict | None = None,
        limor_context: LimorContext | None = None,
        limor_settings: LimorSettings | None = None,
    ) -> dict[str, Any]:
        """
        Process a user message and return the response.

        Args:
            user_id: User ID
            conversation_id: Conversation ID
            message: User message
            context: Optional additional context
            limor_context: Optional Limor context for personalization
            limor_settings: Optional Limor settings (persona, preferences)

        Returns:
            Response dictionary with content, intent, sentiment, actions
        """
        start_time = time.time()

        # Determine if we should use Limor
        use_limor = limor_context is not None

        # Initialize state
        initial_state: ConversationState = {
            "user_id": user_id,
            "conversation_id": conversation_id,
            "message": message,
            "context": context,
            "messages": [],  # TODO: Load from memory
            "intent": None,
            "sentiment": None,
            "response": None,
            "actions": [],
            "is_emergency": False,
            "needs_health_check": False,
            "needs_marketplace": False,
            "limor_context": limor_context,
            "limor_settings": limor_settings or LimorSettings(),
            "use_limor": use_limor,
        }

        # Run the graph
        final_state = await self.graph.ainvoke(initial_state)

        processing_time = (time.time() - start_time) * 1000

        logger.info(
            "Processed message",
            user_id=user_id,
            intent=final_state.get("intent"),
            processing_time_ms=round(processing_time),
        )

        return {
            "content": final_state.get("response", ""),
            "intent": final_state.get("intent"),
            "sentiment": final_state.get("sentiment"),
            "actions": final_state.get("actions", []),
            "metadata": {
                "processing_time_ms": round(processing_time),
                "is_emergency": final_state.get("is_emergency", False),
            },
        }

    async def process_message_stream(
        self,
        user_id: str,
        conversation_id: str,
        message: str,
    ) -> AsyncGenerator[str, None]:
        """
        Process a message and stream the response.

        Yields response chunks as they are generated.
        """
        # For MVP, we'll do a simple implementation
        # TODO: Implement true streaming with LangGraph

        result = await self.process_message(
            user_id=user_id,
            conversation_id=conversation_id,
            message=message,
        )

        # Simulate streaming by yielding chunks
        content = result.get("content", "")
        chunk_size = 10  # Characters per chunk

        for i in range(0, len(content), chunk_size):
            yield content[i:i + chunk_size]


_orchestrator: Orchestrator | None = None


@lru_cache
def get_orchestrator() -> Orchestrator:
    """Get the global orchestrator instance."""
    global _orchestrator
    if _orchestrator is None:
        _orchestrator = Orchestrator()
    return _orchestrator
