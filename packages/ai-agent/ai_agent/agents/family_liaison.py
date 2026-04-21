"""
Family liaison agent for family communication.
"""

from typing import Any
from datetime import datetime

import structlog

from shared.llm import LLMProvider
from shared.constants import AlertSeverity


logger = structlog.get_logger()


class FamilyLiaisonAgent:
    """
    Agent specialized in family communication.

    Handles:
    - Family notifications
    - Weekly summaries
    - Alert escalation
    - Privacy-aware information sharing
    """

    def __init__(self, llm: LLMProvider):
        self.llm = llm

    async def generate_family_update(
        self,
        user_id: str,
        period_days: int = 7,
        family_member_permissions: dict | None = None,
    ) -> dict[str, Any]:
        """
        Generate a family update summary.

        Args:
            user_id: Senior user ID
            period_days: Number of days to summarize
            family_member_permissions: What the family member is allowed to see

        Returns:
            Family-friendly summary
        """
        # TODO: Gather data for summary
        # - Conversation sentiment trend
        # - Health metrics (if permitted)
        # - Activities and bookings
        # - Notable events

        summary_data = await self._gather_summary_data(user_id, period_days)

        # Generate natural language summary
        system_prompt = """אתה כותב עדכון משפחתי על אדם מבוגר.

חשוב:
- להיות חיובי אך כנה
- לא להגזים עם דאגות
- להתמקד בדברים חשובים
- לכתוב בעברית ברורה ונעימה
- לכבד את פרטיות המשתמש"""

        user_prompt = f"""כתוב עדכון קצר למשפחה על השבוע האחרון.

נתונים:
- מספר שיחות: {summary_data.get('conversation_count', 0)}
- מצב רוח כללי: {summary_data.get('mood_trend', 'טוב')}
- פעילויות: {summary_data.get('activities', 'לא היו')}
- בריאות: {summary_data.get('health_status', 'יציב')}
- הערות מיוחדות: {summary_data.get('notes', 'אין')}"""

        try:
            response = await self.llm.complete(
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt},
                ],
                temperature=0.7,
                max_tokens=300,
            )

            return {
                "summary": response.content,
                "period_start": datetime.now().isoformat(),
                "period_end": datetime.now().isoformat(),
                "data": summary_data,
            }

        except Exception as e:
            logger.error("Family summary generation error", error=str(e))
            return {
                "summary": "לא ניתן ליצור עדכון כרגע",
                "error": str(e),
            }

    async def _gather_summary_data(
        self,
        user_id: str,
        period_days: int,
    ) -> dict[str, Any]:
        """Gather data for family summary."""
        # TODO: Implement actual data gathering
        # For now, return mock data

        return {
            "conversation_count": 12,
            "mood_trend": "טוב - חיובי יותר מהשבוע הקודם",
            "activities": "פיזיותרפיה פעמיים, קבוצת קפה פעם אחת",
            "health_status": "יציב, שינה טובה",
            "notes": "שיתף סיפורים על הנכדים 💙",
        }

    async def send_alert_notification(
        self,
        user_id: str,
        alert: dict,
        family_contacts: list[dict],
    ) -> dict[str, Any]:
        """
        Send alert notification to family members.

        Args:
            user_id: Senior user ID
            alert: Alert details
            family_contacts: List of family members to notify

        Returns:
            Notification result
        """
        severity = alert.get("severity", AlertSeverity.LOW.value)

        # Generate alert message
        if severity == AlertSeverity.CRITICAL.value:
            template = "🚨 התראה דחופה: {title}\n\n{description}\n\nאנא צור קשר מיד."
        elif severity == AlertSeverity.HIGH.value:
            template = "⚠️ התראה חשובה: {title}\n\n{description}"
        else:
            template = "ℹ️ עדכון: {title}\n\n{description}"

        message = template.format(
            title=alert.get("title", "התראה"),
            description=alert.get("description", ""),
        )

        # TODO: Actually send notifications (SMS, push, email)
        # For now, log the notification

        for contact in family_contacts:
            logger.info(
                "Sending family notification",
                contact_name=contact.get("name"),
                contact_phone=contact.get("phone"),
                severity=severity,
            )

        return {
            "success": True,
            "notifications_sent": len(family_contacts),
            "message": message,
        }

    async def handle_family_inquiry(
        self,
        family_member_id: str,
        user_id: str,
        question: str,
        permissions: dict,
    ) -> dict[str, Any]:
        """
        Handle a question from a family member about their loved one.

        Args:
            family_member_id: Family member asking
            user_id: Senior being asked about
            question: The question
            permissions: What info can be shared

        Returns:
            Response respecting privacy settings
        """
        # Check permissions
        allowed_topics = permissions.get("allowed_topics", [])

        # Determine what the question is about
        topic = self._classify_question_topic(question)

        if topic not in allowed_topics and "all" not in allowed_topics:
            return {
                "content": "מצטער, אין לי הרשאה לשתף מידע על הנושא הזה. אנא פנה ישירות.",
                "blocked_by_privacy": True,
            }

        # Generate appropriate response
        system_prompt = f"""אתה עוזר לבן משפחה לקבל מידע על יקירם.

מותר לשתף מידע על: {', '.join(allowed_topics)}

היה:
- מרגיע אך כנה
- תמציתי
- מכבד את פרטיות המבוגר"""

        try:
            response = await self.llm.complete(
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": question},
                ],
                temperature=0.5,
                max_tokens=200,
            )

            return {
                "content": response.content,
                "topic": topic,
            }

        except Exception as e:
            logger.error("Family inquiry error", error=str(e))
            return {
                "content": "אני לא יכול לענות כרגע. נסה שוב מאוחר יותר.",
                "error": str(e),
            }

    def _classify_question_topic(self, question: str) -> str:
        """Classify what topic the question is about."""
        question_lower = question.lower()

        if any(kw in question_lower for kw in ["בריאות", "כאב", "רופא", "תרופות"]):
            return "health"

        if any(kw in question_lower for kw in ["מצב רוח", "שמח", "עצוב", "לבד"]):
            return "emotional"

        if any(kw in question_lower for kw in ["פעילות", "יצא", "תור", "שירות"]):
            return "activities"

        if any(kw in question_lower for kw in ["אכל", "ישן", "שתה"]):
            return "daily_routine"

        return "general"
