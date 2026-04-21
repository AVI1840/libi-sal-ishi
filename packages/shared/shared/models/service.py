"""
Service-related Pydantic models.
Extended with Lev content worlds, subsidy tiers, and ICF requirements.
"""

from datetime import datetime
from typing import Any

from pydantic import BaseModel, Field

from shared.constants import (
    ServiceCategory,
    ServiceSubcategory,
    ContentWorld,
    SubsidyTier,
    MobilityLevel,
    ServiceTag,
    MeaningTag,
    SUBSIDY_TIER_PERCENTAGES,
    CONTENT_WORLD_DEFAULT_SUBSIDY,
)


class ServiceAvailability(BaseModel):
    """Service availability schedule."""
    days: list[str] = Field(default_factory=list)  # ["Sunday", "Monday", ...]
    times: list[str] = Field(default_factory=list)  # ["09:00-12:00", "14:00-17:00"]
    exceptions: list[str] = Field(default_factory=list)  # dates when unavailable


class ServiceLocation(BaseModel):
    """Service location."""
    city: str
    address: str | None = None
    lat: float | None = Field(default=None, ge=-90, le=90)
    lng: float | None = Field(default=None, ge=-180, le=180)


class ServicePricing(BaseModel):
    """Service pricing information with subsidy support."""
    base_price_nis: float = Field(..., ge=0, description="Base price in NIS")
    unit_cost: int = Field(default=1, ge=0, description="Cost in digital units (legacy)")

    # Subsidy configuration
    subsidy_tier: SubsidyTier = Field(
        default=SubsidyTier.PARTIAL,
        description="Default subsidy tier for this service"
    )
    insurance_coverage: bool = Field(
        default=False,
        description="Whether this service can be covered by health insurance"
    )
    allows_private_payment: bool = Field(
        default=True,
        description="Whether user can pay out-of-pocket beyond subsidy"
    )

    def get_base_subsidy_percentage(self) -> float:
        """Get base subsidy percentage from tier."""
        return SUBSIDY_TIER_PERCENTAGES.get(self.subsidy_tier.value, 0.0)


# ===========================================
# ICF Requirements (Safety Filter)
# ===========================================

class ICFRequirements(BaseModel):
    """Minimum ICF requirements for service participation (safety filter)."""
    min_mobility: MobilityLevel = Field(
        default=MobilityLevel.HUMAN_ASSISTED,
        description="Minimum mobility level required"
    )
    requires_intact_hearing: bool = Field(
        default=False,
        description="Whether service requires good hearing"
    )
    requires_intact_vision: bool = Field(
        default=False,
        description="Whether service requires good vision"
    )
    min_cognitive_score: int = Field(
        default=1,
        ge=1, le=5,
        description="Minimum cognitive score required"
    )

    def user_meets_requirements(
        self,
        user_mobility: MobilityLevel,
        user_sensory: str,
        user_cognitive: int,
    ) -> bool:
        """Check if user meets ICF requirements for this service."""
        # Mobility check (order: INDEPENDENT > ASSISTED_DEVICE > HUMAN_ASSISTED)
        mobility_order = {
            MobilityLevel.INDEPENDENT.value: 3,
            MobilityLevel.ASSISTED_DEVICE.value: 2,
            MobilityLevel.HUMAN_ASSISTED.value: 1,
        }
        min_required = mobility_order.get(self.min_mobility.value, 1)
        user_level = mobility_order.get(user_mobility.value, 1)

        if user_level < min_required:
            return False

        # Hearing check
        if self.requires_intact_hearing and user_sensory in ["hearing_impaired", "both_impaired"]:
            return False

        # Vision check
        if self.requires_intact_vision and user_sensory in ["visual_impaired", "both_impaired"]:
            return False

        # Cognitive check
        if user_cognitive < self.min_cognitive_score:
            return False

        return True


class VendorInfo(BaseModel):
    """Basic vendor information for service listing."""
    vendor_id: str
    name: str
    rating: float = Field(default=0, ge=0, le=5)
    reviews_count: int = Field(default=0, ge=0)
    is_verified: bool = False


