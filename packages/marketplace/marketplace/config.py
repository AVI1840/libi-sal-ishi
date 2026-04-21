"""
Marketplace configuration.
"""

from functools import lru_cache

from shared.config import get_settings, Settings


@lru_cache
def get_marketplace_settings() -> Settings:
    """Get marketplace settings."""
    return get_settings()


# Unit conversion constants
HOURS_TO_UNITS_MULTIPLIER = 4  # 1 hour = 4 units (15 min each)

# Nursing level to monthly hours mapping
NURSING_LEVEL_HOURS = {
    1: 2.5,   # Level 1: 2.5 hours/week
    2: 4,     # Level 2: 4 hours/week
    3: 6,     # Level 3: 6 hours/week
    4: 9,     # Level 4: 9 hours/week
    5: 12,    # Level 5: 12 hours/week
    6: 18,    # Level 6: 18 hours/week
}

# Monthly units calculation
def get_monthly_units(nursing_level: int) -> int:
    """Calculate monthly units for a nursing level."""
    weekly_hours = NURSING_LEVEL_HOURS.get(nursing_level, 0)
    weekly_units = weekly_hours * HOURS_TO_UNITS_MULTIPLIER
    monthly_units = int(weekly_units * 4)  # 4 weeks per month
    return monthly_units


# Pre-calculated for quick reference
NURSING_LEVEL_MONTHLY_UNITS = {
    level: get_monthly_units(level)
    for level in range(1, 7)
}
# Results: {1: 40, 2: 64, 3: 96, 4: 144, 5: 192, 6: 288}

# Optimal aging requirements
OPTIMAL_AGING_MIN_UNITS = 2  # Minimum 2 units must be spent on optimal aging services
