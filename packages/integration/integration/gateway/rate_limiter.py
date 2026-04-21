"""
Rate Limiter for API Gateway.

Implements a sliding window rate limiter using Redis.
"""

from datetime import datetime
from typing import Optional
from fastapi import Request, HTTPException
import structlog

from integration.config import settings

logger = structlog.get_logger()


class RateLimiter:
    """Sliding window rate limiter."""

    def __init__(
        self,
        requests_limit: int = 100,
        window_seconds: int = 60,
    ):
        self.requests_limit = requests_limit
        self.window_seconds = window_seconds
        # In-memory storage for MVP (use Redis in production)
        self._requests: dict[str, list[float]] = {}

    def _get_client_id(self, request: Request) -> str:
        """Get unique client identifier from request."""
        # Try to get user ID from JWT token
        auth_header = request.headers.get("Authorization", "")
        if auth_header.startswith("Bearer "):
            # For MVP, use token hash as client ID
            return f"token:{hash(auth_header)}"

        # Fall back to IP address
        forwarded = request.headers.get("X-Forwarded-For")
        if forwarded:
            return f"ip:{forwarded.split(',')[0].strip()}"

        client_host = request.client.host if request.client else "unknown"
        return f"ip:{client_host}"

    def _cleanup_old_requests(self, client_id: str, now: float) -> None:
        """Remove requests outside the current window."""
        if client_id not in self._requests:
            return

        cutoff = now - self.window_seconds
        self._requests[client_id] = [
            ts for ts in self._requests[client_id]
            if ts > cutoff
        ]

    def is_allowed(self, request: Request) -> tuple[bool, dict]:
        """
        Check if the request should be allowed.

        Returns:
            Tuple of (is_allowed, rate_limit_info)
        """
        client_id = self._get_client_id(request)
        now = datetime.now().timestamp()

        # Cleanup old requests
        self._cleanup_old_requests(client_id, now)

        # Get current request count
        if client_id not in self._requests:
            self._requests[client_id] = []

        current_count = len(self._requests[client_id])
        remaining = max(0, self.requests_limit - current_count)

        info = {
            "X-RateLimit-Limit": str(self.requests_limit),
            "X-RateLimit-Remaining": str(remaining),
            "X-RateLimit-Reset": str(int(now + self.window_seconds)),
        }

        if current_count >= self.requests_limit:
            logger.warning("Rate limit exceeded", client_id=client_id, count=current_count)
            return False, info

        # Record this request
        self._requests[client_id].append(now)
        info["X-RateLimit-Remaining"] = str(remaining - 1)

        return True, info

    def get_wait_time(self, request: Request) -> Optional[float]:
        """Get time to wait before next request is allowed."""
        client_id = self._get_client_id(request)
        now = datetime.now().timestamp()

        if client_id not in self._requests or not self._requests[client_id]:
            return None

        oldest_request = min(self._requests[client_id])
        wait_time = (oldest_request + self.window_seconds) - now

        return max(0, wait_time) if wait_time > 0 else None


# Global rate limiter instance
rate_limiter = RateLimiter(
    requests_limit=settings.rate_limit_requests,
    window_seconds=settings.rate_limit_window_seconds,
)


async def check_rate_limit(request: Request) -> None:
    """Dependency to check rate limit."""
    allowed, info = rate_limiter.is_allowed(request)

    if not allowed:
        raise HTTPException(
            status_code=429,
            detail="Rate limit exceeded. Please try again later.",
            headers=info,
        )
