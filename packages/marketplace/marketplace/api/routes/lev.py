"""
Lev (לב) API Routes - Intake, Recommendations, CRM, and Subsidy endpoints.
"""

from datetime import date, datetime
from typing import Any
from uuid import uuid4

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, Field

from shared.constants import (
    ContentWorld,
    SubsidyTier,
    MeaningTag,
    MobilityLevel,
    SensoryLevel,
    DigitalLiteracyLevel,
    CONTENT_WORLD_LABELS_HE,
    MEANING_TAG_LABELS_HE,
)
from shared.models.lev_profile import (
    LevProfile,
    IntakeData,
    ICFProfile,
    RiskFlags,
    UserPersona,
    DEFAULT_INTAKE_QUESTIONS,
)

router = APIRouter(prefix="/lev", tags=["Lev - Optimal Aging OS"])


# ===========================================
# Request/Response Models
# ===========================================

class IntakeSubmission(BaseModel):
    """Intake wizard submission from frontend."""
    user_id: str

    # ICF answers (from simple questions)
    mobility: MobilityLevel = MobilityLevel.INDEPENDENT
    sensory: SensoryLevel = SensoryLevel.INTACT
    digital_literacy: DigitalLiteracyLevel = DigitalLiteracyLevel.BASIC

    # Intake answers
    meaning_tags: list[MeaningTag] = Field(default_factory=list)
    loneliness_score: int = Field(default=7, ge=1, le=10)
    prefers_group_activities: bool = True
    core_dream: str | None = None
    goals: list[str] = Field(default_factory=list)
    main_challenges: str | None = None
    preferred_times: list[str] = Field(default_factory=lambda: ["morning"])


class IntakeResponse(BaseModel):
    """Response after intake submission."""
    success: bool
    profile_id: str
    persona_summary: dict | None = None
    risk_summary: dict | None = None
    message_he: str = "הפרופיל נוצר בהצלחה!"


class SubsidyRequest(BaseModel):
    """Request for subsidy calculation."""
    service_base_price: float = Field(..., ge=0)
    content_world: ContentWorld
    subsidy_tier_override: SubsidyTier | None = None
    is_group_activity: bool = False
    user_has_income_supplement: bool = False
    user_is_lonely: bool = False


class RecommendationRequest(BaseModel):
    """Request for personalized recommendations."""
    user_id: str
    limit: int = Field(default=10, ge=1, le=50)
    content_world_filter: ContentWorld | None = None
    max_distance_km: float | None = None


class CRMActionUpdate(BaseModel):
    """Update CRM action status."""
    status: str  # pending, in_progress, completed, dismissed
    notes: str | None = None


# ===========================================
# Intake Wizard Endpoints
# ===========================================

@router.get("/intake/questions")
async def get_intake_questions() -> dict:
    """
    Get the intake wizard questions.

    Questions are pre-configured with conditional logic
    and Hebrew labels for the frontend.
    """
    return {
        "success": True,
        "data": {
            "questions": [q.model_dump() for q in DEFAULT_INTAKE_QUESTIONS],
            "welcome_message_he": "שלום! נשמח להכיר אותך טוב יותר 👋",
            "completion_message_he": "תודה! יצרנו לך פרופיל אישי ✨",
            "estimated_minutes": 5,
        }
    }


@router.post("/intake/submit")
async def submit_intake(submission: IntakeSubmission) -> IntakeResponse:
    """
    Submit completed intake wizard.

    Creates the Lev profile with ICF data, risk flags, and persona.
    """
    # Create ICF profile from answers
    icf = ICFProfile(
        mobility=submission.mobility,
        sensory=submission.sensory,
        digital_literacy=submission.digital_literacy,
    )

    # Create intake data
    intake = IntakeData(
        meaning_tags=submission.meaning_tags,
        loneliness_score=submission.loneliness_score,
        prefers_group_activities=submission.prefers_group_activities,
        core_dream=submission.core_dream,
        goals=submission.goals,
        main_challenges=submission.main_challenges,
        preferred_times=submission.preferred_times,
        completed_at=datetime.now(),
    )

    # Compute risk flags
    risk_flags = RiskFlags.compute_from_intake(icf=icf, intake=intake)

    # Compute persona
    persona = UserPersona.compute_from_profile(icf=icf, intake=intake)

    # Create full Lev profile
    profile = LevProfile(
        user_id=submission.user_id,
        intake_data=intake,
        icf_profile=icf,
        risk_flags=risk_flags,
        persona=persona,
        intake_completed=True,
        created_at=datetime.now(),
        updated_at=datetime.now(),
    )

    # In production: Save to database
    # await profile_repository.save(profile)

    return IntakeResponse(
        success=True,
        profile_id=submission.user_id,
        persona_summary={
            "primary": persona.primary_persona.value,
            "key_traits": persona.key_traits,
            "engagement_tips": persona.engagement_tips,
        },
        risk_summary={
            "flags": [f.value for f in risk_flags.get_active_flags()],
            "is_lonely": risk_flags.is_lonely,
        },
        message_he="הפרופיל נוצר בהצלחה! התאמנו לך שירותים מומלצים",
    )


