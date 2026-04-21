"""
API Gateway Router.

Routes requests between AI Agent and Marketplace services.
"""

from fastapi import APIRouter, Request, HTTPException, Depends
from fastapi.responses import StreamingResponse
import httpx
import structlog

from integration.config import settings
from integration.gateway.rate_limiter import RateLimiter, check_rate_limit

logger = structlog.get_logger()
router = APIRouter()


class ServiceClient:
    """HTTP client for downstream services."""

    def __init__(self):
        self.timeout = httpx.Timeout(
            connect=settings.connect_timeout_seconds,
            read=settings.request_timeout_seconds,
            write=settings.request_timeout_seconds,
            pool=5.0
        )

    async def forward_request(
        self,
        service_url: str,
        path: str,
        method: str,
        headers: dict,
        body: bytes | None = None,
        params: dict | None = None,
    ) -> httpx.Response:
        """Forward a request to a downstream service."""
        url = f"{service_url}{path}"

        # Remove hop-by-hop headers
        forward_headers = {
            k: v for k, v in headers.items()
            if k.lower() not in ['host', 'content-length', 'transfer-encoding']
        }

        async with httpx.AsyncClient(timeout=self.timeout) as client:
            response = await client.request(
                method=method,
                url=url,
                headers=forward_headers,
                content=body,
                params=params,
            )

        return response


client = ServiceClient()


@router.api_route(
    "/ai-agent/{path:path}",
    methods=["GET", "POST", "PUT", "DELETE", "PATCH"],
)
async def proxy_ai_agent(
    path: str,
    request: Request,
    _: None = Depends(check_rate_limit),
):
    """Proxy requests to AI Agent service."""
    try:
        body = await request.body() if request.method in ["POST", "PUT", "PATCH"] else None

        response = await client.forward_request(
            service_url=settings.ai_agent_url,
            path=f"/{path}",
            method=request.method,
            headers=dict(request.headers),
            body=body,
            params=dict(request.query_params),
        )

        logger.info("Proxied request to AI Agent",
                   path=path,
                   method=request.method,
                   status_code=response.status_code)

        return StreamingResponse(
            content=iter([response.content]),
            status_code=response.status_code,
            headers=dict(response.headers),
            media_type=response.headers.get("content-type"),
        )

    except httpx.TimeoutException:
        logger.error("AI Agent service timeout", path=path)
        raise HTTPException(status_code=504, detail="AI Agent service timeout")
    except httpx.ConnectError:
        logger.error("AI Agent service unavailable", path=path)
        raise HTTPException(status_code=503, detail="AI Agent service unavailable")


@router.api_route(
    "/marketplace/{path:path}",
    methods=["GET", "POST", "PUT", "DELETE", "PATCH"],
)
async def proxy_marketplace(
    path: str,
    request: Request,
    _: None = Depends(check_rate_limit),
):
    """Proxy requests to Marketplace service."""
    try:
        body = await request.body() if request.method in ["POST", "PUT", "PATCH"] else None

        response = await client.forward_request(
            service_url=settings.marketplace_url,
            path=f"/{path}",
            method=request.method,
            headers=dict(request.headers),
            body=body,
            params=dict(request.query_params),
        )

        logger.info("Proxied request to Marketplace",
                   path=path,
                   method=request.method,
                   status_code=response.status_code)

        return StreamingResponse(
            content=iter([response.content]),
            status_code=response.status_code,
            headers=dict(response.headers),
            media_type=response.headers.get("content-type"),
        )

    except httpx.TimeoutException:
        logger.error("Marketplace service timeout", path=path)
        raise HTTPException(status_code=504, detail="Marketplace service timeout")
    except httpx.ConnectError:
        logger.error("Marketplace service unavailable", path=path)
        raise HTTPException(status_code=503, detail="Marketplace service unavailable")


@router.get("/services/status")
async def service_status():
    """Check status of downstream services."""
    status = {
        "ai_agent": "unknown",
        "marketplace": "unknown",
    }

    async with httpx.AsyncClient(timeout=httpx.Timeout(5.0)) as client:
        # Check AI Agent
        try:
            resp = await client.get(f"{settings.ai_agent_url}/health")
            status["ai_agent"] = "healthy" if resp.status_code == 200 else "unhealthy"
        except Exception:
            status["ai_agent"] = "unavailable"

        # Check Marketplace
        try:
            resp = await client.get(f"{settings.marketplace_url}/health")
            status["marketplace"] = "healthy" if resp.status_code == 200 else "unhealthy"
        except Exception:
            status["marketplace"] = "unavailable"

    return {
        "gateway": "healthy",
        "services": status,
    }
