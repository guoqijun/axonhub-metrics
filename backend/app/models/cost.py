from pydantic import BaseModel
from typing import Optional


class TokenFeeTrendPoint(BaseModel):
    date: str
    prompt_tokens: int = 0
    completion_tokens: int = 0
    total_cost: float = 0.0


class CostModelDist(BaseModel):
    model_config = {"protected_namespaces": ()}

    model_id: str
    total_cost: float = 0.0
    request_count: int = 0
    total_tokens: int = 0


class ChannelCostComparison(BaseModel):
    channel_id: Optional[int] = None
    channel_name: Optional[str] = None
    total_cost: float = 0.0
    request_count: int = 0
    avg_cost_per_request: float = 0.0


class CostTopUser(BaseModel):
    user_id: Optional[int] = None
    email: Optional[str] = None
    name: str = ""
    employee_id: Optional[str] = None
    employee_name: Optional[str] = None
    employee_org_id: Optional[str] = None
    employee_org_name: Optional[str] = None
    total_cost: float = 0.0
    request_count: int = 0
    total_tokens: int = 0


class ProjectDailyCost(BaseModel):
    date: str
    project_id: Optional[int] = None
    project_name: Optional[str] = None
    total_cost: float = 0.0


class CacheHitRatePoint(BaseModel):
    date: str
    prompt_tokens: int = 0
    cached_tokens: int = 0
    cache_hit_pct: float = 0.0


class ReasoningRatioPoint(BaseModel):
    date: str
    completion_tokens: int = 0
    reasoning_tokens: int = 0
    reasoning_pct: float = 0.0


class ForecastPoint(BaseModel):
    date: str
    actual: Optional[float] = None
    forecast: Optional[float] = None
