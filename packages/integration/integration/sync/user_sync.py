"""
User Data Synchronization.

Ensures user data is consistent between AI Agent and Marketplace services.
"""

from datetime import datetime
from typing import Any
from uuid import UUID

from fastapi import APIRouter, HTTPException, BackgroundTasks
from pydantic import BaseModel, Field
import httpx
import structlog

from integration.config import settings

logger = structlog.get_logger()
router = APIRouter()


class UserSyncRequest(BaseModel):
    """Request to sync user data."""
    user_id: UUID
    fields: list[str] | None = Field(
        None,
        description="Specific fields to sync, or None for full sync"
    )
    source: str = Field(
        "shared",
        description="Source of truth: shared, ai_agent, marketplace"
    )


class UserUpdateEvent(BaseModel):
    """User update event for sync."""
    user_id: UUID
    updated_fields: dict[str, Any]
    source_service: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)


async def fetch_user_from_service(service_url: str, user_id: UUID) -> dict | None:
    """Fetch user data from a service."""
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{service_url}/api/v1/users/{user_id}",
                timeout=10.0,
            )
            if response.status_code == 200:
                return response.json().get("data")
            return None
    except Exception as e:
        logger.error("Failed to fetch user", service=service_url, error=str(e))
        return None


async def update_service_user(
    service_url: str,
    user_id: UUID,
    data: dict,
) -> bool:
    """Update user data in a service."""
    try:
        async with httpx.AsyncClient() as client:
            response = await client.patch(
                f"{service_url}/api/v1/users/{user_id}",
                json=data,
                timeout=10.0,
            )
            return response.status_code in [200, 204]
    except Exception as e:
        logger.error("Failed to update user", service=service_url, error=str(e))
        return False


@router.post("/users/{user_id}")
async def sync_user(
    user_id: UUID,
    request: UserSyncRequest,
    background_tasks: BackgroundTasks,
):
    """
    Synchronize user data across services.

    Fetches user data from the source of truth and propagates
    to other services.
    """
    logger.info("Syncing user",
               user_id=str(user_id),
               source=request.source,
               fields=request.fields)

    # Determine source URL
    if request.source == "ai_agent":
        source_url = settings.ai_agent_url
        target_url = settings.marketplace_url
    elif request.source == "marketplace":
        source_url = settings.marketplace_url
        target_url = settings.ai_agent_url
    else:
        # Source is shared database - sync to both
        return {
            "success": True,
            "message": "Shared database is source of truth - no sync needed",
        }

    # Fetch from source
    user_data = await fetch_user_from_service(source_url, user_id)

    if not user_data:
        raise HTTPException(status_code=404, detail="User not found in source service")

    # Filter fields if specified
    if request.fields:
        user_data = {k: v for k, v in user_data.items() if k in request.fields}

    # Update target in background
    background_tasks.add_task(
        update_service_user,
        target_url,
        user_id,
        user_data,
    )

    return {
        "success": True,
        "message": f"User sync initiated from {request.source}",
        "user_id": str(user_id),
        "synced_fields": list(user_data.keys()),
    }


@router.post("/users/event")
async def handle_user_update_event(
    event: UserUpdateEvent,
    background_tasks: BackgroundTasks,
):
    """
    Handle user update events for cross-service sync.

    When a service updates user data, this propagates
    the change to other services.
    """
    logger.info("User update event received",
               user_id=str(event.user_id),
               source=event.source_service,
               fields=list(event.updated_fields.keys()))

    # Determine target service
    if event.source_service == "ai_agent":
        target_url = settings.marketplace_url
    else:
        target_url = settings.ai_agent_url

    # Sync to target
    background_tasks.add_task(
        update_service_user,
        target_url,
        event.user_id,
        event.updated_fields,
    )

    return {
        "success": True,
        "message": f"Update propagated from {event.source_service}",
    }


@router.get("/users/{user_id}/status")
async def get_user_sync_status(user_id: UUID):
    """
    Check sync status for a user across services.

    Compares user data between services to identify inconsistencies.
    """
    results = {
        "user_id": str(user_id),
        "ai_agent": {"status": "unknown", "data": None},
        "marketplace": {"status": "unknown", "data": None},
        "in_sync": False,
    }

    # Fetch from AI Agent
    ai_agent_user = await fetch_user_from_service(settings.ai_agent_url, user_id)
    if ai_agent_user:
        results["ai_agent"] = {"status": "found", "data": ai_agent_user}
    else:
        results["ai_agent"] = {"status": "not_found", "data": None}

    # Fetch from Marketplace
    marketplace_user = await fetch_user_from_service(settings.marketplace_url, user_id)
    if marketplace_user:
        results["marketplace"] = {"status": "found", "data": marketplace_user}
    else:
        results["marketplace"] = {"status": "not_found", "data": None}

    # Check if in sync (both found and data matches)
    if ai_agent_user and marketplace_user:
        # Compare relevant fields
        sync_fields = ["first_name", "last_name", "phone", "nursing_level"]
        results["in_sync"] = all(
            ai_agent_user.get(f) == marketplace_user.get(f)
            for f in sync_fields
        )

    return results


@router.post("/users/batch-sync")
async def batch_sync_users(
    user_ids: list[UUID],
    background_tasks: BackgroundTasks,
):
    """
    Sync multiple users at once.

    Useful for scheduled sync jobs or initial data population.
    """
    logger.info("Batch sync requested", count=len(user_ids))

    # Queue sync tasks
    for user_id in user_ids:
        background_tasks.add_task(
            sync_user,
            user_id,
            UserSyncRequest(user_id=user_id),
            background_tasks,
        )

    return {
        "success": True,
        "message": f"Batch sync initiated for {len(user_ids)} users",
        "user_ids": [str(uid) for uid in user_ids],
    }
