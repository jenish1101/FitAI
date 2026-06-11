from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse

from app.api.v1.router import api_router
from app.core.config import get_settings
from app.core.logging_config import configure_logging
from app.core.database import close_database_connection, connect_to_database
from app.core.exceptions import register_exception_handlers
from app.seed.runner import run_seed


@asynccontextmanager
async def lifespan(_: FastAPI):
    await connect_to_database()
    await run_seed()
    yield
    await close_database_connection()


def create_app() -> FastAPI:
    settings = get_settings()
    configure_logging(settings.debug)
    app = FastAPI(
        title=settings.app_name,
        version="1.0.0",
        debug=settings.debug,
        lifespan=lifespan,
        description="FitAI REST API — Pydantic-validated requests/responses, MongoDB persistence.",
        response_model_by_alias=True,
    )

    register_exception_handlers(app)

    app.add_middleware(
        CORSMiddleware,
        allow_origins=(
            settings.cors_origin_list + ["*"]
            if settings.is_development
            else settings.cors_origin_list
        ),
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    @app.get("/", include_in_schema=False)
    async def root() -> RedirectResponse:
        return RedirectResponse(url="/docs")

    app.include_router(api_router, prefix=settings.api_v1_prefix)
    return app


app = create_app()
