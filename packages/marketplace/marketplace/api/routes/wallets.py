"""
Wallet API routes.
"""

from typing import Annotated
from uuid import UUID
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, status, Query
import structlog

from shared.models.wallet import (
    WalletCreate,
    WalletResponse,
    WalletBalance,
    Transaction,
)
from shared.models.common import APIResponse, PaginatedResponse
from shared.constants import TransactionType


logger = structlog.get_logger()
router = APIRouter()


# Mock wallet data for MVP
MOCK_WALLETS = {
    "user-001": {
        "wallet_id": "wallet-001",
        "user_id": "user-001",
        "nursing_level": 3,
        "total_units": 96,
        "available_units": 88,
        "reserved_units": 8,
        "optimal_aging_units": 2,
        "units_expire_at": "2025-04-15",
    },
}


@router.get("/me", response_model=APIResponse[WalletResponse])
async def get_my_wallet():
    """
    Get the current user's wallet.

    Returns wallet balance and unit allocation details.
    """
    # TODO: Get user from auth token
    user_id = "user-001"

    wallet = MOCK_WALLETS.get(user_id)
    if not wallet:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Wallet not found",
        )

    return APIResponse(
        success=True,
        data=WalletResponse(
            **wallet,
            created_at=datetime.now(),
            updated_at=datetime.now(),
        ),
    )


@router.get("/me/balance", response_model=APIResponse[WalletBalance])
async def get_my_wallet_balance():
    """
    Get a simplified wallet balance view.

    Perfect for displaying in the UI header.
    """
    # TODO: Get user from auth token
    user_id = "user-001"

    wallet = MOCK_WALLETS.get(user_id)
    if not wallet:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Wallet not found",
        )

    return APIResponse(
        success=True,
        data=WalletBalance(
            available_units=wallet["available_units"],
            reserved_units=wallet["reserved_units"],
            optimal_aging_units=wallet["optimal_aging_units"],
            units_expire_at=datetime.fromisoformat(wallet["units_expire_at"]),
        ),
    )


@router.get("/me/transactions", response_model=PaginatedResponse[Transaction])
async def get_my_transactions(
    transaction_type: TransactionType | None = None,
    start_date: datetime | None = None,
    end_date: datetime | None = None,
    limit: int = Query(default=20, le=100),
    page: int = Query(default=1, ge=1),
):
    """
    Get transaction history for the current user's wallet.

    Can filter by transaction type and date range.
    """
    # TODO: Fetch from database

    # Mock transactions
    transactions = [
        Transaction(
            transaction_id="txn-001",
            wallet_id="wallet-001",
            booking_id="bkg-001",
            transaction_type=TransactionType.RESERVE,
            units_amount=2,
            nis_equivalent=240.0,
            status="completed",
            created_at=datetime.now(),
        ),
        Transaction(
            transaction_id="txn-002",
            wallet_id="wallet-001",
            booking_id="bkg-001",
            transaction_type=TransactionType.COMPLETE,
            units_amount=2,
            nis_equivalent=240.0,
            status="completed",
            created_at=datetime.now(),
        ),
    ]

    return PaginatedResponse(
        success=True,
        data=transactions,
        pagination={
            "page": page,
            "limit": limit,
            "total": len(transactions),
            "pages": 1,
        },
    )


@router.post("/me/reserve", response_model=APIResponse[Transaction])
async def reserve_units(
    units: int,
    booking_id: str,
):
    """
    Reserve units for a pending booking.

    Units are held until the booking is completed or cancelled.
    """
    # TODO: Implement actual reservation

    logger.info(
        "Reserving units",
        units=units,
        booking_id=booking_id,
    )

    return APIResponse(
        success=True,
        data=Transaction(
            transaction_id="txn-new",
            wallet_id="wallet-001",
            booking_id=booking_id,
            transaction_type=TransactionType.RESERVE,
            units_amount=units,
            nis_equivalent=units * 120.0,
            status="pending",
            created_at=datetime.now(),
        ),
    )


@router.get("/{wallet_id}", response_model=APIResponse[WalletResponse])
async def get_wallet(wallet_id: UUID):
    """
    Get a specific wallet by ID.

    Requires admin or case manager permissions.
    """
    # TODO: Check permissions
    # TODO: Fetch from database

    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="Not implemented yet",
    )
