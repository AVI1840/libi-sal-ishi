"""
Cloud provider factory.
"""

from typing import Literal

from shared.config import get_settings
from shared.cloud.base import CloudProvider
from shared.exceptions import ValidationError


CloudProviderType = Literal["aws", "gcp", "azure"]


class CloudFactory:
    """Factory for creating cloud providers."""

    @classmethod
    def create(
        cls,
        provider: CloudProviderType | None = None,
        **kwargs,
    ) -> CloudProvider:
        """
        Create a cloud provider instance.

        Args:
            provider: Provider name (aws, gcp, azure)
            **kwargs: Provider-specific parameters

        Returns:
            Cloud provider instance
        """
        settings = get_settings()
        provider = provider or settings.cloud_provider

        if provider == "aws":
            from shared.cloud.aws_provider import create_aws_provider
            return create_aws_provider(
                access_key_id=kwargs.get("access_key_id", settings.aws_access_key_id),
                secret_access_key=kwargs.get("secret_access_key", settings.aws_secret_access_key),
                region=kwargs.get("region", settings.aws_region),
            )

        elif provider == "gcp":
            from shared.cloud.gcp_provider import create_gcp_provider
            project_id = kwargs.get("project_id", settings.gcp_project_id)
            if not project_id:
                raise ValidationError(
                    "GCP project_id is required",
                    field="project_id",
                )
            return create_gcp_provider(project_id=project_id)

        elif provider == "azure":
            from shared.cloud.azure_provider import create_azure_provider
            connection_string = kwargs.get(
                "connection_string",
                settings.azure_storage_connection_string,
            )
            if not connection_string:
                raise ValidationError(
                    "Azure storage connection string is required",
                    field="connection_string",
                )
            return create_azure_provider(
                storage_connection_string=connection_string,
                vault_url=kwargs.get("vault_url"),
            )

        else:
            raise ValidationError(
                f"Unknown cloud provider: {provider}",
                field="provider",
                details={"supported": ["aws", "gcp", "azure"]},
            )


def create_cloud(
    provider: CloudProviderType | None = None,
    **kwargs,
) -> CloudProvider:
    """
    Convenience function to create a cloud provider.

    Uses settings from environment variables by default.
    """
    return CloudFactory.create(provider=provider, **kwargs)
