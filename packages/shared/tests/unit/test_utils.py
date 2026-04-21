"""
Unit tests for utility functions.
"""

import pytest

from shared.utils import (
    validate_israeli_id,
    validate_israeli_phone,
    format_israeli_phone,
    mask_pii,
    calculate_age,
    sanitize_text,
)


class TestIsraeliIDValidation:
    """Tests for Israeli ID validation."""

    def test_valid_israeli_id(self):
        """Test valid Israeli ID numbers."""
        valid_ids = [
            "123456782",
            "000000018",
            "012345670",
        ]
        for id_num in valid_ids:
            assert validate_israeli_id(id_num), f"Expected {id_num} to be valid"

    def test_invalid_israeli_id_wrong_checksum(self):
        """Test invalid checksum."""
        assert not validate_israeli_id("123456789")

    def test_invalid_israeli_id_wrong_length(self):
        """Test wrong length IDs."""
        assert not validate_israeli_id("12345")
        assert not validate_israeli_id("1234567890")

    def test_invalid_israeli_id_non_numeric(self):
        """Test non-numeric IDs."""
        assert not validate_israeli_id("12345678a")
        assert not validate_israeli_id("abcdefghi")

    def test_empty_israeli_id(self):
        """Test empty ID."""
        assert not validate_israeli_id("")


class TestIsraeliPhoneValidation:
    """Tests for Israeli phone validation."""

    def test_valid_mobile_phones(self):
        """Test valid mobile phone formats."""
        valid_phones = [
            "050-1234567",
            "0501234567",
            "+972-50-123-4567",
            "972501234567",
            "052-1234567",
            "054-1234567",
        ]
        for phone in valid_phones:
            assert validate_israeli_phone(phone), f"Expected {phone} to be valid"

    def test_valid_landline_phones(self):
        """Test valid landline formats."""
        valid_phones = [
            "02-1234567",
            "03-1234567",
            "09-1234567",
        ]
        for phone in valid_phones:
            assert validate_israeli_phone(phone), f"Expected {phone} to be valid"

    def test_invalid_phones(self):
        """Test invalid phone numbers."""
        invalid_phones = [
            "123456",
            "abc",
            "",
            "060-1234567",  # Invalid prefix
        ]
        for phone in invalid_phones:
            assert not validate_israeli_phone(phone), f"Expected {phone} to be invalid"


class TestPhoneFormatting:
    """Tests for phone number formatting."""

    def test_format_mobile_phone(self):
        """Test mobile phone formatting."""
        assert format_israeli_phone("0501234567") == "050-123-4567"
        assert format_israeli_phone("050-1234567") == "050-123-4567"

    def test_format_with_country_code(self):
        """Test formatting with country code."""
        assert format_israeli_phone("+972501234567") == "050-123-4567"
        assert format_israeli_phone("972-50-123-4567") == "050-123-4567"


class TestPIIMasking:
    """Tests for PII masking."""

    def test_mask_email(self):
        """Test email masking."""
        assert mask_pii("yossi@example.com", "email") == "y****@e******.com"

    def test_mask_phone(self):
        """Test phone masking."""
        assert mask_pii("050-123-4567", "phone") == "***-***-4567"

    def test_mask_israeli_id(self):
        """Test Israeli ID masking."""
        assert mask_pii("123456782", "id") == "*****6782"


class TestAgeCalculation:
    """Tests for age calculation."""

    def test_calculate_age(self):
        """Test age calculation."""
        from datetime import date

        birth_date = date(1950, 6, 15)
        # This test will need updating based on current date
        age = calculate_age(birth_date)
        assert age >= 74  # Born in 1950, so at least 74 as of 2024

    def test_calculate_age_string_input(self):
        """Test age calculation with string input."""
        age = calculate_age("1950-06-15")
        assert age >= 74


class TestTextSanitization:
    """Tests for text sanitization."""

    def test_sanitize_removes_html(self):
        """Test HTML tag removal."""
        text = "<script>alert('xss')</script>Hello"
        assert "<script>" not in sanitize_text(text)

    def test_sanitize_removes_excessive_whitespace(self):
        """Test whitespace normalization."""
        text = "Hello    World\n\n\nTest"
        result = sanitize_text(text)
        assert "    " not in result

    def test_sanitize_preserves_hebrew(self):
        """Test that Hebrew text is preserved."""
        text = "שלום עולם"
        assert sanitize_text(text) == "שלום עולם"
