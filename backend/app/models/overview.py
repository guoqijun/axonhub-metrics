from pydantic import BaseModel
from typing import Optional


class OverviewKPI(BaseModel):
    today_requests: int = 0
    dau: int = 0
    success_rate: float = 0.0
    today_cost: float = 0.0
    total_requests_30d: int = 0
    avg_latency_ms: float = 0.0


class TrendPoint(BaseModel):
    date: str
    value: float


class TokenTrendPoint(BaseModel):
    date: str
    prompt_tokens: float
    completion_tokens: float


class ModelDistItem(BaseModel):
    model_config = {"protected_namespaces": ()}

    model_id: str
    request_count: int
    percentage: float


class ErrorTrendPoint(BaseModel):
    date: str
    error_rate: float
    error_count: int
    total_count: int
