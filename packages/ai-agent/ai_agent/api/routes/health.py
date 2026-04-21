"""
Health monitoring API routes.
"""

from typing import Annotated
from uuid import UUID
from datetime import datetime, timedelta

from fastapi import APIRouter, Depends, HTTPException, status, Query
import structlog

from shared.models.health import (
    HealthReading,
    HealthSummary,
    HealthAlert,
)
from shared.models.common import APIResponse, PaginatedResponse
from shared.constants import HealthMetricType, AlertSeverity, UserRole
from ai_agent.api.dependencies import (
    get_current_user,
    get_current_user_id,
    require_role,
)
from ai_agent.memory import get_mock_provider, get_structured_memory


logger = structlog.get_logger()
router = APIRouter()


@router.post("/readings", response_model=APIResponse[HealthReading])
async def submit_health_reading(
    reading: HealthReading,
    current_user: dict = Depends(get_current_user),
):
    """
    Submit a health reading (from wearable or manual entry).

    The system will analyze the reading against the user's baseline
    and trigger alerts if anomalies are detected.
    """
    user_id = UUID(current_user["sub"])

    # TODO: Save reading to database
    # TODO: Compare against baseline
    # TODO: Trigger anomaly detection if needed

    logger.info(
        "Health reading submitted",
        user_id=str(user_id),
        metric_type=reading.metric_type,
        value=reading.value,
    )

    return APIResponse(
        success=True,
        data=reading,
    )


@router.get("/readings", response_model=PaginatedResponse[HealthReading])
async def get_health_readings(
    current_user: dict = Depends(get_current_user),
    metric_type: HealthMetricType | None = None,
    start_date: datetime | None = None,
    end_date: datetime | None = None,
    limit: int = Query(default=50, le=200),
    page: int = Query(default=1, ge=1),
):
    """
    Get health readings for the current user.

    Can filter by metric type and date range.
    """
    user_id = current_user["sub"]
    mock_provider = get_mock_provider()

    # Get mock health readings
    readings_data = mock_provider.get_health_readings(user_id, days=14)

    # Filter by metric type if specified
    if metric_type:
        readings_data = [r for r in readings_data if r["metric_type"] == metric_type.value]

    # Convert to response models
    readings = [
        HealthReading(
            reading_id=r["reading_id"],
            user_id=r["user_id"],
            metric_type=HealthMetricType(r["metric_type"]),
            value=r["value"],
            recorded_at=datetime.fromisoformat(r["recorded_at"]),
            source=r.get("source", "manual"),
        )
        for r in readings_data
    ]

    # Sort by date descending
    readings.sort(key=lambda x: x.recorded_at, reverse=True)

    # Paginate
    total = len(readings)
    start_idx = (page - 1) * limit
    end_idx = start_idx + limit
    page_readings = readings[start_idx:end_idx]

    return PaginatedResponse(
        success=True,
        data=page_readings,
        pagination={
            "page": page,
            "limit": limit,
            "total": total,
            "pages": (total + limit - 1) // limit,
        },
    )


@router.get("/summary", response_model=APIResponse[HealthSummary])
async def get_health_summary(
    current_user: dict = Depends(get_current_user),
    days: int = Query(default=7, ge=1, le=90),
):
    """
    Get a health summary for the specified period.

    Includes:
    - Average values for each metric
    - Trends (improving/declining)
    - Notable anomalies
    - Recommendations
    """
    user_id = current_user["sub"]
    mock_provider = get_mock_provider()
    memory = get_structured_memory()

    # Get user data
    user = memory.get_user(user_id)
    readings = mock_provider.get_health_readings(user_id, days=days)

    # Calculate metrics summary
    metrics = {}
    for metric_type in set(r["metric_type"] for r in readings):
        values = [r["value"] for r in readings if r["metric_type"] == metric_type]
        if values:
            metrics[metric_type] = {
                "avg": round(sum(values) / len(values), 1),
                "min": round(min(values), 1),
                "max": round(max(values), 1),
                "trend": "stable",  # Would calculate from actual data
            }

    # Get baselines for recommendations
    recommendations = []
    if user:
        for baseline in user.health_baselines:
            metric = metrics.get(baseline.metric_type)
            if metric:
                if metric["avg"] < baseline.baseline_value - baseline.std_deviation:
                    if baseline.metric_type == "steps":
                        recommendations.append("כמות הצעדים שלך ירדה, נסה להגביר פעילות גופנית קלה")
                    elif baseline.metric_type == "sleep_hours":
                        recommendations.append("שעות השינה שלך פחתו, נסה לשמור על שגרת שינה קבועה")

    if not recommendations:
        recommendations = [
            "הפרמטרים שלך נראים יציבים 👍",
            "המשך לשמור על אורח חיים בריא!",
        ]

    # Get alerts count
    alerts = mock_provider.get_alerts(user_id)
    alerts_count = len([a for a in alerts if a["status"] == "pending"])

    return APIResponse(
        success=True,
        data=HealthSummary(
            user_id=user_id,
            period_start=datetime.now() - timedelta(days=days),
            period_end=datetime.now(),
            metrics=metrics,
            alerts_count=alerts_count,
            overall_status="good" if alerts_count == 0 else "attention",
            recommendations=recommendations,
        ),
    )


