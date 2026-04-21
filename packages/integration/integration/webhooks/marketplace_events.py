"""
Marketplace Events Webhook Handler.

Handles events from the Marketplace service and forwards to AI Agent.
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


class BookingEvent(BaseModel):
    """Booking event from marketplace."""
    event_type: str = Field(..., description="Event type: created, confirmed, cancelled, completed")
    booking_id: UUID
    user_id: UUID
    service_id: UUID
    service_title: str
    scheduled_datetime: datetime
    units_cost: int
    vendor_name: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)


class WalletEvent(BaseModel):
    """Wallet event from marketplace."""
    event_type: str = Field(..., description="Event type: low_balance, units_expired, allocation")
    user_id: UUID
    wallet_id: UUID
    available_units: int
    total_units: int
    details: dict[str, Any] = Field(default_factory=dict)
    timestamp: datetime = Field(default_factory=datetime.utcnow)


async def notify_ai_agent(endpoint: str, data: dict) -> bool:
    """Send notification to AI Agent service."""
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{settings.ai_agent_url}/api/v1/webhooks/{endpoint}",
                json=data,
                timeout=10.0,
            )

            if response.status_code == 200:
                logger.info("Notified AI Agent", endpoint=endpoint)
                return True
            else:
                logger.warning("AI Agent notification failed",
                             endpoint=endpoint,
                             status=response.status_code)
                return False
    except Exception as e:
        logger.error("Failed to notify AI Agent", endpoint=endpoint, error=str(e))
        return False


@router.post("/booking")
async def handle_booking_event(
    event: BookingEvent,
    background_tasks: BackgroundTasks,
):
    """
    Handle booking events from Marketplace.

    Forwards booking updates to AI Agent for:
    - Conversation context updates
    - Calendar reminders
    - Family notifications
    """
    logger.info("Received booking event",
               event_type=event.event_type,
               booking_id=str(event.booking_id),
               user_id=str(event.user_id))

    # Prepare notification data
    notification_data = {
        "event_type": event.event_type,
        "booking_id": str(event.booking_id),
        "user_id": str(event.user_id),
        "service_title": event.service_title,
        "scheduled_datetime": event.scheduled_datetime.isoformat(),
        "units_cost": event.units_cost,
        "vendor_name": event.vendor_name,
    }

    # Send to AI Agent in background
    background_tasks.add_task(
        notify_ai_agent,
        "booking-update",
        notification_data,
    )

    return {
        "success": True,
        "message": f"Booking event {event.event_type} processed",
        "booking_id": str(event.booking_id),
    }


@router.post("/wallet")
async def handle_wallet_event(
    event: WalletEvent,
    background_tasks: BackgroundTasks,
):
    """
    Handle wallet events from Marketplace.

    Forwards wallet alerts to AI Agent for:
    - Low balance warnings
    - Expiration reminders
    - Family notifications
    """
    logger.info("Received wallet event",
               event_type=event.event_type,
               user_id=str(event.user_id),
               available_units=event.available_units)

    notification_data = {
        "event_type": event.event_type,
        "user_id": str(event.user_id),
        "wallet_id": str(event.wallet_id),
        "available_units": event.available_units,
        "total_units": event.total_units,
        "details": event.details,
    }

    background_tasks.add_task(
        notify_ai_agent,
        "wallet-alert",
        notification_data,
    )

    return {
        "success": True,
        "message": f"Wallet event {event.event_type} processed",
        "user_id": str(event.user_id),
    }


@router.post("/vendor")
async def handle_vendor_event(
    event_type: str,
    vendor_id: UUID,
    details: dict[str, Any],
    background_tasks: BackgroundTasks,
):
    """
    Handle vendor events from Marketplace.

    Events like vendor availability changes, new reviews, etc.
    """
    logger.info("Received vendor event",
               event_type=event_type,
               vendor_id=str(vendor_id))

    return {
        "success": True,
        "message": f"Vendor event {event_type} processed",
    }
