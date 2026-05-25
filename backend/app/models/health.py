from pydantic import BaseModel
from typing import Optional


class LatencyTrendPoint(BaseModel):
    date: str
    p50_latency: float = 0.0
    p95_latency: float = 0.0
    p99_latency: float = 0.0


class ChannelHealthRanking(BaseModel):
    channel_id: Optional[int] = None
    channel_name: Optional[str] = None
    total_requests: int = 0
    success_rate: float = 0.0
    avg_latency: float = 0.0
    health_score: float = 0.0


class SlowRequest(BaseModel):
    request_id: int
    model_id: str
    channel_name: Optional[str] = None
    latency_ms: float = 0.0
    status: str
    created_at: str


class QuotaAlert(BaseModel):
    channel_id: int
    channel_name: Optional[str] = None
    provider_type: Optional[str] = None
    status: str = "unknown"
    ready: bool = True
    next_reset_at: Optional[str] = None


class ProbeTrendPoint(BaseModel):
    date: str
    channel_id: Optional[int] = None
    channel_name: Optional[str] = None
    avg_tokens_per_second: float = 0.0
    avg_time_to_first_token_ms: float = 0.0
    request_count: int = 0


class CacheHitTrendPoint(BaseModel):
    date: str
    prompt_tokens: int = 0
    cached_tokens: int = 0
    cache_hit_pct: float = 0.0


class AvailabilityCalendarPoint(BaseModel):
    date: str
    total_requests: int = 0
    success_count: int = 0
    availability_pct: float = 0.0
