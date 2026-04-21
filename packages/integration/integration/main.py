"""
Integration Gateway - FastAPI Application.

Provides a unified API gateway between AI Agent and Marketplace services.
"""

from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import structlog

from integration.config import settings
from integration.gateway.router import router as gateway_router
from integration.webhooks.marketplace_events import router as marketplace_events_router
from integration.webhooks.ai_agent_events import router as ai_agent_events_router
from integration.sync.user_sync import router as user_sync_router

logger = structlog.get_logger()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager."""
    logger.info("Starting Integration Gateway",
                ai_agent_url=settings.ai_agent_url,
                marketplace_url=settings.marketplace_url)
    yield
    logger.info("Shutting down Integration Gateway")


app = FastAPI(
    title="Savta.AI Integration Gateway",
    description="API Gateway connecting AI Agent and Marketplace services",
    version="0.1.0",
    lifespan=lifespan,
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(gateway_router, prefix=settings.api_prefix, tags=["Gateway"])
app.include_router(marketplace_events_router, prefix=f"{settings.api_prefix}/webhooks/marketplace", tags=["Webhooks"])
app.include_router(ai_agent_events_router, prefix=f"{settings.api_prefix}/webhooks/ai-agent", tags=["Webhooks"])
app.include_router(user_sync_router, prefix=f"{settings.api_prefix}/sync", tags=["Sync"])


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "service": "integration-gateway",
        "version": "0.1.0",
    }


@app.get("/")
async def root():
    """Root endpoint."""
    return {
        "service": "Savta.AI Integration Gateway",
        "version": "0.1.0",
        "docs": "/docs",
        "health": "/health",
    }
