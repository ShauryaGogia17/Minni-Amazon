from unittest.mock import AsyncMock
import httpx
from app.config import Settings
from app.services.readiness import ReadinessProbe


async def test_probe_checks_real_dependencies_and_handles_failure():
    client = AsyncMock()
    client.get.return_value = httpx.Response(200, json={"status": "UP"})
    redis = AsyncMock()
    redis.ping.return_value = True
    probe = ReadinessProbe(Settings(), client, redis)
    probe._postgres = AsyncMock(return_value=True)
    assert all((await probe.check()).values())
    redis.ping.side_effect = ConnectionError("private connection details")
    result = await probe.check()
    assert result == {"postgres": True, "redis": False, "product_service": True}
