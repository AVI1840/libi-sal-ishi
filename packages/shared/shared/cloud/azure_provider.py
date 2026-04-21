"""
Azure cloud provider implementation.
"""

from typing import Any

from shared.cloud.base import CloudProvider, SecretsProvider, StorageObject, StorageProvider
from shared.exceptions import ServiceUnavailableError


class AzureStorageProvider(StorageProvider):
    """Azure Blob Storage provider."""

    def __init__(self, connection_string: str):
        from azure.storage.blob import BlobServiceClient

        self.client = BlobServiceClient.from_connection_string(connection_string)

    async def upload(
        self,
        bucket: str,  # container in Azure terms
        key: str,  # blob name
        data: bytes,
        content_type: str | None = None,
        metadata: dict[str, str] | None = None,
    ) -> str:
        """Upload to Blob Storage."""
        try:
            from azure.storage.blob import ContentSettings

            container_client = self.client.get_container_client(bucket)
            blob_client = container_client.get_blob_client(key)

            content_settings = None
            if content_type:
                content_settings = ContentSettings(content_type=content_type)

            blob_client.upload_blob(
                data,
                overwrite=True,
                content_settings=content_settings,
                metadata=metadata,
            )
            return f"https://{self.client.account_name}.blob.core.windows.net/{bucket}/{key}"

        except Exception as e:
            raise ServiceUnavailableError("Azure Blob Storage", str(e))

    async def download(self, bucket: str, key: str) -> bytes:
        """Download from Blob Storage."""
        try:
            container_client = self.client.get_container_client(bucket)
            blob_client = container_client.get_blob_client(key)
            return blob_client.download_blob().readall()
        except Exception as e:
            raise ServiceUnavailableError("Azure Blob Storage", str(e))

    async def delete(self, bucket: str, key: str) -> bool:
        """Delete from Blob Storage."""
        try:
            container_client = self.client.get_container_client(bucket)
            blob_client = container_client.get_blob_client(key)
            blob_client.delete_blob()
            return True
        except Exception as e:
            raise ServiceUnavailableError("Azure Blob Storage", str(e))

    async def exists(self, bucket: str, key: str) -> bool:
        """Check if blob exists in Blob Storage."""
        try:
            container_client = self.client.get_container_client(bucket)
            blob_client = container_client.get_blob_client(key)
            return blob_client.exists()
        except Exception:
            return False

    async def list_objects(
        self,
        bucket: str,
        prefix: str | None = None,
        max_results: int = 1000,
    ) -> list[StorageObject]:
        """List Blob Storage objects."""
        try:
            container_client = self.client.get_container_client(bucket)

            blobs = container_client.list_blobs(name_starts_with=prefix)

            objects = []
            count = 0
            for blob in blobs:
                if count >= max_results:
                    break
                objects.append(
                    StorageObject(
                        key=blob.name,
                        size=blob.size,
                        last_modified=blob.last_modified.isoformat() if blob.last_modified else None,
                        content_type=blob.content_settings.content_type if blob.content_settings else None,
                        etag=blob.etag,
                        metadata=blob.metadata,
                    )
                )
                count += 1
            return objects

        except Exception as e:
            raise ServiceUnavailableError("Azure Blob Storage", str(e))

    async def get_signed_url(
        self,
        bucket: str,
        key: str,
        expires_in: int = 3600,
        method: str = "GET",
    ) -> str:
        """Generate Blob Storage SAS URL."""
        try:
            from datetime import datetime, timedelta
            from azure.storage.blob import BlobSasPermissions, generate_blob_sas

            container_client = self.client.get_container_client(bucket)
            blob_client = container_client.get_blob_client(key)

            permissions = BlobSasPermissions(read=True) if method == "GET" else BlobSasPermissions(write=True)

            sas_token = generate_blob_sas(
                account_name=self.client.account_name,
                container_name=bucket,
                blob_name=key,
                account_key=self.client.credential.account_key,
                permission=permissions,
                expiry=datetime.utcnow() + timedelta(seconds=expires_in),
            )

            return f"{blob_client.url}?{sas_token}"

        except Exception as e:
            raise ServiceUnavailableError("Azure Blob Storage", str(e))


class AzureSecretsProvider(SecretsProvider):
    """Azure Key Vault provider."""

    def __init__(self, vault_url: str):
        from azure.identity import DefaultAzureCredential
        from azure.keyvault.secrets import SecretClient

        credential = DefaultAzureCredential()
        self.client = SecretClient(vault_url=vault_url, credential=credential)

    async def get(self, secret_name: str, version: str | None = None) -> str:
        """Get secret from Key Vault."""
        try:
            secret = self.client.get_secret(secret_name, version=version)
            return secret.value
        except Exception as e:
            raise ServiceUnavailableError("Azure Key Vault", str(e))

    async def set(self, secret_name: str, secret_value: str) -> bool:
        """Set secret in Key Vault."""
        try:
            self.client.set_secret(secret_name, secret_value)
            return True
        except Exception as e:
            raise ServiceUnavailableError("Azure Key Vault", str(e))

    async def delete(self, secret_name: str) -> bool:
        """Delete secret from Key Vault."""
        try:
            self.client.begin_delete_secret(secret_name).wait()
            return True
        except Exception as e:
            raise ServiceUnavailableError("Azure Key Vault", str(e))

    async def list_secrets(self, prefix: str | None = None) -> list[str]:
        """List secrets in Key Vault."""
        try:
            secrets = []
            for secret in self.client.list_properties_of_secrets():
                name = secret.name
                if prefix is None or name.startswith(prefix):
                    secrets.append(name)
            return secrets
        except Exception as e:
            raise ServiceUnavailableError("Azure Key Vault", str(e))


def create_azure_provider(
    storage_connection_string: str,
    vault_url: str | None = None,
) -> CloudProvider:
    """Create Azure cloud provider."""
    storage = AzureStorageProvider(storage_connection_string)

    # Secrets provider is optional (requires vault_url)
    secrets: SecretsProvider
    if vault_url:
        secrets = AzureSecretsProvider(vault_url)
    else:
        # Create a dummy secrets provider
        class NoOpSecretsProvider(SecretsProvider):
            async def get(self, secret_name: str, version: str | None = None) -> str:
                raise ServiceUnavailableError("Azure Key Vault", "Vault URL not configured")
            async def set(self, secret_name: str, secret_value: str) -> bool:
                raise ServiceUnavailableError("Azure Key Vault", "Vault URL not configured")
            async def delete(self, secret_name: str) -> bool:
                raise ServiceUnavailableError("Azure Key Vault", "Vault URL not configured")
            async def list_secrets(self, prefix: str | None = None) -> list[str]:
                raise ServiceUnavailableError("Azure Key Vault", "Vault URL not configured")

        secrets = NoOpSecretsProvider()

    return CloudProvider(storage, secrets)
