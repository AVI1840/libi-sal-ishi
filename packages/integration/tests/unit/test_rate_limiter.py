"""
Unit tests for rate limiter.
"""

import pytest
from unittest.mock import MagicMock

from integration.gateway.rate_limiter import RateLimiter


class TestRateLimiter:
    """Tests for RateLimiter class."""

    def test_first_request_allowed(self):
        """First request should always be allowed."""
        limiter = RateLimiter(requests_limit=10, window_seconds=60)

        mock_request = MagicMock()
        mock_request.headers = {}
        mock_request.client.host = "127.0.0.1"

        allowed, info = limiter.is_allowed(mock_request)

        assert allowed is True
        assert int(info["X-RateLimit-Remaining"]) == 9

    def test_rate_limit_exceeded(self):
        """Request should be blocked when limit exceeded."""
        limiter = RateLimiter(requests_limit=2, window_seconds=60)

        mock_request = MagicMock()
        mock_request.headers = {}
        mock_request.client.host = "127.0.0.1"

        # First two requests should be allowed
        limiter.is_allowed(mock_request)
        limiter.is_allowed(mock_request)

        # Third should be blocked
        allowed, info = limiter.is_allowed(mock_request)

        assert allowed is False
        assert info["X-RateLimit-Remaining"] == "0"

    def test_different_clients_separate_limits(self):
        """Different clients should have separate rate limits."""
        limiter = RateLimiter(requests_limit=1, window_seconds=60)

        # Client 1
        mock_request_1 = MagicMock()
        mock_request_1.headers = {}
        mock_request_1.client.host = "127.0.0.1"

        # Client 2
        mock_request_2 = MagicMock()
        mock_request_2.headers = {}
        mock_request_2.client.host = "192.168.1.1"

        # Both should be allowed
        allowed_1, _ = limiter.is_allowed(mock_request_1)
        allowed_2, _ = limiter.is_allowed(mock_request_2)

        assert allowed_1 is True
        assert allowed_2 is True
