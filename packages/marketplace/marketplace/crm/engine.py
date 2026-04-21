"""
Proactive CRM Engine for Lev Optimal Aging OS.

Key Principle: Do not show a list of users. Show a list of ACTIONS.

Daily Jobs:
- Silent User Detection (21+ days without activity)
- Loneliness Intervention Suggestions
- Birthday Gift Vouchers
- Expiring Balance Alerts
- Low Balance Warnings
- Follow-up after Services
- Reactivation Campaigns
"""

from dataclasses import dataclass, field
from datetime import date, datetime, timedelta
from enum import Enum
from typing import TYPE_CHECKING

import structlog

from shared.constants import (
    CRMActionType,
    CRM_ACTION_LABELS_HE,
    RiskFlagType,
    RISK_FLAG_DISPLAY_LABELS_HE,
    KPI_THRESHOLDS,
    PersonaType,
    PERSONA_DISPLAY_LABELS_HE,
)

if TYPE_CHECKING:
    from shared.models.lev_profile import LevProfile


logger = structlog.get_logger()


class ActionPriority(str, Enum):
    """Priority levels for CRM actions."""
    URGENT = "urgent"          # Requires immediate attention
    HIGH = "high"              # Should be handled today
    MEDIUM = "medium"          # Handle within 3 days
    LOW = "low"                # Handle within a week


@dataclass
class CRMAction:
    """A proactive action for the case manager to take."""
    action_id: str
    action_type: CRMActionType

    # User info
    user_id: str
    user_name: str
    user_phone: str | None = None

    # Action details
    title_he: str = ""
    description_he: str = ""
    suggested_action_he: str = ""

    # Priority and timing
    priority: ActionPriority = ActionPriority.MEDIUM
    due_date: date | None = None
    created_at: datetime = field(default_factory=datetime.now)

    # Context
    trigger_reason: str = ""
    persona_hint: str | None = None
    engagement_tips: list[str] = field(default_factory=list)

    # Service suggestion (if applicable)
    suggested_service_id: str | None = None
    suggested_service_name: str | None = None

    # Status
    status: str = "pending"  # pending, in_progress, completed, dismissed
    completed_at: datetime | None = None
    notes: str | None = None

    def to_dict(self) -> dict:
        """Convert to dictionary for API response."""
        return {
            "action_id": self.action_id,
            "action_type": self.action_type.value,
            "user_id": self.user_id,
            "user_name": self.user_name,
            "user_phone": self.user_phone,
            "title_he": self.title_he,
            "description_he": self.description_he,
            "suggested_action_he": self.suggested_action_he,
            "priority": self.priority.value,
            "due_date": self.due_date.isoformat() if self.due_date else None,
            "created_at": self.created_at.isoformat(),
            "trigger_reason": self.trigger_reason,
            "persona_hint": self.persona_hint,
            "engagement_tips": self.engagement_tips,
            "suggested_service_id": self.suggested_service_id,
            "suggested_service_name": self.suggested_service_name,
            "status": self.status,
        }


@dataclass
class CRMDashboardSummary:
    """Summary statistics for case manager dashboard."""
    total_actions: int = 0
    urgent_actions: int = 0
    high_priority_actions: int = 0

    # By action type
    silent_users_count: int = 0
    loneliness_interventions_count: int = 0
    birthdays_count: int = 0
    expiring_balance_count: int = 0
    low_balance_count: int = 0
    follow_ups_count: int = 0

    # Overall health
    total_active_clients: int = 0
    clients_at_risk: int = 0
    prevention_service_percentage: float = 0.0

    def to_dict(self) -> dict:
        """Convert to dictionary for API response."""
        return {
            "total_actions": self.total_actions,
            "urgent_actions": self.urgent_actions,
            "high_priority_actions": self.high_priority_actions,
            "by_type": {
                "silent_users": self.silent_users_count,
                "loneliness_interventions": self.loneliness_interventions_count,
                "birthdays": self.birthdays_count,
                "expiring_balance": self.expiring_balance_count,
                "low_balance": self.low_balance_count,
                "follow_ups": self.follow_ups_count,
            },
            "health": {
                "total_active_clients": self.total_active_clients,
                "clients_at_risk": self.clients_at_risk,
                "prevention_service_percentage": round(self.prevention_service_percentage, 1),
            }
        }