@router.get("/intake/options")
async def get_intake_options() -> dict:
    """
    Get all available options for intake fields.

    Returns Hebrew labels for display.
    """
    return {
        "success": True,
        "data": {
            "meaning_tags": [
                {"value": tag.value, "label_he": MEANING_TAG_LABELS_HE.get(tag.value, tag.value)}
                for tag in MeaningTag
            ],
            "content_worlds": [
                {"value": cw.value, "label_he": CONTENT_WORLD_LABELS_HE.get(cw.value, cw.value)}
                for cw in ContentWorld
            ],
            "mobility_levels": [
                {"value": "independent", "label_he": "הולך/ת בעצמאות"},
                {"value": "assisted_device", "label_he": "משתמש/ת במקל או הליכון"},
                {"value": "human_assisted", "label_he": "צריך/ה עזרה מאדם אחר"},
            ],
            "sensory_levels": [
                {"value": "intact", "label_he": "שומע/ת ורואה טוב"},
                {"value": "hearing_impaired", "label_he": "קשה לי לשמוע"},
                {"value": "visual_impaired", "label_he": "קשה לי לראות"},
                {"value": "both_impaired", "label_he": "קשה לי גם לשמוע וגם לראות"},
            ],
        }
    }


# ===========================================
# Subsidy Calculation Endpoints
# ===========================================

@router.post("/subsidy/calculate")
async def calculate_subsidy(request: SubsidyRequest) -> dict:
    """
    Calculate subsidy for a service purchase.

    Implements the Dynamic Subsidy Engine (Algorithm A).
    """
    from marketplace.subsidy.engine import subsidy_engine

    result = subsidy_engine.calculate_subsidy(
        service_base_price=request.service_base_price,
        content_world=request.content_world,
        subsidy_tier_override=request.subsidy_tier_override,
        is_group_activity=request.is_group_activity,
        user_has_income_supplement=request.user_has_income_supplement,
        user_is_lonely=request.user_is_lonely,
    )

    return {
        "success": True,
        "data": result.to_dict(),
    }


@router.get("/subsidy/tiers")
async def get_subsidy_tiers() -> dict:
    """
    Get all subsidy tiers with their percentages.
    """
    from shared.constants import SUBSIDY_TIER_PERCENTAGES
    from marketplace.subsidy.engine import SUBSIDY_TIER_LABELS_HE

    tiers = []
    for tier in SubsidyTier:
        tiers.append({
            "value": tier.value,
            "label_he": SUBSIDY_TIER_LABELS_HE.get(tier.value, tier.value),
            "percentage": SUBSIDY_TIER_PERCENTAGES.get(tier.value, 0) * 100,
        })

    return {
        "success": True,
        "data": {"tiers": tiers},
    }


# ===========================================
# Recommendation Endpoints
# ===========================================

@router.get("/recommendations/{user_id}")
async def get_recommendations(
    user_id: str,
    limit: int = Query(default=10, ge=1, le=50),
    content_world: ContentWorld | None = None,
) -> dict:
    """
    Get personalized service recommendations for a user.

    Implements the Recommendation Engine (Algorithm B).
    """
    # In production: Load user profile and services from database
    # For mock: Return sample recommendations

    return {
        "success": True,
        "data": {
            "user_id": user_id,
            "recommendations": _generate_mock_recommendations(user_id, limit),
            "generated_at": datetime.now().isoformat(),
        }
    }


