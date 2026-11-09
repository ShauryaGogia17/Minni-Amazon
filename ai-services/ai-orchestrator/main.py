import re
from contextlib import asynccontextmanager
from uuid import uuid4
import httpx
from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from redis.asyncio import Redis
from app.config import get_settings
from app.schemas.health import Capability, CapabilitiesResponse, HealthResponse
from app.services.readiness import ReadinessProbe
from app.services.shopping import ShoppingService
from app.schemas.shopping import ChatRequest, ChatResponse, RecommendationRequest, RecommendationResponse


@asynccontextmanager
async def lifespan(app: FastAPI):
    settings = get_settings()
    async with httpx.AsyncClient(base_url=settings.product_service_url, timeout=2) as client:
        async with Redis.from_url(settings.redis_url.get_secret_value(), socket_connect_timeout=2, socket_timeout=2) as redis:
            app.state.probe = ReadinessProbe(settings, client, redis)
            app.state.shopping = ShoppingService(client, settings)
            yield


def create_app() -> FastAPI:
    settings = get_settings()
    app = FastAPI(title="ShopAI AI Orchestrator", version="0.1.0", lifespan=lifespan)
    app.add_middleware(CORSMiddleware, allow_origins=settings.allowed_origins,
                       allow_methods=["GET", "POST"], allow_headers=["Content-Type", "X-Request-ID"],
                       expose_headers=["X-Request-ID"])

    @app.middleware("http")
    async def correlation(request: Request, call_next):
        supplied = request.headers.get("X-Request-ID", "")
        request_id = supplied if re.fullmatch(r"[A-Za-z0-9_-]{1,64}", supplied) else str(uuid4())
        response = await call_next(request)
        response.headers["X-Request-ID"] = request_id
        return response

    @app.get("/health/live", response_model=HealthResponse)
    async def live():
        return HealthResponse(status="ok")

    @app.get("/health/ready", response_model=HealthResponse, responses={503: {"model": HealthResponse}})
    async def ready(request: Request, response: Response):
        checks = await request.app.state.probe.check()
        healthy = all(checks.values())
        response.status_code = 200 if healthy else 503
        return HealthResponse(status="ready" if healthy else "not_ready", checks=checks)

    @app.get("/api/v1/ai/capabilities", response_model=CapabilitiesResponse)
    async def capabilities():
        return CapabilitiesResponse(llm_enabled=bool(settings.openai_api_key.get_secret_value()), agents=[
            Capability(id="shopping", name="Shopping assistant", available=True),
            Capability(id="recommendation", name="Personal recommendations", available=True),
            Capability(id="review", name="Review summaries"),
            Capability(id="support", name="Customer support"),
            Capability(id="inventory", name="Inventory intelligence"),
        ])

    @app.post("/api/v1/ai/chat", response_model=ChatResponse)
    async def chat(body: ChatRequest, request: Request):
        return await request.app.state.shopping.chat(body)

    @app.post("/api/v1/ai/recommendations", response_model=RecommendationResponse)
    async def recommendations(body: RecommendationRequest, request: Request):
        return await request.app.state.shopping.recommendations(body)

    return app


app = create_app()
