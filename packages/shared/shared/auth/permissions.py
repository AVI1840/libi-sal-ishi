"""
Permission and role-based access control utilities.
"""

from enum import Enum
from functools import wraps
from typing import Callable

from shared.constants import UserRole
from shared.exceptions import AuthorizationError


class Permission(str, Enum):
    """Available permissions in the system."""

    # User permissions
    READ_OWN_PROFILE = "read:own_profile"
    WRITE_OWN_PROFILE = "write:own_profile"
    DELETE_OWN_PROFILE = "delete:own_profile"

    # Wallet permissions
    READ_OWN_WALLET = "read:own_wallet"
    WRITE_OWN_WALLET = "write:own_wallet"

    # Booking permissions
    READ_OWN_BOOKINGS = "read:own_bookings"
    WRITE_OWN_BOOKINGS = "write:own_bookings"
    CANCEL_OWN_BOOKINGS = "cancel:own_bookings"

    # Health permissions
    READ_OWN_HEALTH = "read:own_health"
    WRITE_OWN_HEALTH = "write:own_health"

    # Conversation permissions
    READ_OWN_CONVERSATIONS = "read:own_conversations"

    # Family permissions (for family members viewing senior's data)
    READ_ASSIGNED_PROFILE = "read:assigned_profile"
    READ_ASSIGNED_HEALTH = "read:assigned_health"
    READ_ASSIGNED_BOOKINGS = "read:assigned_bookings"
    READ_ASSIGNED_ALERTS = "read:assigned_alerts"

    # Case manager permissions
    READ_CLIENT_PROFILE = "read:client_profile"
    WRITE_CLIENT_PROFILE = "write:client_profile"
    READ_CLIENT_WALLET = "read:client_wallet"
    WRITE_CLIENT_BOOKINGS = "write:client_bookings"
    READ_CLIENT_HEALTH = "read:client_health"
    MANAGE_CLIENTS = "manage:clients"

    # Vendor permissions
    READ_OWN_SERVICES = "read:own_services"
    WRITE_OWN_SERVICES = "write:own_services"
    READ_OWN_VENDOR_BOOKINGS = "read:own_vendor_bookings"
    MANAGE_OWN_VENDOR_BOOKINGS = "manage:own_vendor_bookings"
    READ_OWN_FINANCIALS = "read:own_financials"

    # Admin permissions
    READ_ALL_USERS = "read:all_users"
    WRITE_ALL_USERS = "write:all_users"
    READ_ALL_WALLETS = "read:all_wallets"
    WRITE_ALL_WALLETS = "write:all_wallets"
    READ_ALL_BOOKINGS = "read:all_bookings"
    WRITE_ALL_BOOKINGS = "write:all_bookings"
    READ_ALL_SERVICES = "read:all_services"
    WRITE_ALL_SERVICES = "write:all_services"
    MANAGE_VENDORS = "manage:vendors"
    VIEW_ANALYTICS = "view:analytics"
    MANAGE_SYSTEM = "manage:system"


# Role to permissions mapping
RolePermissions: dict[UserRole, list[Permission]] = {
    UserRole.SENIOR: [
        Permission.READ_OWN_PROFILE,
        Permission.WRITE_OWN_PROFILE,
        Permission.READ_OWN_WALLET,
        Permission.READ_OWN_BOOKINGS,
        Permission.WRITE_OWN_BOOKINGS,
        Permission.CANCEL_OWN_BOOKINGS,
        Permission.READ_OWN_HEALTH,
        Permission.WRITE_OWN_HEALTH,
        Permission.READ_OWN_CONVERSATIONS,
    ],

    UserRole.FAMILY: [
        Permission.READ_OWN_PROFILE,
        Permission.WRITE_OWN_PROFILE,
        Permission.READ_ASSIGNED_PROFILE,
        Permission.READ_ASSIGNED_HEALTH,
        Permission.READ_ASSIGNED_BOOKINGS,
        Permission.READ_ASSIGNED_ALERTS,
    ],

    UserRole.CASE_MANAGER: [
        Permission.READ_OWN_PROFILE,
        Permission.WRITE_OWN_PROFILE,
        Permission.READ_CLIENT_PROFILE,
        Permission.WRITE_CLIENT_PROFILE,
        Permission.READ_CLIENT_WALLET,
        Permission.READ_CLIENT_HEALTH,
        Permission.WRITE_CLIENT_BOOKINGS,
        Permission.MANAGE_CLIENTS,
    ],

    UserRole.VENDOR: [
        Permission.READ_OWN_PROFILE,
        Permission.WRITE_OWN_PROFILE,
        Permission.READ_OWN_SERVICES,
        Permission.WRITE_OWN_SERVICES,
        Permission.READ_OWN_VENDOR_BOOKINGS,
        Permission.MANAGE_OWN_VENDOR_BOOKINGS,
        Permission.READ_OWN_FINANCIALS,
    ],

    UserRole.ADMIN: [
        # Admins have all permissions
        Permission.READ_OWN_PROFILE,
        Permission.WRITE_OWN_PROFILE,
        Permission.DELETE_OWN_PROFILE,
        Permission.READ_ALL_USERS,
        Permission.WRITE_ALL_USERS,
        Permission.READ_ALL_WALLETS,
        Permission.WRITE_ALL_WALLETS,
        Permission.READ_ALL_BOOKINGS,
        Permission.WRITE_ALL_BOOKINGS,
        Permission.READ_ALL_SERVICES,
        Permission.WRITE_ALL_SERVICES,
        Permission.MANAGE_VENDORS,
        Permission.VIEW_ANALYTICS,
        Permission.MANAGE_SYSTEM,
    ],
}


