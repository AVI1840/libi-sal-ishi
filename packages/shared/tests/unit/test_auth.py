"""
Unit tests for JWT authentication.
"""

import pytest
from datetime import datetime, timedelta
from uuid import uuid4

from shared.auth import JWTHandler, create_access_token, verify_token
from shared.exceptions import AuthenticationError
from shared.constants import UserRole


class TestJWTHandler:
    """Tests for JWT handler."""

    @pytest.fixture
    def jwt_handler(self):
        """Create JWT handler for testing."""
        return JWTHandler(
            secret_key="test-secret-key-for-unit-tests-only-32chars",
            algorithm="HS256",
            access_token_expire_minutes=60,
            refresh_token_expire_days=7,
        )

    def test_create_access_token(self, jwt_handler):
        """Test access token creation."""
        user_id = str(uuid4())
        token = jwt_handler.create_access_token(
            user_id=user_id,
            role=UserRole.SENIOR,
        )

        assert token is not None
        assert isinstance(token, str)
        assert len(token) > 0

    def test_create_refresh_token(self, jwt_handler):
        """Test refresh token creation."""
        user_id = str(uuid4())
        token = jwt_handler.create_refresh_token(user_id=user_id)

        assert token is not None
        assert isinstance(token, str)

    def test_verify_valid_token(self, jwt_handler):
        """Test verification of valid token."""
        user_id = str(uuid4())
        token = jwt_handler.create_access_token(
            user_id=user_id,
            role=UserRole.SENIOR,
        )

        payload = jwt_handler.verify_token(token)

        assert payload is not None
        assert payload["sub"] == user_id
        assert payload["role"] == UserRole.SENIOR.value
        assert payload["type"] == "access"

    def test_verify_invalid_token(self, jwt_handler):
        """Test verification of invalid token."""
        with pytest.raises(AuthenticationError):
            jwt_handler.verify_token("invalid-token")

    def test_verify_expired_token(self, jwt_handler):
        """Test verification of expired token."""
        # Create handler with very short expiry
        short_handler = JWTHandler(
            secret_key="test-secret-key-for-unit-tests-only-32chars",
            algorithm="HS256",
            access_token_expire_minutes=-1,  # Already expired
            refresh_token_expire_days=7,
        )

        user_id = str(uuid4())
        token = short_handler.create_access_token(
            user_id=user_id,
            role=UserRole.SENIOR,
        )

        with pytest.raises(AuthenticationError):
            jwt_handler.verify_token(token)

    def test_decode_token(self, jwt_handler):
        """Test token decoding without verification."""
        user_id = str(uuid4())
        token = jwt_handler.create_access_token(
            user_id=user_id,
            role=UserRole.ADMIN,
            permissions=["read:all", "write:all"],
        )

        payload = jwt_handler.decode_token(token)

        assert payload["sub"] == user_id
        assert payload["role"] == UserRole.ADMIN.value
        assert "read:all" in payload.get("permissions", [])

    def test_token_with_custom_claims(self, jwt_handler):
        """Test token with custom claims."""
        user_id = str(uuid4())
        token = jwt_handler.create_access_token(
            user_id=user_id,
            role=UserRole.CASE_MANAGER,
            custom_claim="test_value",
        )

        payload = jwt_handler.verify_token(token)

        assert payload.get("custom_claim") == "test_value"

    def test_refresh_token_type(self, jwt_handler):
        """Test that refresh token has correct type."""
        user_id = str(uuid4())
        token = jwt_handler.create_refresh_token(user_id=user_id)

        payload = jwt_handler.verify_token(token, token_type="refresh")

        assert payload["type"] == "refresh"

    def test_wrong_token_type_fails(self, jwt_handler):
        """Test that using wrong token type fails."""
        user_id = str(uuid4())
        access_token = jwt_handler.create_access_token(
            user_id=user_id,
            role=UserRole.SENIOR,
        )

        with pytest.raises(AuthenticationError):
            jwt_handler.verify_token(access_token, token_type="refresh")
