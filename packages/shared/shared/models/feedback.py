"""
Service Feedback Models — Post-service satisfaction data.

Feeds into the recommendation engine's learning loop:
- Rating affects service ranking
- Comments analyzed for sentiment
- would_recommend affects social proof score
"""

from datetime import datetime

from pydantic import BaseModel, Field


class ServiceFeedback(BaseModel):
    """Feedback submitted after a service is completed."""
    feedback_id: str
    booking_id: str
    user_id: str
    service_id: str
    vendor_id: str | None = None

    # Core feedback
    rating: int = Field(..., ge=1, le=5, description="1-5 star rating")
    comment: str | None = Field(default=None, max_length=500)
    would_recommend: bool = Field(default=True)

    # Metadata
    submitted_at: datetime = Field(default_factory=datetime.now)
    channel: str = "web"  # web, whatsapp, voice

    # Sentiment (computed)
    sentiment_score: float | None = Field(
        default=None,
        description="Computed sentiment from comment (-1 to 1)"
    )


class ServiceFeedbackSummary(BaseModel):
    """Aggregated feedback for a service."""
    service_id: str
    average_rating: float = 0.0
    total_reviews: int = 0
    would_recommend_percent: float = 0.0
    rating_distribution: dict[int, int] = Field(
        default_factory=lambda: {1: 0, 2: 0, 3: 0, 4: 0, 5: 0}
    )
    recent_comments: list[dict] = Field(default_factory=list)