@router.get("/alerts", response_model=PaginatedResponse[HealthAlert])
async def get_health_alerts(
    current_user: dict = Depends(get_current_user),
    severity: AlertSeverity | None = None,
    alert_status: str | None = Query(default=None, alias="status"),
    limit: int = Query(default=20, le=100),
    page: int = Query(default=1, ge=1),
):
    """
    Get health alerts for the current user.

    Can filter by severity and status.
    """
    user_id = current_user["sub"]
    mock_provider = get_mock_provider()

    # Get alerts from mock data
    alerts_data = mock_provider.get_alerts(user_id)

    # Filter by severity
    if severity:
        alerts_data = [a for a in alerts_data if a["severity"] == severity.value]

    # Filter by status
    if alert_status:
        alerts_data = [a for a in alerts_data if a["status"] == alert_status]

    # Convert to response models
    alerts = [
        HealthAlert(
            alert_id=a["alert_id"],
            user_id=a["user_id"],
            alert_type=a["alert_type"],
            severity=AlertSeverity(a["severity"]),
            title=a["title"],
            description=a.get("description"),
            triggered_by=a.get("triggered_by"),
            status=a["status"],
            created_at=a["created_at"],
        )
        for a in alerts_data
    ]

    # Paginate
    total = len(alerts)
    start_idx = (page - 1) * limit
    end_idx = start_idx + limit
    page_alerts = alerts[start_idx:end_idx]

    return PaginatedResponse(
        success=True,
        data=page_alerts,
        pagination={
            "page": page,
            "limit": limit,
            "total": total,
            "pages": max(1, (total + limit - 1) // limit),
        },
    )


@router.post("/alerts/{alert_id}/acknowledge")
async def acknowledge_alert(
    alert_id: UUID,
    current_user: dict = Depends(get_current_user),
):
    """
    Acknowledge a health alert.

    Can be done by the user or a family member with appropriate permissions.
    """
    user_id = UUID(current_user["sub"])

    # TODO: Update alert status
    # TODO: Log acknowledgment

    logger.info(
        "Alert acknowledged",
        alert_id=str(alert_id),
        acknowledged_by=str(user_id),
    )

    return APIResponse(
        success=True,
        data={"message": "Alert acknowledged"},
    )


@router.get("/baselines", response_model=APIResponse[dict])
async def get_health_baselines(
    current_user: dict = Depends(get_current_user),
):
    """
    Get the user's health baselines.

    Baselines are calculated from historical data and used
    for anomaly detection.
    """
    user_id = current_user["sub"]
    memory = get_structured_memory()

    user = memory.get_user(user_id)
    if not user:
        # Return default baselines for unknown users
        return APIResponse(
            success=True,
            data={
                "heart_rate": {"baseline": 72, "std_dev": 8},
                "steps": {"baseline": 3000, "std_dev": 1500},
                "sleep_hours": {"baseline": 6.5, "std_dev": 1},
            },
        )

    # Build baselines from user data
    baselines = {}
    for baseline in user.health_baselines:
        baselines[baseline.metric_type] = {
            "baseline": baseline.baseline_value,
            "std_dev": baseline.std_deviation,
        }

    return APIResponse(
        success=True,
        data=baselines,
    )


@router.get("/family/{user_id}/summary", response_model=APIResponse[HealthSummary])
async def get_family_member_health_summary(
    user_id: UUID,
    current_user: dict = Depends(require_role(UserRole.FAMILY)),
    days: int = Query(default=7, ge=1, le=90),
):
    """
    Get health summary for a family member's loved one.

    Only accessible by family members with appropriate permissions.
    """
    # TODO: Verify family relationship and privacy settings
    # TODO: Fetch summary with potentially filtered data

    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="Not implemented yet",
    )
