"""
Structured Memory - Persistent user facts and preferences.

For MVP: Uses in-memory storage with mock data.
Production: Would use PostgreSQL.
"""

from datetime import datetime
from typing import Any
from uuid import uuid4

from pydantic import BaseModel, Field
import structlog

from shared.constants import MeaningTag


logger = structlog.get_logger()


class FamilyMember(BaseModel):
    """Information about a family member."""
    id: str = Field(default_factory=lambda: str(uuid4()))
    name: str
    relation: str  # son, daughter, spouse, caregiver
    phone: str | None = None
    last_contact: datetime | None = None
    notes: str | None = None


class HealthBaseline(BaseModel):
    """Health baseline for anomaly detection."""
    metric_type: str
    baseline_value: float
    std_deviation: float = 0.0
    updated_at: datetime = Field(default_factory=datetime.now)


class Preference(BaseModel):
    """User preference."""
    key: str
    value: Any
    category: str = "general"
    updated_at: datetime = Field(default_factory=datetime.now)


class UserMemory(BaseModel):
    """Persistent memory about a user."""
    user_id: str

    # Basic info
    first_name: str = ""
    preferred_name: str | None = None  # nickname they prefer
    birth_date: datetime | None = None
    city: str | None = None

    # Family
    family_members: list[FamilyMember] = Field(default_factory=list)

    # Health
    nursing_level: int | None = None
    health_baselines: list[HealthBaseline] = Field(default_factory=list)
    medical_conditions: list[str] = Field(default_factory=list)
    medications: list[str] = Field(default_factory=list)

    # Preferences and personality
    meaning_tags: list[MeaningTag] = Field(default_factory=list)
    interests: list[str] = Field(default_factory=list)
    preferences: list[Preference] = Field(default_factory=list)
    topics_to_avoid: list[str] = Field(default_factory=list)

    # Communication preferences
    preferred_language: str = "he"
    speech_speed: float = 0.9  # 0.5-1.5, slower for elderly
    preferred_call_times: list[str] = Field(default_factory=list)

    # Important memories (facts learned from conversations)
    memories: list[dict] = Field(default_factory=list)

    # Metadata
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)

    @property
    def display_name(self) -> str:
        """Get the name to use when addressing the user."""
        return self.preferred_name or self.first_name or "חבר/ה"

    @property
    def age(self) -> int | None:
        """Calculate age from birth date."""
        if not self.birth_date:
            return None
        today = datetime.now()
        age = today.year - self.birth_date.year
        if today.month < self.birth_date.month or (
            today.month == self.birth_date.month and today.day < self.birth_date.day
        ):
            age -= 1
        return age

    def get_preference(self, key: str, default: Any = None) -> Any:
        """Get a preference value by key."""
        for pref in self.preferences:
            if pref.key == key:
                return pref.value
        return default

    def set_preference(self, key: str, value: Any, category: str = "general") -> None:
        """Set or update a preference."""
        for pref in self.preferences:
            if pref.key == key:
                pref.value = value
                pref.updated_at = datetime.now()
                self.updated_at = datetime.now()
                return

        self.preferences.append(Preference(
            key=key,
            value=value,
            category=category,
        ))
        self.updated_at = datetime.now()

    def add_memory(self, content: str, category: str = "fact") -> None:
        """Add a memory about the user."""
        self.memories.append({
            "id": str(uuid4()),
            "content": content,
            "category": category,
            "created_at": datetime.now().isoformat(),
        })
        self.updated_at = datetime.now()

    def get_health_baseline(self, metric_type: str) -> HealthBaseline | None:
        """Get baseline for a health metric."""
        for baseline in self.health_baselines:
            if baseline.metric_type == metric_type:
                return baseline
        return None


class StructuredMemory:
    """
    In-memory storage for structured user data.

    For MVP: Simple dict-based storage.
    Production: Would connect to PostgreSQL.
    """

    def __init__(self):
        self._users: dict[str, UserMemory] = {}

    def get_user(self, user_id: str) -> UserMemory | None:
        """Get user memory by ID."""
        return self._users.get(user_id)

    def get_or_create_user(self, user_id: str) -> UserMemory:
        """Get existing user or create new one."""
        if user_id not in self._users:
            self._users[user_id] = UserMemory(user_id=user_id)
            logger.info("Created new user memory", user_id=user_id)
        return self._users[user_id]

    def update_user(self, user: UserMemory) -> None:
        """Update user memory."""
        user.updated_at = datetime.now()
        self._users[user.user_id] = user

    def add_family_member(
        self,
        user_id: str,
        name: str,
        relation: str,
        phone: str | None = None,
    ) -> FamilyMember:
        """Add a family member to user's memory."""
        user = self.get_or_create_user(user_id)
        member = FamilyMember(
            name=name,
            relation=relation,
            phone=phone,
        )
        user.family_members.append(member)
        self.update_user(user)
        return member

    def update_health_baseline(
        self,
        user_id: str,
        metric_type: str,
        baseline_value: float,
        std_deviation: float = 0.0,
    ) -> HealthBaseline:
        """Update or create health baseline."""
        user = self.get_or_create_user(user_id)

        # Find and update existing baseline
        for baseline in user.health_baselines:
            if baseline.metric_type == metric_type:
                baseline.baseline_value = baseline_value
                baseline.std_deviation = std_deviation
                baseline.updated_at = datetime.now()
                self.update_user(user)
                return baseline

        # Create new baseline
        baseline = HealthBaseline(
            metric_type=metric_type,
            baseline_value=baseline_value,
            std_deviation=std_deviation,
        )
        user.health_baselines.append(baseline)
        self.update_user(user)
        return baseline

    def record_family_contact(self, user_id: str, family_member_id: str) -> None:
        """Record that a family member contacted the user."""
        user = self.get_user(user_id)
        if not user:
            return

        for member in user.family_members:
            if member.id == family_member_id:
                member.last_contact = datetime.now()
                self.update_user(user)
                return

    def get_all_users(self) -> list[UserMemory]:
        """Get all users (for admin/case manager)."""
        return list(self._users.values())

    def search_users(self, query: str) -> list[UserMemory]:
        """Search users by name or city."""
        query_lower = query.lower()
        return [
            user for user in self._users.values()
            if query_lower in user.first_name.lower()
            or (user.preferred_name and query_lower in user.preferred_name.lower())
            or (user.city and query_lower in user.city.lower())
        ]


# Global structured memory instance
_structured_memory: StructuredMemory | None = None


def get_structured_memory() -> StructuredMemory:
    """Get the global structured memory instance."""
    global _structured_memory
    if _structured_memory is None:
        _structured_memory = StructuredMemory()
    return _structured_memory
