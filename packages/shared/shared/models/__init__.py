"""
Shared Pydantic models (DTOs) for the Lev (לב) Optimal Aging OS.
"""

from shared.models.user import (
    UserBase,
    UserCreate,
    UserUpdate,
    UserResponse,
    UserInDB,
    FamilyMemberBase,
    FamilyMemberCreate,
    FamilyMemberResponse,
    Address,
    EmergencyContact,
    UserPreferences,
)
from shared.models.wallet import (
    WalletBase,
    WalletCreate,
    WalletResponse,
    WalletBalance,
    UnitAllocation,
)
from shared.models.booking import (
    BookingBase,
    BookingCreate,
    BookingUpdate,
    BookingResponse,
    BookingWithDetails,
    ProofOfService,
)
from shared.models.service import (
    ServiceBase,
    ServiceCreate,
    ServiceUpdate,
    ServiceResponse,
    ServiceSearchParams,
    ServiceAvailability,
    ServicePricing,
    ICFRequirements,
)
from shared.models.health import (
    HealthReading,
    HealthBaseline,
    HealthAlert,
    HealthSummary,
)
from shared.models.conversation import (
    Message,
    ConversationBase,
    ConversationResponse,
    ConversationSummary,
)
from shared.models.common import (
    PaginatedResponse,
    APIResponse,
    ErrorResponse,
)
from shared.models.lev_profile import (
    LevProfile,
    IntakeData,
    ICFProfile,
    RiskFlags,
    UserPersona,
    IntakeQuestion,
    IntakeWizardConfig,
    DEFAULT_INTAKE_QUESTIONS,
)
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
    LimorStandaloneIntake,
    LIMOR_SYSTEM_PROMPTS,
    LIMOR_PERSONA_LABELS_HE,
    LIMOR_PERSONA_DESCRIPTIONS_HE,
)

__all__ = [
    # User models
    "UserBase",
    "UserCreate",
    "UserUpdate",
    "UserResponse",
    "UserInDB",
    "FamilyMemberBase",
    "FamilyMemberCreate",
    "FamilyMemberResponse",
    "Address",
    "EmergencyContact",
    "UserPreferences",
    # Wallet models
    "WalletBase",
    "WalletCreate",
    "WalletResponse",
    "WalletBalance",
    "UnitAllocation",
    # Booking models
    "BookingBase",
    "BookingCreate",
    "BookingUpdate",
    "BookingResponse",
    "BookingWithDetails",
    "ProofOfService",
    # Service models
    "ServiceBase",
    "ServiceCreate",
    "ServiceUpdate",
    "ServiceResponse",
    "ServiceSearchParams",
    "ServiceAvailability",
    "ServicePricing",
    "ICFRequirements",
    # Health models
    "HealthReading",
    "HealthBaseline",
    "HealthAlert",
    "HealthSummary",
    # Conversation models
    "Message",
    "ConversationBase",
    "ConversationResponse",
    "ConversationSummary",
    # Common models
    "PaginatedResponse",
    "APIResponse",
    "ErrorResponse",
    # Lev Profile models
    "LevProfile",
    "IntakeData",
    "ICFProfile",
    "RiskFlags",
    "UserPersona",
    "IntakeQuestion",
    "IntakeWizardConfig",
    "DEFAULT_INTAKE_QUESTIONS",
    # Limor Persona models
    "LimorPersonaType",
    "LimorSettings",
    "LimorContext",
    "MorningBriefingContent",
    "MorningBriefingResponse",
    "EmotionalState",
    "EmotionalSupportResponse",
    "LimorAlert",
    "LimorAlertType",
    "LimorStandaloneIntake",
    "LIMOR_SYSTEM_PROMPTS",
    "LIMOR_PERSONA_LABELS_HE",
    "LIMOR_PERSONA_DESCRIPTIONS_HE",
]
