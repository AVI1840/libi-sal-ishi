"""
Common utility functions.
"""

import re
import uuid
from datetime import datetime, timezone
from typing import Any


def generate_uuid() -> str:
    """Generate a new UUID string."""
    return str(uuid.uuid4())


def utc_now() -> datetime:
    """Get current UTC datetime."""
    return datetime.now(timezone.utc)


def validate_israeli_id(teudat_zehut: str) -> bool:
    """
    Validate Israeli ID number (Teudat Zehut).

    Uses the Luhn-like algorithm specific to Israeli IDs.

    Args:
        teudat_zehut: 9-digit Israeli ID number

    Returns:
        True if valid, False otherwise
    """
    # Remove any non-digit characters
    id_num = re.sub(r'\D', '', teudat_zehut)

    # Must be 9 digits (pad with leading zeros if needed)
    if len(id_num) > 9:
        return False
    id_num = id_num.zfill(9)

    # Calculate checksum
    total = 0
    for i, digit in enumerate(id_num):
        num = int(digit)
        if i % 2 == 1:
            num *= 2
            if num > 9:
                num -= 9
        total += num

    return total % 10 == 0


def validate_israeli_phone(phone: str) -> bool:
    """
    Validate Israeli phone number.

    Accepts formats: 05X-XXXXXXX, +972-5X-XXXXXXX, etc.

    Args:
        phone: Phone number string

    Returns:
        True if valid Israeli mobile/landline
    """
    # Remove all non-digit characters except +
    cleaned = re.sub(r'[^\d+]', '', phone)

    # Handle international format
    if cleaned.startswith('+972'):
        cleaned = '0' + cleaned[4:]
    elif cleaned.startswith('972'):
        cleaned = '0' + cleaned[3:]

    # Israeli mobile: 05X-XXX-XXXX (10 digits starting with 05)
    # Israeli landline: 0X-XXX-XXXX (9-10 digits starting with 0)
    if len(cleaned) == 10 and cleaned.startswith('05'):
        return True
    if len(cleaned) in (9, 10) and cleaned.startswith('0'):
        return True

    return False


def format_israeli_phone(phone: str) -> str:
    """
    Format Israeli phone number to standard format.

    Args:
        phone: Phone number string

    Returns:
        Formatted phone number (+972-XX-XXX-XXXX)
    """
    # Remove all non-digit characters
    cleaned = re.sub(r'\D', '', phone)

    # Handle international format
    if cleaned.startswith('972'):
        cleaned = cleaned[3:]

    # Remove leading zero
    if cleaned.startswith('0'):
        cleaned = cleaned[1:]

    # Format as +972-XX-XXX-XXXX
    if len(cleaned) == 9:
        return f"+972-{cleaned[:2]}-{cleaned[2:5]}-{cleaned[5:]}"

    return phone  # Return original if can't format


def mask_pii(value: str, visible_chars: int = 4) -> str:
    """
    Mask PII data, showing only last few characters.

    Args:
        value: Value to mask
        visible_chars: Number of characters to show at the end

    Returns:
        Masked string (e.g., "****4567")
    """
    if not value:
        return ""
    if len(value) <= visible_chars:
        return "*" * len(value)
    return "*" * (len(value) - visible_chars) + value[-visible_chars:]


def calculate_age(birth_date: datetime) -> int:
    """
    Calculate age from birth date.

    Args:
        birth_date: Date of birth

    Returns:
        Age in years
    """
    today = utc_now().date()
    birth = birth_date.date() if isinstance(birth_date, datetime) else birth_date

    age = today.year - birth.year
    if (today.month, today.day) < (birth.month, birth.day):
        age -= 1
    return age


def sanitize_text(text: str) -> str:
    """
    Sanitize text for safe storage and display.

    Removes control characters and normalizes whitespace.

    Args:
        text: Input text

    Returns:
        Sanitized text
    """
    # Remove control characters except newlines and tabs
    cleaned = re.sub(r'[\x00-\x08\x0b\x0c\x0e-\x1f\x7f-\x9f]', '', text)
    # Normalize whitespace
    cleaned = ' '.join(cleaned.split())
    return cleaned.strip()


def truncate_text(text: str, max_length: int = 100, suffix: str = "...") -> str:
    """
    Truncate text to maximum length.

    Args:
        text: Input text
        max_length: Maximum length
        suffix: Suffix to append if truncated

    Returns:
        Truncated text
    """
    if len(text) <= max_length:
        return text
    return text[:max_length - len(suffix)] + suffix


def safe_get(data: dict[str, Any], *keys: str, default: Any = None) -> Any:
    """
    Safely get nested dictionary value.

    Args:
        data: Dictionary to search
        *keys: Path of keys
        default: Default value if not found

    Returns:
        Value at path or default
    """
    result = data
    for key in keys:
        if isinstance(result, dict):
            result = result.get(key)
        else:
            return default
        if result is None:
            return default
    return result


def merge_dicts(*dicts: dict[str, Any]) -> dict[str, Any]:
    """
    Deep merge multiple dictionaries.

    Later dictionaries override earlier ones.

    Args:
        *dicts: Dictionaries to merge

    Returns:
        Merged dictionary
    """
    result: dict[str, Any] = {}
    for d in dicts:
        if d:
            for key, value in d.items():
                if (
                    key in result
                    and isinstance(result[key], dict)
                    and isinstance(value, dict)
                ):
                    result[key] = merge_dicts(result[key], value)
                else:
                    result[key] = value
    return result


def chunks(lst: list[Any], n: int):
    """
    Split list into chunks of size n.

    Args:
        lst: List to split
        n: Chunk size

    Yields:
        List chunks
    """
    for i in range(0, len(lst), n):
        yield lst[i:i + n]
