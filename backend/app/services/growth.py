from typing import List, Optional
from datetime import datetime
from databases import Database
from app.database import get_db
from app.models.growth import (
    MomYoyPoint, GrowthForecastPoint, UserGrowthPoint,
    ModelGrowthRate, ChannelMarketShare, ProjectGrowthRanking,
)
from app.services.base import FilterParams, date_trunc_expr, apply_filters


class GrowthService:
    def __init__(self, db: Database):
        self.db = db

    async def get_mom_yoy(self, params: FilterParams) -> List[MomYoyPoint]:
        where, bind = apply_filters(params)

        rows = await self.db.fetch_all(f"""
            SELECT DATE_FORMAT(ul.created_at, '%Y-%m') as month,
                   COUNT(*) as request_count,
                   COUNT(DISTINCT ak.user_id) as user_count,
                   COALESCE(SUM(ul.total_tokens), 0) as total_tokens,
                   COALESCE(SUM(ul.total_cost), 0) as total_cost
            FROM usage_logs ul
            LEFT JOIN api_keys ak ON ul.api_key_id = ak.id
            WHERE {where}
            GROUP BY month
            ORDER BY month
        """, bind)

        result = []
        prev = None
        for r in rows:
            cur = dict(r)
            cur["request_count"] = int(cur["request_count"])
            cur["user_count"] = int(cur["user_count"])
            cur["total_tokens"] = int(cur["total_tokens"])
            cur["total_cost"] = float(cur["total_cost"] or 0)

            if prev:
                req_growth = ((cur["request_count"] - prev["request_count"]) / prev["request_count"] * 100) if prev["request_count"] > 0 else 0
                user_growth = ((cur["user_count"] - prev["user_count"]) / prev["user_count"] * 100) if prev["user_count"] > 0 else 0
                token_growth = ((cur["total_tokens"] - prev["total_tokens"]) / prev["total_tokens"] * 100) if prev["total_tokens"] > 0 else 0
                cost_growth = ((cur["total_cost"] - prev["total_cost"]) / prev["total_cost"] * 100) if prev["total_cost"] > 0 else 0
            else:
                req_growth = user_growth = token_growth = cost_growth = 0.0

            point = MomYoyPoint(
                month=cur["month"],
                request_count=cur["request_count"],
                request_growth_pct=round(req_growth, 2),
                user_count=cur["user_count"],
                user_growth_pct=round(user_growth, 2),
                total_tokens=cur["total_tokens"],
                token_growth_pct=round(token_growth, 2),
                total_cost=cur["total_cost"],
                cost_growth_pct=round(cost_growth, 2),
            )
            result.append(point)
            prev = cur

        return result

    async def get_forecast(self, params: FilterParams) -> List[GrowthForecastPoint]:
        trunc = date_trunc_expr(params.granularity)
        where, bind = apply_filters(params)

        rows = await self.db.fetch_all(f"""
            SELECT {trunc} as date,
                   COUNT(*) as request_count,
                   COUNT(DISTINCT ak.user_id) as user_count
            FROM usage_logs ul
            LEFT JOIN api_keys ak ON ul.api_key_id = ak.id
            WHERE {where}
            GROUP BY {trunc}
            ORDER BY date
        """, bind)

        points = [(str(r["date"]), r["request_count"], r["user_count"]) for r in rows]
        result = []

        for metric_name, idx in [("requests", 1), ("users", 2)]:
            values = [p[idx] for p in points]
            actual_values = [v for v in values if v is not None and v > 0]

            forecast_val = None
            if len(actual_values) >= 3:
                window = actual_values[-3:]
                avg_growth = sum(window[i] - window[i - 1] for i in range(1, len(window))) / len(window)
                forecast_val = max(0, int(values[-1] + avg_growth)) if values[-1] else None

            for i, (dt, *_) in enumerate(points):
                result.append(GrowthForecastPoint(
                    date=dt,
                    metric=metric_name,
                    actual=float(values[i]) if values[i] else None,
                    forecast=None,
                ))

            if forecast_val is not None and points:
                last_date = points[-1][0]
                result.append(GrowthForecastPoint(
                    date=last_date,
                    metric=metric_name,
                    actual=None,
                    forecast=float(forecast_val),
                ))

        return result

    async def get_user_growth_curve(self, params: FilterParams) -> List[UserGrowthPoint]:
        where, bind = apply_filters(params)

        rows = await self.db.fetch_all(f"""
            SELECT DATE(ul.created_at) as date,
                   COUNT(DISTINCT ak.user_id) as new_users
            FROM usage_logs ul
            LEFT JOIN api_keys ak ON ul.api_key_id = ak.id
            WHERE {where}
            GROUP BY DATE(ul.created_at)
            ORDER BY date
        """, bind)

        cumulative = 0
        return [
            UserGrowthPoint(
                date=str(r["date"]),
                new_users=r["new_users"],
                cumulative_users=(cumulative := cumulative + r["new_users"]),
            )
            for r in rows
        ]

    async def get_model_growth_rate(self, params: FilterParams) -> List[ModelGrowthRate]:
        where, bind = apply_filters(params)

        rows = await self.db.fetch_all(f"""
            SELECT DATE_FORMAT(ul.created_at, '%Y-%m') as month,
                   ul.model_id,
                   COUNT(*) as request_count
            FROM usage_logs ul
            WHERE {where}
            GROUP BY month, ul.model_id
            ORDER BY month, ul.model_id
        """, bind)

        return [
            ModelGrowthRate(
                model_id=r["model_id"],
                month=r["month"],
                request_count=r["request_count"],
            )
            for r in rows
        ]

    async def get_channel_market_share(self, params: FilterParams) -> List[ChannelMarketShare]:
        where, bind = apply_filters(params)

        rows = await self.db.fetch_all(f"""
            SELECT DATE_FORMAT(ul.created_at, '%Y-%m') as month,
                   ul.channel_id, c.name as channel_name,
                   COUNT(*) as request_count
            FROM usage_logs ul
            LEFT JOIN channels c ON ul.channel_id = c.id
            WHERE {where}
            GROUP BY month, ul.channel_id
            ORDER BY month, request_count DESC
        """, bind)

        month_totals: dict = {}
        for r in rows:
            m = r["month"]
            month_totals[m] = month_totals.get(m, 0) + r["request_count"]

        return [
            ChannelMarketShare(
                month=r["month"],
                channel_id=r["channel_id"],
                channel_name=r["channel_name"],
                request_count=r["request_count"],
                share_pct=round(r["request_count"] / month_totals.get(r["month"], 1) * 100, 2),
            )
            for r in rows
        ]

    async def get_project_growth_ranking(self, params: FilterParams) -> List[ProjectGrowthRanking]:
        where, bind = apply_filters(params)

        rows = await self.db.fetch_all(f"""
            SELECT ul.project_id, p.name as project_name,
                   COUNT(*) as request_count,
                   COUNT(DISTINCT ak.user_id) as user_count
            FROM usage_logs ul
            LEFT JOIN projects p ON ul.project_id = p.id
            LEFT JOIN api_keys ak ON ul.api_key_id = ak.id
            WHERE {where}
            GROUP BY ul.project_id
            ORDER BY request_count DESC
        """, bind)

        return [
            ProjectGrowthRanking(
                project_id=r["project_id"],
                project_name=r["project_name"],
                request_count=r["request_count"],
                user_count=r["user_count"],
            )
            for r in rows
        ]