class CRMEngine:
    """
    Proactive CRM Engine for Case Managers.

    Generates action-oriented alerts and suggestions based on:
    - User activity patterns
    - Risk flags
    - Wallet status
    - Calendar events (birthdays)
    - Service completion follow-ups
    """

    def __init__(self):
        self._action_counter = 0

    def generate_actions(
        self,
        users: list["LevProfile"],
        wallets: list[dict] | None = None,
        recent_bookings: list[dict] | None = None,
    ) -> list[CRMAction]:
        """
        Generate all proactive CRM actions for a list of users.

        This is the main daily job that populates the case manager's action list.
        """
        actions: list[CRMAction] = []

        wallets_map = {w.get("user_id"): w for w in (wallets or [])}
        bookings_map = self._group_bookings_by_user(recent_bookings or [])

        for user in users:
            user_actions = self._generate_user_actions(
                user,
                wallets_map.get(user.user_id),
                bookings_map.get(user.user_id, []),
            )
            actions.extend(user_actions)

        # Sort by priority and due date
        actions.sort(key=lambda a: (
            {"urgent": 0, "high": 1, "medium": 2, "low": 3}[a.priority.value],
            a.due_date or date.max,
        ))

        logger.info(
            "Generated CRM actions",
            total_users=len(users),
            total_actions=len(actions),
            urgent=sum(1 for a in actions if a.priority == ActionPriority.URGENT),
        )

        return actions

    def _generate_user_actions(
        self,
        user: "LevProfile",
        wallet: dict | None,
        recent_bookings: list[dict],
    ) -> list[CRMAction]:
        """Generate actions for a single user."""
        actions: list[CRMAction] = []

        # Get user's persona for engagement tips
        persona_hint = None
        engagement_tips = []
        if user.persona:
            persona_hint = PERSONA_DISPLAY_LABELS_HE.get(
                user.persona.primary_persona.value,
                None
            )
            engagement_tips = user.persona.engagement_tips or []

        # Check: Silent User (21+ days)
        if user.risk_flags.is_inactive:
            actions.append(self._create_silent_user_action(
                user, persona_hint, engagement_tips
            ))

        # Check: Loneliness Intervention
        if user.risk_flags.is_lonely:
            actions.append(self._create_loneliness_action(
                user, persona_hint, engagement_tips
            ))

        # Check: Birthday (within next 7 days)
        # Note: In real implementation, would check user's birth_date
        # For mock, we'll skip this check

        # Check: Expiring Balance (within 14 days)
        if wallet and self._is_balance_expiring(wallet):
            actions.append(self._create_expiring_balance_action(
                user, wallet, persona_hint
            ))

        # Check: Low Balance (< 15%)
        if wallet and self._is_balance_low(wallet):
            actions.append(self._create_low_balance_action(
                user, wallet, persona_hint
            ))

        # Check: Follow-up after recent completed service
        for booking in recent_bookings:
            if self._needs_follow_up(booking):
                actions.append(self._create_follow_up_action(
                    user, booking, persona_hint
                ))
                break  # Only one follow-up at a time

        return actions

    def _create_silent_user_action(
        self,
        user: "LevProfile",
        persona_hint: str | None,
        engagement_tips: list[str],
    ) -> CRMAction:
        """Create action for silent user."""
        self._action_counter += 1

        return CRMAction(
            action_id=f"action-{self._action_counter}",
            action_type=CRMActionType.SILENT_USER,
            user_id=user.user_id,
            user_name=user.city or "משתמש",  # Would use actual name in production
            title_he="משתמש שקט - ליצור קשר",
            description_he="לא הייתה פעילות יותר מ-21 יום",
            suggested_action_he="להתקשר ולברר מצב, להציע פעילות מתאימה",
            priority=ActionPriority.HIGH,
            due_date=date.today(),
            trigger_reason="inactive_21_days",
            persona_hint=persona_hint,
            engagement_tips=engagement_tips,
        )

    def _create_loneliness_action(
        self,
        user: "LevProfile",
        persona_hint: str | None,
        engagement_tips: list[str],
    ) -> CRMAction:
        """Create loneliness intervention action."""
        self._action_counter += 1

        # Suggest group activity based on meaning tags
        suggested_service = self._suggest_group_service(user)

        return CRMAction(
            action_id=f"action-{self._action_counter}",
            action_type=CRMActionType.LONELINESS_INTERVENTION,
            user_id=user.user_id,
            user_name=user.city or "משתמש",
            title_he="להציע פעילות חברתית",
            description_he=f"ציון בדידות נמוך ({user.intake_data.loneliness_score}/10)",
            suggested_action_he="להציע פעילות קבוצתית שמתאימה לתחומי העניין",
            priority=ActionPriority.HIGH,
            due_date=date.today() + timedelta(days=2),
            trigger_reason="loneliness_score_low",
            persona_hint=persona_hint,
            engagement_tips=engagement_tips,
            suggested_service_id=suggested_service.get("id") if suggested_service else None,
            suggested_service_name=suggested_service.get("name") if suggested_service else None,
        )

    def _create_expiring_balance_action(
        self,
        user: "LevProfile",
        wallet: dict,
        persona_hint: str | None,
    ) -> CRMAction:
        """Create expiring balance alert."""
        self._action_counter += 1

        expiry_date = wallet.get("expiry_date", "")
        balance = wallet.get("available_units", 0)

        return CRMAction(
            action_id=f"action-{self._action_counter}",
            action_type=CRMActionType.EXPIRING_BALANCE,
            user_id=user.user_id,
            user_name=user.city or "משתמש",
            title_he="יתרה עומדת לפוג",
            description_he=f"יש {balance} יחידות שיפוגו ב-{expiry_date}",
            suggested_action_he="להתקשר ולהציע שירותים שניתן לנצל",
            priority=ActionPriority.URGENT,
            due_date=date.today(),
            trigger_reason="balance_expiring",
            persona_hint=persona_hint,
        )

    def _create_low_balance_action(
        self,
        user: "LevProfile",
        wallet: dict,
        persona_hint: str | None,
    ) -> CRMAction:
        """Create low balance warning."""
        self._action_counter += 1

        balance = wallet.get("available_units", 0)
        total = wallet.get("total_units", 1)
        percentage = int((balance / total) * 100) if total > 0 else 0

        return CRMAction(
            action_id=f"action-{self._action_counter}",
            action_type=CRMActionType.LOW_BALANCE,
            user_id=user.user_id,
            user_name=user.city or "משתמש",
            title_he="יתרה נמוכה",
            description_he=f"נותרו רק {percentage}% מהסל ({balance} יחידות)",
            suggested_action_he="לבדוק זכויות נוספות או להתאים תוכנית",
            priority=ActionPriority.MEDIUM,
            due_date=date.today() + timedelta(days=3),
            trigger_reason="low_balance",
            persona_hint=persona_hint,
        )

    def _create_follow_up_action(
        self,
        user: "LevProfile",
        booking: dict,
        persona_hint: str | None,
    ) -> CRMAction:
        """Create follow-up action after service completion."""
        self._action_counter += 1

        service_name = booking.get("service_name", "שירות")
        completed_date = booking.get("completed_at", "")

        return CRMAction(
            action_id=f"action-{self._action_counter}",
            action_type=CRMActionType.FOLLOW_UP,
            user_id=user.user_id,
            user_name=user.city or "משתמש",
            title_he="מעקב אחרי שירות",
            description_he=f"השלים/ה {service_name} ב-{completed_date}",
            suggested_action_he="לברר שביעות רצון ולהציע המשך",
            priority=ActionPriority.LOW,
            due_date=date.today() + timedelta(days=3),
            trigger_reason="service_completed",
            persona_hint=persona_hint,
            suggested_service_id=booking.get("service_id"),
        )

    def _create_birthday_action(
        self,
        user: "LevProfile",
        birthday: date,
    ) -> CRMAction:
        """Create birthday gift voucher action."""
        self._action_counter += 1

        days_until = (birthday - date.today()).days

        return CRMAction(
            action_id=f"action-{self._action_counter}",
            action_type=CRMActionType.BIRTHDAY_GIFT,
            user_id=user.user_id,
            user_name=user.city or "משתמש",
            title_he="🎂 יום הולדת קרוב",
            description_he=f"יום הולדת בעוד {days_until} ימים",
            suggested_action_he="לשלוח שובר מתנה וברכה",
            priority=ActionPriority.MEDIUM,
            due_date=birthday - timedelta(days=2),
            trigger_reason="birthday",
        )

    def _is_balance_expiring(self, wallet: dict) -> bool:
        """Check if balance is expiring within threshold."""
        expiry_date = wallet.get("expiry_date")
        if not expiry_date:
            return False

        if isinstance(expiry_date, str):
            expiry_date = date.fromisoformat(expiry_date)

        days_until = (expiry_date - date.today()).days
        return days_until <= KPI_THRESHOLDS["expiring_balance_days"]

    def _is_balance_low(self, wallet: dict) -> bool:
        """Check if balance is below threshold."""
        available = wallet.get("available_units", 0)
        total = wallet.get("total_units", 1)

        if total == 0:
            return False

        percentage = available / total
        return percentage <= KPI_THRESHOLDS["low_balance_percentage"]

    def _needs_follow_up(self, booking: dict) -> bool:
        """Check if booking needs follow-up."""
        if booking.get("status") != "completed":
            return False

        completed_at = booking.get("completed_at")
        if not completed_at:
            return False

        if isinstance(completed_at, str):
            completed_at = datetime.fromisoformat(completed_at).date()
        elif isinstance(completed_at, datetime):
            completed_at = completed_at.date()

        # Follow up 2-5 days after completion
        days_since = (date.today() - completed_at).days
        return 2 <= days_since <= 5

    def _suggest_group_service(self, user: "LevProfile") -> dict | None:
        """Suggest a group service based on user's meaning tags."""
        # In production, this would query the service catalog
        # For mock, return a placeholder
        meaning_tags = user.intake_data.meaning_tags

        if not meaning_tags:
            return {"id": "service-6", "name": "מועדון צהריים חברתי"}

        # Map meaning tags to service suggestions
        from shared.constants import MeaningTag

        suggestions = {
            MeaningTag.MUSIC: {"id": "service-music", "name": "מקהלה קהילתית"},
            MeaningTag.ART: {"id": "service-7", "name": "סדנת ציור ויצירה"},
            MeaningTag.SPORTS: {"id": "service-5", "name": "הליכה קבוצתית בפארק"},
            MeaningTag.SOCIAL: {"id": "service-6", "name": "מועדון צהריים חברתי"},
            MeaningTag.LEARNING: {"id": "service-9", "name": "אימון זיכרון"},
        }

        for tag in meaning_tags:
            if tag in suggestions:
                return suggestions[tag]

        return {"id": "service-6", "name": "מועדון צהריים חברתי"}

    def _group_bookings_by_user(self, bookings: list[dict]) -> dict[str, list[dict]]:
        """Group bookings by user ID."""
        result: dict[str, list[dict]] = {}
        for booking in bookings:
            user_id = booking.get("user_id", booking.get("client_id"))
            if user_id:
                if user_id not in result:
                    result[user_id] = []
                result[user_id].append(booking)
        return result

    def get_dashboard_summary(
        self,
        actions: list[CRMAction],
        total_clients: int = 0,
        clients_at_risk: int = 0,
        prevention_percentage: float = 0.0,
    ) -> CRMDashboardSummary:
        """Generate dashboard summary from actions."""
        summary = CRMDashboardSummary(
            total_actions=len(actions),
            urgent_actions=sum(1 for a in actions if a.priority == ActionPriority.URGENT),
            high_priority_actions=sum(1 for a in actions if a.priority == ActionPriority.HIGH),
            silent_users_count=sum(1 for a in actions if a.action_type == CRMActionType.SILENT_USER),
            loneliness_interventions_count=sum(1 for a in actions if a.action_type == CRMActionType.LONELINESS_INTERVENTION),
            birthdays_count=sum(1 for a in actions if a.action_type == CRMActionType.BIRTHDAY_GIFT),
            expiring_balance_count=sum(1 for a in actions if a.action_type == CRMActionType.EXPIRING_BALANCE),
            low_balance_count=sum(1 for a in actions if a.action_type == CRMActionType.LOW_BALANCE),
            follow_ups_count=sum(1 for a in actions if a.action_type == CRMActionType.FOLLOW_UP),
            total_active_clients=total_clients,
            clients_at_risk=clients_at_risk,
            prevention_service_percentage=prevention_percentage,
        )
        return summary


# Singleton instance
crm_engine = CRMEngine()
