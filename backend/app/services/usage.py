from typing import List
from databases import Database
from app.database import get_db
from app.models.usage import (
    AvgConversationRounds, AvgTokensPerRequest, SessionDurationBucket,
    FrequencyBucket, ChannelDailyRequests, StreamRatio,
    RetentionCohortPoint, DailyPerCapita,
)
from app.services.base import FilterParams, date_trunc_expr, apply_filters


class UsageService:
    def __init__(self, db: Database):
        self.db = db

    async def get_avg_conversation_rounds(self, params: FilterParams) -> AvgConversationRounds:
        where, bind = apply_filters(params)

        row = await self.db.fetch_one(f"""
            SELECT AVG(rc) as avg_rounds, COUNT(*) as total_conversations
            FROM (
                SELECT r.trace_id, COUNT(*) as rc
                FROM usage_logs ul
                JOIN requests r ON ul.request_id = r.id
                WHERE {where} AND r.trace_id IS NOT NULL
                GROUP BY r.trace_id
            ) t
        """, bind)

        return AvgConversationRounds(
            avg_rounds=round(float(row["avg_rounds"] or 0), 2),
            total_conversations=row["total_conversations"] or 0,
        )

    async def get_avg_tokens_per_request(self, params: FilterParams) -> AvgTokensPerRequest:
        where, bind = apply_filters(params)

        row = await self.db.fetch_one(f"""
            SELECT
                AVG(ul.prompt_tokens + ul.completion_tokens) as avg_tokens,
                AVG(ul.prompt_tokens) as avg_prompt,
                AVG(ul.completion_tokens) as avg_completion
            FROM usage_logs ul
            WHERE {where}
        """, bind)

        return AvgTokensPerRequest(
            avg_tokens=round(float(row["avg_tokens"] or 0), 2),
            avg_prompt=round(float(row["avg_prompt"] or 0), 2),
            avg_completion=round(float(row["avg_completion"] or 0), 2),
        )

    async def get_session_duration(self, params: FilterParams) -> List[SessionDurationBucket]:
        where, bind = apply_filters(params)

        rows = await self.db.fetch_all(f"""
            SELECT
                CASE
                    WHEN duration_seconds < 60 THEN '<1m'
                    WHEN duration_seconds < 300 THEN '1-5m'
                    WHEN duration_seconds < 900 THEN '5-15m'
                    WHEN duration_seconds < 1800 THEN '15-30m'
                    WHEN duration_seconds < 3600 THEN '30-60m'
                    ELSE '>60m'
                END as bucket,
                COUNT(*) as count
            FROM (
                SELECT r.trace_id,
                       TIMESTAMPDIFF(SECOND, MIN(ul.created_at), MAX(ul.created_at)) as duration_seconds
                FROM usage_logs ul
                JOIN requests r ON ul.request_id = r.id
                WHERE {where} AND r.trace_id IS NOT NULL
                GROUP BY r.trace_id
            ) t
            GROUP BY bucket
            ORDER BY bucket
        """, bind)

        return [SessionDurationBucket(bucket=r["bucket"], count=r["count"]) for r in rows]

    async def get_request_frequency_buckets(self, params: FilterParams) -> List[FrequencyBucket]:
        where, bind = apply_filters(params)

        rows = await self.db.fetch_all(f"""
            SELECT
                CASE
                    WHEN req_count = 1 THEN '1'
                    WHEN req_count <= 5 THEN '2-5'
                    WHEN req_count <= 20 THEN '6-20'
                    WHEN req_count <= 50 THEN '21-50'
                    WHEN req_count <= 100 THEN '51-100'
                    ELSE '100+'
                END as bucket,
                COUNT(*) as user_count
            FROM (
                SELECT ak.user_id, COUNT(*) as req_count
                FROM usage_logs ul
                LEFT JOIN api_keys ak ON ul.api_key_id = ak.id
                WHERE {where}
                GROUP BY ak.user_id
            ) t
            GROUP BY bucket
            ORDER BY bucket
        """, bind)

        return [FrequencyBucket(bucket=r["bucket"], user_count=r["user_count"]) for r in rows]

    async def get_channel_daily_requests(self, params: FilterParams) -> List[ChannelDailyRequests]:
        where, bind = apply_filters(params)

        rows = await self.db.fetch_all(f"""
            SELECT ul.channel_id, c.name as channel_name,
                   COUNT(*) / COUNT(DISTINCT DATE(ul.created_at)) as daily_avg
            FROM usage_logs ul
            LEFT JOIN channels c ON ul.channel_id = c.id
            WHERE {where}
            GROUP BY ul.channel_id
            ORDER BY daily_avg DESC
        """, bind)

        return [
            ChannelDailyRequests(
                channel_id=r["channel_id"],
                channel_name=r["channel_name"],
                daily_avg=round(float(r["daily_avg"]), 2),
            )
            for r in rows
        ]

    async def get_stream_ratio(self, params: FilterParams) -> StreamRatio:
        where, bind = apply_filters(params)

        row = await self.db.fetch_one(f"""
            SELECT
                COUNT(CASE WHEN r.stream = TRUE THEN 1 END) as stream_count,
                COUNT(*) as total_count
            FROM usage_logs ul
            LEFT JOIN requests r ON ul.request_id = r.id
            WHERE {where}
        """, bind)

        stream_count = row["stream_count"] or 0
        total_count = row["total_count"] or 0
        stream_ratio = round(stream_count / total_count, 4) if total_count > 0 else 0.0

        return StreamRatio(
            stream_count=stream_count,
            total_count=total_count,
            stream_ratio=stream_ratio,
        )

    async def get_user_retention_cohort(self, params: FilterParams) -> List[RetentionCohortPoint]:
        # Build conditions for usage_logs scope
        ul_conditions = ["1=1"]
        bind = {}
        if params.start_date:
            ul_conditions.append("DATE(ul.created_at) >= :start_date")
            bind["start_date"] = params.start_date
        if params.end_date:
            ul_conditions.append("DATE(ul.created_at) <= :end_date")
            bind["end_date"] = params.end_date
        if params.channel_ids:
            placeholders = ", ".join([f":cid_{i}" for i in range(len(params.channel_ids))])
            ul_conditions.append(f"ul.channel_id IN ({placeholders})")
            for i, cid in enumerate(params.channel_ids):
                bind[f"cid_{i}"] = cid
        if params.model_ids:
            placeholders = ", ".join([f":mid_{i}" for i in range(len(params.model_ids))])
            ul_conditions.append(f"ul.model_id IN ({placeholders})")
            for i, mid in enumerate(params.model_ids):
                bind[f"mid_{i}"] = mid

        ul_where = " AND ".join(ul_conditions)

        rows = await self.db.fetch_all(f"""
            SELECT
                DATE_FORMAT(u.created_at, '%Y-%m') as cohort,
                DATE_FORMAT(ul.created_at, '%Y-%m') as active_month,
                COUNT(DISTINCT ak.user_id) as active_users
            FROM users u
            INNER JOIN api_keys ak ON u.id = ak.user_id
            INNER JOIN usage_logs ul ON ak.id = ul.api_key_id
            WHERE u.deleted_at = 0
              AND u.status = 'activated'
              AND {ul_where}
            GROUP BY cohort, active_month
            ORDER BY cohort, active_month
        """, bind)

        return [
            RetentionCohortPoint(
                cohort=r["cohort"],
                active_month=r["active_month"],
                active_users=r["active_users"],
            )
            for r in rows
        ]

    async def get_daily_per_capita(self, params: FilterParams) -> List[DailyPerCapita]:
        trunc = date_trunc_expr(params.granularity)
        where, bind = apply_filters(params)

        rows = await self.db.fetch_all(f"""
            SELECT {trunc} as date,
                   COUNT(*) as total_requests,
                   COUNT(DISTINCT ak.user_id) as active_users
            FROM usage_logs ul
            LEFT JOIN api_keys ak ON ul.api_key_id = ak.id
            WHERE {where}
            GROUP BY {trunc}
            ORDER BY date
        """, bind)

        return [
            DailyPerCapita(
                date=str(r["date"]),
                total_requests=r["total_requests"],
                active_users=r["active_users"],
                per_capita=round(r["total_requests"] / r["active_users"], 2) if r["active_users"] > 0 else 0,
            )
            for r in rows
        ]
