"""
Webhook API routes for external integrations.
"""

from fastapi import APIRouter, HTTPException, status, Request, Header
from typing import Annotated
import hmac
import hashlib
import structlog

from shared.models.common import APIResponse
from shared.config import get_settings


logger = structlog.get_logger()
router = APIRouter()


def verify_webhook_signature(
    payload: bytes,
    signature: str,
    secret: str,
) -> bool:
    """Verify webhook signature using HMAC-SHA256."""
    expected = hmac.new(
        secret.encode(),
        payload,
        hashlib.sha256,
    ).hexdigest()

    return hmac.compare_digest(expected, signature)


@router.post("/marketplace/booking-created")
async def handle_booking_created(
    request: Request,
    x_webhook_signature: Annotated[str | None, Header()] = None,
):
    """
    Handle booking created event from marketplace.

    Triggers:
    - Notification to user via AI agent
    - Calendar update
    - Reminder scheduling
    """
    settings = get_settings()

    # Verify webhook signature in production
    if settings.is_production:
        if not x_webhook_signature:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Missing webhook signature",
            )

        body = await request.body()
        # TODO: Verify signature with webhook secret

    data = await request.json()

    logger.info(
        "Received booking created webhook",
        booking_id=data.get("booking_id"),
        user_id=data.get("user_id"),
    )

    # TODO: Process the webhook
    # - Notify user
    # - Schedule reminders
    # - Update conversation context

    return APIResponse(
        success=True,
        data={"message": "Webhook processed"},
    )


@router.post("/marketplace/booking-completed")
async def handle_booking_completed(
    request: Request,
    x_webhook_signature: Annotated[str | None, Header()] = None,
):
    """
    Handle booking completed event from marketplace.

    Triggers:
    - Follow-up conversation with user
    - Satisfaction survey
    - Health metric logging (if relevant)
    """
    data = await request.json()

    logger.info(
        "Received booking completed webhook",
        booking_id=data.get("booking_id"),
    )

    # TODO: Process the webhook
    # - Initiate follow-up
    # - Log health impact

    return APIResponse(
        success=True,
        data={"message": "Webhook processed"},
    )


@router.post("/marketplace/booking-cancelled")
async def handle_booking_cancelled(
    request: Request,
    x_webhook_signature: Annotated[str | None, Header()] = None,
):
    """
    Handle booking cancelled event from marketplace.

    Triggers:
    - Notification to user
    - Offer to reschedule
    """
    data = await request.json()

    logger.info(
        "Received booking cancelled webhook",
        booking_id=data.get("booking_id"),
        reason=data.get("cancellation_reason"),
    )

    # TODO: Process the webhook

    return APIResponse(
        success=True,
        data={"message": "Webhook processed"},
    )


@router.post("/wearable/health-data")
async def handle_wearable_data(
    request: Request,
    x_webhook_signature: Annotated[str | None, Header()] = None,
):
    """
    Handle health data from wearable devices.

    Supports:
    - Fitbit
    - Withings
    - Apple Health (via bridge)
    """
    data = await request.json()

    logger.info(
        "Received wearable health data",
        source=data.get("source"),
        user_id=data.get("user_id"),
        metrics=list(data.get("metrics", {}).keys()),
    )

    # TODO: Process health data
    # - Store readings
    # - Check for anomalies
    # - Trigger alerts if needed

    return APIResponse(
        success=True,
        data={"message": "Health data received"},
    )


@router.post("/emergency/alert")
async def handle_emergency_alert(
    request: Request,
    x_webhook_signature: Annotated[str | None, Header()] = None,
):
    """
    Handle emergency alerts from external systems.

    This is a high-priority endpoint that triggers immediate response.
    """
    data = await request.json()

    logger.critical(
        "Received emergency alert",
        user_id=data.get("user_id"),
        alert_type=data.get("alert_type"),
    )

    # TODO: Immediate emergency response
    # - Alert family members
    # - Contact emergency services if needed
    # - Log incident

    return APIResponse(
        success=True,
        data={"message": "Emergency alert processed"},
    )


# ===========================================
# WhatsApp Business API Integration
# ===========================================

@router.get("/whatsapp/verify")
async def verify_whatsapp_webhook(
    hub_mode: str | None = None,
    hub_verify_token: str | None = None,
    hub_challenge: str | None = None,
):
    """
    WhatsApp webhook verification (GET).

    Meta sends a GET request to verify the webhook URL.
    We must return the hub.challenge value if the verify_token matches.
    """
    settings = get_settings()
    expected_token = getattr(settings, 'whatsapp_verify_token', 'libi-whatsapp-verify')

    if hub_mode == "subscribe" and hub_verify_token == expected_token:
        logger.info("WhatsApp webhook verified")
        return int(hub_challenge) if hub_challenge else ""

    raise HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail="Verification failed",
    )


@router.post("/whatsapp/incoming")
async def handle_whatsapp_message(request: Request):
    """
    Handle incoming WhatsApp messages.

    Flow:
    1. Parse incoming message from WhatsApp Business API
    2. Identify user by phone number
    3. Route to Limor AI agent (same as web chat)
    4. Send response back via WhatsApp API

    Message types supported:
    - text: Regular text messages (routed to Limor)
    - interactive: Button/list replies
    - location: For proximity-based recommendations
    """
    data = await request.json()

    logger.info(
        "Received WhatsApp message",
        data_keys=list(data.keys()),
    )

    # Parse WhatsApp Cloud API format
    entry = data.get("entry", [{}])[0]
    changes = entry.get("changes", [{}])[0]
    value = changes.get("value", {})
    messages = value.get("messages", [])

    if not messages:
        # Status update (delivered, read, etc.) — acknowledge
        return {"status": "ok"}

    message = messages[0]
    from_phone = message.get("from", "")
    msg_type = message.get("type", "text")
    msg_id = message.get("id", "")

    # Extract text content
    text_content = ""
    if msg_type == "text":
        text_content = message.get("text", {}).get("body", "")
    elif msg_type == "interactive":
        interactive = message.get("interactive", {})
        if interactive.get("type") == "button_reply":
            text_content = interactive.get("button_reply", {}).get("title", "")
        elif interactive.get("type") == "list_reply":
            text_content = interactive.get("list_reply", {}).get("title", "")

    if not text_content:
        logger.info("Non-text WhatsApp message received", msg_type=msg_type)
        return {"status": "ok"}

    logger.info(
        "Processing WhatsApp message",
        from_phone=from_phone[-4:],  # Log only last 4 digits
        msg_type=msg_type,
        text_length=len(text_content),
    )

    # TODO: In production:
    # 1. Look up user by phone number
    # 2. Create/resume conversation with channel=WHATSAPP
    # 3. Route through Limor AI agent (same orchestrator as web)
    # 4. Send response via WhatsApp Cloud API:
    #    POST https://graph.facebook.com/v18.0/{phone_number_id}/messages
    #    { messaging_product: "whatsapp", to: from_phone, type: "text", text: { body: response } }

    # For now, return acknowledgment
    return APIResponse(
        success=True,
        data={
            "message_id": msg_id,
            "from": from_phone,
            "channel": "whatsapp",
            "status": "received",
            "note": "WhatsApp integration ready — connect WhatsApp Business API to activate",
        },
    )
