"""
Dashboard API routes for case managers.
"""

from typing import Annotated
from uuid import UUID
from datetime import datetime, timedelta

from fastapi import APIRouter, Depends, HTTPException, status, Query
import structlog

from shared.models.common import APIResponse, PaginatedResponse
from shared.constants import UserRole


logger = structlog.get_logger()
router = APIRouter()


@router.get("/overview", response_model=APIResponse[dict])
async def get_dashboard_overview():
    """
    Get dashboard overview for case managers.

    Shows key metrics and alerts requiring attention.
    """
    # TODO: Get case manager from auth and fetch their clients

    return APIResponse(
        success=True,
        data={
            "total_clients": 25,
            "active_bookings": 12,
            "pending_alerts": 3,
            "expiring_units": 5,  # Clients with units expiring soon
            "recent_activity_count": 48,
        },
    )


@router.get("/clients", response_model=PaginatedResponse[dict])
async def list_clients(
    status: str | None = None,
    nursing_level: int | None = None,
    search: str | None = None,
    limit: int = Query(default=20, le=100),
    page: int = Query(default=1, ge=1),
):
    """
    List clients managed by the case manager.
    """
    # Mock clients
    clients = [
        {
            "user_id": "user-001",
            "name": "שרה כהן",
            "nursing_level": 3,
            "wallet_balance": 88,
            "last_activity": datetime.now().isoformat(),
            "status": "active",
            "alerts": 1,
        },
        {
            "user_id": "user-002",
            "name": "יעקב לוי",
            "nursing_level": 4,
            "wallet_balance": 120,
            "last_activity": datetime.now().isoformat(),
            "status": "active",
            "alerts": 0,
        },
    ]

    if search:
        clients = [c for c in clients if search.lower() in c["name"].lower()]

    if nursing_level:
        clients = [c for c in clients if c["nursing_level"] == nursing_level]

    return PaginatedResponse(
        success=True,
        data=clients,
        pagination={
            "page": page,
            "limit": limit,
            "total": len(clients),
            "pages": 1,
        },
    )


@router.get("/clients/{user_id}", response_model=APIResponse[dict])
async def get_client_details(user_id: str):
    """
    Get detailed information about a specific client.
    """
    # Mock client details
    return APIResponse(
        success=True,
        data={
            "user_id": user_id,
            "personal_info": {
                "name": "[שם לקוח לדוגמה]",
                "birth_date": "1950-01-01",
                "phone": "050-0000000",
                "address": "רחוב הרצל 10, תל אביב",
            },
            "nursing_info": {
                "level": 3,
                "eligibility_start": "2024-01-01",
                "primary_diagnosis": "שיקום אחרי ניתוח",
            },
            "wallet": {
                "total_units": 96,
                "available_units": 88,
                "reserved_units": 8,
            },
            "recent_bookings": [],
            "health_alerts": [],
            "family_contacts": [
                {
                    "name": "דני כהן",
                    "relation": "son",
                    "phone": "052-1234567",
                },
            ],
        },
    )


@router.post("/clients/{user_id}/book-service")
async def book_service_for_client(
    user_id: str,
    service_id: str,
    scheduled_datetime: datetime,
    notes: str | None = None,
):
    """
    Book a service on behalf of a client.

    Case managers can create bookings for their clients.
    """
    logger.info(
        "Case manager booking service for client",
        user_id=user_id,
        service_id=service_id,
    )

    return APIResponse(
        success=True,
        data={
            "booking_id": "bkg-new",
            "message": "ההזמנה נוצרה בהצלחה",
        },
    )


@router.get("/alerts", response_model=PaginatedResponse[dict])
async def list_alerts(
    severity: str | None = None,
    status: str | None = Query(default=None, regex="^(pending|acknowledged|resolved)$"),
    limit: int = Query(default=20, le=100),
    page: int = Query(default=1, ge=1),
):
    """
    List alerts for clients managed by the case manager.
    """
    # Mock alerts
    alerts = [
        {
            "alert_id": "alert-001",
            "user_id": "user-001",
            "user_name": "שרה כהן",
            "type": "wallet_low",
            "severity": "medium",
            "title": "יתרת יחידות נמוכה",
            "description": "נותרו 8 יחידות בלבד",
            "status": "pending",
            "created_at": datetime.now().isoformat(),
        },
        {
            "alert_id": "alert-002",
            "user_id": "user-002",
            "user_name": "יעקב לוי",
            "type": "units_expiring",
            "severity": "low",
            "title": "יחידות עומדות לפוג",
            "description": "24 יחידות יפוגו בעוד 14 יום",
            "status": "pending",
            "created_at": datetime.now().isoformat(),
        },
    ]

    if severity:
        alerts = [a for a in alerts if a["severity"] == severity]

    if status:
        alerts = [a for a in alerts if a["status"] == status]

    return PaginatedResponse(
        success=True,
        data=alerts,
        pagination={
            "page": page,
            "limit": limit,
            "total": len(alerts),
            "pages": 1,
        },
    )


@router.get("/reports/usage", response_model=APIResponse[dict])
async def get_usage_report(
    start_date: datetime | None = None,
    end_date: datetime | None = None,
):
    """
    Get usage report for case manager's clients.
    """
    start = start_date or (datetime.now() - timedelta(days=30))
    end = end_date or datetime.now()

    return APIResponse(
        success=True,
        data={
            "period": {
                "start": start.isoformat(),
                "end": end.isoformat(),
            },
            "summary": {
                "total_bookings": 156,
                "completed_bookings": 142,
                "cancelled_bookings": 8,
                "total_units_used": 312,
                "average_rating": 4.7,
            },
            "by_category": {
                "physiotherapy": 45,
                "nursing": 62,
                "social_activity": 28,
                "wellness": 21,
            },
            "by_client_count": {
                "active_users": 22,
                "inactive_users": 3,
            },
        },
    )
