"""
GCP cloud provider implementation.
"""

from typing import Any

from shared.cloud.base import CloudProvider, SecretsProvider, StorageObject, StorageProvider
from shared.exceptions import ServiceUnavailableError


class GCPStorageProvider(StorageProvider):
    """GCP Cloud Storage provider."""

    def __init__(self, project_id: str | None = None):
        from google.cloud import storage

        self.project_id = project_id
        self.client = storage.Client(project=project_id)

    async def upload(
        self,
        bucket: str,
        key: str,
        data: bytes,
        content_type: str | None = None,
        metadata: dict[str, str] | None = None,
    ) -> str:
        """Upload to Cloud Storage."""
        try:
            bucket_obj = self.client.bucket(bucket)
            blob = bucket_obj.blob(key)

            if content_type:
                blob.content_type = content_type
            if metadata:
                blob.metadata = metadata

            blob.upload_from_string(data)
            return f"gs://{bucket}/{key}"

        except Exception as e:
            raise ServiceUnavailableError("GCP Cloud Storage", str(e))

    async def download(self, bucket: str, key: str) -> bytes:
        """Download from Cloud Storage."""
        try:
            bucket_obj = self.client.bucket(bucket)
            blob = bucket_obj.blob(key)
            return blob.download_as_bytes()
        except Exception as e:
            raise ServiceUnavailableError("GCP Cloud Storage", str(e))

    async def delete(self, bucket: str, key: str) -> bool:
        """Delete from Cloud Storage."""
        try:
            bucket_obj = self.client.bucket(bucket)
            blob = bucket_obj.blob(key)
            blob.delete()
            return True
        except Exception as e:
            raise ServiceUnavailableError("GCP Cloud Storage", str(e))

    async def exists(self, bucket: str, key: str) -> bool:
        """Check if object exists in Cloud Storage."""
        try:
            bucket_obj = self.client.bucket(bucket)
            blob = bucket_obj.blob(key)
            return blob.exists()
        except Exception:
            return False

    async def list_objects(
        self,
        bucket: str,
        prefix: str | None = None,
        max_results: int = 1000,
    ) -> list[StorageObject]:
        """List Cloud Storage objects."""
        try:
            bucket_obj = self.client.bucket(bucket)
            blobs = bucket_obj.list_blobs(prefix=prefix, max_results=max_results)

            objects = []
            for blob in blobs:
                objects.append(
                    StorageObject(
                        key=blob.name,
                        size=blob.size or 0,
                        last_modified=blob.updated.isoformat() if blob.updated else None,
                        content_type=blob.content_type,
                        etag=blob.etag,
                        metadata=blob.metadata,
                    )
                )
            return objects

        except Exception as e:
            raise ServiceUnavailableError("GCP Cloud Storage", str(e))

    async def get_signed_url(
        self,
        bucket: str,
        key: str,
        expires_in: int = 3600,
        method: str = "GET",
    ) -> str:
        """Generate Cloud Storage signed URL."""
        try:
            from datetime import timedelta

            bucket_obj = self.client.bucket(bucket)
            blob = bucket_obj.blob(key)

            url = blob.generate_signed_url(
                version="v4",
                expiration=timedelta(seconds=expires_in),
                method=method,
            )
            return url
        except Exception as e:
            raise ServiceUnavailableError("GCP Cloud Storage", str(e))


class GCPSecretsProvider(SecretsProvider):
    """GCP Secret Manager provider."""

    def __init__(self, project_id: str):
        from google.cloud import secretmanager

        self.project_id = project_id
        self.client = secretmanager.SecretManagerServiceClient()

    async def get(self, secret_name: str, version: str | None = None) -> str:
        """Get secret from Secret Manager."""
        try:
            version = version or "latest"
            name = f"projects/{self.project_id}/secrets/{secret_name}/versions/{version}"
            response = self.client.access_secret_version(request={"name": name})
            return response.payload.data.decode("UTF-8")
        except Exception as e:
            raise ServiceUnavailableError("GCP Secret Manager", str(e))

    async def set(self, secret_name: str, secret_value: str) -> bool:
        """Set secret in Secret Manager."""
        try:
            parent = f"projects/{self.project_id}"

            # Try to create the secret first
            try:
                self.client.create_secret(
                    request={
                        "parent": parent,
                        "secret_id": secret_name,
                        "secret": {"replication": {"automatic": {}}},
                    }
                )
            except Exception:
                pass  # Secret might already exist

            # Add a new version
            secret_path = f"projects/{self.project_id}/secrets/{secret_name}"
            self.client.add_secret_version(
                request={
                    "parent": secret_path,
                    "payload": {"data": secret_value.encode("UTF-8")},
                }
            )
            return True

        except Exception as e:
            raise ServiceUnavailableError("GCP Secret Manager", str(e))

    async def delete(self, secret_name: str) -> bool:
        """Delete secret from Secret Manager."""
        try:
            name = f"projects/{self.project_id}/secrets/{secret_name}"
            self.client.delete_secret(request={"name": name})
            return True
        except Exception as e:
            raise ServiceUnavailableError("GCP Secret Manager", str(e))

    async def list_secrets(self, prefix: str | None = None) -> list[str]:
        """List secrets in Secret Manager."""
        try:
            parent = f"projects/{self.project_id}"

            secrets = []
            for secret in self.client.list_secrets(request={"parent": parent}):
                name = secret.name.split("/")[-1]
                if prefix is None or name.startswith(prefix):
                    secrets.append(name)
            return secrets

        except Exception as e:
            raise ServiceUnavailableError("GCP Secret Manager", str(e))


def create_gcp_provider(project_id: str) -> CloudProvider:
    """Create GCP cloud provider."""
    storage = GCPStorageProvider(project_id)
    secrets = GCPSecretsProvider(project_id)
    return CloudProvider(storage, secrets)
