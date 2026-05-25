from pydantic import BaseModel
from typing import Optional


class ErrorRatePoint(BaseModel):
    date: str
    total_count: int = 0
    error_count: int = 0
    error_rate: float = 0.0


class ErrorTypeDist(BaseModel):
    status: str
    count: int = 0


class ErrorByModel(BaseModel):
    model_config = {"protected_namespaces": ()}
    model_id: str
    total_count: int = 0
    error_count: int = 0
    error_rate: float = 0.0


class ErrorByChannel(BaseModel):
    channel_id: Optional[int] = None
    channel_name: Optional[str] = None
    total_count: int = 0
    error_count: int = 0
    error_rate: float = 0.0


class ErrorHeatmapPoint(BaseModel):
    day_of_week: int
    hour: int
    error_count: int = 0


class TopFailingUser(BaseModel):
    user_id: Optional[int] = None
    email: Optional[str] = None
    name: str = ""
    employee_id: Optional[str] = None
    employee_name: Optional[str] = None
    employee_org_id: Optional[str] = None
    employee_org_name: Optional[str] = None
    total_count: int = 0
    error_count: int = 0
    error_rate: float = 0.0


class ChannelErrorMatrixPoint(BaseModel):
    channel_id: Optional[int] = None
    channel_name: Optional[str] = None
    status: Optional[str] = None
    count: int = 0


class RetrySuccessCategory(BaseModel):
    category: str
    trace_count: int = 0


class StatusCodeDist(BaseModel):
    status: str
    count: int = 0
