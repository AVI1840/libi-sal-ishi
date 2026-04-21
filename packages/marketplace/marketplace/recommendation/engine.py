"""
Recommendation Engine for Lev Optimal Aging OS.

Algorithm B: The Recommendation Engine (Ranking)
Goal: Surface the most relevant services for this specific user.

Formula: Score = (PreventionVal * 0.4) + (MeaningMatch * 0.3) + (Proximity * 0.2) + (SocialProof * 0.1)

Features:
- Safety Filter (Hard Gate): Remove services where user doesn't meet ICF requirements
- Scoring Loop with configurable weights
- Persona Adjustment (EY Logic)
- Meaning tag matching with 1.5x multiplier
"""

from dataclasses import dataclass, field
from math import radians, cos, sin, asin, sqrt
from typing import TYPE_CHECKING

import structlog

from shared.constants import (
    ContentWorld,
    PersonaType,
    MeaningTag,
    ServiceTag,
    RECOMMENDATION_WEIGHTS,
    RECOMMENDATION_WEIGHTS_MEANING_MULTIPLIER,
)

if TYPE_CHECKING:
    from shared.models.lev_profile import LevProfile, ICFProfile
    from shared.models.service import ServiceResponse


logger = structlog.get_logger()


@dataclass
class ServiceRecommendation:
    """A recommended service with scoring details."""
    service: "ServiceResponse"

    # Total score (0-100)
    total_score: float

    # Score breakdown
    prevention_score: float = 0.0
    meaning_score: float = 0.0
    proximity_score: float = 0.0
    social_proof_score: float = 0.0

    # Persona adjustment applied
    persona_boost: float = 0.0
    persona_boost_reason: str | None = None

    # Match details
    matched_meaning_tags: list[str] = field(default_factory=list)
    distance_km: float | None = None
    community_count: int = 0

    # Safety check
    passes_safety_filter: bool = True
    safety_filter_reason: str | None = None

    # Subsidy info (from SubsidyEngine)
    subsidy_percentage: float = 0.0
    client_pays: float = 0.0

    # Display
    recommendation_reason_he: str = ""

    def to_dict(self) -> dict:
        """Convert to dictionary for API response."""
        return {
            "service_id": self.service.service_id,
            "service": self.service.model_dump() if hasattr(self.service, 'model_dump') else {},
            "total_score": round(self.total_score, 1),
            "score_breakdown": {
                "prevention": round(self.prevention_score, 1),
                "meaning": round(self.meaning_score, 1),
                "proximity": round(self.proximity_score, 1),
                "social_proof": round(self.social_proof_score, 1),
                "persona_boost": round(self.persona_boost, 1),
            },
            "matched_meaning_tags": self.matched_meaning_tags,
            "distance_km": round(self.distance_km, 1) if self.distance_km else None,
            "community_count": self.community_count,
            "subsidy_percentage": round(self.subsidy_percentage * 100, 1),
            "client_pays": round(self.client_pays, 2),
            "recommendation_reason_he": self.recommendation_reason_he,
        }


