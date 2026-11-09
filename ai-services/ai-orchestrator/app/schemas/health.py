from typing import Literal
from pydantic import BaseModel


class HealthResponse(BaseModel):
    status: Literal["ok", "ready", "not_ready"]
    service: str = "ai-orchestrator"
    checks: dict[str, bool] = {}


class Capability(BaseModel):
    id: str
    name: str
    available: bool = False
    planned_phase: int = 5


class CapabilitiesResponse(BaseModel):
    phase: int = 1
    llm_enabled: bool = False
    message: str = "Shopping assistant and catalog recommendations are available. Other agents are planned."
    agents: list[Capability]