# ===========================================
# CRM Action Endpoints
# ===========================================

@router.get("/crm/actions")
async def get_crm_actions(
    priority: str | None = Query(default=None, description="Filter by priority"),
    action_type: str | None = Query(default=None, description="Filter by action type"),
    status: str = Query(default="pending", description="Filter by status"),
    limit: int = Query(default=50, ge=1, le=200),
) -> dict:
    """
    Get CRM actions for case manager dashboard.

    Returns a list of ACTIONS, not a list of users.
    """
    # In production: Load from database
    # For mock: Generate sample actions

    actions = _generate_mock_crm_actions(limit)

    # Apply filters
    if priority:
        actions = [a for a in actions if a.get("priority") == priority]
    if action_type:
        actions = [a for a in actions if a.get("action_type") == action_type]
    if status:
        actions = [a for a in actions if a.get("status") == status]

    return {
        "success": True,
        "data": {
            "actions": actions,
            "total": len(actions),
            "summary": _generate_crm_summary(actions),
        }
    }


@router.patch("/crm/actions/{action_id}")
async def update_crm_action(action_id: str, update: CRMActionUpdate) -> dict:
    """
    Update CRM action status.
    """
    # In production: Update in database

    return {
        "success": True,
        "data": {
            "action_id": action_id,
            "status": update.status,
            "notes": update.notes,
            "updated_at": datetime.now().isoformat(),
        }
    }


@router.get("/crm/dashboard")
async def get_crm_dashboard() -> dict:
    """
    Get CRM dashboard summary with KPIs.
    """
    return {
        "success": True,
        "data": {
            "summary": {
                "total_actions": 12,
                "urgent_actions": 3,
                "high_priority_actions": 5,
            },
            "by_type": {
                "silent_users": 4,
                "loneliness_interventions": 3,
                "birthdays": 2,
                "expiring_balance": 1,
                "low_balance": 2,
            },
            "kpis": {
                "total_active_clients": 75,
                "clients_at_risk": 8,
                "prevention_service_percentage": 62.5,
                "average_subsidy_rate": 78.3,
                "wallet_utilization_rate": 71.2,
            },
            "trends": {
                "prevention_trend": "up",  # up, down, stable
                "activity_trend": "stable",
                "satisfaction_trend": "up",
            },
            "vendor_health": {
                "average_rating": 4.7,
                "vendors_below_threshold": 1,
                "top_performing": "מרכז כושר הגיל השלישי",
            },
        }
    }


# ===========================================
# Mock Data Generators (For Demo)
# ===========================================

def _generate_mock_recommendations(user_id: str, limit: int) -> list[dict]:
    """Generate mock recommendations for demo."""
    services = [
        {
            "service_id": "service-6",
            "title_he": "מועדון צהריים חברתי",
            "content_world": "belonging_meaning",
            "total_score": 92.5,
            "subsidy_percentage": 100,
            "client_pays": 0,
            "base_price": 40,
            "recommendation_reason_he": "שירות מניעה מומלץ • פעילות חברתית • קרוב לביתך",
            "is_group_activity": True,
            "distance_km": 1.2,
        },
        {
            "service_id": "service-4",
            "title_he": "יוגה לגיל השלישי",
            "content_world": "health_function",
            "total_score": 88.3,
            "subsidy_percentage": 100,
            "client_pays": 0,
            "base_price": 45,
            "recommendation_reason_he": "שירות מניעה מומלץ • מתאים לתחומי העניין שלך: ספורט",
            "is_group_activity": True,
            "distance_km": 0.8,
        },
        {
            "service_id": "service-8",
            "title_he": "סדנת מניעת נפילות",
            "content_world": "health_function",
            "total_score": 85.1,
            "subsidy_percentage": 100,
            "client_pays": 0,
            "base_price": 0,
            "recommendation_reason_he": "שירות מניעה מומלץ • קרוב לביתך",
            "is_group_activity": True,
            "distance_km": 1.5,
        },
        {
            "service_id": "service-7",
            "title_he": "סדנת ציור ויצירה",
            "content_world": "belonging_meaning",
            "total_score": 79.8,
            "subsidy_percentage": 100,
            "client_pays": 0,
            "base_price": 60,
            "recommendation_reason_he": "מתאים לתחומי העניין שלך: אומנות",
            "is_group_activity": True,
            "distance_km": 2.3,
        },
        {
            "service_id": "service-3",
            "title_he": "ייעוץ תזונתי",
            "content_world": "health_function",
            "total_score": 72.4,
            "subsidy_percentage": 50,
            "client_pays": 100,
            "base_price": 200,
            "recommendation_reason_he": "שירות מניעה מומלץ",
            "is_group_activity": False,
            "distance_km": 3.1,
        },
    ]

    return services[:limit]