class RecommendationEngine:
    """
    Personalized service recommendation engine.

    Ranks services based on:
    1. Prevention value (content world alignment)
    2. Meaning match (user's meaning tags)
    3. Proximity (distance from user)
    4. Social proof (community purchases)

    Plus persona-based boosts.
    """

    def __init__(self, weights: dict | None = None):
        """Initialize with optional custom weights."""
        self.weights = weights or RECOMMENDATION_WEIGHTS

    def get_recommendations(
        self,
        user_profile: "LevProfile",
        services: list["ServiceResponse"],
        limit: int = 10,
        include_filtered: bool = False,
    ) -> list[ServiceRecommendation]:
        """
        Get personalized service recommendations for a user.

        Args:
            user_profile: User's Lev profile
            services: List of available services
            limit: Maximum number of recommendations to return
            include_filtered: Include services that failed safety filter (for debugging)

        Returns:
            List of ServiceRecommendation sorted by score
        """
        recommendations: list[ServiceRecommendation] = []

        for service in services:
            rec = self._score_service(user_profile, service)

            # Include if passes safety filter or if debugging
            if rec.passes_safety_filter or include_filtered:
                recommendations.append(rec)

        # Sort by total score (descending)
        recommendations.sort(key=lambda r: r.total_score, reverse=True)

        # Apply limit
        if limit > 0:
            recommendations = recommendations[:limit]

        logger.info(
            "Generated recommendations",
            user_id=user_profile.user_id,
            total_services=len(services),
            recommendations_count=len(recommendations),
        )

        return recommendations

    def _score_service(
        self,
        user_profile: "LevProfile",
        service: "ServiceResponse",
    ) -> ServiceRecommendation:
        """Score a single service for a user."""

        # Step 1: Safety Filter (Hard Gate)
        passes_safety, safety_reason = self._check_safety_filter(
            user_profile.icf_profile,
            service,
        )

        if not passes_safety:
            return ServiceRecommendation(
                service=service,
                total_score=0,
                passes_safety_filter=False,
                safety_filter_reason=safety_reason,
            )

        # Step 2: Calculate component scores

        # Prevention Value (40%)
        prevention_score = self._calculate_prevention_score(service)

        # Meaning Match (30%)
        meaning_score, matched_tags = self._calculate_meaning_score(
            user_profile.intake_data.meaning_tags,
            service,
        )

        # Proximity (20%)
        proximity_score, distance_km = self._calculate_proximity_score(
            user_profile.lat,
            user_profile.lng,
            service,
        )

        # Social Proof (10%)
        social_score = self._calculate_social_proof_score(
            service,
            user_profile.city,
        )

        # Step 3: Apply weights
        weighted_score = (
            prevention_score * self.weights["prevention_value"] +
            meaning_score * self.weights["meaning_match"] +
            proximity_score * self.weights["proximity"] +
            social_score * self.weights["social_proof"]
        )

        # Step 4: Apply persona boost
        persona_boost, boost_reason = self._calculate_persona_boost(
            user_profile,
            service,
        )

        total_score = weighted_score * (1 + persona_boost)

        # Cap at 100
        total_score = min(total_score, 100)

        # Generate recommendation reason
        reason_he = self._generate_reason(
            prevention_score,
            matched_tags,
            distance_km,
            service,
        )

        return ServiceRecommendation(
            service=service,
            total_score=total_score,
            prevention_score=prevention_score * self.weights["prevention_value"],
            meaning_score=meaning_score * self.weights["meaning_match"],
            proximity_score=proximity_score * self.weights["proximity"],
            social_proof_score=social_score * self.weights["social_proof"],
            persona_boost=persona_boost,
            persona_boost_reason=boost_reason,
            matched_meaning_tags=[t.value for t in matched_tags],
            distance_km=distance_km,
            community_count=service.community_purchases_count,
            passes_safety_filter=True,
            recommendation_reason_he=reason_he,
        )

    def _check_safety_filter(
        self,
        user_icf: "ICFProfile",
        service: "ServiceResponse",
    ) -> tuple[bool, str | None]:
        """
        Check if user meets ICF requirements for service.

        This is a HARD GATE - services that don't pass are not recommended.
        """
        icf_req = service.icf_requirements

        # Check requirements using the model method
        passes = icf_req.user_meets_requirements(
            user_mobility=user_icf.mobility,
            user_sensory=user_icf.sensory.value,
            user_cognitive=user_icf.cognitive_score,
        )

        if not passes:
            # Generate reason
            if icf_req.min_mobility.value == "independent" and user_icf.mobility.value != "independent":
                return False, "שירות זה דורש הליכה עצמאית"
            if icf_req.requires_intact_hearing and user_icf.sensory.value in ["hearing_impaired", "both_impaired"]:
                return False, "שירות זה דורש שמיעה תקינה"
            if icf_req.requires_intact_vision and user_icf.sensory.value in ["visual_impaired", "both_impaired"]:
                return False, "שירות זה דורש ראייה תקינה"
            if user_icf.cognitive_score < icf_req.min_cognitive_score:
                return False, "שירות זה דורש יכולות קוגניטיביות גבוהות יותר"
            return False, "שירות זה לא מתאים לפרופיל התפקודי"

        return True, None

    def _calculate_prevention_score(self, service: "ServiceResponse") -> float:
        """
        Calculate prevention value score.

        PREVENTION_CORE content worlds get highest score.
        """
        # Full 100 points for prevention-focused content worlds
        prevention_worlds = [
            ContentWorld.BELONGING_MEANING,
            ContentWorld.HEALTH_FUNCTION,
        ]

        if service.content_world in prevention_worlds:
            return 100.0
        elif service.content_world == ContentWorld.RESILIENCE:
            return 70.0
        elif service.content_world == ContentWorld.ASSISTIVE_TECH:
            return 50.0
        else:
            return 30.0

    def _calculate_meaning_score(
        self,
        user_meaning_tags: list[MeaningTag],
        service: "ServiceResponse",
    ) -> tuple[float, list[MeaningTag]]:
        """
        Calculate meaning match score.

        Matches user's meaning tags with service's meaning tags.
        Applies 1.5x multiplier as per spec.
        """
        if not user_meaning_tags or not service.meaning_tags:
            return 0.0, []

        # Find matching tags
        matched = []
        for user_tag in user_meaning_tags:
            if user_tag in service.meaning_tags:
                matched.append(user_tag)

        if not matched:
            return 0.0, []

        # Base score: percentage of user's tags that matched
        base_score = (len(matched) / len(user_meaning_tags)) * 100

        # Apply meaning multiplier
        final_score = base_score * RECOMMENDATION_WEIGHTS_MEANING_MULTIPLIER

        # Cap at 100
        final_score = min(final_score, 100)

        return final_score, matched

    def _calculate_proximity_score(
        self,
        user_lat: float | None,
        user_lng: float | None,
        service: "ServiceResponse",
    ) -> tuple[float, float | None]:
        """
        Calculate proximity score based on distance.

        +100 points if < 1km
        Decreases logarithmically with distance
        """
        if user_lat is None or user_lng is None:
            return 50.0, None  # Default middle score if no location

        if not service.locations:
            return 50.0, None

        # Find nearest service location
        min_distance = float('inf')
        for loc in service.locations:
            if loc.lat is not None and loc.lng is not None:
                dist = self._haversine_distance(
                    user_lat, user_lng,
                    loc.lat, loc.lng
                )
                min_distance = min(min_distance, dist)

        if min_distance == float('inf'):
            return 50.0, None

        # Score based on distance
        if min_distance < 1:
            score = 100.0
        elif min_distance < 3:
            score = 80.0
        elif min_distance < 5:
            score = 60.0
        elif min_distance < 10:
            score = 40.0
        else:
            score = 20.0

        return score, min_distance

    def _calculate_social_proof_score(
        self,
        service: "ServiceResponse",
        user_city: str | None,
    ) -> float:
        """
        Calculate social proof score.

        +100 points if > 5 neighbors (same city) purchased.
        Scaled based on community count.
        """
        community_count = service.community_purchases_count

        # Threshold is 5 neighbors
        if community_count >= 5:
            # Scale: 5-10 = 60-80, 10+ = 80-100
            if community_count >= 10:
                return 100.0
            else:
                return 60.0 + (community_count - 5) * 8
        else:
            # Below threshold: proportional score
            return community_count * 12

    def _calculate_persona_boost(
        self,
        user_profile: "LevProfile",
        service: "ServiceResponse",
    ) -> tuple[float, str | None]:
        """
        Calculate persona-based score boost.

        Implements EY Logic:
        - SECURITY_SEEKER + Emergency Button -> 1.5x boost
        - SOCIAL_BUTTERFLY + Group Activity -> 1.3x boost
        - LEARNER + Cognitive Training -> 1.3x boost
        """
        if user_profile.persona is None:
            return 0.0, None

        persona = user_profile.persona.primary_persona

        # Security seeker + emergency/safety services
        if persona == PersonaType.SECURITY_SEEKER:
            if (service.content_world == ContentWorld.ASSISTIVE_TECH or
                ServiceTag.PREVENTIVE in service.service_tags):
                return 0.5, "מתאים לאנשים שמעדיפים ביטחון"

        # Social butterfly + group activities
        if persona == PersonaType.SOCIAL_BUTTERFLY:
            if service.is_group_activity:
                return 0.3, "פעילות קבוצתית מומלצת"

        # Learner + cognitive services
        if persona == PersonaType.LEARNER:
            if (ServiceTag.COGNITIVE in service.service_tags or
                MeaningTag.LEARNING in service.meaning_tags):
                return 0.3, "מתאים לאוהבי למידה"

        # Family oriented + intergenerational
        if persona == PersonaType.FAMILY_ORIENTED:
            if MeaningTag.GRANDCHILDREN in service.meaning_tags:
                return 0.3, "פעילות עם נכדים"

        # Caregiver + volunteering
        if persona == PersonaType.CAREGIVER:
            if MeaningTag.VOLUNTEERING in service.meaning_tags:
                return 0.3, "הזדמנות לעזור לאחרים"

        return 0.0, None

    def _generate_reason(
        self,
        prevention_score: float,
        matched_tags: list[MeaningTag],
        distance_km: float | None,
        service: "ServiceResponse",
    ) -> str:
        """Generate Hebrew explanation for why this service is recommended."""
        reasons = []

        # Prevention value
        if prevention_score >= 80:
            reasons.append("שירות מניעה מומלץ")

        # Meaning match
        if matched_tags:
            from shared.constants import MEANING_TAG_LABELS_HE
            tag_names = [
                MEANING_TAG_LABELS_HE.get(t.value, t.value)
                for t in matched_tags[:2]
            ]
            reasons.append(f"מתאים לתחומי העניין שלך: {', '.join(tag_names)}")

        # Proximity
        if distance_km is not None and distance_km < 3:
            reasons.append("קרוב לביתך")

        # Group activity
        if service.is_group_activity:
            reasons.append("פעילות חברתית")

        if not reasons:
            reasons.append("שירות מומלץ")

        return " • ".join(reasons[:3])

    @staticmethod
    def _haversine_distance(
        lat1: float, lng1: float,
        lat2: float, lng2: float,
    ) -> float:
        """
        Calculate the great circle distance between two points
        on the earth (specified in decimal degrees).
        Returns distance in kilometers.
        """
        # Convert to radians
        lat1, lng1, lat2, lng2 = map(radians, [lat1, lng1, lat2, lng2])

        # Haversine formula
        dlat = lat2 - lat1
        dlng = lng2 - lng1
        a = sin(dlat/2)**2 + cos(lat1) * cos(lat2) * sin(dlng/2)**2
        c = 2 * asin(sqrt(a))

        # Earth's radius in kilometers
        r = 6371

        return c * r


# Singleton instance
recommendation_engine = RecommendationEngine()
