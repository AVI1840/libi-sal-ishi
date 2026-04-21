"""
Shared package for Savta.AI ecosystem.

This package contains:
- Pydantic models (DTOs)
- Database utilities
- Authentication (JWT)
- LLM provider abstraction
- Cloud provider abstraction
- TTS provider abstraction
- Common utilities and constants
"""

from shared.config import Settings, get_settings
from shared.exceptions import (
    SavtaAIException,
    AuthenticationError,
    AuthorizationError,
    NotFoundError,
    ValidationError,
    InsufficientUnitsError,
    ServiceUnavailableError,
    RateLimitError,
    LLMError,
    EmergencyDetectedError,
)
from shared.constants import (
    UserRole,
    NursingLevel,
    ServiceCategory,
    BookingStatus,
    TransactionType,
    AlertType,
    AlertSeverity,
    HealthMetricType,
    ConversationChannel,
    MessageRole,
    Language,
)

__version__ = "0.1.0"
__all__ = [
    # Config
    "Settings",
    "get_settings",
    # Exceptions
    "SavtaAIException",
    "AuthenticationError",
    "AuthorizationError",
    "NotFoundError",
    "ValidationError",
    "InsufficientUnitsError",
    "ServiceUnavailableError",
    "RateLimitError",
    "LLMError",
    "EmergencyDetectedError",
    # Constants/Enums
    "UserRole",
    "NursingLevel",
    "ServiceCategory",
    "BookingStatus",
    "TransactionType",
    "AlertType",
    "AlertSeverity",
    "HealthMetricType",
    "ConversationChannel",
    "MessageRole",
    "Language",
]
