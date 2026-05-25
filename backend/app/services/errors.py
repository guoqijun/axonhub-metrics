from typing import List
from databases import Database
from app.database import get_db
from app.models.errors import (
    ErrorRatePoint, ErrorTypeDist, ErrorByModel, ErrorByChannel,
    ErrorHeatmapPoint, TopFailingUser, ChannelErrorMatrixPoint,
    RetrySuccessCategory, StatusCodeDist,
)
from app.services.base import FilterParams, date_trunc_expr, apply_filters


class ErrorsService:
    def __init__(self, db: Database):
        self.db = db

    async def get_rate_trend(self, params: FilterParams) -> List[ErrorRatePoint]:
        trunc = date_trunc_expr(params.granularity)
        where, bind = apply_filters(params)

        rows = await self.db.fetch_all(f"""
            SELECT {trunc} as date,
                   COUNT(*) as total_count,
                   SUM(CASE WHEN r.status IN ('failed', 'canceled') THEN 1 ELSE 0 END) as error_count
            FROM usage_logs ul
            LEFT JOIN requests r ON ul.request_id = r.id
            WHERE {where}
            GROUP BY {trunc}
            ORDER BY date
        """, bind)

        return [
            ErrorRatePoint(
                date=str(r["date"]),
                total_count=r["total_count"],
                error_count=r["error_count"],
                error_rate=round(r["error_count"] / r["total_count"] * 100, 2) if r["total_count"] > 0 else 0,
            )
            for r in rows
        ]

    async def get_type_distribution(self, params: FilterParams) -> List[ErrorTypeDist]:
        where, bind = apply_filters(params)

        rows = await self.db.fetch_all(f"""
            SELECT r.status, COUNT(*) as count
            FROM usage_logs ul
            JOIN requests r ON ul.request_id = r.id
            WHERE {where} AND r.status IN ('failed', 'canceled')
            GROUP BY r.status
            ORDER BY count DESC
        """, bind)

        return [ErrorTypeDist(status=r["status"], count=r["count"]) for r in rows]

    async def get_by_model(self, params: FilterParams) -> List[ErrorByModel]:
        where, bind = apply_filters(params)

        rows = await self.db.fetch_all(f"""
            SELECT ul.model_id,
                   COUNT(*) as total_count,
                   SUM(CASE WHEN r.status IN ('failed', 'canceled') THEN 1 ELSE 0 END) as error_count
            FROM usage_logs ul
            LEFT JOIN requests r ON ul.request_id = r.id
            WHERE {where}
            GROUP BY ul.model_id
            ORDER BY error_count DESC
        """, bind)

        return [
            ErrorByModel(
                model_id=r["model_id"],
                total_count=r["total_count"],
                error_count=r["error_count"],
                error_rate=round(r["error_count"] / r["total_count"] * 100, 2) if r["total_count"] > 0 else 0,
            )
            for r in rows
        ]

    async def get_by_channel(self, params: FilterParams) -> List[ErrorByChannel]:
        where, bind = apply_filters(params)

        rows = await self.db.fetch_all(f"""
            SELECT ul.channel_id, c.name as channel_name,
                   COUNT(*) as total_count,
                   SUM(CASE WHEN r.status IN ('failed', 'canceled') THEN 1 ELSE 0 END) as error_count
            FROM usage_logs ul
            LEFT JOIN requests r ON ul.request_id = r.id
            LEFT JOIN channels c ON ul.channel_id = c.id
            WHERE {where}
            GROUP BY ul.channel_id
            ORDER BY error_count DESC
        """, bind)

        return [
            ErrorByChannel(
                channel_id=r["channel_id"],
                channel_name=r["channel_name"],
                total_count=r["total_count"],
                error_count=r["error_count"],
                error_rate=round(r["error_count"] / r["total_count"] * 100, 2) if r["total_count"] > 0 else 0,
            )
            for r in rows
        ]

    async def get_heatmap(self, params: FilterParams) -> List[ErrorHeatmapPoint]:
        where, bind = apply_filters(params)

        rows = await self.db.fetch_all(f"""
            SELECT DAYOFWEEK(ul.created_at) as day_of_week,
                   HOUR(ul.created_at) as hour,
                   SUM(CASE WHEN r.status IN ('failed', 'canceled') THEN 1 ELSE 0 END) as error_count
            FROM usage_logs ul
            LEFT JOIN requests r ON ul.request_id = r.id
            WHERE {where}
            GROUP BY DAYOFWEEK(ul.created_at), HOUR(ul.created_at)
            ORDER BY day_of_week, hour
        """, bind)

        return [
            ErrorHeatmapPoint(
                day_of_week=r["day_of_week"],
                hour=r["hour"],
                error_count=r["error_count"],
            )
            for r in rows
        ]

    async def get_top_failing_users(self, params: FilterParams) -> List[TopFailingUser]:
        where, bind = apply_filters(params)

        rows = await self.db.fetch_all(f"""
            SELECT ak.user_id, u.email, u.first_name, u.last_name,
                   COUNT(*) as total_count,
                   SUM(CASE WHEN r.status IN ('failed', 'canceled') THEN 1 ELSE 0 END) as error_count
            FROM usage_logs ul
            LEFT JOIN requests r ON ul.request_id = r.id
            LEFT JOIN api_keys ak ON ul.api_key_id = ak.id
            LEFT JOIN users u ON ak.user_id = u.id
            WHERE {where}
            GROUP BY ak.user_id
            ORDER BY error_count DESC
            LIMIT 20
        """, bind)

        return [
            TopFailingUser(
                user_id=r["user_id"],
                email=r["email"],
                name=(r["first_name"] or "") + " " + (r["last_name"] or ""),
                total_count=r["total_count"],
                error_count=r["error_count"],
                error_rate=round(r["error_count"] / r["total_count"] * 100, 2) if r["total_count"] > 0 else 0,
            )
            for r in rows
        ]

    async def get_channel_error_matrix(self, params: FilterParams) -> List[ChannelErrorMatrixPoint]:
        where, bind = apply_filters(params)

        rows = await self.db.fetch_all(f"""
            SELECT ul.channel_id, c.name as channel_name, r.status, COUNT(*) as count
            FROM usage_logs ul
            LEFT JOIN requests r ON ul.request_id = r.id
            LEFT JOIN channels c ON ul.channel_id = c.id
            WHERE {where}
            GROUP BY ul.channel_id, r.status
            ORDER BY ul.channel_id, r.status
        """, bind)

        return [
            ChannelErrorMatrixPoint(
                channel_id=r["channel_id"],
                channel_name=r["channel_name"],
                status=r["status"],
                count=r["count"],
            )
            for r in rows
        ]

    async def get_retry_success_rate(self, params: FilterParams) -> List[RetrySuccessCategory]:
        where, bind = apply_filters(params)

        rows = await self.db.fetch_all(f"""
            SELECT
                CASE
                    WHEN failed_count = 0 THEN '全部成功'
                    WHEN failed_count > 0 AND success_count > 0 THEN '部分成功'
                    ELSE '全部失败'
                END as category,
                COUNT(*) as trace_count
            FROM (
                SELECT r.trace_id,
                       SUM(CASE WHEN r.status = 'completed' THEN 1 ELSE 0 END) as success_count,
                       SUM(CASE WHEN r.status IN ('failed', 'canceled') THEN 1 ELSE 0 END) as failed_count
                FROM usage_logs ul
                JOIN requests r ON ul.request_id = r.id
                WHERE {where} AND r.trace_id IS NOT NULL
                GROUP BY r.trace_id
            ) t
            GROUP BY category
            ORDER BY category
        """, bind)

        return [RetrySuccessCategory(category=r["category"], trace_count=r["trace_count"]) for r in rows]

    async def get_status_code_distribution(self, params: FilterParams) -> List[StatusCodeDist]:
        where, bind = apply_filters(params)

        rows = await self.db.fetch_all(f"""
            SELECT r.status, COUNT(*) as count
            FROM usage_logs ul
            LEFT JOIN requests r ON ul.request_id = r.id
            WHERE {where}
            GROUP BY r.status
            ORDER BY count DESC
        """, bind)

        return [StatusCodeDist(status=r["status"], count=r["count"]) for r in rows]
