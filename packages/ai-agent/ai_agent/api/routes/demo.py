"""
Demo API routes for investor demonstrations.
"""

from uuid import uuid4
from datetime import datetime
import asyncio
import json

from fastapi import APIRouter, HTTPException, status
from fastapi.responses import StreamingResponse
import structlog

from shared.models.common import APIResponse
from shared.models.conversation import ChatResponse
from ai_agent.memory import get_mock_provider, get_structured_memory, get_session_memory


logger = structlog.get_logger()
router = APIRouter()


# Demo scenarios
DEMO_SCENARIOS = {
    "morning_checkin": {
        "name": "בדיקת בוקר",
        "description": "AI initiates morning check-in, detects back pain, offers to book physiotherapy",
        "messages": [
            {
                "role": "assistant",
                "content": "בוקר טוב, שרה! איך ישנת הלילה? 😊",
                "delay_ms": 500,
            },
            {
                "role": "user",
                "content": "לא כל כך טוב, הגב כואב לי",
            },
            {
                "role": "assistant",
                "content": "אני מצטערת לשמוע שהגב כואב לך 💙 האם זה כאב חדש או משהו שכבר מטריד אותך?",
                "delay_ms": 1200,
            },
            {
                "role": "user",
                "content": "כבר כמה ימים, בעיקר בבוקר",
            },
            {
                "role": "assistant",
                "content": "הבנתי. כאב גב בבוקר יכול להיות קשור לתנוחת השינה או למזרן. אני רואה שיש לך 32 יחידות בארנק. רוצה שאמצא לך פיזיותרפיסט שיכול לבוא הביתה? יש מישהו מצוין באזור שלך עם דירוג 4.8 ⭐",
                "delay_ms": 2000,
                "actions": ["search_services", "check_wallet"],
            },
            {
                "role": "user",
                "content": "כן, בבקשה",
            },
            {
                "role": "assistant",
                "content": "מצוין! ✅ קבעתי לך תור לפיזיותרפיה עם יוסי כהן ביום שלישי בשעה 10:00 בבוקר. זה עולה 2 יחידות. שלחתי לך תזכורת לטלפון ועדכנתי את דני (הבן שלך) שיש לך תור. יש עוד משהו שאוכל לעזור?",
                "delay_ms": 1800,
                "actions": ["book_service", "notify_family"],
            },
        ],
    },
    "loneliness_intervention": {
        "name": "התערבות בדידות",
        "description": "AI detects loneliness pattern over 3 days, suggests community activity",
        "messages": [
            {
                "role": "assistant",
                "content": "שלום יעקב, שמתי לב שלא דיברנו כבר כמה ימים. מה נשמע? 💙",
                "delay_ms": 500,
            },
            {
                "role": "user",
                "content": "משעמם... אף אחד לא מתקשר",
            },
            {
                "role": "assistant",
                "content": "אני שומעת שאתה מרגיש לבד, ואני כאן בשבילך 💙 ספר לי, מה היית אוהב לעשות? יש לי רעיון שאולי ימצא חן בעיניך...",
                "delay_ms": 1500,
                "sentiment": -0.6,
            },
            {
                "role": "user",
                "content": "מה?",
            },
            {
                "role": "assistant",
                "content": "יש קבוצה של גברים בגילך שנפגשת פעמיים בשבוע במתנ\"ס ליד הבית שלך. הם משחקים שש-בש ולוקחים קפה ביחד. הרבה מהם סיפרו שזה הדבר הטוב ביותר בשבוע שלהם 🎲☕ רוצה שאירשם אותך לפגישה הבאה?",
                "delay_ms": 2200,
                "actions": ["search_activities", "check_wallet"],
            },
            {
                "role": "user",
                "content": "למה לא, בוא ננסה",
            },
            {
                "role": "assistant",
                "content": "נהדר! 🎉 רשמתי אותך לקבוצת \"קפה וחברים\" ביום חמישי בשעה 16:00. המתנ\"ס נמצא ברחוב הרצל 15, 5 דקות הליכה מהבית. העלות היא יחידה אחת מהארנק שלך (נשאר לך 31). אני אזכיר לך יום לפני, בסדר?",
                "delay_ms": 1800,
                "actions": ["register_activity", "schedule_reminder"],
            },
        ],
    },
    "emergency_detection": {
        "name": "זיהוי חירום",
        "description": "AI detects emergency keywords and triggers protocol",
        "messages": [
            {
                "role": "user",
                "content": "הלב שלי דופק מהר מאוד ואני לא מרגיש טוב",
            },
            {
                "role": "assistant",
                "content": "🚨 יעקב, אני מבינה שאתה לא מרגיש טוב. זה חשוב מאוד. האם יש לך כאב בחזה? קושי לנשום? סחרחורת?",
                "delay_ms": 800,
                "priority": "high",
            },
            {
                "role": "user",
                "content": "קצת קשה לי לנשום",
            },
            {
                "role": "assistant",
                "content": "⚠️ יעקב, בגלל הסימפטומים שתיארת, אני מפעילה פרוטוקול חירום:\n\n1. ✅ שלחתי התראה לדני (הבן שלך)\n2. ✅ מעבירה את המיקום שלך לשירותי חירום\n3. 📞 אנא הישאר על הקו - עוזר מ-מד\"א יתקשר אליך תוך 30 שניות\n\nנסה לשבת, לנשום לאט, ואל תזוז. אני כאן איתך. 💙",
                "delay_ms": 1200,
                "actions": ["alert_family", "contact_emergency", "log_incident"],
                "priority": "critical",
            },
        ],
    },
}


