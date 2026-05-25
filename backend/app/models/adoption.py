from pydantic import BaseModel
from typing import Optional


class DAUMauPoint(BaseModel):
    date: str
    dau: int = 0
    mau: int = 0


class UsageRatio(BaseModel):
    active_users: int = 0
    total_users: int = 0
    ratio: float = 0.0


class ChannelActiveUsers(BaseModel):
    channel_id: Optional[int] = None
    channel_name: Optional[str] = None
    active_users: int = 0


class ModelUserCount(BaseModel):
    model_config = {"protected_namespaces": ()}

    model_id: str
    user_count: int = 0


class ActivityHeatmapPoint(BaseModel):
    day_of_week: int
    hour: int
    user_count: int = 0


class ProjectRanking(BaseModel):
    project_id: Optional[int] = None
    project_name: Optional[str] = None
    request_count: int = 0
    user_count: int = 0


class UserPenetration(BaseModel):
    heavy_users: int = 0
    total_users: int = 0
    penetration_rate: float = 0.0