class ServiceBase(BaseModel):
    """Base service model with Lev content worlds."""
    # Legacy category (for backward compatibility)
    category: ServiceCategory
    subcategory: ServiceSubcategory | None = None

    # New: Content World (per Government Decision)
    content_world: ContentWorld = Field(
        default=ContentWorld.HEALTH_FUNCTION,
        description="Content world per Optimal Aging government decision"
    )

    # Basic info
    title: str = Field(..., min_length=1, max_length=255)
    title_he: str | None = Field(default=None, max_length=255)
    description: str | None = None
    description_he: str | None = None
    duration_minutes: int | None = Field(default=None, ge=15, le=480)

    # Nursing level eligibility
    min_nursing_level: int = Field(default=1, ge=1, le=6)
    max_nursing_level: int = Field(default=3, ge=1, le=6)  # Lev targets 1-3

    # Service characteristics
    requires_referral: bool = False
    is_group_activity: bool = Field(
        default=False,
        description="Group activity (affects anti-loneliness subsidy boost)"
    )

    # ICF safety requirements
    icf_requirements: ICFRequirements = Field(
        default_factory=ICFRequirements,
        description="Minimum ICF requirements for safety"
    )

    # Matching tags
    tags: list[str] = Field(default_factory=list)
    service_tags: list[ServiceTag] = Field(
        default_factory=list,
        description="Structured tags for matching algorithm"
    )
    meaning_tags: list[MeaningTag] = Field(
        default_factory=list,
        description="Meaning tags for recommendation matching"
    )

    # Accessibility
    is_accessible: bool = Field(default=True, description="Wheelchair accessible")
    is_hearing_friendly: bool = Field(default=False, description="Has hearing accommodations")
    is_vision_friendly: bool = Field(default=False, description="Has vision accommodations")


class ServiceCreate(ServiceBase):
    """Model for creating a service."""
    vendor_id: str
    pricing: ServicePricing
    availability: ServiceAvailability = Field(default_factory=ServiceAvailability)
    locations: list[ServiceLocation] = Field(default_factory=list)


class ServiceUpdate(BaseModel):
    """Model for updating a service."""
    title: str | None = Field(default=None, min_length=1, max_length=255)
    title_he: str | None = Field(default=None, max_length=255)
    description: str | None = None
    description_he: str | None = None
    duration_minutes: int | None = Field(default=None, ge=15, le=480)
    min_nursing_level: int | None = Field(default=None, ge=1, le=6)
    max_nursing_level: int | None = Field(default=None, ge=1, le=6)
    requires_referral: bool | None = None
    content_world: ContentWorld | None = None
    is_group_activity: bool | None = None
    pricing: ServicePricing | None = None
    availability: ServiceAvailability | None = None
    locations: list[ServiceLocation] | None = None
    tags: list[str] | None = None
    service_tags: list[ServiceTag] | None = None
    meaning_tags: list[MeaningTag] | None = None
    icf_requirements: ICFRequirements | None = None
    is_active: bool | None = None


class ServiceResponse(ServiceBase):
    """Model for service response with subsidy calculation."""
    service_id: str
    vendor_id: str
    pricing: ServicePricing
    availability: ServiceAvailability
    locations: list[ServiceLocation]
    is_active: bool
    created_at: datetime

    # Optional vendor info (populated when needed)
    vendor: VendorInfo | None = None

    # Calculated fields for display
    community_purchases_count: int = Field(
        default=0,
        description="Number of users in area who purchased this service"
    )
    average_rating: float = Field(default=0.0, ge=0, le=5)

    model_config = {"from_attributes": True}


class ServiceSearchParams(BaseModel):
    """Parameters for searching services."""
    category: ServiceCategory | None = None
    subcategory: ServiceSubcategory | None = None
    query: str | None = Field(default=None, max_length=255)
    city: str | None = None
    lat: float | None = Field(default=None, ge=-90, le=90)
    lng: float | None = Field(default=None, ge=-180, le=180)
    radius_km: float = Field(default=10, ge=1, le=100)
    nursing_level: int | None = Field(default=None, ge=1, le=6)
    max_unit_cost: int | None = Field(default=None, ge=1)
    is_optimal_aging: bool | None = None
    requires_referral: bool | None = None
    available_date: datetime | None = None
    tags: list[str] | None = None

    # Pagination
    page: int = Field(default=1, ge=1)
    limit: int = Field(default=20, ge=1, le=100)

    # Sorting
    sort_by: str = Field(default="rating")  # rating, distance, price, reviews
    sort_order: str = Field(default="desc")  # asc, desc


class ServiceSearchResult(BaseModel):
    """Service search result with relevance info."""
    service: ServiceResponse
    distance_km: float | None = None
    relevance_score: float = 0


class ServiceCatalog(BaseModel):
    """Grouped service catalog."""
    categories: dict[str, list[ServiceResponse]]
    total_services: int
