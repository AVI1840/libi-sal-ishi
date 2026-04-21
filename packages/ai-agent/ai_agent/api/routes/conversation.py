"""
Conversation API routes.
"""

from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse
import structlog

from shared.models.conversation import (
    ChatRequest,
    ChatResponse,
    ConversationResponse,
)
from shared.models.common import APIResponse
from shared.constants import UserRole
from ai_agent.api.dependencies import (
    get_current_user,
    get_current_user_id,
    require_role,
)
from ai_agent.agents import get_orchestrator


logger = structlog.get_logger()
router = APIRouter()


@router.post("/", response_model=APIResponse[ConversationResponse])
async def create_conversation(
    current_user: dict = Depends(get_current_user),
):
    """
    Create a new conversation session.

    Returns a conversation ID that should be used for subsequent messages.
    """
    user_id = UUID(current_user["sub"])

    # TODO: Create conversation in database
    # TODO: Initialize session memory in Redis

    logger.info("Created new conversation", user_id=str(user_id))

    return APIResponse(
        success=True,
        data=ConversationResponse(
            conversation_id=str(UUID("00000000-0000-0000-0000-000000000000")),  # Placeholder
            user_id=str(user_id),
            channel="web",
            started_at="2025-01-15T10:00:00Z",
            messages=[],
        ),
    )


@router.post("/{conversation_id}/messages", response_model=APIResponse[ChatResponse])
async def send_message(
    conversation_id: UUID,
    request: ChatRequest,
    current_user: dict = Depends(get_current_user),
):
    """
    Send a message in a conversation and get AI response.

    The AI will process the message through the appropriate agents
    and return a response.
    """
    user_id = UUID(current_user["sub"])

    logger.info(
        "Processing message",
        conversation_id=str(conversation_id),
        user_id=str(user_id),
        message_length=len(request.message),
    )

    try:
        # Get the orchestrator agent
        orchestrator = get_orchestrator()

        # Process the message
        response = await orchestrator.process_message(
            user_id=str(user_id),
            conversation_id=str(conversation_id),
            message=request.message,
            context=request.context,
        )

        return APIResponse(
            success=True,
            data=ChatResponse(
                conversation_id=str(conversation_id),
                message=response["content"],
                intent=response.get("intent"),
                sentiment=response.get("sentiment"),
                actions=response.get("actions", []),
                metadata=response.get("metadata", {}),
            ),
        )

    except Exception as e:
        logger.error(
            "Error processing message",
            error=str(e),
            conversation_id=str(conversation_id),
        )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to process message",
        )


@router.post("/{conversation_id}/messages/stream")
async def send_message_stream(
    conversation_id: UUID,
    request: ChatRequest,
    current_user: dict = Depends(get_current_user),
):
    """
    Send a message and stream the AI response.

    Returns a Server-Sent Events stream with incremental response chunks.
    """
    user_id = UUID(current_user["sub"])

    async def generate():
        orchestrator = get_orchestrator()

        async for chunk in orchestrator.process_message_stream(
            user_id=str(user_id),
            conversation_id=str(conversation_id),
            message=request.message,
        ):
            yield f"data: {chunk}\n\n"

        yield "data: [DONE]\n\n"

    return StreamingResponse(
        generate(),
        media_type="text/event-stream",
    )


@router.get("/{conversation_id}", response_model=APIResponse[ConversationResponse])
async def get_conversation(
    conversation_id: UUID,
    current_user: dict = Depends(get_current_user),
):
    """
    Get conversation details and message history.
    """
    user_id = UUID(current_user["sub"])

    # TODO: Fetch from database
    # TODO: Verify user has access to this conversation

    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="Not implemented yet",
    )


@router.get("/", response_model=APIResponse[list[ConversationResponse]])
async def list_conversations(
    current_user: dict = Depends(get_current_user),
    limit: int = 20,
    offset: int = 0,
):
    """
    List user's conversations.
    """
    user_id = UUID(current_user["sub"])

    # TODO: Fetch from database with pagination

    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="Not implemented yet",
    )


@router.post("/{conversation_id}/end")
async def end_conversation(
    conversation_id: UUID,
    current_user: dict = Depends(get_current_user),
):
    """
    End a conversation session.

    Triggers summary generation and cleanup.
    """
    user_id = UUID(current_user["sub"])

    # TODO: Generate conversation summary
    # TODO: Update database with end time
    # TODO: Cleanup session memory

    logger.info(
        "Ended conversation",
        conversation_id=str(conversation_id),
        user_id=str(user_id),
    )

    return APIResponse(
        success=True,
        data={"message": "Conversation ended"},
    )
