from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.analysis import router as analysis_router
from app.core.config import get_settings
from app.core.exceptions import MediScanException, mediscan_exception_handler
from app.core.logging import setup_logging
from app.core.middleware import RequestLoggingMiddleware


def create_app() -> FastAPI:
    settings = get_settings()
    setup_logging(debug=settings.debug)

    app = FastAPI(
        title=settings.app_name,
        version=settings.app_version,
        description="API de análisis de imágenes médicas potenciada por IA",
        docs_url="/docs",
        redoc_url="/redoc",
    )

    app.add_middleware(RequestLoggingMiddleware)
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.add_exception_handler(MediScanException, mediscan_exception_handler)
    app.include_router(analysis_router, prefix="/api/v1")

    @app.get("/", tags=["root"])
    async def root() -> dict:
        return {
            "app": settings.app_name,
            "version": settings.app_version,
            "docs": "/docs",
        }

    return app


app = create_app()
