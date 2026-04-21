"""
Bookings API routes.
"""

from typing import Annotated
from uuid import UUID, uuid4
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, status, Query
import structlog

from shared.models.booking import (
    BookingCreate,
    BookingResponse,
    BookingWithDetails,
)
from shared.models.common import APIResponse, PaginatedResponse
from shared.constants import BookingStatus


logger = structlog.get_logger()
router = APIRouter()


# Mock bookings for MVP
MOCK_BOOKINGS = []


@router.post("/", response_model=APIResponse[BookingResponse])
async def create_booking(booking: BookingCreate):
    """
    Create a new booking.

    This will:
    1. Verify the service is available
    2. Check wallet balance
    3. Reserve units
    4. Create the booking
    5. Notify the vendor
    """
    # TODO: Implement actual booking creation

    new_booking = BookingResponse(
        booking_id=str(uuid4()),
        user_id=str(booking.user_id),
        wallet_id=str(uuid4()),
        service_id=str(booking.service_id),
        vendor_id=str(uuid4()),
        status=BookingStatus.PENDING,
        scheduled_datetime=booking.scheduled_datetime,
        units_cost=2,  # TODO: Get from service
        created_at=datetime.now(),
        updated_at=datetime.now(),
    )

    logger.info(
        "Created booking",
        booking_id=new_booking.booking_id,
        service_id=str(booking.service_id),
    )

    return APIResponse(
        success=True,
        data=new_booking,
    )


@router.get("/", response_model=PaginatedResponse[BookingResponse])
async def list_my_bookings(
    status: BookingStatus | None = None,
    upcoming_only: bool = False,
    limit: int = Query(default=20, le=100),
    page: int = Query(default=1, ge=1),
):
    """
    List bookings for the current user.

    Can filter by status and show only upcoming bookings.
    """
    # TODO: Get user from auth and fetch from database

    # Mock bookings
    bookings = [
        BookingResponse(
            booking_id="bkg-001",
            user_id="user-001",
            wallet_id="wallet-001",
            service_id="svc-001",
            vendor_id="vendor-001",
            status=BookingStatus.CONFIRMED,
            scheduled_datetime=datetime(2025, 1, 20, 10, 0),
            units_cost=2,
            created_at=datetime.now(),
            updated_at=datetime.now(),
        ),
        BookingResponse(
            booking_id="bkg-002",
            user_id="user-001",
            wallet_id="wallet-001",
            service_id="svc-002",
            vendor_id="vendor-002",
            status=BookingStatus.COMPLETED,
            scheduled_datetime=datetime(2025, 1, 15, 16, 0),
            units_cost=1,
            created_at=datetime.now(),
            updated_at=datetime.now(),
        ),
    ]

    if status:
        bookings = [b for b in bookings if b.status == status]

    if upcoming_only:
        now = datetime.now()
        bookings = [b for b in bookings if b.scheduled_datetime > now]

    return PaginatedResponse(
        success=True,
        data=bookings,
        pagination={
            "page": page,
            "limit": limit,
            "total": len(bookings),
            "pages": 1,
        },
    )


@router.get("/{booking_id}", response_model=APIResponse[BookingWithDetails])
async def get_booking(booking_id: str):
    """
    Get detailed information about a specific booking.
    """
    # TODO: Fetch from database

    # Mock booking with details
    return APIResponse(
        success=True,
        data=BookingWithDetails(
            booking_id=booking_id,
            user_id="user-001",
            wallet_id="wallet-001",
            service_id="svc-001",
            vendor_id="vendor-001",
            status=BookingStatus.CONFIRMED,
            scheduled_datetime=datetime(2025, 1, 20, 10, 0),
            units_cost=2,
            service_title="פיזיותרפיה בבית",
            vendor_name="ספק שירות לדוגמה",
            vendor_phone="050-0000001",
            created_at=datetime.now(),
            updated_at=datetime.now(),
        ),
    )


@router.post("/{booking_id}/confirm")
async def confirm_booking(booking_id: str):
    """
    Confirm a pending booking.

    Usually called by vendors to accept a booking request.
    """
    logger.info("Confirming booking", booking_id=booking_id)

    return APIResponse(
        success=True,
        data={"message": "Booking confirmed", "status": "confirmed"},
    )


@router.post("/{booking_id}/cancel")
async def cancel_booking(
    booking_id: str,
    reason: str | None = None,
):
    """
    Cancel a booking.

    This will:
    1. Update booking status
    2. Release reserved units
    3. Notify relevant parties
    """
    logger.info(
        "Cancelling booking",
        booking_id=booking_id,
        reason=reason,
    )

    return APIResponse(
        success=True,
        data={"message": "Booking cancelled", "units_refunded": 2},
    )


@router.post("/{booking_id}/complete")
async def complete_booking(
    booking_id: str,
    proof_of_service: dict | None = None,
):
    """
    Mark a booking as completed.

    Called by vendors after service delivery.
    Can include proof of service (photos, signature).
    """
    logger.info(
        "Completing booking",
        booking_id=booking_id,
        has_proof=proof_of_service is not None,
    )

    return APIResponse(
        success=True,
        data={"message": "Booking completed", "units_charged": 2},
    )


@router.post("/{booking_id}/reschedule")
async def reschedule_booking(
    booking_id: str,
    new_datetime: datetime,
):
    """
    Reschedule a booking to a new time.
    """
    logger.info(
        "Rescheduling booking",
        booking_id=booking_id,
        new_datetime=new_datetime.isoformat(),
    )

    return APIResponse(
        success=True,
        data={
            "message": "Booking rescheduled",
            "new_datetime": new_datetime.isoformat(),
        },
    )
