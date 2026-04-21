"""
Dynamic Subsidy Engine for Lev Optimal Aging OS.

Algorithm A: The Dynamic Subsidy Engine
Goal: Direct budget towards prevention without blocking choice.

Logic:
1. Identify Tier based on content world
2. Apply boosters (income supplement, anti-loneliness for group activities)
3. Calculate final price: ClientPay = Service.BasePrice * (1 - TotalSubsidy)
"""

from dataclasses import dataclass
from typing import TYPE_CHECKING

import structlog

from shared.constants import (
    ContentWorld,
    SubsidyTier,
    SUBSIDY_TIER_PERCENTAGES,
    CONTENT_WORLD_DEFAULT_SUBSIDY,
    SUBSIDY_BOOSTERS,
    SUBSIDY_MAX_PERCENTAGE,
)

if TYPE_CHECKING:
    from shared.models.lev_profile import LevProfile
    from shared.models.service import ServiceResponse


logger = structlog.get_logger()


@dataclass
class SubsidyCalculation:
    """Result of subsidy calculation."""

    # Base tier info
    content_world: str
    subsidy_tier: str
    base_subsidy_percentage: float

    # Applied boosters
    boosters_applied: list[str]
    boosters_total: float

    # Final calculation
    final_subsidy_percentage: float

    # Price breakdown
    service_base_price: float
    subsidy_amount: float
    client_pays: float

    # Display info
    subsidy_tier_label_he: str
    explanation_he: str

    def to_dict(self) -> dict:
        """Convert to dictionary for API response."""
        return {
            "content_world": self.content_world,
            "subsidy_tier": self.subsidy_tier,
            "base_subsidy_percentage": round(self.base_subsidy_percentage * 100, 1),
            "boosters_applied": self.boosters_applied,
            "boosters_total": round(self.boosters_total * 100, 1),
            "final_subsidy_percentage": round(self.final_subsidy_percentage * 100, 1),
            "service_base_price": self.service_base_price,
            "subsidy_amount": round(self.subsidy_amount, 2),
            "client_pays": round(self.client_pays, 2),
            "subsidy_tier_label_he": self.subsidy_tier_label_he,
            "explanation_he": self.explanation_he,
        }


# Hebrew labels for subsidy tiers
SUBSIDY_TIER_LABELS_HE = {
    SubsidyTier.FULL.value: "מסובסד במלואו",
    SubsidyTier.PARTIAL.value: "מסובסד חלקית",
    SubsidyTier.MINIMAL.value: "סבסוד מינימלי",
    SubsidyTier.NONE.value: "תשלום פרטי",
}


