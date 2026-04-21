"""
Common response models for API standardization.
"""

from datetime import datetime
from typing import Any, Generic, TypeVar

from pydantic import BaseModel, Field

from shared.utils import generate_uuid, utc_now


T = TypeVar("T")


class Meta(BaseModel):
    """Metadata for API responses."""
    timestamp: datetime = Field(default_factory=utc_now)
    request_id: str = Field(default_factory=generate_uuid)


class PaginationInfo(BaseModel):
    """Pagination information."""
    page: int = Field(ge=1)
    limit: int = Field(ge=1, le=100)
    total: int = Field(ge=0)
    pages: int = Field(ge=0)

    @classmethod
    def create(cls, page: int, limit: int, total: int) -> "PaginationInfo":
        """Create pagination info with calculated pages."""
        pages = (total + limit - 1) // limit if limit > 0 else 0
        return cls(page=page, limit=limit, total=total, pages=pages)


class APIResponse(BaseModel, Generic[T]):
    """Standard API response wrapper."""
    success: bool = True
    data: T
    meta: Meta = Field(default_factory=Meta)


class PaginatedResponse(BaseModel, Generic[T]):
    """Paginated API response wrapper."""
    success: bool = True
    data: list[T]
    pagination: PaginationInfo
    meta: Meta = Field(default_factory=Meta)


class ErrorDetail(BaseModel):
    """Error details."""
    code: str
    message: str
    details: dict[str, Any] = Field(default_factory=dict)


class ErrorResponse(BaseModel):
    """Standard error response."""
    success: bool = False
    error: ErrorDetail
    meta: Meta = Field(default_factory=Meta)

    @classmethod
    def from_exception(
        cls,
        code: str,
        message: str,
        details: dict[str, Any] | None = None,
    ) -> "ErrorResponse":
        """Create error response from exception details."""
        return cls(
            error=ErrorDetail(
                code=code,
                message=message,
                details=details or {},
            )
        )


class HealthCheck(BaseModel):
    """Health check response."""
    status: str = "healthy"
    service: str
    version: str
    timestamp: datetime = Field(default_factory=utc_now)
    dependencies: dict[str, str] = Field(default_factory=dict)
