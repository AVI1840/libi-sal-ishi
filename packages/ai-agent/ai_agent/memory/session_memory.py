"""
Session Memory - Short-term conversation context.

For MVP: Uses in-memory storage.
Production: Would use Redis for horizontal scalability.
"""

from datetime import datetime, timedelta
from typing import Any
from uuid import uuid4

from pydantic import BaseModel, Field
import structlog


logger = structlog.get_logger()


class ConversationMessage(BaseModel):
    """A single message in a conversation."""
    id: str = Field(default_factory=lambda: str(uuid4()))
    role: str  # user, assistant, system
    content: str
    timestamp: datetime = Field(default_factory=datetime.now)
    metadata: dict = Field(default_factory=dict)


class ConversationSession(BaseModel):
    """A conversation session with message history."""
    session_id: str = Field(default_factory=lambda: str(uuid4()))
    user_id: str
    started_at: datetime = Field(default_factory=datetime.now)
    last_activity: datetime = Field(default_factory=datetime.now)
    messages: list[ConversationMessage] = Field(default_factory=list)
    context: dict = Field(default_factory=dict)
    emotional_timeline: list[dict] = Field(default_factory=list)

    def add_message(self, role: str, content: str, metadata: dict | None = None) -> ConversationMessage:
        """Add a message to the conversation."""
        msg = ConversationMessage(
            role=role,
            content=content,
            metadata=metadata or {},
        )
        self.messages.append(msg)
        self.last_activity = datetime.now()
        return msg

    def get_recent_messages(self, count: int = 10) -> list[dict]:
        """Get recent messages in LLM format."""
        return [
            {"role": m.role, "content": m.content}
            for m in self.messages[-count:]
        ]

    def add_emotional_state(self, state: dict) -> None:
        """Track emotional state over time."""
        self.emotional_timeline.append({
            "timestamp": datetime.now().isoformat(),
            **state
        })

    @property
    def message_count(self) -> int:
        return len(self.messages)

    @property
    def duration_minutes(self) -> int:
        return int((self.last_activity - self.started_at).total_seconds() / 60)


class SessionMemory:
    """
    In-memory session storage for conversations.

    For MVP: Simple dict-based storage.
    Production: Would connect to Redis.
    """

    def __init__(self, session_timeout_minutes: int = 60):
        self._sessions: dict[str, ConversationSession] = {}
        self._user_sessions: dict[str, list[str]] = {}  # user_id -> session_ids
        self.session_timeout = timedelta(minutes=session_timeout_minutes)

    def create_session(self, user_id: str, context: dict | None = None) -> ConversationSession:
        """Create a new conversation session."""
        session = ConversationSession(
            user_id=user_id,
            context=context or {},
        )
        self._sessions[session.session_id] = session

        if user_id not in self._user_sessions:
            self._user_sessions[user_id] = []
        self._user_sessions[user_id].append(session.session_id)

        logger.info(
            "Session created",
            session_id=session.session_id,
            user_id=user_id,
        )
        return session

    def get_session(self, session_id: str) -> ConversationSession | None:
        """Get a session by ID."""
        session = self._sessions.get(session_id)
        if session and self._is_expired(session):
            self._cleanup_session(session_id)
            return None
        return session

    def get_or_create_session(
        self,
        session_id: str | None,
        user_id: str,
        context: dict | None = None,
    ) -> ConversationSession:
        """Get existing session or create new one."""
        if session_id:
            session = self.get_session(session_id)
            if session:
                return session

        return self.create_session(user_id, context)

    def get_user_sessions(self, user_id: str) -> list[ConversationSession]:
        """Get all active sessions for a user."""
        session_ids = self._user_sessions.get(user_id, [])
        sessions = []
        for sid in session_ids:
            session = self.get_session(sid)
            if session:
                sessions.append(session)
        return sessions

    def get_active_session(self, user_id: str) -> ConversationSession | None:
        """Get the most recent active session for a user."""
        sessions = self.get_user_sessions(user_id)
        if not sessions:
            return None
        return max(sessions, key=lambda s: s.last_activity)

    def end_session(self, session_id: str) -> ConversationSession | None:
        """End a session and return its final state."""
        session = self._sessions.get(session_id)
        if session:
            self._cleanup_session(session_id)
        return session

    def add_message(
        self,
        session_id: str,
        role: str,
        content: str,
        metadata: dict | None = None,
    ) -> ConversationMessage | None:
        """Add a message to a session."""
        session = self.get_session(session_id)
        if not session:
            return None
        return session.add_message(role, content, metadata)

    def _is_expired(self, session: ConversationSession) -> bool:
        """Check if session has expired."""
        return datetime.now() - session.last_activity > self.session_timeout

    def _cleanup_session(self, session_id: str) -> None:
        """Remove a session from storage."""
        session = self._sessions.pop(session_id, None)
        if session:
            user_sessions = self._user_sessions.get(session.user_id, [])
            if session_id in user_sessions:
                user_sessions.remove(session_id)

    def cleanup_expired(self) -> int:
        """Remove all expired sessions. Returns count of removed sessions."""
        expired = [
            sid for sid, session in self._sessions.items()
            if self._is_expired(session)
        ]
        for sid in expired:
            self._cleanup_session(sid)
        return len(expired)

    def get_stats(self) -> dict:
        """Get memory usage statistics."""
        return {
            "active_sessions": len(self._sessions),
            "active_users": len(self._user_sessions),
            "total_messages": sum(s.message_count for s in self._sessions.values()),
        }


# Global session memory instance
_session_memory: SessionMemory | None = None


def get_session_memory() -> SessionMemory:
    """Get the global session memory instance."""
    global _session_memory
    if _session_memory is None:
        _session_memory = SessionMemory()
    return _session_memory