def _generate_mock_crm_actions(limit: int) -> list[dict]:
    """Generate mock CRM actions for demo."""
    actions = [
        {
            "action_id": "action-1",
            "action_type": "silent_user",
            "user_id": "client-15",
            "user_name": "יוסף אברהם",
            "title_he": "משתמש שקט - ליצור קשר",
            "description_he": "לא הייתה פעילות יותר מ-21 יום",
            "suggested_action_he": "להתקשר ולברר מצב, להציע פעילות מתאימה",
            "priority": "high",
            "due_date": date.today().isoformat(),
            "status": "pending",
            "persona_hint": "נהנה/ית מפעילות חברתית",
            "engagement_tips": ["להציע פעילויות קבוצתיות", "לשתף בהצלחות של אחרים"],
        },
        {
            "action_id": "action-2",
            "action_type": "loneliness_intervention",
            "user_id": "client-8",
            "user_name": "שרה כהן",
            "title_he": "להציע פעילות חברתית",
            "description_he": "ציון בדידות נמוך (3/10)",
            "suggested_action_he": "להציע פעילות קבוצתית שמתאימה לתחומי העניין",
            "priority": "urgent",
            "due_date": date.today().isoformat(),
            "status": "pending",
            "persona_hint": "שואף/ת לשמור על עצמאות",
            "suggested_service_id": "service-6",
            "suggested_service_name": "מועדון צהריים חברתי",
        },
        {
            "action_id": "action-3",
            "action_type": "expiring_balance",
            "user_id": "client-22",
            "user_name": "משה לוי",
            "title_he": "יתרה עומדת לפוג",
            "description_he": "יש 15 יחידות שיפוגו בעוד 10 ימים",
            "suggested_action_he": "להתקשר ולהציע שירותים שניתן לנצל",
            "priority": "urgent",
            "due_date": date.today().isoformat(),
            "status": "pending",
        },
        {
            "action_id": "action-4",
            "action_type": "birthday_gift",
            "user_id": "client-45",
            "user_name": "רחל מזרחי",
            "title_he": "🎂 יום הולדת קרוב",
            "description_he": "יום הולדת בעוד 3 ימים",
            "suggested_action_he": "לשלוח שובר מתנה וברכה",
            "priority": "medium",
            "due_date": (date.today() + timedelta(days=1)).isoformat(),
            "status": "pending",
        },
        {
            "action_id": "action-5",
            "action_type": "follow_up",
            "user_id": "client-33",
            "user_name": "דוד ביטון",
            "title_he": "מעקב אחרי שירות",
            "description_he": "השלים פיזיותרפיה בבית לפני 3 ימים",
            "suggested_action_he": "לברר שביעות רצון ולהציע המשך",
            "priority": "low",
            "due_date": (date.today() + timedelta(days=2)).isoformat(),
            "status": "pending",
        },
    ]

    return actions[:limit]


def _generate_crm_summary(actions: list[dict]) -> dict:
    """Generate summary from actions."""
    return {
        "total_actions": len(actions),
        "urgent_actions": sum(1 for a in actions if a.get("priority") == "urgent"),
        "high_priority_actions": sum(1 for a in actions if a.get("priority") == "high"),
        "by_type": {
            "silent_users": sum(1 for a in actions if a.get("action_type") == "silent_user"),
            "loneliness_interventions": sum(1 for a in actions if a.get("action_type") == "loneliness_intervention"),
            "birthdays": sum(1 for a in actions if a.get("action_type") == "birthday_gift"),
            "expiring_balance": sum(1 for a in actions if a.get("action_type") == "expiring_balance"),
            "follow_ups": sum(1 for a in actions if a.get("action_type") == "follow_up"),
        }
    }


# For backwards compatibility
from datetime import timedelta
