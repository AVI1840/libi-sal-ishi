"""
Unit tests for Pydantic models.
"""

import pytest
from uuid import uuid4
from datetime import date, datetime

from shared.models.user import (
    UserCreate,
    UserResponse,
    UserPreferences,
    Address,
    EmergencyContact,
)
from shared.models.wallet import WalletCreate, WalletResponse, Transaction
from shared.models.booking import BookingCreate, BookingResponse
from shared.models.service import ServiceCreate, ServiceResponse
from shared.constants import (
    NursingLevel,
    ServiceCategory,
    BookingStatus,
    TransactionType,
)


class TestUserModels:
    """Tests for user models."""

    def test_create_user_valid(self, sample_user_data):
        """Test creating a valid user."""
        user = UserCreate(**sample_user_data)

        assert user.first_name == "יוסי"
        assert user.last_name == "כהן"
        assert user.nursing_level == 3

    def test_create_user_with_preferences(self, sample_user_data):
        """Test creating user with preferences."""
        sample_user_data["preferences"] = {
            "speech_speed": 0.8,
            "call_times": ["morning"],
            "topics_to_avoid": ["politics"],
        }

        user = UserCreate(**sample_user_data)

        assert user.preferences is not None
        assert user.preferences.speech_speed == 0.8

    def test_user_response_model(self, sample_user_data):
        """Test user response model."""
        response_data = {
            **sample_user_data,
            "user_id": str(uuid4()),
            "created_at": datetime.now(),
            "updated_at": datetime.now(),
            "is_active": True,
        }

        user = UserResponse(**response_data)

        assert user.user_id is not None
        assert user.is_active is True

    def test_address_model(self):
        """Test address model."""
        address = Address(
            street="רחוב הרצל 1",
            city="תל אביב",
            postal_code="6100000",
            lat=32.0853,
            lng=34.7818,
        )

        assert address.city == "תל אביב"
        assert address.lat == 32.0853

    def test_emergency_contact_model(self):
        """Test emergency contact model."""
        contact = EmergencyContact(
            name="דני כהן",
            phone="052-1234567",
            relation="son",
            is_primary=True,
        )

        assert contact.name == "דני כהן"
        assert contact.is_primary is True


class TestWalletModels:
    """Tests for wallet models."""

    def test_create_wallet(self, sample_wallet_data):
        """Test creating a wallet."""
        wallet = WalletCreate(
            user_id=sample_wallet_data["user_id"],
            nursing_level=sample_wallet_data["nursing_level"],
        )

        assert wallet.nursing_level == 3

    def test_wallet_response(self, sample_wallet_data):
        """Test wallet response model."""
        response_data = {
            **sample_wallet_data,
            "wallet_id": str(uuid4()),
            "created_at": datetime.now(),
            "updated_at": datetime.now(),
        }

        wallet = WalletResponse(**response_data)

        assert wallet.total_units == 36
        assert wallet.available_units == 32

    def test_transaction_model(self):
        """Test transaction model."""
        transaction = Transaction(
            transaction_id=str(uuid4()),
            wallet_id=str(uuid4()),
            booking_id=str(uuid4()),
            transaction_type=TransactionType.RESERVE,
            units_amount=2,
            nis_equivalent=240.0,
            status="completed",
            created_at=datetime.now(),
        )

        assert transaction.units_amount == 2
        assert transaction.transaction_type == TransactionType.RESERVE


class TestServiceModels:
    """Tests for service models."""

    def test_create_service(self, sample_service_data):
        """Test creating a service."""
        service = ServiceCreate(**sample_service_data)

        assert service.category == "physiotherapy"
        assert service.unit_cost == 2
        assert service.is_optimal_aging is True

    def test_service_response(self, sample_service_data):
        """Test service response model."""
        response_data = {
            **sample_service_data,
            "service_id": str(uuid4()),
            "is_active": True,
            "rating": 4.5,
            "reviews_count": 10,
            "created_at": datetime.now(),
        }

        service = ServiceResponse(**response_data)

        assert service.rating == 4.5
        assert service.is_active is True


class TestBookingModels:
    """Tests for booking models."""

    def test_create_booking(self):
        """Test creating a booking."""
        booking = BookingCreate(
            user_id=str(uuid4()),
            service_id=str(uuid4()),
            scheduled_datetime=datetime.now(),
            notes="First session",
        )

        assert booking.notes == "First session"

    def test_booking_response(self):
        """Test booking response model."""
        booking = BookingResponse(
            booking_id=str(uuid4()),
            user_id=str(uuid4()),
            wallet_id=str(uuid4()),
            service_id=str(uuid4()),
            vendor_id=str(uuid4()),
            status=BookingStatus.CONFIRMED,
            scheduled_datetime=datetime.now(),
            units_cost=2,
            created_at=datetime.now(),
            updated_at=datetime.now(),
        )

        assert booking.status == BookingStatus.CONFIRMED
        assert booking.units_cost == 2
