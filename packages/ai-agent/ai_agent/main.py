"""
FastAPI application entry point for AI Agent service.
"""

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import structlog

from shared.config import get_settings
from ai_agent.api.routes import conversation, health, webhooks, demo, limor
from ai_agent.api.routes import websocket as ws_routes
from ai_agent.api.routes import overview
from ai_agent.memory import get_mock_provider


logger = structlog.get_logger()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan handler."""
    settings = get_settings()

    logger.info(
        "Starting AI Agent service",
        environment=settings.environment,
        llm_provider=settings.llm_provider,
    )

    # Initialize mock data for demo
    mock_provider = get_mock_provider()
    logger.info("Mock data initialized", demo_users=len(mock_provider.get_demo_user_ids()))

    yield

    # Cleanup
    logger.info("Shutting down AI Agent service")


def create_app() -> FastAPI:
    """Create and configure the FastAPI application."""
    settings = get_settings()

    app = FastAPI(
        title="Savta.AI - AI Agent",
        description="Autonomous Care Companion for Elderly Israelis",
        version="0.1.0",
        lifespan=lifespan,
        docs_url="/docs" if settings.is_development else None,
        redoc_url="/redoc" if settings.is_development else None,
    )

    # CORS
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins_list,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Include routers
    app.include_router(
        conversation.router,
        prefix="/api/v1/conversations",
        tags=["Conversations"],
    )
    app.include_router(
        health.router,
        prefix="/api/v1/health",
        tags=["Health Monitoring"],
    )
    app.include_router(
        webhooks.router,
        prefix="/api/v1/webhooks",
        tags=["Webhooks"],
    )
    app.include_router(
        demo.router,
        prefix="/api/v1/demo",
        tags=["Demo"],
    )
    app.include_router(
        limor.router,
        prefix="/api/v1/limor",
        tags=["Limor - AI Companion"],
    )

    # WebSocket routes
    app.include_router(
        ws_routes.router,
        prefix="/api/v1",
        tags=["WebSocket"],
    )

    # API Overview (for demo)
    app.include_router(
        overview.router,
        prefix="/api/v1/overview",
        tags=["API Overview"],
    )

    # Health check endpoint
    @app.get("/health")
    async def health_check():
        return {
            "status": "healthy",
            "service": "ai-agent",
            "version": "0.1.0",
        }

    return app


app = create_app()


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "ai_agent.main:app",
        host="0.0.0.0",
        port=8001,
        reload=True,
    )
