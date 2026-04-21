"""
Health monitoring agent.
"""

from typing import Any
from datetime import datetime, timedelta

import structlog

from shared.llm import LLMProvider
from shared.constants import HealthMetricType, AlertSeverity


logger = structlog.get_logger()


class HealthMonitorAgent:
    """
    Agent specialized in health monitoring.

    Handles:
    - Health-related conversations
    - Anomaly detection
    - Alert generation
    - Health advice (non-medical)
    """

    def __init__(self, llm: LLMProvider):
        self.llm = llm

    async def handle(
        self,
        message: str,
        health_context: dict[str, Any] | None = None,
    ) -> dict[str, Any]:
        """
        Handle a health-related message.

        Args:
            message: User message about health
            health_context: Recent readings, baselines, alerts

        Returns:
            Response with health-specific metadata
        """
        system_prompt = self._build_health_prompt(health_context)

        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": message},
        ]

        try:
            response = await self.llm.complete(
                messages=messages,
                temperature=0.5,  # Lower temperature for health topics
                max_tokens=400,
            )

            # Check if we should trigger an alert
            alert = self._check_for_alert(message, response.content)

            return {
                "content": response.content,
                "alert": alert,
                "health_action": self._determine_health_action(message),
            }

        except Exception as e:
            logger.error("Health agent error", error=str(e))
            return {
                "content": "אני רוצה לעזור לך עם הנושא הבריאותי הזה. אפשר לספר לי עוד?",
                "error": str(e),
            }

    def _build_health_prompt(self, context: dict[str, Any] | None) -> str:
        """Build health-focused system prompt."""
        prompt = """אתה עוזר בריאות ידידותי (לא רופא).

חשוב:
- לעולם לא לתת אבחנה רפואית
- תמיד להמליץ לפנות לרופא במקרה של חשש
- להיות רגיש ואמפתי
- לשאול שאלות הבהרה
- לעודד הרגלים בריאים

אם מישהו מזכיר:
- כאב חזה / קושי לנשום / סחרחורת חמורה → הפנה מיד לשירותי חירום
- תסמינים מתמשכים → הצע לקבוע תור לרופא
- שינויים בשינה/תיאבון → בדוק על רגשות ובדידות"""

        if context:
            if context.get("recent_readings"):
                readings_str = self._format_readings(context["recent_readings"])
                prompt += f"\n\nמדידות אחרונות:\n{readings_str}"

            if context.get("baselines"):
                prompt += f"\n\nבסיסים רגילים: {context['baselines']}"

        return prompt

    def _format_readings(self, readings: list[dict]) -> str:
        """Format health readings for context."""
        formatted = []
        for reading in readings[:5]:
            metric = reading.get("metric_type", "")
            value = reading.get("value", "")
            date = reading.get("recorded_at", "")
            formatted.append(f"- {metric}: {value} ({date})")
        return "\n".join(formatted)

    def _check_for_alert(self, message: str, response: str) -> dict | None:
        """Check if an alert should be generated."""
        # Critical symptoms that need immediate alert
        critical_keywords = ["כאב בחזה", "לא יכול לנשום", "התמוטטתי", "נפלתי"]

        if any(kw in message for kw in critical_keywords):
            return {
                "type": "health_emergency",
                "severity": AlertSeverity.CRITICAL.value,
                "title": "זוהה תסמין חמור",
                "description": f"המשתמש דיווח על: {message[:100]}",
                "notify_family": True,
            }

        # Warning symptoms
        warning_keywords = ["כאב", "סחרחורת", "לא ישנתי", "אין תיאבון"]

        if any(kw in message for kw in warning_keywords):
            return {
                "type": "health_concern",
                "severity": AlertSeverity.MEDIUM.value,
                "title": "דאגה בריאותית",
                "description": f"המשתמש הזכיר: {message[:100]}",
                "notify_family": False,
            }

        return None

    def _determine_health_action(self, message: str) -> str | None:
        """Determine what health action to take."""
        if any(kw in message for kw in ["תרופות", "לקחת", "שכחתי"]):
            return "check_medication_reminder"

        if any(kw in message for kw in ["תור", "רופא", "בדיקה"]):
            return "check_appointments"

        if any(kw in message for kw in ["לחץ", "דופק", "סוכר"]):
            return "log_reading"

        return None

    async def analyze_readings(
        self,
        user_id: str,
        readings: list[dict],
        baselines: dict,
    ) -> dict[str, Any]:
        """
        Analyze health readings for anomalies.

        Args:
            user_id: User ID
            readings: Recent health readings
            baselines: User's normal baselines

        Returns:
            Analysis result with any detected anomalies
        """
        anomalies = []

        for reading in readings:
            metric_type = reading.get("metric_type")
            value = reading.get("value")

            if metric_type in baselines:
                baseline = baselines[metric_type]
                std_dev = baseline.get("std_dev", 10)
                baseline_value = baseline.get("baseline")

                # Check if value is more than 2 standard deviations from baseline
                if abs(value - baseline_value) > 2 * std_dev:
                    anomalies.append({
                        "metric": metric_type,
                        "value": value,
                        "baseline": baseline_value,
                        "deviation": abs(value - baseline_value) / std_dev,
                    })

        if anomalies:
            logger.warning(
                "Health anomalies detected",
                user_id=user_id,
                anomalies=anomalies,
            )

        return {
            "anomalies": anomalies,
            "alert_recommended": len(anomalies) > 0,
        }
