from typing import List
from databases import Database
from app.database import get_db
from app.models.overview import OverviewKPI, TrendPoint, TokenTrendPoint, ModelDistItem, ErrorTrendPoint
from app.services.base import FilterParams, date_trunc_expr, apply_filters


class OverviewService:
    def __init__(self, db: Database):
        self.db = db

    async def get_kpi(self, params: FilterParams) -> OverviewKPI:
        where, bind = apply_filters(params)

        # Build today_where with manual filter injection (avoids double-binding issues)
        today_parts = ["DATE(ul.created_at) = CURDATE()"]
        today_bind = {}
        if params.channel_ids:
            cids = ", ".join([str(c) for c in params.channel_ids])
            today_parts.append(f"ul.channel_id IN ({cids})")
        if params.model_ids:
            mids = ", ".join([f"'{m}'" for m in params.model_ids])
            today_parts.append(f"ul.model_id IN ({mids})")
        if params.user_ids:
            uid_placeholders = ", ".join([f":tuid_{i}" for i in range(len(params.user_ids))])
            today_parts.append(f"ul.api_key_id IN (SELECT id FROM api_keys WHERE user_id IN ({uid_placeholders}))")
            for i, uid in enumerate(params.user_ids):
                today_bind[f"tuid_{i}"] = uid

        today_where = " AND ".join(today_parts)

        # 30-day KPI with requests join for success rate + latency
        where_30d = f"ul.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)"

        today_row = await self.db.fetch_one(f"""
            SELECT
                COUNT(*) as today_requests,
                COUNT(DISTINCT ak.user_id) as dau,
                COALESCE(SUM(ul.total_cost), 0) as today_cost
            FROM usage_logs ul
            LEFT JOIN api_keys ak ON ul.api_key_id = ak.id
            WHERE {today_where}
        """, today_bind)

        total_row = await self.db.fetch_one(f"""
            SELECT
                COUNT(*) as total_requests_30d,
                COALESCE(AVG(r.metrics_latency_ms), 0) as avg_latency_ms,
                CASE WHEN COUNT(*) > 0
                    THEN COALESCE(SUM(CASE WHEN r.status = 'completed' THEN 1 ELSE 0 END) / COUNT(*), 0)
                    ELSE 0 END as success_rate
            FROM usage_logs ul
            LEFT JOIN requests r ON ul.request_id = r.id
            WHERE {where_30d}
        """)

        return OverviewKPI(
            today_requests=today_row["today_requests"] or 0,
            dau=today_row["dau"] or 0,
            success_rate=float(total_row["success_rate"] or 0),
            today_cost=float(today_row["today_cost"] or 0),
            total_requests_30d=total_row["total_requests_30d"] or 0,
            avg_latency_ms=float(total_row["avg_latency_ms"] or 0),
        )

    async def get_requests_trend(self, params: FilterParams) -> List[TrendPoint]:
        trunc = date_trunc_expr(params.granularity)
        where, bind = apply_filters(params)

        rows = await self.db.fetch_all(f"""
            SELECT {trunc} as date, COUNT(*) as value
            FROM usage_logs ul
            WHERE {where}
            GROUP BY {trunc}
            ORDER BY date ASC
        """, bind)

        return [TrendPoint(date=str(r["date"]), value=r["value"]) for r in rows]

    async def get_token_trend(self, params: FilterParams) -> List[TokenTrendPoint]:
        trunc = date_trunc_expr(params.granularity)
        where, bind = apply_filters(params)

        rows = await self.db.fetch_all(f"""
            SELECT {trunc} as date,
                   COALESCE(SUM(prompt_tokens), 0) as prompt_tokens,
                   COALESCE(SUM(completion_tokens), 0) as completion_tokens
            FROM usage_logs ul
            WHERE {where}
            GROUP BY {trunc}
            ORDER BY date ASC
        """, bind)

        return [TokenTrendPoint(date=str(r["date"]), prompt_tokens=float(r["prompt_tokens"]), completion_tokens=float(r["completion_tokens"])) for r in rows]

    async def get_model_distribution(self, params: FilterParams) -> List[ModelDistItem]:
        where, bind = apply_filters(params)

        total = await self.db.fetch_val(f"""
            SELECT COUNT(*) FROM usage_logs ul WHERE {where}
        """, bind)

        if not total:
            return []

        rows = await self.db.fetch_all(f"""
            SELECT model_id, COUNT(*) as request_count
            FROM usage_logs ul
            WHERE {where}
            GROUP BY model_id
            ORDER BY request_count DESC
        """, bind)

        return [
            ModelDistItem(
                model_id=r["model_id"],
                request_count=r["request_count"],
                percentage=round(r["request_count"] / total * 100, 2),
            )
            for r in rows
        ]

    async def get_error_trend(self, params: FilterParams) -> List[ErrorTrendPoint]:
        trunc = date_trunc_expr(params.granularity)
        where, bind = apply_filters(params)

        rows = await self.db.fetch_all(f"""
            SELECT {trunc} as date,
                   COUNT(*) as total_count,
                   SUM(CASE WHEN r.status = 'failed' OR r.status = 'canceled' THEN 1 ELSE 0 END) as error_count
            FROM usage_logs ul
            LEFT JOIN requests r ON ul.request_id = r.id
            WHERE {where}
            GROUP BY {trunc}
            ORDER BY date ASC
        """, bind)

        return [
            ErrorTrendPoint(
                date=str(r["date"]),
                error_count=r["error_count"],
                total_count=r["total_count"],
                error_rate=round(r["error_count"] / r["total_count"] * 100, 2) if r["total_count"] > 0 else 0,
            )
            for r in rows
        ]
