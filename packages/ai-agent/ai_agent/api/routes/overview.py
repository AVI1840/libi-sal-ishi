"""
API Documentation and Overview Endpoints.

Provides a summary of all available endpoints for demo purposes.
"""

from fastapi import APIRouter
import structlog

from shared.models.common import APIResponse


logger = structlog.get_logger()
router = APIRouter()


@router.get("/")
async def get_api_overview():
    """
    Get an overview of all available API endpoints.

    Perfect for demo purposes and API exploration.
    """
    return {
        "service": "Savta.AI - AI Agent",
        "version": "0.1.0",
        "description": "סוכן AI אישי לטיפול בקשישים",
        "endpoints": {
            "limor": {
                "base": "/api/v1/limor",
                "description": "לימור - סוכנת ה-AI האישית",
                "endpoints": [
                    {
                        "method": "POST",
                        "path": "/chat",
                        "description": "שיחה עם לימור",
                    },
                    {
                        "method": "POST",
                        "path": "/chat/stream",
                        "description": "שיחה עם streaming",
                    },
                    {
                        "method": "GET",
                        "path": "/morning-briefing",
                        "description": "תדריך בוקר אישי",
                    },
                    {
                        "method": "GET",
                        "path": "/conversations",
                        "description": "רשימת שיחות פעילות",
                    },
                    {
                        "method": "GET",
                        "path": "/conversations/{id}",
                        "description": "היסטוריית שיחה",
                    },
                    {
                        "method": "GET",
                        "path": "/intake/questions",
                        "description": "שאלות לקליטה",
                    },
                    {
                        "method": "POST",
                        "path": "/intake/submit",
                        "description": "שליחת מילוי קליטה",
                    },
                ],
            },
            "health": {
                "base": "/api/v1/health",
                "description": "ניטור בריאות",
                "endpoints": [
                    {
                        "method": "GET",
                        "path": "/readings",
                        "description": "קריאות בריאות",
                    },
                    {
                        "method": "POST",
                        "path": "/readings",
                        "description": "הוספת קריאה",
                    },
                    {
                        "method": "GET",
                        "path": "/summary",
                        "description": "סיכום בריאות",
                    },
                    {
                        "method": "GET",
                        "path": "/alerts",
                        "description": "התראות בריאות",
                    },
                    {
                        "method": "GET",
                        "path": "/baselines",
                        "description": "קווי בסיס לזיהוי אנומליות",
                    },
                ],
            },
            "demo": {
                "base": "/api/v1/demo",
                "description": "תרחישי הדגמה",
                "endpoints": [
                    {
                        "method": "GET",
                        "path": "/scenarios",
                        "description": "רשימת תרחישים",
                    },
                    {
                        "method": "GET",
                        "path": "/scenarios/{id}",
                        "description": "פרטי תרחיש",
                    },
                    {
                        "method": "POST",
                        "path": "/scenarios/{id}/stream",
                        "description": "הפעלת תרחיש עם streaming",
                    },
                    {
                        "method": "GET",
                        "path": "/users",
                        "description": "משתמשי דמו",
                    },
                    {
                        "method": "GET",
                        "path": "/users/{id}",
                        "description": "פרטי משתמש דמו",
                    },
                    {
                        "method": "GET",
                        "path": "/users/{id}/morning-briefing",
                        "description": "תדריך בוקר למשתמש דמו",
                    },
                    {
                        "method": "POST",
                        "path": "/quick-test",
                        "description": "בדיקה מהירה של ה-AI",
                    },
                ],
            },
            "websocket": {
                "base": "/api/v1/ws",
                "description": "התראות בזמן אמת",
                "endpoints": [
                    {
                        "type": "WebSocket",
                        "path": "/user/{user_id}",
                        "description": "התראות למשתמש",
                    },
                    {
                        "type": "WebSocket",
                        "path": "/case-manager",
                        "description": "התראות למנהלי מקרה",
                    },
                    {
                        "method": "GET",
                        "path": "/stats",
                        "description": "סטטיסטיקות חיבורים",
                    },
                    {
                        "method": "POST",
                        "path": "/test-alert",
                        "description": "שליחת התראת בדיקה",
                    },
                ],
            },
        },
        "demo_scenarios": [
            {
                "id": "morning_checkin",
                "name": "בדיקת בוקר",
                "description": "AI מתחיל שיחת בוקר, מזהה כאבי גב, מציע לקבוע פיזיותרפיה",
            },
            {
                "id": "loneliness_intervention",
                "name": "התערבות בדידות",
                "description": "AI מזהה דפוס בדידות, מציע פעילות חברתית",
            },
            {
                "id": "emergency_detection",
                "name": "זיהוי חירום",
                "description": "AI מזהה מילות חירום ומפעיל פרוטוקול",
            },
        ],
        "demo_users": [
            {"id": "user-sarah", "name": "שרה", "nursing_level": 3},
            {"id": "user-yaakov", "name": "יעקב", "nursing_level": 4},
            {"id": "user-miriam", "name": "מרים", "nursing_level": 2},
        ],
    }


@router.get("/features")
async def get_features():
    """
    Get a summary of MVP features.
    """
    return {
        "implemented": [
            {
                "name": "לימור - סוכנת AI אישית",
                "features": [
                    "שלושה סוגי פרסונות",
                    "תדריך בוקר מותאם אישית",
                    "זיהוי רגשות ובדידות",
                    "זיהוי חירום אוטומטי",
                    "היסטוריית שיחות",
                ],
            },
            {
                "name": "ניטור בריאות",
                "features": [
                    "קריאות ממכשירים לבישים (mock)",
                    "קווי בסיס אישיים",
                    "זיהוי אנומליות",
                    "סיכום בריאות שבועי",
                ],
            },
            {
                "name": "מערכת התראות",
                "features": [
                    "WebSocket לזמן אמת",
                    "התראות למנהלי מקרה",
                    "סיווג חומרה",
                ],
            },
            {
                "name": "תרחישי הדגמה",
                "features": [
                    "שלושה תרחישים מלאים",
                    "Streaming responses",
                    "משתמשי דמו מציאותיים",
                ],
            },
        ],
        "mvp_ready": [
            "שיחה בעברית עם AI",
            "זיהוי חירום",
            "תדריך בוקר",
            "ניטור בריאות בסיסי",
            "התראות בזמן אמת",
        ],
        "planned_for_next_phase": [
            "אינטגרציה עם WhatsApp",
            "קול (TTS/STT)",
            "אינטגרציה עם מכשירים לבישים אמיתיים",
            "חיבור לקופות חולים",
            "תשלומים אמיתיים",
        ],
    }
