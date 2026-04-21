"""
Vendors API routes.
"""

from typing import Annotated
from uuid import UUID, uuid4
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, status, Query
import structlog

from shared.models.common import APIResponse, PaginatedResponse


logger = structlog.get_logger()
router = APIRouter()


# Mock vendors for MVP
MOCK_VENDORS = [
    {
        "vendor_id": "vendor-001",
        "business_name": "יוסי כהן פיזיותרפיסט",
        "license_number": "FT-00001",
        "contact_name": "[שם ספק לדוגמה]",
        "phone": "050-0000001",
        "email": "vendor-demo@example.com",
        "service_areas": ["תל אביב", "רמת גן", "גבעתיים"],
        "rating": 4.8,
        "reviews_count": 127,
        "is_verified": True,
        "is_active": True,
    },
    {
        "vendor_id": "vendor-002",
        "business_name": "מתנ\"ס הרצליה",
        "license_number": "CC-54321",
        "contact_name": "שרה לוי",
        "phone": "09-9876543",
        "email": "info@matnasherzliya.org.il",
        "service_areas": ["הרצליה", "רעננה", "כפר סבא"],
        "rating": 4.9,
        "reviews_count": 89,
        "is_verified": True,
        "is_active": True,
    },
]


@router.get("/", response_model=PaginatedResponse[dict])
async def list_vendors(
    service_area: str | None = None,
    min_rating: float | None = Query(default=None, ge=0, le=5),
    verified_only: bool = False,
    limit: int = Query(default=20, le=100),
    page: int = Query(default=1, ge=1),
):
    """
    List registered vendors with optional filters.
    """
    filtered = MOCK_VENDORS.copy()

    if service_area:
        filtered = [
            v for v in filtered
            if service_area in v.get("service_areas", [])
        ]

    if min_rating:
        filtered = [v for v in filtered if v["rating"] >= min_rating]

    if verified_only:
        filtered = [v for v in filtered if v["is_verified"]]

    return PaginatedResponse(
        success=True,
        data=filtered,
        pagination={
            "page": page,
            "limit": limit,
            "total": len(filtered),
            "pages": 1,
        },
    )


@router.get("/{vendor_id}", response_model=APIResponse[dict])
async def get_vendor(vendor_id: str):
    """
    Get detailed information about a vendor.
    """
    vendor = next(
        (v for v in MOCK_VENDORS if v["vendor_id"] == vendor_id),
        None,
    )

    if not vendor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Vendor not found",
        )

    return APIResponse(
        success=True,
        data=vendor,
    )


@router.get("/{vendor_id}/services", response_model=PaginatedResponse[dict])
async def get_vendor_services(
    vendor_id: str,
    limit: int = Query(default=20, le=100),
    page: int = Query(default=1, ge=1),
):
    """
    List services offered by a specific vendor.
    """
    # TODO: Fetch from database

    return PaginatedResponse(
        success=True,
        data=[],
        pagination={
            "page": page,
            "limit": limit,
            "total": 0,
            "pages": 0,
        },
    )


@router.get("/{vendor_id}/reviews", response_model=PaginatedResponse[dict])
async def get_vendor_reviews(
    vendor_id: str,
    limit: int = Query(default=20, le=100),
    page: int = Query(default=1, ge=1),
):
    """
    List reviews for a specific vendor.
    """
    # Mock reviews
    reviews = [
        {
            "review_id": "rev-001",
            "rating": 5,
            "comment": "מקצועי ואדיב מאוד, ממליץ בחום!",
            "created_at": datetime.now().isoformat(),
        },
        {
            "review_id": "rev-002",
            "rating": 4,
            "comment": "שירות טוב, הגיע בזמן",
            "created_at": datetime.now().isoformat(),
        },
    ]

    return PaginatedResponse(
        success=True,
        data=reviews,
        pagination={
            "page": page,
            "limit": limit,
            "total": len(reviews),
            "pages": 1,
        },
    )


# Vendor portal endpoints (for vendors themselves)

@router.get("/me/bookings", response_model=PaginatedResponse[dict])
async def get_my_vendor_bookings(
    status: str | None = None,
    limit: int = Query(default=20, le=100),
    page: int = Query(default=1, ge=1),
):
    """
    Get bookings for the authenticated vendor.

    For vendor portal use.
    """
    # TODO: Get vendor from auth

    return PaginatedResponse(
        success=True,
        data=[],
        pagination={
            "page": page,
            "limit": limit,
            "total": 0,
            "pages": 0,
        },
    )


@router.get("/me/earnings", response_model=APIResponse[dict])
async def get_my_vendor_earnings(
    start_date: datetime | None = None,
    end_date: datetime | None = None,
):
    """
    Get earnings summary for the authenticated vendor.
    """
    # TODO: Calculate actual earnings

    return APIResponse(
        success=True,
        data={
            "total_earnings_nis": 12500.0,
            "pending_payment_nis": 2400.0,
            "completed_bookings": 45,
            "period_start": start_date,
            "period_end": end_date,
        },
    )
