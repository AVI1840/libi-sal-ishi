"""
Wallet-related Pydantic models.
"""

from datetime import date, datetime
from typing import Optional

from pydantic import BaseModel, Field, field_validator

from shared.constants import NURSING_LEVEL_UNITS


class WalletBase(BaseModel):
    """Base wallet model."""
    nursing_level: int = Field(..., ge=1, le=6)
    total_units: int = Field(..., ge=0)
    available_units: int = Field(..., ge=0)
    reserved_units: int = Field(default=0, ge=0)
    optimal_aging_units: int = Field(default=0, ge=0)
    units_expire_at: date | None = None


class WalletCreate(BaseModel):
    """Model for creating a wallet."""
    user_id: str
    nursing_level: int = Field(..., ge=1, le=6)

    def calculate_total_units(self) -> int:
        """Calculate total units based on nursing level."""
        return NURSING_LEVEL_UNITS.get(self.nursing_level, 0)


class WalletUpdate(BaseModel):
    """Model for updating a wallet."""
    nursing_level: int | None = Field(default=None, ge=1, le=6)
    units_expire_at: date | None = None


class WalletResponse(WalletBase):
    """Model for wallet response."""
    wallet_id: str
    user_id: str
    created_at: datetime
    updated_at: datetime

    # Calculated fields
    used_units: int = 0
    expiring_soon: bool = False
    days_until_expiry: int | None = None

    model_config = {"from_attributes": True}

    @classmethod
    def from_wallet(cls, wallet: "WalletResponse", days_warning: int = 14) -> "WalletResponse":
        """Create response with calculated fields."""
        from shared.utils import utc_now

        used_units = wallet.total_units - wallet.available_units - wallet.reserved_units

        days_until_expiry = None
        expiring_soon = False
        if wallet.units_expire_at:
            days_until_expiry = (wallet.units_expire_at - utc_now().date()).days
            expiring_soon = days_until_expiry <= days_warning

        return cls(
            wallet_id=wallet.wallet_id,
            user_id=wallet.user_id,
            nursing_level=wallet.nursing_level,
            total_units=wallet.total_units,
            available_units=wallet.available_units,
            reserved_units=wallet.reserved_units,
            optimal_aging_units=wallet.optimal_aging_units,
            units_expire_at=wallet.units_expire_at,
            created_at=wallet.created_at,
            updated_at=wallet.updated_at,
            used_units=used_units,
            expiring_soon=expiring_soon,
            days_until_expiry=days_until_expiry,
        )


class WalletBalance(BaseModel):
    """Simplified wallet balance for quick queries."""
    user_id: str
    available_units: int
    reserved_units: int
    expiring_units: int = 0
    expiry_date: date | None = None

    @property
    def total_available(self) -> int:
        """Total units that can be used."""
        return self.available_units


class UnitAllocation(BaseModel):
    """Monthly unit allocation by category."""
    allocation_id: str | None = None
    wallet_id: str
    category: str  # traditional_nursing, optimal_aging, wellness
    allocated_units: int = Field(..., ge=0)
    month: date

    model_config = {"from_attributes": True}


class UnitAllocationSummary(BaseModel):
    """Summary of unit allocations."""
    wallet_id: str
    month: date
    allocations: dict[str, int]  # category -> units
    total_allocated: int
    remaining_unallocated: int


# ===========================================
# Transaction Models
# ===========================================

class TransactionBase(BaseModel):
    """Base transaction model."""
    wallet_id: str
    booking_id: str | None = None
    transaction_type: str  # reserve, complete, cancel, refund, expire
    units_amount: int = Field(..., ge=0)
    nis_equivalent: float | None = None


class TransactionCreate(TransactionBase):
    """Model for creating a transaction."""
    pass


class TransactionResponse(TransactionBase):
    """Model for transaction response."""
    transaction_id: str
    status: str  # pending, completed, failed
    created_at: datetime

    model_config = {"from_attributes": True}


class TransactionHistory(BaseModel):
    """Transaction history for a wallet."""
    wallet_id: str
    transactions: list[TransactionResponse]
    total_count: int
    total_debited: int
    total_credited: int
