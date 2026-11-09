import asyncio
import httpx
import psycopg
from redis.asyncio import Redis
from app.config import Settings


class ReadinessProbe:
    def __init__(self, settings: Settings, client: httpx.AsyncClient, redis: Redis):
        self.settings = settings
        self.client = client
        self.redis = redis

    async def _postgres(self) -> bool:
        async with await psycopg.AsyncConnection.connect(
            self.settings.ai_database_url.get_secret_value(), connect_timeout=2
        ) as connection:
            async with connection.cursor() as cursor:
                await cursor.execute("SELECT 1")
                return await cursor.fetchone() == (1,)

    async def _products(self) -> bool:
        response = await self.client.get("/actuator/health/readiness")
        return response.status_code == 200 and response.json().get("status") == "UP"

    async def _safe(self, operation) -> bool:
        try:
            return bool(await asyncio.wait_for(operation, timeout=3))
        except Exception:
            # Readiness exposes no credentials, hostnames, stack traces, or private records.
            return False

    async def check(self) -> dict[str, bool]:
        values = await asyncio.gather(
            self._safe(self._postgres()), self._safe(self.redis.ping()), self._safe(self._products())
        )
        return dict(zip(("postgres", "redis", "product_service"), values, strict=True))
