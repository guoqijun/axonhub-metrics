from pydantic import BaseModel
from typing import Optional


class AvgConversationRounds(BaseModel):
    avg_rounds: float = 0.0
    total_conversations: int = 0


class AvgTokensPerRequest(BaseModel):
    avg_tokens: float = 0.0
    avg_prompt: float = 0.0
    avg_completion: float = 0.0


class SessionDurationBucket(BaseModel):
    bucket: str
    count: int = 0


class FrequencyBucket(BaseModel):
    bucket: str
    user_count: int = 0


class ChannelDailyRequests(BaseModel):
    channel_id: Optional[int] = None
    channel_name: Optional[str] = None
    daily_avg: float = 0.0


class StreamRatio(BaseModel):
    stream_count: int = 0
    total_count: int = 0
    stream_ratio: float = 0.0


class RetentionCohortPoint(BaseModel):
    cohort: str
    active_month: str
    active_users: int = 0


class DailyPerCapita(BaseModel):
    date: str
    total_requests: int = 0
    active_users: int = 0
    per_capita: float = 0.0
