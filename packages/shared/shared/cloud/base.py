"""
Base classes and interfaces for cloud providers.
"""

from abc import ABC, abstractmethod
from dataclasses import dataclass
from typing import Any


@dataclass
class StorageObject:
    """Represents an object in cloud storage."""
    key: str
    size: int
    last_modified: str | None = None
    content_type: str | None = None
    etag: str | None = None
    metadata: dict[str, str] | None = None


class StorageProvider(ABC):
    """Abstract base class for cloud storage providers."""

    @abstractmethod
    async def upload(
        self,
        bucket: str,
        key: str,
        data: bytes,
        content_type: str | None = None,
        metadata: dict[str, str] | None = None,
    ) -> str:
        """
        Upload data to storage.

        Args:
            bucket: Bucket/container name
            key: Object key/path
            data: Binary data to upload
            content_type: MIME type
            metadata: Custom metadata

        Returns:
            URL or URI of uploaded object
        """
        pass

    @abstractmethod
    async def download(self, bucket: str, key: str) -> bytes:
        """
        Download data from storage.

        Args:
            bucket: Bucket/container name
            key: Object key/path

        Returns:
            Binary data
        """
        pass

    @abstractmethod
    async def delete(self, bucket: str, key: str) -> bool:
        """
        Delete an object from storage.

        Args:
            bucket: Bucket/container name
            key: Object key/path

        Returns:
            True if deleted successfully
        """
        pass

    @abstractmethod
    async def exists(self, bucket: str, key: str) -> bool:
        """
        Check if an object exists.

        Args:
            bucket: Bucket/container name
            key: Object key/path

        Returns:
            True if object exists
        """
        pass

    @abstractmethod
    async def list_objects(
        self,
        bucket: str,
        prefix: str | None = None,
        max_results: int = 1000,
    ) -> list[StorageObject]:
        """
        List objects in a bucket.

        Args:
            bucket: Bucket/container name
            prefix: Filter by prefix
            max_results: Maximum number of results

        Returns:
            List of storage objects
        """
        pass

    @abstractmethod
    async def get_signed_url(
        self,
        bucket: str,
        key: str,
        expires_in: int = 3600,
        method: str = "GET",
    ) -> str:
        """
        Generate a signed URL for temporary access.

        Args:
            bucket: Bucket/container name
            key: Object key/path
            expires_in: Seconds until URL expires
            method: HTTP method (GET, PUT)

        Returns:
            Signed URL string
        """
        pass


class SecretsProvider(ABC):
    """Abstract base class for secrets management."""

    @abstractmethod
    async def get(self, secret_name: str, version: str | None = None) -> str:
        """
        Get a secret value.

        Args:
            secret_name: Name of the secret
            version: Specific version (optional)

        Returns:
            Secret value as string
        """
        pass

    @abstractmethod
    async def set(self, secret_name: str, secret_value: str) -> bool:
        """
        Set a secret value.

        Args:
            secret_name: Name of the secret
            secret_value: Value to store

        Returns:
            True if successful
        """
        pass

    @abstractmethod
    async def delete(self, secret_name: str) -> bool:
        """
        Delete a secret.

        Args:
            secret_name: Name of the secret

        Returns:
            True if deleted successfully
        """
        pass

    @abstractmethod
    async def list_secrets(self, prefix: str | None = None) -> list[str]:
        """
        List available secrets.

        Args:
            prefix: Filter by prefix

        Returns:
            List of secret names
        """
        pass


class CloudProvider:
    """
    Unified cloud provider with storage and secrets.

    Usage:
        cloud = CloudFactory.create()
        await cloud.storage.upload(bucket, key, data)
        secret = await cloud.secrets.get("my-secret")
    """

    def __init__(self, storage: StorageProvider, secrets: SecretsProvider):
        self._storage = storage
        self._secrets = secrets

    @property
    def storage(self) -> StorageProvider:
        """Get storage provider."""
        return self._storage

    @property
    def secrets(self) -> SecretsProvider:
        """Get secrets provider."""
        return self._secrets
