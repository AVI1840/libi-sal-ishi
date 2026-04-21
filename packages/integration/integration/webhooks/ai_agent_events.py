"""
AI Agent Events Webhook Handler.

Handles events from the AI Agent service and forwards to Marketplace.
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


class BookingRequestEvent(BaseModel):
    """Booking request from AI Agent."""
    user_id: UUID
    service_id: UUID
    preferred_datetime: datetime
    notes: str | None = None
    conversation_id: UUID | None = None
    timestamp: datetime = Field(default_factory=datetime.utcnow)


class AlertEvent(BaseModel):
    """Alert event from AI Agent."""
    alert_type: str = Field(..., description="Type: health, loneliness, emergency, cognitive")
    severity: str = Field(..., description="Severity: low, medium, high, critical")
    user_id: UUID
    title: str
    description: str
    triggered_by: dict[str, Any] = Field(default_factory=dict)
    timestamp: datetime = Field(default_factory=datetime.utcnow)


class ServiceRecommendationEvent(BaseModel):
    """Service recommendation request from AI Agent."""
    user_id: UUID
    category: str
    preferences: dict[str, Any] = Field(default_factory=dict)
    max_unit_cost: int | None = None
    timestamp: datetime = Field(default_factory=datetime.utcnow)


async def notify_marketplace(endpoint: str, data: dict) -> dict | None:
    """Send notification to Marketplace service."""
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{settings.marketplace_url}/api/v1/{endpoint}",
                json=data,
                timeout=10.0,
            )

            if response.status_code == 200:
                logger.info("Notified Marketplace", endpoint=endpoint)
                return response.json()
            else:
                logger.warning("Marketplace notification failed",
                             endpoint=endpoint,
                             status=response.status_code)
                return None
    except Exception as e:
        logger.error("Failed to notify Marketplace", endpoint=endpoint, error=str(e))
        return None


@router.post("/booking-request")
async def handle_booking_request(
    event: BookingRequestEvent,
    background_tasks: BackgroundTasks,
):
    """
    Handle booking requests from AI Agent.

    When the AI Agent wants to book a service for a user,
    it sends this request to create the booking in Marketplace.
    """
    logger.info("Received booking request from AI Agent",
               user_id=str(event.user_id),
               service_id=str(event.service_id))

    # Create booking request for Marketplace
    booking_data = {
        "user_id": str(event.user_id),
        "service_id": str(event.service_id),
        "scheduled_datetime": event.preferred_datetime.isoformat(),
        "notes": event.notes,
        "ai_booked": True,
        "conversation_id": str(event.conversation_id) if event.conversation_id else None,
    }

    # Send to Marketplace
    result = await notify_marketplace("bookings", booking_data)

    if result and result.get("success"):
        return {
            "success": True,
            "message": "Booking created successfully",
            "booking_id": result.get("data", {}).get("booking_id"),
        }
    else:
        raise HTTPException(
            status_code=500,
            detail="Failed to create booking in Marketplace",
        )


@router.post("/alert")
async def handle_alert_event(
    event: AlertEvent,
    background_tasks: BackgroundTasks,
):
    """
    Handle alert events from AI Agent.

    Alerts may trigger:
    - Family notifications
    - Emergency service recommendations
    - Case manager dashboard updates
    """
    logger.info("Received alert from AI Agent",
               alert_type=event.alert_type,
               severity=event.severity,
               user_id=str(event.user_id))

    # For critical alerts, notify immediately
    if event.severity == "critical":
        logger.critical("CRITICAL ALERT",
                       user_id=str(event.user_id),
                       alert_type=event.alert_type,
                       title=event.title)
        # In production: trigger emergency protocols

    # Update case manager dashboard
    dashboard_data = {
        "user_id": str(event.user_id),
        "alert_type": event.alert_type,
        "severity": event.severity,
        "title": event.title,
        "description": event.description,
        "timestamp": event.timestamp.isoformat(),
    }

    background_tasks.add_task(
        notify_marketplace,
        "dashboard/alerts",
        dashboard_data,
    )

    return {
        "success": True,
        "message": f"Alert {event.alert_type} processed",
        "severity": event.severity,
    }


@router.post("/service-recommendation")
async def handle_service_recommendation(
    event: ServiceRecommendationEvent,
):
    """
    Handle service recommendation requests from AI Agent.

    AI Agent requests service recommendations based on user needs.
    Returns matching services from Marketplace.
    """
    logger.info("Received service recommendation request",
               user_id=str(event.user_id),
               category=event.category)

    # Query Marketplace for matching services
    try:
        async with httpx.AsyncClient() as client:
            params = {
                "category": event.category,
                "is_active": True,
            }
            if event.max_unit_cost:
                params["max_cost"] = event.max_unit_cost

            response = await client.get(
                f"{settings.marketplace_url}/api/v1/services",
                params=params,
                timeout=10.0,
            )

            if response.status_code == 200:
                services = response.json().get("data", [])
                return {
                    "success": True,
                    "services": services[:5],  # Return top 5 matches
                    "total_found": len(services),
                }
            else:
                return {
                    "success": False,
                    "services": [],
                    "message": "Failed to fetch services",
                }
    except Exception as e:
        logger.error("Failed to get service recommendations", error=str(e))
        return {
            "success": False,
            "services": [],
            "message": str(e),
        }


@router.post("/wallet-check")
async def handle_wallet_check(
    user_id: UUID,
    required_units: int,
):
    """
    Check if user has sufficient wallet balance.

    AI Agent checks this before offering to book services.
    """
    logger.info("Wallet check request",
               user_id=str(user_id),
               required_units=required_units)

    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{settings.marketplace_url}/api/v1/wallets/{user_id}",
                timeout=10.0,
            )

            if response.status_code == 200:
                wallet = response.json().get("data", {})
                available = wallet.get("available_units", 0)

                return {
                    "success": True,
                    "has_sufficient_balance": available >= required_units,
                    "available_units": available,
                    "required_units": required_units,
                }
            else:
                return {
                    "success": False,
                    "message": "Wallet not found",
                }
    except Exception as e:
        logger.error("Failed to check wallet", error=str(e))
        return {
            "success": False,
            "message": str(e),
        }