class SubsidyEngine:
    """
    Dynamic Subsidy Engine.

    Calculates personalized subsidy based on:
    1. Service content world (determines base subsidy tier)
    2. User characteristics (income supplement, loneliness risk)
    3. Service type (group activity for anti-loneliness boost)
    """

    def calculate_subsidy(
        self,
        service_base_price: float,
        content_world: ContentWorld | str,
        subsidy_tier_override: SubsidyTier | str | None = None,
        is_group_activity: bool = False,
        user_has_income_supplement: bool = False,
        user_is_lonely: bool = False,
    ) -> SubsidyCalculation:
        """
        Calculate subsidy for a service purchase.

        Args:
            service_base_price: Base price of the service in NIS
            content_world: Content world of the service
            subsidy_tier_override: Override the default tier for this service
            is_group_activity: Whether this is a group activity
            user_has_income_supplement: User receives income supplement
            user_is_lonely: User has loneliness risk flag

        Returns:
            SubsidyCalculation with full breakdown
        """
        # Convert string to enum if needed
        if isinstance(content_world, str):
            content_world = ContentWorld(content_world)

        # Step 1: Determine base subsidy tier
        if subsidy_tier_override:
            if isinstance(subsidy_tier_override, str):
                subsidy_tier = SubsidyTier(subsidy_tier_override)
            else:
                subsidy_tier = subsidy_tier_override
        else:
            # Get default tier from content world
            tier_value = CONTENT_WORLD_DEFAULT_SUBSIDY.get(
                content_world.value,
                SubsidyTier.PARTIAL.value
            )
            subsidy_tier = SubsidyTier(tier_value)

        # Get base percentage
        base_percentage = SUBSIDY_TIER_PERCENTAGES.get(subsidy_tier.value, 0.0)

        # Step 2: Apply boosters
        boosters_applied: list[str] = []
        boosters_total = 0.0

        # Income supplement booster
        if user_has_income_supplement:
            boost = SUBSIDY_BOOSTERS.get("income_supplement", 0.0)
            boosters_applied.append("income_supplement")
            boosters_total += boost

        # Anti-loneliness nudge: lonely user + group activity
        if user_is_lonely and is_group_activity:
            boost = SUBSIDY_BOOSTERS.get("loneliness_group", 0.0)
            boosters_applied.append("loneliness_group")
            boosters_total += boost

        # Step 3: Calculate final percentage (capped at 100%)
        final_percentage = min(
            base_percentage + boosters_total,
            SUBSIDY_MAX_PERCENTAGE
        )

        # Step 4: Calculate prices
        subsidy_amount = service_base_price * final_percentage
        client_pays = service_base_price - subsidy_amount

        # Step 5: Generate explanation
        explanation = self._generate_explanation(
            subsidy_tier,
            boosters_applied,
            final_percentage,
        )

        logger.info(
            "Subsidy calculated",
            content_world=content_world.value,
            subsidy_tier=subsidy_tier.value,
            base_percentage=base_percentage,
            boosters=boosters_applied,
            final_percentage=final_percentage,
            base_price=service_base_price,
            client_pays=client_pays,
        )

        return SubsidyCalculation(
            content_world=content_world.value,
            subsidy_tier=subsidy_tier.value,
            base_subsidy_percentage=base_percentage,
            boosters_applied=boosters_applied,
            boosters_total=boosters_total,
            final_subsidy_percentage=final_percentage,
            service_base_price=service_base_price,
            subsidy_amount=subsidy_amount,
            client_pays=client_pays,
            subsidy_tier_label_he=SUBSIDY_TIER_LABELS_HE.get(
                subsidy_tier.value,
                "לא ידוע"
            ),
            explanation_he=explanation,
        )

    def calculate_for_user_and_service(
        self,
        user_profile: "LevProfile",
        service: "ServiceResponse",
    ) -> SubsidyCalculation:
        """
        Calculate subsidy for a specific user and service combination.

        This is the main entry point for the recommendation engine.
        """
        # Extract user characteristics
        user_is_lonely = user_profile.risk_flags.is_lonely
        user_has_income_supplement = user_profile.has_income_supplement

        # Extract service characteristics
        content_world = service.content_world
        is_group_activity = service.is_group_activity
        base_price = service.pricing.base_price_nis
        subsidy_tier_override = service.pricing.subsidy_tier

        return self.calculate_subsidy(
            service_base_price=base_price,
            content_world=content_world,
            subsidy_tier_override=subsidy_tier_override,
            is_group_activity=is_group_activity,
            user_has_income_supplement=user_has_income_supplement,
            user_is_lonely=user_is_lonely,
        )

    def _generate_explanation(
        self,
        subsidy_tier: SubsidyTier,
        boosters_applied: list[str],
        final_percentage: float,
    ) -> str:
        """Generate Hebrew explanation for the subsidy calculation."""
        parts = []

        # Base tier explanation
        if subsidy_tier == SubsidyTier.FULL:
            parts.append("שירות זה מסובסד במלואו כחלק מתוכנית הזדקנות מיטבית")
        elif subsidy_tier == SubsidyTier.PARTIAL:
            parts.append("שירות זה מסובסד בחצי מהמחיר")
        elif subsidy_tier == SubsidyTier.MINIMAL:
            parts.append("שירות זה כולל סבסוד חלקי")
        else:
            parts.append("שירות זה בתשלום מלא")

        # Booster explanations
        if "income_supplement" in boosters_applied:
            parts.append("קיבלת הטבה נוספת כמקבל/ת השלמת הכנסה")

        if "loneliness_group" in boosters_applied:
            parts.append("קיבלת הטבה נוספת על פעילות קבוצתית")

        # Final percentage
        if final_percentage >= 1.0:
            parts.append("השירות ללא עלות עבורך! ✨")
        elif final_percentage > 0:
            percentage_display = int(final_percentage * 100)
            parts.append(f"סה\"כ סבסוד: {percentage_display}%")

        return " • ".join(parts)

    def get_tier_for_content_world(self, content_world: ContentWorld | str) -> SubsidyTier:
        """Get default subsidy tier for a content world."""
        if isinstance(content_world, str):
            content_world = ContentWorld(content_world)

        tier_value = CONTENT_WORLD_DEFAULT_SUBSIDY.get(
            content_world.value,
            SubsidyTier.PARTIAL.value
        )
        return SubsidyTier(tier_value)

    def estimate_monthly_savings(
        self,
        user_profile: "LevProfile",
        monthly_services: list["ServiceResponse"],
    ) -> dict:
        """
        Estimate monthly savings for a user based on their subsidy rates.

        Returns summary of savings across all services.
        """
        total_base_price = 0.0
        total_client_pays = 0.0
        total_subsidy = 0.0

        for service in monthly_services:
            calc = self.calculate_for_user_and_service(user_profile, service)
            total_base_price += calc.service_base_price
            total_client_pays += calc.client_pays
            total_subsidy += calc.subsidy_amount

        savings_percentage = (total_subsidy / total_base_price * 100) if total_base_price > 0 else 0

        return {
            "total_base_price": round(total_base_price, 2),
            "total_client_pays": round(total_client_pays, 2),
            "total_subsidy": round(total_subsidy, 2),
            "savings_percentage": round(savings_percentage, 1),
            "services_count": len(monthly_services),
        }


# Singleton instance
subsidy_engine = SubsidyEngine()
