"""
API route dependencies.
"""

from typing import Annotated
from uuid import UUID

from fastapi import Depends, Header, HTTPException, status

from shared.auth import JWTHandler, verify_token
from shared.config import get_settings
from shared.constants import UserRole
from shared.exceptions import AuthenticationError, AuthorizationError


def get_jwt_handler() -> JWTHandler:
    """Get JWT handler instance."""
    settings = get_settings()
    return JWTHandler(
        secret_key=settings.jwt_secret_key,
        algorithm=settings.jwt_algorithm,
        access_token_expire_minutes=settings.jwt_access_token_expire_minutes,
        refresh_token_expire_days=settings.jwt_refresh_token_expire_days,
    )


async def get_current_user(
    authorization: Annotated[str | None, Header()] = None,
    jwt_handler: JWTHandler = Depends(get_jwt_handler),
) -> dict:
    """
    Get the current authenticated user from JWT token.

    Returns user payload from token.
    """
    if not authorization:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authorization header missing",
        )

    # Extract token from "Bearer <token>"
    parts = authorization.split()
    if len(parts) != 2 or parts[0].lower() != "bearer":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authorization header format",
        )

    token = parts[1]

    try:
        payload = jwt_handler.verify_token(token)
        return payload
    except AuthenticationError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(e),
        )


async def get_current_user_id(
    current_user: dict = Depends(get_current_user),
) -> UUID:
    """Get the current user's ID."""
    return UUID(current_user["sub"])


def require_role(*roles: UserRole):
    """
    Dependency that requires the user to have one of the specified roles.

    Usage:
        @router.get("/admin")
        async def admin_endpoint(
            user: dict = Depends(require_role(UserRole.ADMIN))
        ):
            ...
    """
    async def role_checker(
        current_user: dict = Depends(get_current_user),
    ) -> dict:
        user_role = current_user.get("role")

        if not user_role:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="User role not found in token",
            )

        if user_role not in [r.value for r in roles]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Required role: {[r.value for r in roles]}, got: {user_role}",
            )

        return current_user

    return role_checker
