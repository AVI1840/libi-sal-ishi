"""
Booking-related Pydantic models.
"""

from datetime import datetime
from typing import Any

from pydantic import BaseModel, Field

from shared.constants import BookingStatus


class ProofOfService(BaseModel):
    """Proof of service documentation."""
    photo_url: str | None = None
    signature_url: str | None = None
    completed_at: datetime | None = None
    notes: str | None = None
    verified: bool = False


class BookingBase(BaseModel):
    """Base booking model."""
    service_id: str
    scheduled_datetime: datetime
    notes: str | None = Field(default=None, max_length=1000)


class BookingCreate(BookingBase):
    """Model for creating a booking."""
    user_id: str
    wallet_id: str | None = None  # Will be looked up if not provided

    # Optional: if booking via AI Agent
    ai_booked: bool = False
    conversation_id: str | None = None


class BookingUpdate(BaseModel):
    """Model for updating a booking."""
    scheduled_datetime: datetime | None = None
    notes: str | None = Field(default=None, max_length=1000)
    assigned_staff: str | None = Field(default=None, max_length=100)


class BookingStatusUpdate(BaseModel):
    """Model for updating booking status."""
    status: BookingStatus
    reason: str | None = None
    proof_of_service: ProofOfService | None = None


class BookingResponse(BookingBase):
    """Model for booking response."""
    booking_id: str
    user_id: str
    wallet_id: str
    vendor_id: str
    status: BookingStatus
    units_cost: int
    assigned_staff: str | None = None
    proof_of_service: ProofOfService | None = None
    ai_booked: bool
    conversation_id: str | None = None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class ServiceSummary(BaseModel):
    """Summary of service for booking details."""
    service_id: str
    title: str
    title_he: str | None = None
    category: str
    duration_minutes: int | None = None


class VendorSummary(BaseModel):
    """Summary of vendor for booking details."""
    vendor_id: str
    business_name: str
    phone: str | None = None
    rating: float = 0


class UserSummary(BaseModel):
    """Summary of user for booking details."""
    user_id: str
    first_name: str
    last_name: str
    phone: str
    address: dict[str, Any] | None = None


class BookingWithDetails(BookingResponse):
    """Booking with related entity details."""
    service: ServiceSummary | None = None
    vendor: VendorSummary | None = None
    user: UserSummary | None = None


class BookingConfirmation(BaseModel):
    """Booking confirmation details."""
    booking_id: str
    status: BookingStatus
    confirmed_datetime: datetime
    assigned_staff: str | None = None
    vendor_message: str | None = None


class BookingCancellation(BaseModel):
    """Booking cancellation details."""
    booking_id: str
    cancelled_at: datetime
    reason: str | None = None
    units_refunded: int
    initiated_by: str  # user, vendor, system


class UpcomingBooking(BaseModel):
    """Simplified booking for upcoming list."""
    booking_id: str
    service_title: str
    service_title_he: str | None = None
    vendor_name: str
    scheduled_datetime: datetime
    status: BookingStatus
    units_cost: int


class BookingHistory(BaseModel):
    """User's booking history."""
    user_id: str
    bookings: list[BookingResponse]
    total_count: int
    total_units_spent: int
    completed_count: int
    cancelled_count: int