@router.get("/scenarios")
async def list_demo_scenarios():
    """
    List available demo scenarios for investor presentation.
    """
    scenarios = [
        {
            "id": key,
            "name": value["name"],
            "description": value["description"],
            "message_count": len(value["messages"]),
        }
        for key, value in DEMO_SCENARIOS.items()
    ]

    return APIResponse(
        success=True,
        data=scenarios,
    )


@router.get("/scenarios/{scenario_id}")
async def get_demo_scenario(scenario_id: str):
    """
    Get a specific demo scenario with all messages.
    """
    if scenario_id not in DEMO_SCENARIOS:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Scenario '{scenario_id}' not found",
        )

    scenario = DEMO_SCENARIOS[scenario_id]

    return APIResponse(
        success=True,
        data={
            "id": scenario_id,
            **scenario,
        },
    )


@router.post("/scenarios/{scenario_id}/run")
async def run_demo_scenario(scenario_id: str):
    """
    Run a demo scenario interactively.

    Returns the first assistant message. Subsequent messages
    can be retrieved by calling /next.
    """
    if scenario_id not in DEMO_SCENARIOS:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Scenario '{scenario_id}' not found",
        )

    scenario = DEMO_SCENARIOS[scenario_id]
    session_id = str(uuid4())

    # Store session state (in production, use Redis)
    # For demo, return first message
    first_message = scenario["messages"][0]

    return APIResponse(
        success=True,
        data={
            "session_id": session_id,
            "scenario_id": scenario_id,
            "message": first_message,
            "message_index": 0,
            "total_messages": len(scenario["messages"]),
        },
    )


@router.post("/quick-test")
async def quick_test_ai():
    """
    Quick test endpoint to verify AI agent is working.

    Sends a simple Hebrew greeting and returns the response.
    """
    from ai_agent.agents import get_orchestrator

    try:
        orchestrator = get_orchestrator()

        response = await orchestrator.process_message(
            user_id="demo-user",
            conversation_id="demo-conversation",
            message="שלום, מה שלומך?",
        )

        return APIResponse(
            success=True,
            data={
                "user_message": "שלום, מה שלומך?",
                "ai_response": response["content"],
                "processing_time_ms": response.get("processing_time_ms"),
            },
        )

    except Exception as e:
        logger.error("Quick test failed", error=str(e))
        return APIResponse(
            success=False,
            data={
                "error": str(e),
                "note": "AI agent may not be fully configured",
            },
        )


# ===========================================
# Demo Data Endpoints
# ===========================================

@router.get("/users")
async def list_demo_users():
    """
    List available demo users for testing.
    """
    mock_provider = get_mock_provider()
    memory = get_structured_memory()

    users = []
    for user_id in mock_provider.get_demo_user_ids():
        user = memory.get_user(user_id)
        if user:
            wallet = mock_provider.get_user_wallet(user_id)
            appointments = mock_provider.get_user_appointments(user_id)
            users.append({
                "user_id": user_id,
                "name": user.display_name,
                "first_name": user.first_name,
                "age": user.age,
                "city": user.city,
                "nursing_level": user.nursing_level,
                "meaning_tags": [t.value for t in user.meaning_tags],
                "wallet_balance": wallet.get("available_units") if wallet else 0,
                "appointments_today": len(appointments),
            })

    return APIResponse(
        success=True,
        data=users,
    )


