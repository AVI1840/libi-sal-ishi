"""
FastAPI application entry point for Marketplace service.
Lev (לב) - Optimal Aging OS
"""

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import structlog

from shared.config import get_settings
from marketplace.api.routes import wallets, services, bookings, vendors, dashboard
from marketplace.api.routes import lev


logger = structlog.get_logger()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan handler."""
    settings = get_settings()

    logger.info(
        "Starting Marketplace service",
        environment=settings.environment,
    )

    # Initialize database connection
    # TODO: Initialize database pool

    yield

    # Cleanup
    logger.info("Shutting down Marketplace service")


def create_app() -> FastAPI:
    """Create and configure the FastAPI application."""
    settings = get_settings()

    app = FastAPI(
        title="Personal Basket - Marketplace",
        description="Care Services Marketplace for Israeli Nursing Benefits",
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
        wallets.router,
        prefix="/api/v1/wallets",
        tags=["Wallets"],
    )
    app.include_router(
        services.router,
        prefix="/api/v1/services",
        tags=["Services"],
    )
    app.include_router(
        bookings.router,
        prefix="/api/v1/bookings",
        tags=["Bookings"],
    )
    app.include_router(
        vendors.router,
        prefix="/api/v1/vendors",
        tags=["Vendors"],
    )
    app.include_router(
        dashboard.router,
        prefix="/api/v1/dashboard",
        tags=["Dashboard"],
    )

    # Lev - Optimal Aging OS Routes
    app.include_router(
        lev.router,
        prefix="/api/v1",
        tags=["Lev - Optimal Aging OS"],
    )

    # Health check endpoint
    @app.get("/health")
    async def health_check():
        return {
            "status": "healthy",
            "service": "marketplace",
            "version": "0.1.0",
        }

    return app


app = create_app()


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "marketplace.main:app",
        host="0.0.0.0",
        port=8002,
        reload=True,
    )
