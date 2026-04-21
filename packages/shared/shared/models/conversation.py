"""
Conversation-related Pydantic models.
"""

from datetime import datetime
from typing import Any

from pydantic import BaseModel, Field

from shared.constants import ConversationChannel, MessageRole


class Message(BaseModel):
    """Single message in a conversation."""
    message_id: str | None = None
    conversation_id: str | None = None
    role: MessageRole
    content: str
    sentiment_score: float | None = Field(default=None, ge=-1, le=1)
    intent: str | None = None
    entities: dict[str, Any] = Field(default_factory=dict)
    created_at: datetime | None = None

    model_config = {"from_attributes": True}


class MessageCreate(BaseModel):
    """Model for creating a message."""
    role: MessageRole
    content: str
    intent: str | None = None
    entities: dict[str, Any] = Field(default_factory=dict)


class ConversationBase(BaseModel):
    """Base conversation model."""
    user_id: str
    channel: ConversationChannel = ConversationChannel.WEB


class ConversationCreate(ConversationBase):
    """Model for creating a conversation."""
    metadata: dict[str, Any] = Field(default_factory=dict)


class ConversationResponse(ConversationBase):
    """Model for conversation response."""
    conversation_id: str
    started_at: datetime
    ended_at: datetime | None = None
    summary: str | None = None
    sentiment_avg: float | None = None
    metadata: dict[str, Any] = Field(default_factory=dict)

    model_config = {"from_attributes": True}


class ConversationWithMessages(ConversationResponse):
    """Conversation with all messages."""
    messages: list[Message] = Field(default_factory=list)


class ConversationSummary(BaseModel):
    """Summary of a conversation for reports."""
    conversation_id: str
    user_id: str
    started_at: datetime
    ended_at: datetime | None = None
    duration_minutes: int | None = None
    message_count: int
    user_message_count: int
    assistant_message_count: int
    sentiment_avg: float | None = None
    topics: list[str] = Field(default_factory=list)
    actions_taken: list[str] = Field(default_factory=list)
    alerts_triggered: int = 0


class ConversationContext(BaseModel):
    """Context for continuing a conversation."""
    conversation_id: str
    user_id: str
    recent_messages: list[Message]
    user_preferences: dict[str, Any] = Field(default_factory=dict)
    relevant_memories: list[str] = Field(default_factory=list)
    pending_actions: list[dict[str, Any]] = Field(default_factory=list)
    health_context: dict[str, Any] = Field(default_factory=dict)


class SemanticMemory(BaseModel):
    """Long-term semantic memory entry."""
    memory_id: str | None = None
    user_id: str
    content: str
    memory_type: str  # preference, fact, event, relationship
    embedding_id: str | None = None
    importance_score: float = Field(default=0.5, ge=0, le=1)
    last_accessed_at: datetime | None = None
    created_at: datetime | None = None

    model_config = {"from_attributes": True}


class SemanticMemoryCreate(BaseModel):
    """Model for creating a semantic memory."""
    user_id: str
    content: str
    memory_type: str
    importance_score: float = 0.5


class ChatRequest(BaseModel):
    """Request for chat endpoint."""
    user_id: str
    message: str
    conversation_id: str | None = None
    channel: ConversationChannel = ConversationChannel.WEB
    include_voice: bool = False
    metadata: dict[str, Any] = Field(default_factory=dict)


class ChatResponse(BaseModel):
    """Response from chat endpoint."""
    conversation_id: str
    message: Message
    voice_url: str | None = None
    actions: list[dict[str, Any]] = Field(default_factory=list)
    suggestions: list[str] = Field(default_factory=list)
    alerts: list[dict[str, Any]] = Field(default_factory=list)


class VoiceSynthesisRequest(BaseModel):
    """Request for voice synthesis."""
    text: str
    language: str = "he-IL"
    voice: str | None = None
    speaking_rate: float = Field(default=0.85, ge=0.5, le=1.5)


class VoiceSynthesisResponse(BaseModel):
    """Response from voice synthesis."""
    audio_url: str | None = None
    audio_base64: str | None = None
    duration_seconds: float | None = None
    format: str = "mp3"
