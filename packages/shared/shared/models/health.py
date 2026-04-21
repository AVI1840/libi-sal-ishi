"""
Health-related Pydantic models.
"""

from datetime import datetime
from typing import Any

from pydantic import BaseModel, Field

from shared.constants import AlertSeverity, AlertStatus, AlertType, HealthMetricType


class HealthReading(BaseModel):
    """Single health reading from a device or manual entry."""
    reading_id: str | None = None
    user_id: str
    metric_type: HealthMetricType
    value: float
    unit: str | None = None
    recorded_at: datetime
    source: str = "manual"  # manual, fitbit, withings, etc.

    model_config = {"from_attributes": True}


class HealthReadingCreate(BaseModel):
    """Model for creating a health reading."""
    user_id: str
    metric_type: HealthMetricType
    value: float
    unit: str | None = None
    recorded_at: datetime | None = None
    source: str = "manual"


class HealthBaseline(BaseModel):
    """Baseline health metrics for anomaly detection."""
    user_id: str
    metric_type: HealthMetricType
    baseline_value: float
    std_deviation: float | None = None
    min_normal: float | None = None
    max_normal: float | None = None
    updated_at: datetime

    model_config = {"from_attributes": True}

    def is_anomaly(self, value: float, threshold_std: float = 2.0) -> bool:
        """Check if a value is an anomaly based on baseline."""
        if self.min_normal is not None and value < self.min_normal:
            return True
        if self.max_normal is not None and value > self.max_normal:
            return True
        if self.std_deviation:
            lower = self.baseline_value - (threshold_std * self.std_deviation)
            upper = self.baseline_value + (threshold_std * self.std_deviation)
            return value < lower or value > upper
        return False


class HealthAlert(BaseModel):
    """Health-related alert."""
    alert_id: str | None = None
    user_id: str
    alert_type: AlertType
    severity: AlertSeverity
    title: str
    description: str | None = None
    triggered_by: dict[str, Any] | None = None
    status: AlertStatus = AlertStatus.PENDING
    notified_family: bool = False
    created_at: datetime | None = None
    resolved_at: datetime | None = None

    model_config = {"from_attributes": True}


class HealthAlertCreate(BaseModel):
    """Model for creating a health alert."""
    user_id: str
    alert_type: AlertType
    severity: AlertSeverity
    title: str
    description: str | None = None
    triggered_by: dict[str, Any] | None = None


class HealthMetricSummary(BaseModel):
    """Summary of a single health metric."""
    metric_type: HealthMetricType
    current_value: float | None = None
    baseline_value: float | None = None
    trend: str | None = None  # improving, declining, stable
    last_reading_at: datetime | None = None
    readings_count: int = 0


class HealthSummary(BaseModel):
    """Overall health summary for a user."""
    user_id: str
    metrics: list[HealthMetricSummary]
    active_alerts: list[HealthAlert]
    overall_status: str = "unknown"  # good, fair, concerning, critical
    last_updated: datetime

    @property
    def has_critical_alerts(self) -> bool:
        """Check if there are critical alerts."""
        return any(a.severity == AlertSeverity.CRITICAL for a in self.active_alerts)


class HealthTrend(BaseModel):
    """Health trend over time."""
    user_id: str
    metric_type: HealthMetricType
    period_days: int
    readings: list[HealthReading]
    average: float | None = None
    min_value: float | None = None
    max_value: float | None = None
    trend_direction: str | None = None  # up, down, stable


class CognitiveIndicator(BaseModel):
    """Cognitive health indicator from conversation analysis."""
    user_id: str
    indicator_type: str  # repeated_questions, confusion, memory_issues
    occurrences: int
    period_hours: int
    examples: list[str] = Field(default_factory=list)
    severity: AlertSeverity
    detected_at: datetime


class LonelinessIndicator(BaseModel):
    """Loneliness indicator from conversation analysis."""
    user_id: str
    sentiment_score: float  # -1 to 1
    loneliness_keywords_detected: list[str]
    days_without_family_contact: int
    social_activity_count: int
    risk_level: str  # low, medium, high
    detected_at: datetime
