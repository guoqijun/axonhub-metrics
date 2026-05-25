from pydantic import BaseModel
from typing import Optional


class HeavyUser(BaseModel):
    user_id: Optional[int] = None
    email: Optional[str] = None
    name: str = ""
    employee_id: Optional[str] = None
    employee_name: Optional[str] = None
    employee_org_id: Optional[str] = None
    employee_org_name: Optional[str] = None
    request_count: int = 0
    total_tokens: int = 0
    total_cost: float = 0.0


class TokenRanking(BaseModel):
    model_config = {"protected_namespaces": ()}

    model_id: str
    total_prompt: int = 0
    total_completion: int = 0
    total_tokens: int = 0


class RFMQuadrant(BaseModel):
    quadrant: str
    user_count: int = 0


class ChannelEfficiency(BaseModel):
    channel_id: Optional[int] = None
    channel_name: Optional[str] = None
    request_count: int = 0
    total_tokens: int = 0
    total_cost: float = 0.0
    tokens_per_dollar: float = 0.0


class ProjectContributionPoint(BaseModel):
    date: str
    project_id: Optional[int] = None
    project_name: Optional[str] = None
    request_count: int = 0
    total_tokens: int = 0


class ModelOutputRanking(BaseModel):
    model_config = {"protected_namespaces": ()}

    model_id: str
    request_count: int = 0
    total_tokens: int = 0
    completion_tokens: int = 0
    avg_completion_per_request: float = 0.0
