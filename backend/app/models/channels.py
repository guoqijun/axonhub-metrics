from pydantic import BaseModel
from typing import Optional, Any


class ChannelComparison(BaseModel):
    channel_id: Optional[int] = None
    channel_name: Optional[str] = None
    channel_type: Optional[str] = None
    request_count: int = 0
    user_count: int = 0
    avg_latency: float = 0.0
    total_cost: float = 0.0
    total_tokens: int = 0
    error_count: int = 0
    error_rate: float = 0.0
    model_count: int = 0


class ChannelLatency(BaseModel):
    channel_id: Optional[int] = None
    channel_name: Optional[str] = None
    avg_latency: float = 0.0
    max_latency: float = 0.0


class ChannelLatencyHeatmapPoint(BaseModel):
    channel_id: Optional[int] = None
    channel_name: Optional[str] = None
    hour: int
    avg_latency: float = 0.0


class ChannelHealth(BaseModel):
    channel_id: Optional[int] = None
    channel_name: Optional[str] = None
    total_requests: int = 0
    error_count: int = 0
    error_rate: float = 0.0
    avg_latency: float = 0.0
    health_score: float = 0.0


class ChannelErrorTrendPoint(BaseModel):
    date: str
    channel_id: Optional[int] = None
    channel_name: Optional[str] = None
    total_count: int = 0
    error_count: int = 0
    error_rate: float = 0.0


class QuotaStatus(BaseModel):
    channel_id: int
    channel_name: Optional[str] = None
    provider_type: Optional[str] = None
    status: str = "unknown"
    ready: bool = True
    next_reset_at: Optional[str] = None
    next_check_at: Optional[str] = None


class ChannelPricePoint(BaseModel):
    channel_id: Optional[int] = None
    channel_name: Optional[str] = None
    model_id: str
    avg_cost_per_token: float = 0.0
    request_count: int = 0
