"""
Custom exceptions for the Savta.AI ecosystem.

All exceptions inherit from SavtaAIException for easy catching.
"""

from typing import Any


class SavtaAIException(Exception):
    """Base exception for all Savta.AI errors."""

    def __init__(
        self,
        message: str,
        code: str | None = None,
        details: dict[str, Any] | None = None,
    ):
        super().__init__(message)
        self.message = message
        self.code = code or "INTERNAL_ERROR"
        self.details = details or {}

    def to_dict(self) -> dict[str, Any]:
        """Convert exception to dictionary for API responses."""
        return {
            "code": self.code,
            "message": self.message,
            "details": self.details,
        }


class AuthenticationError(SavtaAIException):
    """Raised when authentication fails."""

    def __init__(self, message: str = "Authentication failed", details: dict[str, Any] | None = None):
        super().__init__(message, code="AUTHENTICATION_ERROR", details=details)


class AuthorizationError(SavtaAIException):
    """Raised when user lacks permission for an action."""

    def __init__(self, message: str = "Permission denied", details: dict[str, Any] | None = None):
        super().__init__(message, code="AUTHORIZATION_ERROR", details=details)


class NotFoundError(SavtaAIException):
    """Raised when a requested resource is not found."""

    def __init__(
        self,
        resource: str,
        resource_id: str | None = None,
        details: dict[str, Any] | None = None,
    ):
        message = f"{resource} not found"
        if resource_id:
            message = f"{resource} with ID '{resource_id}' not found"
        super().__init__(message, code="NOT_FOUND", details=details)
        self.resource = resource
        self.resource_id = resource_id


class ValidationError(SavtaAIException):
    """Raised when input validation fails."""

    def __init__(
        self,
        message: str = "Validation error",
        field: str | None = None,
        details: dict[str, Any] | None = None,
    ):
        super().__init__(message, code="VALIDATION_ERROR", details=details)
        self.field = field
        if field and "field" not in (details or {}):
            self.details["field"] = field


class InsufficientUnitsError(SavtaAIException):
    """Raised when wallet has insufficient units for a transaction."""

    def __init__(
        self,
        required_units: int,
        available_units: int,
        details: dict[str, Any] | None = None,
    ):
        message = f"Insufficient units: required {required_units}, available {available_units}"
        details = details or {}
        details.update({
            "required_units": required_units,
            "available_units": available_units,
        })
        super().__init__(message, code="INSUFFICIENT_UNITS", details=details)
        self.required_units = required_units
        self.available_units = available_units


class ServiceUnavailableError(SavtaAIException):
    """Raised when an external service is unavailable."""

    def __init__(
        self,
        service: str,
        message: str | None = None,
        details: dict[str, Any] | None = None,
    ):
        msg = message or f"Service '{service}' is currently unavailable"
        super().__init__(msg, code="SERVICE_UNAVAILABLE", details=details)
        self.service = service


class RateLimitError(SavtaAIException):
    """Raised when rate limit is exceeded."""

    def __init__(
        self,
        message: str = "Rate limit exceeded",
        retry_after: int | None = None,
        details: dict[str, Any] | None = None,
    ):
        details = details or {}
        if retry_after:
            details["retry_after"] = retry_after
        super().__init__(message, code="RATE_LIMIT_EXCEEDED", details=details)
        self.retry_after = retry_after


class LLMError(SavtaAIException):
    """Raised when LLM provider returns an error."""

    def __init__(
        self,
        provider: str,
        message: str,
        details: dict[str, Any] | None = None,
    ):
        super().__init__(f"LLM error ({provider}): {message}", code="LLM_ERROR", details=details)
        self.provider = provider


class EmergencyDetectedError(SavtaAIException):
    """Raised when an emergency situation is detected."""

    def __init__(
        self,
        emergency_type: str,
        message: str,
        user_id: str | None = None,
        details: dict[str, Any] | None = None,
    ):
        details = details or {}
        details["emergency_type"] = emergency_type
        if user_id:
            details["user_id"] = user_id
        super().__init__(message, code="EMERGENCY_DETECTED", details=details)
        self.emergency_type = emergency_type
        self.user_id = user_id
