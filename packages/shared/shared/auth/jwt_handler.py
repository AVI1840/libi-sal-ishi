"""
JWT token handling utilities.
"""

from datetime import datetime, timedelta, timezone
from typing import Any

from jose import JWTError, jwt
from pydantic import BaseModel, Field

from shared.config import get_settings
from shared.constants import UserRole
from shared.exceptions import AuthenticationError


class TokenPayload(BaseModel):
    """JWT token payload."""
    sub: str  # user_id
    type: str  # access | refresh
    role: UserRole
    permissions: list[str] = Field(default_factory=list)
    iat: datetime
    exp: datetime

    # Optional claims
    name: str | None = None
    email: str | None = None


class JWTHandler:
    """Handles JWT token creation and verification."""

    def __init__(
        self,
        secret_key: str | None = None,
        algorithm: str | None = None,
        access_token_expire_minutes: int | None = None,
        refresh_token_expire_days: int | None = None,
    ):
        settings = get_settings()
        self.secret_key = secret_key or settings.jwt_secret_key
        self.algorithm = algorithm or settings.jwt_algorithm
        self.access_token_expire_minutes = (
            access_token_expire_minutes or settings.jwt_access_token_expire_minutes
        )
        self.refresh_token_expire_days = (
            refresh_token_expire_days or settings.jwt_refresh_token_expire_days
        )

    def create_access_token(
        self,
        user_id: str,
        role: UserRole,
        permissions: list[str] | None = None,
        extra_claims: dict[str, Any] | None = None,
    ) -> str:
        """
        Create an access token.

        Args:
            user_id: User's unique identifier
            role: User's role
            permissions: List of permission strings
            extra_claims: Additional claims to include

        Returns:
            Encoded JWT token string
        """
        now = datetime.now(timezone.utc)
        expire = now + timedelta(minutes=self.access_token_expire_minutes)

        payload = {
            "sub": user_id,
            "type": "access",
            "role": role.value,
            "permissions": permissions or [],
            "iat": now,
            "exp": expire,
        }

        if extra_claims:
            payload.update(extra_claims)

        return jwt.encode(payload, self.secret_key, algorithm=self.algorithm)

    def create_refresh_token(
        self,
        user_id: str,
        role: UserRole,
    ) -> str:
        """
        Create a refresh token.

        Args:
            user_id: User's unique identifier
            role: User's role

        Returns:
            Encoded JWT refresh token string
        """
        now = datetime.now(timezone.utc)
        expire = now + timedelta(days=self.refresh_token_expire_days)

        payload = {
            "sub": user_id,
            "type": "refresh",
            "role": role.value,
            "iat": now,
            "exp": expire,
        }

        return jwt.encode(payload, self.secret_key, algorithm=self.algorithm)

    def verify_token(self, token: str, token_type: str = "access") -> TokenPayload:
        """
        Verify and decode a JWT token.

        Args:
            token: JWT token string
            token_type: Expected token type ("access" or "refresh")

        Returns:
            Decoded token payload

        Raises:
            AuthenticationError: If token is invalid or expired
        """
        try:
            payload = jwt.decode(
                token,
                self.secret_key,
                algorithms=[self.algorithm],
            )

            # Verify token type
            if payload.get("type") != token_type:
                raise AuthenticationError(
                    f"Invalid token type: expected {token_type}",
                    details={"expected_type": token_type},
                )

            # Parse into typed payload
            return TokenPayload(
                sub=payload["sub"],
                type=payload["type"],
                role=UserRole(payload["role"]),
                permissions=payload.get("permissions", []),
                iat=datetime.fromtimestamp(payload["iat"], tz=timezone.utc),
                exp=datetime.fromtimestamp(payload["exp"], tz=timezone.utc),
                name=payload.get("name"),
                email=payload.get("email"),
            )

        except JWTError as e:
            raise AuthenticationError(
                "Invalid or expired token",
                details={"error": str(e)},
            )

    def decode_token(self, token: str, verify: bool = True) -> dict[str, Any]:
        """
        Decode a JWT token without full verification.

        Useful for extracting claims from expired tokens.

        Args:
            token: JWT token string
            verify: Whether to verify signature

        Returns:
            Token payload as dictionary
        """
        try:
            options = {"verify_exp": verify, "verify_signature": verify}
            return jwt.decode(
                token,
                self.secret_key,
                algorithms=[self.algorithm],
                options=options,
            )
        except JWTError as e:
            raise AuthenticationError(
                "Failed to decode token",
                details={"error": str(e)},
            )

    def refresh_access_token(
        self,
        refresh_token: str,
        permissions: list[str] | None = None,
    ) -> tuple[str, str]:
        """
        Refresh an access token using a refresh token.

        Args:
            refresh_token: Valid refresh token
            permissions: Updated permissions (optional)

        Returns:
            Tuple of (new_access_token, new_refresh_token)
        """
        payload = self.verify_token(refresh_token, token_type="refresh")

        new_access = self.create_access_token(
            user_id=payload.sub,
            role=payload.role,
            permissions=permissions or payload.permissions,
        )

        new_refresh = self.create_refresh_token(
            user_id=payload.sub,
            role=payload.role,
        )

        return new_access, new_refresh


# Module-level convenience functions
_default_handler: JWTHandler | None = None


def _get_handler() -> JWTHandler:
    """Get or create default JWT handler."""
    global _default_handler
    if _default_handler is None:
        _default_handler = JWTHandler()
    return _default_handler


def create_access_token(
    user_id: str,
    role: UserRole,
    permissions: list[str] | None = None,
    extra_claims: dict[str, Any] | None = None,
) -> str:
    """Create an access token using default handler."""
    return _get_handler().create_access_token(user_id, role, permissions, extra_claims)


def create_refresh_token(user_id: str, role: UserRole) -> str:
    """Create a refresh token using default handler."""
    return _get_handler().create_refresh_token(user_id, role)


def verify_token(token: str, token_type: str = "access") -> TokenPayload:
    """Verify a token using default handler."""
    return _get_handler().verify_token(token, token_type)


def decode_token(token: str, verify: bool = True) -> dict[str, Any]:
    """Decode a token using default handler."""
    return _get_handler().decode_token(token, verify)
