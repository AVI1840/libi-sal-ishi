"""
Cloud provider abstraction layer.

Supports AWS, GCP, and Azure with unified interfaces for:
- Object Storage (S3, Cloud Storage, Blob Storage)
- Secrets Management (Secrets Manager, Secret Manager, Key Vault)
"""

from shared.cloud.base import (
    CloudProvider,
    StorageProvider,
    SecretsProvider,
)
from shared.cloud.factory import CloudFactory, create_cloud

__all__ = [
    "CloudProvider",
    "StorageProvider",
    "SecretsProvider",
    "CloudFactory",
    "create_cloud",
]
