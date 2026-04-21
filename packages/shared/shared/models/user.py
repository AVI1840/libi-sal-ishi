"""
User-related Pydantic models.
Extended with Lev Profile for Optimal Aging OS.
"""

from datetime import date, datetime
from typing import Any, TYPE_CHECKING

from pydantic import BaseModel, Field, field_validator, EmailStr

from shared.constants import Language, NursingLevel, UserRole
from shared.utils import validate_israeli_id, validate_israeli_phone

if TYPE_CHECKING:
    from shared.models.lev_profile import LevProfile


class Address(BaseModel):
    """Address model."""
    street: str = Field(..., min_length=1, max_length=255)
    city: str = Field(..., min_length=1, max_length=100)
    postal_code: str | None = None
    lat: float | None = Field(default=None, ge=-90, le=90)
    lng: float | None = Field(default=None, ge=-180, le=180)


class EmergencyContact(BaseModel):
    """Emergency contact model."""
    name: str = Field(..., min_length=1, max_length=100)
    phone: str = Field(..., min_length=9, max_length=20)
    relation: str | None = Field(default=None, max_length=50)

    @field_validator("phone")
    @classmethod
    def validate_phone(cls, v: str) -> str:
        if not validate_israeli_phone(v):
            raise ValueError("Invalid Israeli phone number")
        return v


class UserPreferences(BaseModel):
    """User preferences model."""
    speech_speed: float = Field(default=0.85, ge=0.5, le=1.5)
    preferred_call_times: list[str] = Field(default_factory=lambda: ["09:00-12:00", "16:00-19:00"])
    topics_to_avoid: list[str] = Field(default_factory=list)
    notifications_enabled: bool = True
    sms_enabled: bool = True
    email_enabled: bool = False


class UserBase(BaseModel):
    """Base user model with common fields."""
    first_name: str = Field(..., min_length=1, max_length=100)
    last_name: str = Field(..., min_length=1, max_length=100)
    birth_date: date
    phone: str = Field(..., min_length=9, max_length=20)
    email: EmailStr | None = None
    address: Address | None = None
    languages: list[Language] = Field(default_factory=lambda: [Language.HEBREW])
    nursing_level: int | None = Field(default=None, ge=1, le=6)

    @field_validator("phone")
    @classmethod
    def validate_phone(cls, v: str) -> str:
        if not validate_israeli_phone(v):
            raise ValueError("Invalid Israeli phone number")
        return v

    @field_validator("birth_date")
    @classmethod
    def validate_birth_date(cls, v: date) -> date:
        from shared.utils import utc_now
        today = utc_now().date()
        if v > today:
            raise ValueError("Birth date cannot be in the future")
        age = (today - v).days // 365
        if age > 120:
            raise ValueError("Invalid birth date (age > 120)")
        return v


class UserCreate(UserBase):
    """Model for creating a new user."""
    teudat_zehut: str = Field(..., min_length=9, max_length=9)
    preferences: UserPreferences = Field(default_factory=UserPreferences)
    emergency_contacts: list[EmergencyContact] = Field(default_factory=list)

    @field_validator("teudat_zehut")
    @classmethod
    def validate_teudat_zehut(cls, v: str) -> str:
        if not validate_israeli_id(v):
            raise ValueError("Invalid Israeli ID number")
        return v


class UserUpdate(BaseModel):
    """Model for updating a user."""
    first_name: str | None = Field(default=None, min_length=1, max_length=100)
    last_name: str | None = Field(default=None, min_length=1, max_length=100)
    phone: str | None = Field(default=None, min_length=9, max_length=20)
    email: EmailStr | None = None
    address: Address | None = None
    languages: list[Language] | None = None
    nursing_level: int | None = Field(default=None, ge=1, le=6)
    preferences: UserPreferences | None = None
    emergency_contacts: list[EmergencyContact] | None = None

    @field_validator("phone")
    @classmethod
    def validate_phone(cls, v: str | None) -> str | None:
        if v is not None and not validate_israeli_phone(v):
            raise ValueError("Invalid Israeli phone number")
        return v


class UserResponse(UserBase):
    """Model for user response (excludes sensitive data)."""
    user_id: str
    is_active: bool
    created_at: datetime
    updated_at: datetime
    preferences: UserPreferences
    emergency_contacts: list[EmergencyContact]

    # Masked sensitive fields
    teudat_zehut_masked: str | None = None

    # Lev Profile summary (for display)
    lev_profile_summary: dict | None = Field(
        default=None,
        description="Summary of Lev profile for UI display"
    )
    has_completed_intake: bool = Field(
        default=False,
        description="Whether intake wizard was completed"
    )

    model_config = {"from_attributes": True}


class UserInDB(UserBase):
    """Internal user model with all fields (including sensitive)."""
    user_id: str
    teudat_zehut: str
    preferences: UserPreferences
    emergency_contacts: list[EmergencyContact]
    is_active: bool
    created_at: datetime
    updated_at: datetime

    # Lev Profile fields (extended for Optimal Aging OS)
    lev_profile: Any | None = Field(
        default=None,
        description="Complete Lev profile with intake data, ICF, risk flags, persona"
    )
    has_income_supplement: bool = Field(
        default=False,
        description="Receives income supplement (affects subsidy calculation)"
    )
    last_activity_date: date | None = Field(
        default=None,
        description="Last date user had any activity (booking, login, etc.)"
    )
    authority_id: str | None = Field(
        default=None,
        description="ID of the local authority this user belongs to"
    )

    model_config = {"from_attributes": True}


# ===========================================
# Family Member Models
# ===========================================

class FamilyMemberBase(BaseModel):
    """Base family member model."""
    name: str = Field(..., min_length=1, max_length=100)
    phone: str = Field(..., min_length=9, max_length=20)
    email: EmailStr | None = None
    relation: str | None = Field(default=None, max_length=50)

    @field_validator("phone")
    @classmethod
    def validate_phone(cls, v: str) -> str:
        if not validate_israeli_phone(v):
            raise ValueError("Invalid Israeli phone number")
        return v


class NotificationPreferences(BaseModel):
    """Family member notification preferences."""
    alerts: bool = True
    weekly_summary: bool = True
    daily_update: bool = False
    emergency_only: bool = False


class FamilyMemberCreate(FamilyMemberBase):
    """Model for creating a family member."""
    user_id: str
    notification_preferences: NotificationPreferences = Field(
        default_factory=NotificationPreferences
    )


class FamilyMemberResponse(FamilyMemberBase):
    """Model for family member response."""
    family_member_id: str
    user_id: str
    notification_preferences: NotificationPreferences
    created_at: datetime

    model_config = {"from_attributes": True}
