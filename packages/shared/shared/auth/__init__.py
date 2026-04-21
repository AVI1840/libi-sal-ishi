"""
Authentication module for Savta.AI ecosystem.

Provides JWT-based authentication that's portable across cloud providers.
"""

from shared.auth.jwt_handler import (
    JWTHandler,
    create_access_token,
    create_refresh_token,
    verify_token,
    decode_token,
    TokenPayload,
)
from shared.auth.permissions import (
    Permission,
    RolePermissions,
    has_permission,
    require_permissions,
)
from shared.auth.password import (
    hash_password,
    verify_password,
)

__all__ = [
    # JWT
    "JWTHandler",
    "create_access_token",
    "create_refresh_token",
    "verify_token",
    "decode_token",
    "TokenPayload",
    # Permissions
    "Permission",
    "RolePermissions",
    "has_permission",
    "require_permissions",
    # Password
    "hash_password",
    "verify_password",
]
