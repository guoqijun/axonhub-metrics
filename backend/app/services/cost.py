from typing import List, Optional
from datetime import datetime, timedelta
from databases import Database
from app.database import get_db
from app.models.cost import (
    TokenFeeTrendPoint, CostModelDist, ChannelCostComparison,
    CostTopUser, ProjectDailyCost, CacheHitRatePoint,
    ReasoningRatioPoint, ForecastPoint,
)
from app.services.base import FilterParams, date_trunc_expr, apply_filters


class CostService:
    def __init__(self, db: Database):
        self.db = db

    async def get_token_fee_trend(self, params: FilterParams) -> List[TokenFeeTrendPoint]:
        trunc = date_trunc_expr(params.granularity)
        where, bind = apply_filters(params)

        rows = await self.db.fetch_all(f"""
            SELECT {trunc} as date,
                   COALESCE(SUM(ul.prompt_tokens), 0) as prompt_tokens,
                   COALESCE(SUM(ul.completion_tokens), 0) as completion_tokens,
                   COALESCE(SUM(ul.total_cost), 0) as total_cost
            FROM usage_logs ul
            WHERE {where}
            GROUP BY {trunc}
            ORDER BY date
        """, bind)

        return [
            TokenFeeTrendPoint(
                date=str(r["date"]),
                prompt_tokens=r["prompt_tokens"],
                completion_tokens=r["completion_tokens"],
                total_cost=float(r["total_cost"] or 0),
            )
            for r in rows
        ]

    async def get_model_distribution(self, params: FilterParams) -> List[CostModelDist]:
        where, bind = apply_filters(params)

        rows = await self.db.fetch_all(f"""
            SELECT ul.model_id,
                   COALESCE(SUM(ul.total_cost), 0) as total_cost,
                   COUNT(*) as request_count,
                   COALESCE(SUM(ul.total_tokens), 0) as total_tokens
            FROM usage_logs ul
            WHERE {where}
            GROUP BY ul.model_id
            ORDER BY total_cost DESC
        """, bind)

        return [
            CostModelDist(
                model_id=r["model_id"],
                total_cost=float(r["total_cost"] or 0),
                request_count=r["request_count"],
                total_tokens=r["total_tokens"],
            )
            for r in rows
        ]

    async def get_channel_comparison(self, params: FilterParams) -> List[ChannelCostComparison]:
        where, bind = apply_filters(params)

        rows = await self.db.fetch_all(f"""
            SELECT ul.channel_id, c.name as channel_name,
                   COALESCE(SUM(ul.total_cost), 0) as total_cost,
                   COUNT(*) as request_count,
                   COALESCE(AVG(ul.total_cost), 0) as avg_cost_per_request
            FROM usage_logs ul
            LEFT JOIN channels c ON ul.channel_id = c.id
            WHERE {where}
            GROUP BY ul.channel_id
            ORDER BY total_cost DESC
        """, bind)

        return [
            ChannelCostComparison(
                channel_id=r["channel_id"],
                channel_name=r["channel_name"],
                total_cost=float(r["total_cost"] or 0),
                request_count=r["request_count"],
                avg_cost_per_request=round(float(r["avg_cost_per_request"] or 0), 4),
            )
            for r in rows
        ]

    async def get_user_top(self, params: FilterParams) -> List[CostTopUser]:
        where, bind = apply_filters(params)

        rows = await self.db.fetch_all(f"""
            SELECT ak.user_id, u.email, u.first_name, u.last_name,
                   COALESCE(SUM(ul.total_cost), 0) as total_cost,
                   COUNT(*) as request_count,
                   COALESCE(SUM(ul.total_tokens), 0) as total_tokens
            FROM usage_logs ul
            LEFT JOIN api_keys ak ON ul.api_key_id = ak.id
            LEFT JOIN users u ON ak.user_id = u.id
            WHERE {where}
            GROUP BY ak.user_id
            ORDER BY total_cost DESC
            LIMIT 20
        """, bind)

        return [
            CostTopUser(
                user_id=r["user_id"],
                email=r["email"],
                name=(r["first_name"] or "") + " " + (r["last_name"] or ""),
                total_cost=float(r["total_cost"] or 0),
                request_count=r["request_count"],
                total_tokens=r["total_tokens"],
            )
            for r in rows
        ]

    async def get_project_daily_cost(self, params: FilterParams) -> List[ProjectDailyCost]:
        trunc = date_trunc_expr(params.granularity)
        where, bind = apply_filters(params)

        rows = await self.db.fetch_all(f"""
            SELECT {trunc} as date, ul.project_id, p.name as project_name,
                   COALESCE(SUM(ul.total_cost), 0) as total_cost
            FROM usage_logs ul
            LEFT JOIN projects p ON ul.project_id = p.id
            WHERE {where}
            GROUP BY {trunc}, ul.project_id
            ORDER BY date, ul.project_id
        """, bind)

        return [
            ProjectDailyCost(
                date=str(r["date"]),
                project_id=r["project_id"],
                project_name=r["project_name"],
                total_cost=float(r["total_cost"] or 0),
            )
            for r in rows
        ]

    async def get_cache_hit_rate(self, params: FilterParams) -> List[CacheHitRatePoint]:
        trunc = date_trunc_expr(params.granularity)
        where, bind = apply_filters(params)

        rows = await self.db.fetch_all(f"""
            SELECT {trunc} as date,
                   COALESCE(SUM(ul.prompt_tokens), 0) as prompt_tokens,
                   COALESCE(SUM(ul.prompt_cached_tokens), 0) as cached_tokens
            FROM usage_logs ul
            WHERE {where}
            GROUP BY {trunc}
            ORDER BY date
        """, bind)

        return [
            CacheHitRatePoint(
                date=str(r["date"]),
                prompt_tokens=r["prompt_tokens"],
                cached_tokens=r["cached_tokens"],
                cache_hit_pct=round(r["cached_tokens"] / r["prompt_tokens"] * 100, 2) if r["prompt_tokens"] > 0 else 0,
            )
            for r in rows
        ]

    async def get_reasoning_ratio(self, params: FilterParams) -> List[ReasoningRatioPoint]:
        trunc = date_trunc_expr(params.granularity)
        where, bind = apply_filters(params)

        rows = await self.db.fetch_all(f"""
            SELECT {trunc} as date,
                   COALESCE(SUM(ul.completion_tokens), 0) as completion_tokens,
                   COALESCE(SUM(ul.completion_reasoning_tokens), 0) as reasoning_tokens
            FROM usage_logs ul
            WHERE {where}
            GROUP BY {trunc}
            ORDER BY date
        """, bind)

        return [
            ReasoningRatioPoint(
                date=str(r["date"]),
                completion_tokens=r["completion_tokens"],
                reasoning_tokens=r["reasoning_tokens"],
                reasoning_pct=round(r["reasoning_tokens"] / r["completion_tokens"] * 100, 2) if r["completion_tokens"] > 0 else 0,
            )
            for r in rows
        ]

    async def get_forecast(self, params: FilterParams) -> List[ForecastPoint]:
        where, bind = apply_filters(params)

        rows = await self.db.fetch_all(f"""
            SELECT DATE(ul.created_at) as date,
                   COALESCE(SUM(ul.total_cost), 0) as total_cost
            FROM usage_logs ul
            WHERE {where}
            GROUP BY DATE(ul.created_at)
            ORDER BY date
        """, bind)

        if not rows or len(rows) < 2:
            return []

        points = [(str(r["date"]), float(r["total_cost"] or 0)) for r in rows]
        n = len(points)
        x = list(range(n))
        y = [p[1] for p in points]

        sum_x = sum(x)
        sum_y = sum(y)
        sum_xy = sum(x[i] * y[i] for i in range(n))
        sum_xx = sum(xi * xi for xi in x)

        slope = (n * sum_xy - sum_x * sum_y) / (n * sum_xx - sum_x * sum_x)
        intercept = (sum_y - slope * sum_x) / n

        result = [ForecastPoint(date=p[0], actual=p[1], forecast=None) for p in points]

        try:
            last_dt = datetime.strptime(points[-1][0], "%Y-%m-%d")
        except ValueError:
            last_dt = datetime.now()

        for i in range(1, 8):
            fdate = (last_dt + timedelta(days=i)).strftime("%Y-%m-%d")
            fvalue = round(slope * (n + i - 1) + intercept, 4)
            result.append(ForecastPoint(date=fdate, actual=None, forecast=max(fvalue, 0)))

        return result
