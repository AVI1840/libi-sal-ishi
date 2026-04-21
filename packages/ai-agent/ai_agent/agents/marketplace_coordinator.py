"""
Marketplace coordinator agent.
"""

from typing import Any
from uuid import UUID
from datetime import datetime

import structlog

from shared.llm import LLMProvider
from shared.constants import ServiceCategory


logger = structlog.get_logger()


class MarketplaceCoordinatorAgent:
    """
    Agent specialized in marketplace interactions.

    Handles:
    - Service discovery and recommendations
    - Booking assistance
    - Wallet inquiries
    - Service explanations
    """

    def __init__(self, llm: LLMProvider):
        self.llm = llm

    async def handle(
        self,
        message: str,
        wallet_context: dict[str, Any] | None = None,
        available_services: list[dict] | None = None,
    ) -> dict[str, Any]:
        """
        Handle a marketplace-related message.

        Args:
            message: User message about services/wallet
            wallet_context: User's wallet balance and history
            available_services: Services matching user's needs

        Returns:
            Response with marketplace action recommendations
        """
        system_prompt = self._build_marketplace_prompt(wallet_context)

        messages = [
            {"role": "system", "content": system_prompt},
        ]

        # Add available services context
        if available_services:
            services_str = self._format_services(available_services)
            messages.append({
                "role": "system",
                "content": f"שירותים זמינים:\n{services_str}",
            })

        messages.append({"role": "user", "content": message})

        try:
            response = await self.llm.complete(
                messages=messages,
                temperature=0.6,
                max_tokens=400,
            )

            # Determine marketplace action
            action = self._determine_action(message, response.content)

            return {
                "content": response.content,
                "action": action,
                "services_mentioned": self._extract_services(response.content),
            }

        except Exception as e:
            logger.error("Marketplace agent error", error=str(e))
            return {
                "content": "אני יכול לעזור לך למצוא שירותים. ספר לי מה אתה מחפש?",
                "error": str(e),
            }

    def _build_marketplace_prompt(self, wallet_context: dict[str, Any] | None) -> str:
        """Build marketplace-focused system prompt."""
        prompt = """אתה עוזר למצוא ולהזמין שירותים מהסל האישי.

תפקידך:
- לעזור למצוא שירותים מתאימים
- להסביר על עלויות ביחידות
- לעזור בתהליך ההזמנה
- להציע חלופות אם משהו לא זמין

חשוב:
- לדבר בפשטות על הארנק והיחידות
- להסביר מה כלול בכל שירות
- לא להציע שירותים שהמשתמש לא יכול להרשות לעצמו
- להציע שירותים שמתאימים לרמת הסיעוד"""

        if wallet_context:
            balance = wallet_context.get("available_units", "לא ידוע")
            prompt += f"\n\nיתרת ארנק נוכחית: {balance} יחידות"

            if wallet_context.get("optimal_aging_units"):
                prompt += f"\n(מתוכם {wallet_context['optimal_aging_units']} יחידות להזדקנות מיטבית)"

        return prompt

    def _format_services(self, services: list[dict]) -> str:
        """Format services for context."""
        formatted = []
        for svc in services[:5]:
            name = svc.get("title_he", svc.get("title", ""))
            cost = svc.get("unit_cost", "")
            rating = svc.get("rating", "")
            formatted.append(f"- {name}: {cost} יחידות (דירוג: {rating}⭐)")
        return "\n".join(formatted)

    def _determine_action(self, message: str, response: str) -> dict | None:
        """Determine what marketplace action to take."""
        # Check for booking intent
        if any(kw in message for kw in ["להזמין", "לקבוע", "רוצה", "אפשר"]):
            return {
                "type": "initiate_booking",
                "requires_confirmation": True,
            }

        # Check for wallet inquiry
        if any(kw in message for kw in ["ארנק", "יחידות", "יתרה", "כמה"]):
            return {
                "type": "show_wallet",
            }

        # Check for service search
        if any(kw in message for kw in ["לחפש", "למצוא", "מה יש", "שירותים"]):
            return {
                "type": "search_services",
            }

        return None

    def _extract_services(self, response: str) -> list[str]:
        """Extract mentioned service categories from response."""
        categories = []

        category_keywords = {
            "physiotherapy": ["פיזיותרפיה", "פיזיו"],
            "nursing": ["סיעוד", "אחות"],
            "social_activity": ["פעילות חברתית", "מתנ\"ס", "קבוצה"],
            "wellness": ["רווחה", "מסאג'", "הרפיה"],
            "transport": ["הסעה", "נסיעה"],
        }

        for category, keywords in category_keywords.items():
            if any(kw in response for kw in keywords):
                categories.append(category)

        return categories

    async def find_services(
        self,
        user_id: str,
        category: ServiceCategory | None = None,
        query: str | None = None,
        location: dict | None = None,
    ) -> list[dict]:
        """
        Find available services for a user.

        Args:
            user_id: User ID
            category: Service category filter
            query: Search query
            location: User's location for proximity search

        Returns:
            List of matching services
        """
        # TODO: Call marketplace service
        # For now, return mock data

        logger.info(
            "Searching services",
            user_id=user_id,
            category=category,
            query=query,
        )

        return [
            {
                "service_id": "svc-1",
                "title": "Home Physiotherapy",
                "title_he": "פיזיותרפיה בבית",
                "unit_cost": 2,
                "rating": 4.8,
                "vendor_name": "יוסי כהן פיזיותרפיסט",
            },
            {
                "service_id": "svc-2",
                "title": "Coffee and Friends Group",
                "title_he": "קבוצת קפה וחברים",
                "unit_cost": 1,
                "rating": 4.9,
                "vendor_name": "מתנ\"ס הרצליה",
            },
        ]

    async def create_booking(
        self,
        user_id: str,
        service_id: str,
        scheduled_datetime: datetime,
        notes: str | None = None,
    ) -> dict[str, Any]:
        """
        Create a booking through the marketplace.

        Args:
            user_id: User ID
            service_id: Service to book
            scheduled_datetime: Requested time
            notes: Additional notes

        Returns:
            Booking result
        """
        # TODO: Call marketplace service
        # For now, return mock success

        logger.info(
            "Creating booking",
            user_id=user_id,
            service_id=service_id,
            scheduled=scheduled_datetime.isoformat(),
        )

        return {
            "success": True,
            "booking_id": "bkg-001",
            "message": "ההזמנה נקבעה בהצלחה!",
        }