def get_permissions_for_role(role: UserRole) -> list[str]:
    """Get list of permission strings for a role."""
    return [p.value for p in RolePermissions.get(role, [])]


def has_permission(
    user_permissions: list[str],
    required_permission: Permission | str,
) -> bool:
    """
    Check if user has a specific permission.

    Args:
        user_permissions: List of permission strings from token
        required_permission: Permission to check

    Returns:
        True if user has the permission
    """
    if isinstance(required_permission, Permission):
        required_permission = required_permission.value
    return required_permission in user_permissions


def has_any_permission(
    user_permissions: list[str],
    required_permissions: list[Permission | str],
) -> bool:
    """
    Check if user has any of the specified permissions.

    Args:
        user_permissions: List of permission strings from token
        required_permissions: List of permissions to check

    Returns:
        True if user has at least one permission
    """
    for perm in required_permissions:
        if has_permission(user_permissions, perm):
            return True
    return False


def has_all_permissions(
    user_permissions: list[str],
    required_permissions: list[Permission | str],
) -> bool:
    """
    Check if user has all specified permissions.

    Args:
        user_permissions: List of permission strings from token
        required_permissions: List of permissions to check

    Returns:
        True if user has all permissions
    """
    for perm in required_permissions:
        if not has_permission(user_permissions, perm):
            return False
    return True


def require_permissions(*permissions: Permission):
    """
    Decorator to require specific permissions for a function.

    The decorated function must have a 'user_permissions' parameter
    or accept **kwargs containing it.

    Usage:
        @require_permissions(Permission.READ_OWN_PROFILE)
        def get_profile(user_id: str, user_permissions: list[str]):
            ...
    """
    def decorator(func: Callable):
        @wraps(func)
        def wrapper(*args, **kwargs):
            user_permissions = kwargs.get("user_permissions", [])

            missing = []
            for perm in permissions:
                if not has_permission(user_permissions, perm):
                    missing.append(perm.value)

            if missing:
                raise AuthorizationError(
                    "Missing required permissions",
                    details={"missing_permissions": missing},
                )

            return func(*args, **kwargs)

        return wrapper
    return decorator


def check_resource_access(
    user_id: str,
    user_role: UserRole,
    resource_owner_id: str,
    user_permissions: list[str],
    read_own_permission: Permission,
    read_all_permission: Permission | None = None,
) -> bool:
    """
    Check if a user can access a resource.

    Args:
        user_id: Current user's ID
        user_role: Current user's role
        resource_owner_id: Owner of the resource
        user_permissions: User's permission list
        read_own_permission: Permission for reading own resources
        read_all_permission: Permission for reading all resources (admin)

    Returns:
        True if user can access the resource

    Raises:
        AuthorizationError: If access is denied
    """
    # Check if user owns the resource
    if user_id == resource_owner_id:
        if has_permission(user_permissions, read_own_permission):
            return True

    # Check if user has admin access
    if read_all_permission and has_permission(user_permissions, read_all_permission):
        return True

    # Access denied
    raise AuthorizationError(
        "You don't have permission to access this resource",
        details={
            "user_id": user_id,
            "resource_owner_id": resource_owner_id,
        },
    )