@router.get("/users/{user_id}")
async def get_demo_user(user_id: str):
    """
    Get detailed info about a demo user.
    """
    memory = get_structured_memory()
    mock_provider = get_mock_provider()

    user = memory.get_user(user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User '{user_id}' not found",
        )

    wallet = mock_provider.get_user_wallet(user_id)
    appointments = mock_provider.get_user_appointments(user_id)
    alerts = mock_provider.get_alerts(user_id)

    return APIResponse(
        success=True,
        data={
            "user": {
                "user_id": user.user_id,
                "first_name": user.first_name,
                "preferred_name": user.preferred_name,
                "display_name": user.display_name,
                "age": user.age,
                "city": user.city,
                "nursing_level": user.nursing_level,
                "preferred_language": user.preferred_language,
                "speech_speed": user.speech_speed,
            },
            "profile": {
                "meaning_tags": [t.value for t in user.meaning_tags],
                "interests": user.interests,
                "topics_to_avoid": user.topics_to_avoid,
            },
            "health": {
                "medical_conditions": user.medical_conditions,
                "medications": user.medications,
                "baselines": [
                    {
                        "metric": b.metric_type,
                        "value": b.baseline_value,
                        "std": b.std_deviation,
                    }
                    for b in user.health_baselines
                ],
            },
            "family": [
                {
                    "name": fm.name,
                    "relation": fm.relation,
                    "phone": fm.phone,
                }
                for fm in user.family_members
            ],
            "wallet": wallet,
            "appointments_today": appointments,
            "pending_alerts": len([a for a in alerts if a["status"] == "pending"]),
            "memories_count": len(user.memories),
        },
    )


@router.get("/users/{user_id}/morning-briefing")
async def get_demo_morning_briefing(user_id: str):
    """
    Get a morning briefing for a demo user.
    """
    from ai_agent.agents import get_limor_agent
    from shared.models.limor_persona import LimorContext, LimorSettings

    memory = get_structured_memory()
    mock_provider = get_mock_provider()

    user = memory.get_user(user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User '{user_id}' not found",
        )

    # Build context
    wallet = mock_provider.get_user_wallet(user_id)
    appointments = mock_provider.get_user_appointments(user_id)

    context = LimorContext(
        user_id=user_id,
        user_name=user.first_name,
        preferred_name=user.preferred_name,
        meaning_tags=user.meaning_tags,
        interests=user.interests,
        has_wallet=wallet is not None,
        wallet_balance_units=wallet.get("available_units") if wallet else None,
        today_appointments=appointments,
        weather_summary="מעונן חלקית, 18°C",  # Mock weather
    )

    settings = LimorSettings()

    try:
        limor = get_limor_agent()
        briefing = await limor.generate_morning_briefing(context, settings)

        return APIResponse(
            success=True,
            data={
                "message": briefing.message_text,
                "content": briefing.content.model_dump() if briefing.content else None,
            },
        )

    except Exception as e:
        logger.error("Morning briefing failed", error=str(e), user_id=user_id)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to generate morning briefing",
        )


@router.post("/scenarios/{scenario_id}/stream")
async def stream_demo_scenario(scenario_id: str):
    """
    Stream a demo scenario with realistic delays.

    Returns Server-Sent Events (SSE) stream.
    """
    if scenario_id not in DEMO_SCENARIOS:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Scenario '{scenario_id}' not found",
        )

    scenario = DEMO_SCENARIOS[scenario_id]

    async def generate_events():
        for i, msg in enumerate(scenario["messages"]):
            # Wait for delay if specified
            delay_ms = msg.get("delay_ms", 1000)
            await asyncio.sleep(delay_ms / 1000)

            event_data = {
                "index": i,
                "role": msg["role"],
                "content": msg["content"],
                "actions": msg.get("actions", []),
                "priority": msg.get("priority"),
                "is_last": i == len(scenario["messages"]) - 1,
            }

            yield f"data: {json.dumps(event_data, ensure_ascii=False)}\n\n"

        # Send completion event
        yield f"data: {json.dumps({'type': 'done'})}\n\n"

    return StreamingResponse(
        generate_events(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
        },
    )


@router.get("/stats")
async def get_demo_stats():
    """
    Get demo system statistics.
    """
    session_memory = get_session_memory()
    mock_provider = get_mock_provider()

    return APIResponse(
        success=True,
        data={
            "demo_users": len(mock_provider.get_demo_user_ids()),
            "scenarios": len(DEMO_SCENARIOS),
            "active_sessions": session_memory.get_stats(),
            "alerts": {
                "total": len(mock_provider.get_alerts()),
                "pending": len([a for a in mock_provider.get_alerts() if a["status"] == "pending"]),
            },
        },
    )
