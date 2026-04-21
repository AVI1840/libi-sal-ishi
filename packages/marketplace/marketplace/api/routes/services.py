"""
Services API routes.
"""

from typing import Annotated
from uuid import UUID
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, status, Query
import structlog

from shared.models.service import (
    ServiceCreate,
    ServiceResponse,
    ServiceSearchParams,
)
from shared.models.common import APIResponse, PaginatedResponse
from shared.constants import ServiceCategory


logger = structlog.get_logger()
router = APIRouter()


# Mock services data for MVP
MOCK_SERVICES = [
    {
        "service_id": "svc-001",
        "vendor_id": "vendor-001",
        "category": "physiotherapy",
        "title": "Home Physiotherapy",
        "title_he": "פיזיותרפיה בבית",
        "description": "Professional physiotherapy at your home",
        "description_he": "פיזיותרפיה מקצועית בנוחות הבית שלך",
        "unit_cost": 2,
        "duration_minutes": 45,
        "is_optimal_aging": True,
        "is_active": True,
        "rating": 4.8,
        "reviews_count": 127,
        "vendor_name": "יוסי כהן פיזיותרפיסט",
    },
    {
        "service_id": "svc-002",
        "vendor_id": "vendor-002",
        "category": "social_activity",
        "title": "Coffee and Friends Group",
        "title_he": "קבוצת קפה וחברים",
        "description": "Social gathering with games and refreshments",
        "description_he": "מפגש חברתי עם משחקים וכיבוד קל",
        "unit_cost": 1,
        "duration_minutes": 120,
        "is_optimal_aging": True,
        "is_active": True,
        "rating": 4.9,
        "reviews_count": 89,
        "vendor_name": "מתנ\"ס הרצליה",
    },
    {
        "service_id": "svc-003",
        "vendor_id": "vendor-003",
        "category": "nursing",
        "title": "Home Nursing Visit",
        "title_he": "ביקור אחות בבית",
        "description": "Professional nursing care at home",
        "description_he": "טיפול סיעודי מקצועי בבית",
        "unit_cost": 3,
        "duration_minutes": 60,
        "is_optimal_aging": False,
        "is_active": True,
        "rating": 4.7,
        "reviews_count": 203,
        "vendor_name": "שירותי סיעוד אהבה",
    },
    {
        "service_id": "svc-004",
        "vendor_id": "vendor-004",
        "category": "wellness",
        "title": "Relaxation Massage",
        "title_he": "עיסוי הרפיה",
        "description": "Gentle massage for relaxation and well-being",
        "description_he": "עיסוי עדין להרפיה ורווחה",
        "unit_cost": 2,
        "duration_minutes": 45,
        "is_optimal_aging": True,
        "is_active": True,
        "rating": 4.6,
        "reviews_count": 56,
        "vendor_name": "מגע רך",
    },
]


@router.get("/", response_model=PaginatedResponse[ServiceResponse])
async def list_services(
    category: ServiceCategory | None = None,
    is_optimal_aging: bool | None = None,
    min_rating: float | None = Query(default=None, ge=0, le=5),
    max_unit_cost: int | None = Query(default=None, ge=1),
    query: str | None = None,
    limit: int = Query(default=20, le=100),
    page: int = Query(default=1, ge=1),
):
    """
    List available services with optional filters.

    Supports filtering by category, optimal aging eligibility,
    rating, and cost.
    """
    # Filter services
    filtered = MOCK_SERVICES.copy()

    if category:
        filtered = [s for s in filtered if s["category"] == category.value]

    if is_optimal_aging is not None:
        filtered = [s for s in filtered if s["is_optimal_aging"] == is_optimal_aging]

    if min_rating:
        filtered = [s for s in filtered if s["rating"] >= min_rating]

    if max_unit_cost:
        filtered = [s for s in filtered if s["unit_cost"] <= max_unit_cost]

    if query:
        query_lower = query.lower()
        filtered = [
            s for s in filtered
            if query_lower in s["title"].lower()
            or query_lower in s.get("title_he", "").lower()
            or query_lower in s.get("description", "").lower()
            or query_lower in s.get("description_he", "").lower()
        ]

    # Paginate
    total = len(filtered)
    start = (page - 1) * limit
    end = start + limit
    page_services = filtered[start:end]

    # Convert to response models
    services = [
        ServiceResponse(
            **svc,
            created_at=datetime.now(),
        )
        for svc in page_services
    ]

    return PaginatedResponse(
        success=True,
        data=services,
        pagination={
            "page": page,
            "limit": limit,
            "total": total,
            "pages": (total + limit - 1) // limit,
        },
    )


@router.get("/categories", response_model=APIResponse[list[dict]])
async def list_categories():
    """
    List all service categories with counts.
    """
    categories = {}
    for svc in MOCK_SERVICES:
        cat = svc["category"]
        if cat not in categories:
            categories[cat] = {"name": cat, "count": 0}
        categories[cat]["count"] += 1

    return APIResponse(
        success=True,
        data=list(categories.values()),
    )


@router.get("/optimal-aging", response_model=PaginatedResponse[ServiceResponse])
async def list_optimal_aging_services(
    limit: int = Query(default=20, le=100),
    page: int = Query(default=1, ge=1),
):
    """
    List services that qualify for optimal aging units.

    These services help maintain physical and mental wellness.
    """
    filtered = [s for s in MOCK_SERVICES if s["is_optimal_aging"]]

    total = len(filtered)
    start = (page - 1) * limit
    end = start + limit
    page_services = filtered[start:end]

    services = [
        ServiceResponse(**svc, created_at=datetime.now())
        for svc in page_services
    ]

    return PaginatedResponse(
        success=True,
        data=services,
        pagination={
            "page": page,
            "limit": limit,
            "total": total,
            "pages": (total + limit - 1) // limit,
        },
    )


@router.get("/{service_id}", response_model=APIResponse[ServiceResponse])
async def get_service(service_id: str):
    """
    Get detailed information about a specific service.
    """
    service = next(
        (s for s in MOCK_SERVICES if s["service_id"] == service_id),
        None,
    )

    if not service:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Service not found",
        )

    return APIResponse(
        success=True,
        data=ServiceResponse(**service, created_at=datetime.now()),
    )


@router.get("/{service_id}/availability")
async def get_service_availability(
    service_id: str,
    start_date: datetime,
    end_date: datetime,
):
    """
    Get available time slots for a service.
    """
    # TODO: Implement availability checking

    # Mock availability
    return APIResponse(
        success=True,
        data={
            "service_id": service_id,
            "available_slots": [
                {"date": "2025-01-20", "times": ["09:00", "11:00", "14:00"]},
                {"date": "2025-01-21", "times": ["10:00", "15:00"]},
                {"date": "2025-01-22", "times": ["09:00", "11:00", "13:00", "15:00"]},
            ],
        },
    )
