from pydantic import BaseModel
from typing import Optional


class MomYoyPoint(BaseModel):
    month: str
    request_count: int = 0
    request_growth_pct: float = 0.0
    user_count: int = 0
    user_growth_pct: float = 0.0
    total_tokens: int = 0
    token_growth_pct: float = 0.0
    total_cost: float = 0.0
    cost_growth_pct: float = 0.0


class GrowthForecastPoint(BaseModel):
    date: str
    metric: str
    actual: Optional[float] = None
    forecast: Optional[float] = None


class UserGrowthPoint(BaseModel):
    date: str
    new_users: int = 0
    cumulative_users: int = 0


class ModelGrowthRate(BaseModel):
    model_id: str
    month: str
    request_count: int = 0


class ChannelMarketShare(BaseModel):
    month: str
    channel_id: Optional[int] = None
    channel_name: Optional[str] = None
    request_count: int = 0
    share_pct: float = 0.0


class ProjectGrowthRanking(BaseModel):
    project_id: Optional[int] = None
    project_name: Optional[str] = None
    request_count: int = 0
    user_count: int = 0
