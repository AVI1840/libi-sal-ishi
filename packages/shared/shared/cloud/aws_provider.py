"""
AWS cloud provider implementation.
"""

from typing import Any

from shared.cloud.base import CloudProvider, SecretsProvider, StorageObject, StorageProvider
from shared.exceptions import ServiceUnavailableError


class AWSStorageProvider(StorageProvider):
    """AWS S3 storage provider."""

    def __init__(
        self,
        access_key_id: str | None = None,
        secret_access_key: str | None = None,
        region: str = "eu-west-1",
    ):
        import boto3

        self.region = region

        if access_key_id and secret_access_key:
            self.client = boto3.client(
                "s3",
                aws_access_key_id=access_key_id,
                aws_secret_access_key=secret_access_key,
                region_name=region,
            )
        else:
            # Use default credentials chain
            self.client = boto3.client("s3", region_name=region)

    async def upload(
        self,
        bucket: str,
        key: str,
        data: bytes,
        content_type: str | None = None,
        metadata: dict[str, str] | None = None,
    ) -> str:
        """Upload to S3."""
        try:
            params: dict[str, Any] = {
                "Bucket": bucket,
                "Key": key,
                "Body": data,
            }
            if content_type:
                params["ContentType"] = content_type
            if metadata:
                params["Metadata"] = metadata

            self.client.put_object(**params)
            return f"s3://{bucket}/{key}"

        except Exception as e:
            raise ServiceUnavailableError("AWS S3", str(e))

    async def download(self, bucket: str, key: str) -> bytes:
        """Download from S3."""
        try:
            response = self.client.get_object(Bucket=bucket, Key=key)
            return response["Body"].read()
        except Exception as e:
            raise ServiceUnavailableError("AWS S3", str(e))

    async def delete(self, bucket: str, key: str) -> bool:
        """Delete from S3."""
        try:
            self.client.delete_object(Bucket=bucket, Key=key)
            return True
        except Exception as e:
            raise ServiceUnavailableError("AWS S3", str(e))

    async def exists(self, bucket: str, key: str) -> bool:
        """Check if object exists in S3."""
        try:
            self.client.head_object(Bucket=bucket, Key=key)
            return True
        except self.client.exceptions.ClientError:
            return False

    async def list_objects(
        self,
        bucket: str,
        prefix: str | None = None,
        max_results: int = 1000,
    ) -> list[StorageObject]:
        """List S3 objects."""
        try:
            params: dict[str, Any] = {"Bucket": bucket, "MaxKeys": max_results}
            if prefix:
                params["Prefix"] = prefix

            response = self.client.list_objects_v2(**params)

            objects = []
            for obj in response.get("Contents", []):
                objects.append(
                    StorageObject(
                        key=obj["Key"],
                        size=obj["Size"],
                        last_modified=obj["LastModified"].isoformat(),
                        etag=obj.get("ETag"),
                    )
                )
            return objects

        except Exception as e:
            raise ServiceUnavailableError("AWS S3", str(e))

    async def get_signed_url(
        self,
        bucket: str,
        key: str,
        expires_in: int = 3600,
        method: str = "GET",
    ) -> str:
        """Generate S3 presigned URL."""
        try:
            client_method = "get_object" if method == "GET" else "put_object"
            url = self.client.generate_presigned_url(
                client_method,
                Params={"Bucket": bucket, "Key": key},
                ExpiresIn=expires_in,
            )
            return url
        except Exception as e:
            raise ServiceUnavailableError("AWS S3", str(e))


class AWSSecretsProvider(SecretsProvider):
    """AWS Secrets Manager provider."""

    def __init__(
        self,
        access_key_id: str | None = None,
        secret_access_key: str | None = None,
        region: str = "eu-west-1",
    ):
        import boto3

        self.region = region

        if access_key_id and secret_access_key:
            self.client = boto3.client(
                "secretsmanager",
                aws_access_key_id=access_key_id,
                aws_secret_access_key=secret_access_key,
                region_name=region,
            )
        else:
            self.client = boto3.client("secretsmanager", region_name=region)

    async def get(self, secret_name: str, version: str | None = None) -> str:
        """Get secret from Secrets Manager."""
        try:
            params: dict[str, Any] = {"SecretId": secret_name}
            if version:
                params["VersionId"] = version

            response = self.client.get_secret_value(**params)
            return response["SecretString"]

        except Exception as e:
            raise ServiceUnavailableError("AWS Secrets Manager", str(e))

    async def set(self, secret_name: str, secret_value: str) -> bool:
        """Set secret in Secrets Manager."""
        try:
            try:
                self.client.create_secret(Name=secret_name, SecretString=secret_value)
            except self.client.exceptions.ResourceExistsException:
                self.client.put_secret_value(SecretId=secret_name, SecretString=secret_value)
            return True
        except Exception as e:
            raise ServiceUnavailableError("AWS Secrets Manager", str(e))

    async def delete(self, secret_name: str) -> bool:
        """Delete secret from Secrets Manager."""
        try:
            self.client.delete_secret(SecretId=secret_name, ForceDeleteWithoutRecovery=True)
            return True
        except Exception as e:
            raise ServiceUnavailableError("AWS Secrets Manager", str(e))

    async def list_secrets(self, prefix: str | None = None) -> list[str]:
        """List secrets in Secrets Manager."""
        try:
            params: dict[str, Any] = {}
            if prefix:
                params["Filters"] = [{"Key": "name", "Values": [prefix]}]

            response = self.client.list_secrets(**params)
            return [s["Name"] for s in response.get("SecretList", [])]

        except Exception as e:
            raise ServiceUnavailableError("AWS Secrets Manager", str(e))


def create_aws_provider(
    access_key_id: str | None = None,
    secret_access_key: str | None = None,
    region: str = "eu-west-1",
) -> CloudProvider:
    """Create AWS cloud provider."""
    storage = AWSStorageProvider(access_key_id, secret_access_key, region)
    secrets = AWSSecretsProvider(access_key_id, secret_access_key, region)
    return CloudProvider(storage, secrets)
