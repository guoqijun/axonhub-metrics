from typing import List
from databases import Database
from app.database import get_db
from app.models.adoption import (
    DAUMauPoint, UsageRatio, ChannelActiveUsers,
    ModelUserCount, ActivityHeatmapPoint, ProjectRanking, UserPenetration,
    OrgUserDistribution,
)
from app.models.overview import TrendPoint
from app.services.base import FilterParams, date_trunc_expr, apply_filters


class AdoptionService:
    def __init__(self, db: Database):
        self.db = db

    async def get_dau_mau_trend(self, params: FilterParams) -> List[DAUMauPoint]:
        trunc = date_trunc_expr(params.granularity)
        where, bind = apply_filters(params)

        # Compute both DAU and MAU from usage_logs via employee_id
        # For daily granularity: dau=per-day, mau=rolling 30d
        # For monthly granularity: only mau=per-month
        if params.granularity == "month":
            rows = await self.db.fetch_all(f"""
                SELECT DATE_FORMAT(ul.created_at, '%Y-%m-01') as date,
                       0 as dau,
                       COUNT(DISTINCT ak.employee_id) as mau
                FROM usage_logs ul
                LEFT JOIN api_keys ak ON ul.api_key_id = ak.id
                WHERE {where}
                GROUP BY DATE_FORMAT(ul.created_at, '%Y-%m-01')
                ORDER BY date
            """, bind)
        else:
            rows = await self.db.fetch_all(f"""
                SELECT {trunc} as date,
                       COUNT(DISTINCT ak.employee_id) as dau,
                       0 as mau
                FROM usage_logs ul
                LEFT JOIN api_keys ak ON ul.api_key_id = ak.id
                WHERE {where}
                GROUP BY {trunc}
                ORDER BY date
            """, bind)

        return [DAUMauPoint(date=str(r["date"]), dau=r["dau"], mau=r["mau"]) for r in rows]

    async def get_usage_ratio(self, params: FilterParams) -> UsageRatio:
        where, bind = apply_filters(params)

        active = await self.db.fetch_val(f"""
            SELECT COUNT(DISTINCT ak.employee_id) FROM usage_logs ul
            LEFT JOIN api_keys ak ON ul.api_key_id = ak.id
            WHERE {where}
        """, bind)

        total = await self.db.fetch_val("""
            SELECT COUNT(DISTINCT employee_id) FROM api_keys
            WHERE employee_id IS NOT NULL
        """)

        active_users = active or 0
        total_users = total or 0
        ratio = round(active_users / total_users, 4) if total_users > 0 else 0.0

        return UsageRatio(active_users=active_users, total_users=total_users, ratio=ratio)

    async def get_new_user_trend(self, params: FilterParams) -> List[TrendPoint]:
        trunc = date_trunc_expr(params.granularity, column="first_seen")

        conditions = []
        bind = {}
        if params.start_date:
            conditions.append("DATE(first_seen) >= :start_date")
            bind["start_date"] = params.start_date
        if params.end_date:
            conditions.append("DATE(first_seen) <= :end_date")
            bind["end_date"] = params.end_date

        where = " AND ".join(conditions) if conditions else "1=1"

        rows = await self.db.fetch_all(f"""
            SELECT {trunc} as date, COUNT(*) as value
            FROM (
                SELECT ak.employee_id, MIN(ul.created_at) as first_seen
                FROM usage_logs ul
                LEFT JOIN api_keys ak ON ul.api_key_id = ak.id
                WHERE ak.employee_id IS NOT NULL
                GROUP BY ak.employee_id
            ) t
            WHERE {where}
            GROUP BY {trunc}
            ORDER BY date
        """, bind)

        return [TrendPoint(date=str(r["date"]), value=r["value"]) for r in rows]

    async def get_channel_active_users(self, params: FilterParams) -> List[ChannelActiveUsers]:
        where, bind = apply_filters(params)

        rows = await self.db.fetch_all(f"""
            SELECT ul.channel_id, c.name as channel_name,
                   COUNT(DISTINCT ak.employee_id) as active_users
            FROM usage_logs ul
            LEFT JOIN api_keys ak ON ul.api_key_id = ak.id
            LEFT JOIN channels c ON ul.channel_id = c.id
            WHERE {where}
            GROUP BY ul.channel_id
            ORDER BY active_users DESC
        """, bind)

        return [
            ChannelActiveUsers(
                channel_id=r["channel_id"],
                channel_name=r["channel_name"],
                active_users=r["active_users"],
            )
            for r in rows
        ]

    async def get_model_user_count(self, params: FilterParams) -> List[ModelUserCount]:
        where, bind = apply_filters(params)

        rows = await self.db.fetch_all(f"""
            SELECT ul.model_id, COUNT(DISTINCT ak.employee_id) as user_count
            FROM usage_logs ul
            LEFT JOIN api_keys ak ON ul.api_key_id = ak.id
            WHERE {where}
            GROUP BY ul.model_id
            ORDER BY user_count DESC
        """, bind)

        return [ModelUserCount(model_id=r["model_id"], user_count=r["user_count"]) for r in rows]

    async def get_activity_heatmap(self, params: FilterParams) -> List[ActivityHeatmapPoint]:
        where, bind = apply_filters(params)

        rows = await self.db.fetch_all(f"""
            SELECT DAYOFWEEK(ul.created_at) as day_of_week,
                   HOUR(ul.created_at) as hour,
                   COUNT(DISTINCT ak.employee_id) as user_count
            FROM usage_logs ul
            LEFT JOIN api_keys ak ON ul.api_key_id = ak.id
            WHERE {where}
            GROUP BY DAYOFWEEK(ul.created_at), HOUR(ul.created_at)
            ORDER BY day_of_week, hour
        """, bind)

        return [
            ActivityHeatmapPoint(
                day_of_week=r["day_of_week"],
                hour=r["hour"],
                user_count=r["user_count"],
            )
            for r in rows
        ]

    async def get_project_ranking(self, params: FilterParams) -> List[ProjectRanking]:
        where, bind = apply_filters(params)

        rows = await self.db.fetch_all(f"""
            SELECT ul.project_id, p.name as project_name,
                   COUNT(*) as request_count,
                   COUNT(DISTINCT ak.employee_id) as user_count
            FROM usage_logs ul
            LEFT JOIN api_keys ak ON ul.api_key_id = ak.id
            LEFT JOIN projects p ON ul.project_id = p.id
            WHERE {where}
            GROUP BY ul.project_id
            ORDER BY request_count DESC
            LIMIT 20
        """, bind)

        return [
            ProjectRanking(
                project_id=r["project_id"],
                project_name=r["project_name"],
                request_count=r["request_count"],
                user_count=r["user_count"],
            )
            for r in rows
        ]

    async def get_user_penetration(self, params: FilterParams) -> UserPenetration:
        where, bind = apply_filters(params)

        heavy = await self.db.fetch_val(f"""
            SELECT COUNT(*) FROM (
                SELECT ak.employee_id
                FROM usage_logs ul
                LEFT JOIN api_keys ak ON ul.api_key_id = ak.id
                WHERE {where} AND ak.employee_id IS NOT NULL
                GROUP BY ak.employee_id
                HAVING COUNT(DISTINCT DATE(ul.created_at)) > 5
            ) t
        """, bind)

        total = await self.db.fetch_val("""
            SELECT COUNT(DISTINCT employee_id) FROM api_keys
            WHERE employee_id IS NOT NULL
        """)

        heavy_users = heavy or 0
        total_users = total or 0
        rate = round(heavy_users / total_users, 4) if total_users > 0 else 0.0

        return UserPenetration(
            heavy_users=heavy_users,
            total_users=total_users,
            penetration_rate=rate,
        )

    async def get_org_user_distribution(self, params: FilterParams) -> List[OrgUserDistribution]:
        where, bind = apply_filters(params)

        rows = await self.db.fetch_all(f"""
            SELECT ak.employee_org_name,
                   COUNT(DISTINCT ak.employee_id) as user_count
            FROM usage_logs ul
            LEFT JOIN api_keys ak ON ul.api_key_id = ak.id
            WHERE {where} AND ak.employee_org_name IS NOT NULL
            GROUP BY ak.employee_org_name
            ORDER BY user_count DESC
        """, bind)

        return [
            OrgUserDistribution(
                employee_org_name=r["employee_org_name"],
                user_count=r["user_count"],
            )
            for r in rows
        ]
