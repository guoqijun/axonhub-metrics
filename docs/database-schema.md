# 数据库 Schema 文档

系统使用 MySQL 数据库，核心表通过 `usage_logs` 关联多个维度表。

## 核心表

### usage_logs — AI API 使用记录

系统最核心的表，记录每一次 API 调用的完整信息。

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | BIGINT PK | 主键 |
| `request_id` | BIGINT | 关联 requests 表 |
| `api_key_id` | INT | 关联 api_keys 表 |
| `channel_id` | INT | 关联 channels 表 |
| `project_id` | INT | 关联 projects 表 |
| `model_id` | VARCHAR | 模型标识 (如 `gpt-4`, `gpt-3.5-turbo`) |
| `prompt_tokens` | INT | Prompt Token 数 |
| `completion_tokens` | INT | Completion Token 数 |
| `total_tokens` | INT | 总 Token 数 |
| `prompt_cached_tokens` | INT | 缓存的 Prompt Token 数 |
| `completion_reasoning_tokens` | INT | 推理 Token 数 |
| `total_cost` | DECIMAL | 本次调用费用 |
| `created_at` | DATETIME | 创建时间 |

**查询模式:**
- 按时间聚合: `DATE(created_at)`, `WEEK(created_at)`, `DATE_FORMAT(created_at, '%Y-%m-01')`
- 按维度聚合: `channel_id`, `model_id`, `project_id`
- 关联用户: `api_key_id → api_keys.user_id`

**常见 JOIN:**
- `usage_logs LEFT JOIN requests ON usage_logs.request_id = requests.id`
- `usage_logs LEFT JOIN api_keys ON usage_logs.api_key_id = api_keys.id`
- `usage_logs LEFT JOIN channels ON usage_logs.channel_id = channels.id`
- `usage_logs LEFT JOIN projects ON usage_logs.project_id = projects.id`

---

### requests — 请求详情

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | BIGINT PK | 主键 (关联 usage_logs.request_id) |
| `trace_id` | VARCHAR | 追踪 ID (同一会话/对话的多个请求共享) |
| `model_id` | VARCHAR | 模型标识 |
| `status` | VARCHAR | 状态: `completed` / `failed` / `canceled` |
| `stream` | BOOLEAN | 是否流式请求 |
| `metrics_latency_ms` | INT | 延迟 (毫秒) |
| `created_at` | DATETIME | 创建时间 |

**查询模式:**
- 错误分析: `WHERE status IN ('failed', 'canceled')`
- 延迟分析: `metrics_latency_ms` 的百分位计算
- 会话分析: `trace_id` GROUP BY 计算对话轮次、会话时长

---

### api_keys — API Key 与用户映射

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | INT PK | 主键 (关联 usage_logs.api_key_id) |
| `user_id` | INT | 关联 users 表 |

---

### users — 用户表

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | INT PK | 主键 |
| `email` | VARCHAR | 邮箱 |
| `first_name` | VARCHAR | 名 |
| `last_name` | VARCHAR | 姓 |
| `status` | VARCHAR | 状态: `activated` 等 |
| `deleted_at` | INT | 软删除标记 (0=未删除) |
| `created_at` | DATETIME | 注册时间 |

**查询模式:**
- 活跃用户: `WHERE deleted_at = 0 AND status = 'activated'`
- 用户排行: 通过 `api_keys` 关联到 `usage_logs`

---

## 维度表

### channels — 渠道配置

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | INT PK | 主键 |
| `name` | VARCHAR | 渠道名称 (如 `OpenAI`, `Azure`) |
| `type` | VARCHAR | 渠道类型 (如 `direct`, `proxy`) |

---

### projects — 项目信息

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | INT PK | 主键 |
| `name` | VARCHAR | 项目名称 |

---

## 管理表

### admin_users — 管理员账号

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | INT PK | 主键 |
| `username` | VARCHAR | 用户名 |
| `password_hash` | VARCHAR | bcrypt 密码哈希 |

---

## 扩展表 (可能存在)

### provider_quota_status — 供应商配额状态

从 `channels` 服务的 `get_quota_status` 和 `health` 服务的 `get_quota_alert_list` 中引用。

| 字段 | 类型 | 说明 |
|------|------|------|
| `channel_id` | INT | 关联 channels 表 |
| `provider_type` | VARCHAR | 供应商类型 |
| `status` | VARCHAR | 状态: `active` / `warning` / `exhausted` |
| `ready` | BOOLEAN | 是否可用 |
| `next_reset_at` | DATETIME | 下次配额重置时间 |
| `next_check_at` | DATETIME | 下次检查时间 |

### channel_probes — 渠道探针性能

从 `health` 服务的 `get_probe_trend` 中引用。

| 字段 | 类型 | 说明 |
|------|------|------|
| `channel_id` | INT | 关联 channels 表 |
| `timestamp` | INT | UNIX 时间戳 |
| `avg_tokens_per_second` | DECIMAL | 平均每秒 Token 数 |
| `avg_time_to_first_token_ms` | DECIMAL | 平均首 Token 延迟 (ms) |
| `total_request_count` | INT | 请求总数 |

---

## 实体关系图 (文本版)

```
users ──< api_keys ──< usage_logs >── requests
                            │
                     ┌──────┼──────┐
                     │      │      │
                  channels  projects  models
                                    (denormalized)
```

说明:
- `──<` 表示一对多关系
- `>──` 表示多对一关系
- `models` 作为 `usage_logs.model_id` 字段去重查询，无独立表

## 常用查询模式

### 按时间聚合
```sql
-- 按日
SELECT DATE(ul.created_at) as date, COUNT(*) as count
FROM usage_logs ul WHERE ... GROUP BY DATE(ul.created_at)

-- 按周
SELECT DATE_SUB(DATE(ul.created_at), INTERVAL WEEKDAY(ul.created_at) DAY) as week_start

-- 按月
SELECT DATE_FORMAT(ul.created_at, '%Y-%m-01') as month
```

### 关联用户
```sql
SELECT COUNT(DISTINCT ak.user_id)
FROM usage_logs ul
LEFT JOIN api_keys ak ON ul.api_key_id = ak.id
WHERE ...
```

### 错误统计
```sql
SUM(CASE WHEN r.status IN ('failed', 'canceled') THEN 1 ELSE 0 END) as error_count
```

### 百分位延迟
```sql
WITH ranked AS (
    SELECT r.metrics_latency_ms,
           ROW_NUMBER() OVER (ORDER BY r.metrics_latency_ms) AS rn,
           COUNT(*) OVER () AS cnt
    FROM ...
)
SELECT MAX(CASE WHEN rn / cnt <= 0.95 THEN metrics_latency_ms END) AS p95
```
