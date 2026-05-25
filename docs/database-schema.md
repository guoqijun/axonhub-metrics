# 数据库 Schema 文档

系统使用 MySQL 数据库，核心表通过 `usage_logs` 关联多个维度表。

> 以下 Schema 基于 `axonhub` 库本地实时导出。

---

## 核心表

### usage_logs — AI API 使用记录（核心事实表）

系统最核心的表，记录每一次 API 调用的用量与费用明细。所有指标查询最终都聚合此表。

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | BIGINT PK | 主键 |
| `request_id` | BIGINT | 关联 requests 表 |
| `api_key_id` | BIGINT | 关联 api_keys 表 |
| `channel_id` | BIGINT | 渠道 ID |
| `project_id` | BIGINT NOT NULL DEFAULT 1 | 项目 ID |
| `model_id` | VARCHAR(255) | 模型标识 (如 `gpt-4`, `claude-sonnet-4`) |
| `source` | ENUM('api','playground','test') | 请求来源 |
| `format` | VARCHAR(255) | 请求格式 (如 `openai/chat_completions`) |
| `prompt_tokens` | BIGINT DEFAULT 0 | Prompt Token 数 |
| `completion_tokens` | BIGINT DEFAULT 0 | Completion Token 数 |
| `total_tokens` | BIGINT DEFAULT 0 | 总 Token 数 |
| `prompt_audio_tokens` | BIGINT DEFAULT 0 | 音频 Prompt Token |
| `prompt_cached_tokens` | BIGINT DEFAULT 0 | 缓存命中 Prompt Token |
| `prompt_write_cached_tokens` | BIGINT DEFAULT 0 | 写缓存 Token |
| `prompt_write_cached_tokens_5m` | BIGINT DEFAULT 0 | 5 分钟写缓存 |
| `prompt_write_cached_tokens_1h` | BIGINT DEFAULT 0 | 1 小时写缓存 |
| `completion_audio_tokens` | BIGINT DEFAULT 0 | 音频 Completion Token |
| `completion_reasoning_tokens` | BIGINT DEFAULT 0 | 推理 Token |
| `completion_accepted_prediction_tokens` | BIGINT DEFAULT 0 | 接受的预测 Token |
| `completion_rejected_prediction_tokens` | BIGINT DEFAULT 0 | 拒绝的预测 Token |
| `total_cost` | DOUBLE | 本次调用费用（美元） |
| `cost_items` | JSON | 费用明细 |
| `cost_price_reference_id` | VARCHAR(255) | 计价参考 ID |
| `created_at` | TIMESTAMP DEFAULT NOW() | 创建时间 |
| `updated_at` | TIMESTAMP DEFAULT NOW() | 更新时间 |

**索引:**
- `usage_logs_by_request_id` (`request_id`)
- `usage_logs_by_created_at` (`created_at`)
- `usage_logs_by_model_id_created_at` (`model_id`, `created_at`)
- `usage_logs_by_project_id_created_at` (`project_id`, `created_at`)
- `usage_logs_by_channel_id_created_at` (`channel_id`, `created_at`)
- `usage_logs_by_api_key_id_created_at` (`api_key_id`, `created_at`)

**查询模式：**
- 按时间聚合: `DATE(created_at)`, `DATE_FORMAT(created_at, '%Y-%m-01')`
- 按维度聚合: `channel_id`, `model_id`, `project_id`
- 关联用户: `api_key_id → api_keys.id` → `api_keys.employee_id`
- 关联请求详情: `request_id → requests.id`
- Token 使用: `SUM(prompt_tokens)`, `SUM(completion_tokens)`
- 费用统计: `SUM(total_cost)`
- 缓存命中: `SUM(prompt_cached_tokens) / SUM(prompt_tokens)`

---

### requests — 请求详情

记录每次 API 请求的元数据，包括状态、延迟、来源等。与 `usage_logs` 一对一关联。

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | BIGINT PK | 主键（关联 usage_logs.request_id） |
| `trace_id` | BIGINT | 追踪 ID（同一会话共享） |
| `api_key_id` | BIGINT | 关联 api_keys 表 |
| `channel_id` | BIGINT | 渠道 ID |
| `project_id` | BIGINT NOT NULL DEFAULT 1 | 项目 ID |
| `model_id` | VARCHAR(255) | 模型标识 |
| `source` | ENUM('api','playground','test') | 请求来源 |
| `format` | VARCHAR(255) | 请求格式 |
| `status` | ENUM('pending','processing','completed','failed','canceled') | 请求状态 |
| `stream` | TINYINT(1) DEFAULT 0 | 是否流式请求 |
| `reasoning_effort` | VARCHAR(255) | 推理努力级别 |
| `external_id` | VARCHAR(512) | 外部 ID |
| `request_headers` | JSON | 请求头 |
| `request_body` | JSON | 请求体 |
| `response_body` | JSON | 响应体 |
| `response_chunks` | JSON | 流式响应块 |
| `client_ip` | VARCHAR(255) | 客户端 IP |
| `content_saved` | TINYINT(1) DEFAULT 0 | 是否保存内容 |
| `content_storage_id` | BIGINT | 内容存储 ID |
| `content_storage_key` | VARCHAR(255) | 内容存储 Key |
| `content_saved_at` | TIMESTAMP | 内容保存时间 |
| `data_storage_id` | BIGINT | 数据存储 ID |
| `metrics_latency_ms` | BIGINT | 总延迟（毫秒） |
| `metrics_first_token_latency_ms` | BIGINT | 首 Token 延迟（毫秒） |
| `metrics_reasoning_duration_ms` | BIGINT | 推理耗时（毫秒） |
| `created_at` | TIMESTAMP DEFAULT NOW() | 创建时间 |
| `updated_at` | TIMESTAMP DEFAULT NOW() | 更新时间 |

**索引:**
- `requests_by_api_key_id_created_at` (`api_key_id`, `created_at`)
- `requests_by_project_id_created_at` (`project_id`, `created_at`)
- `requests_by_channel_id_created_at` (`channel_id`, `created_at`)
- `requests_by_trace_id_created_at` (`trace_id`, `created_at`)
- `requests_by_created_at` (`created_at`)

**查询模式：**
- 错误分析: `WHERE status IN ('failed', 'canceled')`
- 延迟分析: `metrics_latency_ms` 的百分位计算
- 会话分析: 通过 `trace_id` GROUP BY 计算对话轮次、会话时长

---

### api_keys — API Key 与用户映射

平台用户身份信息存储在此表。每个 API Key 对应一个外部用户（通过 `employee_id` 标识），是用户统计的核心来源。

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | BIGINT PK | 主键（关联 usage_logs.api_key_id） |
| `key` | VARCHAR(255) UNIQUE | API Key 值 |
| `name` | VARCHAR(255) | Key 名称 |
| `type` | ENUM('user','service_account','noauth') | Key 类型 |
| `status` | ENUM('enabled','disabled','archived') | 状态 |
| `scopes` | JSON | 权限范围 |
| `employee_id` | VARCHAR(255) | **员工 ID（平台用户标识）** |
| `employee_name` | VARCHAR(255) | 员工姓名 |
| `employee_org_id` | VARCHAR(255) | 员工组织 ID |
| `employee_org_name` | VARCHAR(255) | 员工组织名称 |
| `profiles` | JSON | 配置文件 |
| `project_id` | BIGINT NOT NULL DEFAULT 1 | 项目 ID |
| `user_id` | BIGINT | 关联 users 表（系统用户） |
| `created_at` | TIMESTAMP DEFAULT NOW() | 创建时间 |
| `updated_at` | TIMESTAMP DEFAULT NOW() | 更新时间 |
| `deleted_at` | BIGINT DEFAULT 0 | 软删除标记 |

**索引:**
- `api_keys_by_key` (`key`) UNIQUE
- `api_keys_by_user_id` (`user_id`)
- `api_keys_by_project_id` (`project_id`)

**查询模式：**
- 用户去重统计: `COUNT(DISTINCT employee_id)`
- 用户信息关联: `LEFT JOIN api_keys ak ON ul.api_key_id = ak.id`
- 活跃用户: `WHERE employee_id IS NOT NULL`

---

## 维度表

### channels — 渠道配置

AI 服务提供商渠道配置，包含鉴权、模型支持、定价等信息。

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | BIGINT PK | 主键 |
| `type` | ENUM(...) | 渠道类型（支持 50+ 种，如 openai, anthropic, deepseek, gemini 等） |
| `name` | VARCHAR(255) UNIQUE | 渠道名称 |
| `status` | ENUM('enabled','disabled','archived') | 状态 |
| `base_url` | VARCHAR(255) | 代理 URL |
| `credentials` | JSON | 鉴证信息 |
| `disabled_api_keys` | JSON | 禁用 API Key 列表 |
| `supported_models` | JSON | 支持的模型列表 |
| `manual_models` | JSON | 手动添加模型 |
| `auto_sync_supported_models` | TINYINT(1) | 自动同步模型 |
| `auto_sync_model_pattern` | VARCHAR(255) | 模型同步匹配模式 |
| `default_test_model` | VARCHAR(255) | 默认测试模型 |
| `tags` | JSON | 标签 |
| `policies` | JSON | 策略配置 |
| `settings` | JSON | 设置 |
| `ordering_weight` | BIGINT DEFAULT 0 | 排序权重 |
| `error_message` | VARCHAR(255) | 错误信息 |
| `remark` | VARCHAR(255) | 备注 |
| `endpoints` | JSON | 端点配置 |
| `created_at` | TIMESTAMP DEFAULT NOW() | 创建时间 |
| `updated_at` | TIMESTAMP DEFAULT NOW() | 更新时间 |
| `deleted_at` | BIGINT DEFAULT 0 | 软删除标记 |

---

### projects — 项目信息

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | BIGINT PK | 主键 |
| `name` | VARCHAR(255) UNIQUE | 项目名称 |
| `description` | VARCHAR(255) | 描述 |
| `status` | ENUM('active','archived') | 状态 |
| `profiles` | JSON | 配置文件 |
| `created_at` | TIMESTAMP DEFAULT NOW() | 创建时间 |
| `updated_at` | TIMESTAMP DEFAULT NOW() | 更新时间 |
| `deleted_at` | BIGINT DEFAULT 0 | 软删除标记 |

---

### models — 模型信息

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | BIGINT PK | 主键 |
| `developer` | VARCHAR(255) | 开发商 |
| `model_id` | VARCHAR(255) UNIQUE | 模型标识（如 `gpt-4o`） |
| `type` | ENUM('chat','embedding','rerank','image_generation','video_generation') | 模型类型 |
| `name` | VARCHAR(255) UNIQUE | 显示名称 |
| `icon` | VARCHAR(255) | 图标 URL |
| `group` | VARCHAR(255) | 分组 |
| `model_card` | JSON | 模型信息卡 |
| `settings` | JSON | 设置 |
| `status` | ENUM('enabled','disabled','archived') | 状态 |
| `remark` | VARCHAR(255) | 备注 |
| `created_at` | TIMESTAMP DEFAULT NOW() | 创建时间 |
| `updated_at` | TIMESTAMP DEFAULT NOW() | 更新时间 |
| `deleted_at` | BIGINT DEFAULT 0 | 软删除标记 |

---

## 用户与权限表

### users — 系统用户

系统用户（登录用户），与 `api_keys.employee_id` 无关。

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | BIGINT PK | 主键 |
| `email` | VARCHAR(255) UNIQUE | 邮箱 |
| `password` | VARCHAR(255) | 密码 Hash |
| `first_name` | VARCHAR(255) | 名 |
| `last_name` | VARCHAR(255) | 姓 |
| `avatar` | MEDIUMTEXT | 头像 |
| `status` | ENUM('activated','deactivated') | 状态 |
| `prefer_language` | VARCHAR(255) | 偏好语言 |
| `is_owner` | TINYINT(1) DEFAULT 0 | 是否 Owner |
| `scopes` | JSON | 权限范围 |
| `created_at` | TIMESTAMP DEFAULT NOW() | 创建时间 |
| `updated_at` | TIMESTAMP DEFAULT NOW() | 更新时间 |
| `deleted_at` | BIGINT DEFAULT 0 | 软删除标记 |

### admin_users — 管理员账号

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | INT PK | 主键 |
| `username` | VARCHAR(255) UNIQUE | 用户名 |
| `password_hash` | VARCHAR(255) | 密码 Hash |
| `created_at` | TIMESTAMP DEFAULT NOW() | 创建时间 |

### roles — 角色定义

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | BIGINT PK | 主键 |
| `name` | VARCHAR(255) | 角色名称 |
| `level` | ENUM('system','project') | 角色级别 |
| `scopes` | JSON | 权限范围 |
| `project_id` | BIGINT | 项目 ID |
| `created_at` | TIMESTAMP DEFAULT NOW() | 创建时间 |
| `updated_at` | TIMESTAMP DEFAULT NOW() | 更新时间 |
| `deleted_at` | BIGINT DEFAULT 0 | 软删除标记 |

### user_roles — 用户角色关联

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | BIGINT PK | 主键 |
| `user_id` | BIGINT | 用户 ID |
| `role_id` | BIGINT | 角色 ID |
| `created_at` | TIMESTAMP DEFAULT NOW() | 创建时间 |
| `updated_at` | TIMESTAMP DEFAULT NOW() | 更新时间 |

### user_projects — 用户项目关联

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | BIGINT PK | 主键 |
| `user_id` | BIGINT | 用户 ID |
| `project_id` | BIGINT | 项目 ID |
| `is_owner` | TINYINT(1) DEFAULT 0 | 是否项目 Owner |
| `scopes` | JSON | 权限范围 |
| `created_at` | TIMESTAMP DEFAULT NOW() | 创建时间 |
| `updated_at` | TIMESTAMP DEFAULT NOW() | 更新时间 |

### oidc_identities — OIDC 身份

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | BIGINT PK | 主键 |
| `issuer` | VARCHAR(255) | 签发者 |
| `subject` | VARCHAR(255) | 主体 |
| `email` | VARCHAR(255) | 邮箱 |
| `idp_name` | VARCHAR(255) | IdP 名称 |
| `last_login_at` | TIMESTAMP | 最后登录时间 |
| `user_id` | BIGINT | 关联用户 |
| `created_at` | TIMESTAMP DEFAULT NOW() | 创建时间 |
| `updated_at` | TIMESTAMP DEFAULT NOW() | 更新时间 |
| `deleted_at` | BIGINT DEFAULT 0 | 软删除标记 |

---

## 计费与配额表

### channel_model_prices — 渠道模型定价

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | BIGINT PK | 主键 |
| `channel_id` | BIGINT | 渠道 ID |
| `model_id` | VARCHAR(255) | 模型 ID |
| `price` | JSON | 定价信息 |
| `reference_id` | VARCHAR(255) UNIQUE | 外部参考 ID |
| `created_at` | TIMESTAMP DEFAULT NOW() | 创建时间 |
| `updated_at` | TIMESTAMP DEFAULT NOW() | 更新时间 |
| `deleted_at` | BIGINT DEFAULT 0 | 软删除标记 |

### channel_model_price_versions — 定价版本历史

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | BIGINT PK | 主键 |
| `channel_id` | BIGINT | 渠道 ID |
| `model_id` | VARCHAR(255) | 模型 ID |
| `price` | JSON | 定价信息 |
| `status` | ENUM('active','archived') | 状态 |
| `effective_start_at` | TIMESTAMP | 生效时间 |
| `effective_end_at` | TIMESTAMP | 失效时间 |
| `reference_id` | VARCHAR(255) UNIQUE | 参考 ID |
| `channel_model_price_id` | BIGINT | 关联定价 ID |
| `created_at` | TIMESTAMP DEFAULT NOW() | 创建时间 |
| `updated_at` | TIMESTAMP DEFAULT NOW() | 更新时间 |

### provider_quota_status — 供应商配额状态

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | BIGINT PK | 主键 |
| `channel_id` | BIGINT UNIQUE | 渠道 ID |
| `provider_type` | ENUM('claudecode','codex','github_copilot','nanogpt','wafer','synthetic','neuralwatt') | 供应商类型 |
| `status` | ENUM('available','warning','exhausted','unknown') | 状态 |
| `quota_data` | JSON | 配额数据 |
| `next_reset_at` | TIMESTAMP | 下次重置时间 |
| `next_check_at` | TIMESTAMP | 下次检查时间 |
| `ready` | TINYINT(1) DEFAULT 1 | 是否可用 |
| `created_at` | TIMESTAMP DEFAULT NOW() | 创建时间 |
| `updated_at` | TIMESTAMP DEFAULT NOW() | 更新时间 |
| `deleted_at` | BIGINT DEFAULT 0 | 软删除标记 |

### channel_probes — 渠道探针性能

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | BIGINT PK | 主键 |
| `channel_id` | BIGINT | 渠道 ID |
| `timestamp` | BIGINT | UNIX 时间戳 |
| `total_request_count` | BIGINT | 请求总数 |
| `success_request_count` | BIGINT | 成功请求数 |
| `avg_tokens_per_second` | DOUBLE | 平均每秒 Token |
| `avg_time_to_first_token_ms` | DOUBLE | 平均首 Token 延迟 |

---

## 会话与追踪表

### traces — 追踪记录

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | BIGINT PK | 主键 |
| `trace_id` | VARCHAR(255) UNIQUE | 追踪 ID |
| `project_id` | BIGINT | 项目 ID |
| `thread_id` | BIGINT | 关联线程 |
| `created_at` | TIMESTAMP DEFAULT NOW() | 创建时间 |
| `updated_at` | TIMESTAMP DEFAULT NOW() | 更新时间 |

### threads — 对话线程

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | BIGINT PK | 主键 |
| `thread_id` | VARCHAR(255) UNIQUE | 线程 ID |
| `project_id` | BIGINT | 项目 ID |
| `created_at` | TIMESTAMP DEFAULT NOW() | 创建时间 |
| `updated_at` | TIMESTAMP DEFAULT NOW() | 更新时间 |

---

## Prompts 相关表

### prompts — 提示词模板

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | BIGINT PK | 主键 |
| `project_id` | BIGINT | 项目 ID |
| `name` | VARCHAR(255) | 提示词名称 |
| `description` | VARCHAR(255) | 描述 |
| `role` | VARCHAR(255) | 角色 |
| `content` | LONGTEXT | 提示词内容 |
| `status` | ENUM('enabled','disabled') | 状态 |
| `order` | BIGINT DEFAULT 0 | 排序 |
| `settings` | JSON | 设置 |
| `created_at` | TIMESTAMP DEFAULT NOW() | 创建时间 |
| `updated_at` | TIMESTAMP DEFAULT NOW() | 更新时间 |
| `deleted_at` | BIGINT DEFAULT 0 | 软删除标记 |

### project_prompts — 项目-提示词关联

| 字段 | 类型 | 说明 |
|------|------|------|
| `project_id` | BIGINT PK | 项目 ID |
| `prompt_id` | BIGINT PK | 提示词 ID |

### prompt_protection_rules — 提示词保护规则

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | BIGINT PK | 主键 |
| `name` | VARCHAR(255) UNIQUE | 规则名称 |
| `description` | VARCHAR(255) | 描述 |
| `pattern` | VARCHAR(255) | 匹配模式 |
| `status` | ENUM('enabled','disabled','archived') | 状态 |
| `settings` | JSON | 设置 |
| `created_at` | TIMESTAMP DEFAULT NOW() | 创建时间 |
| `updated_at` | TIMESTAMP DEFAULT NOW() | 更新时间 |
| `deleted_at` | BIGINT DEFAULT 0 | 软删除标记 |

---

## Agent 相关表

### dev_provider_configs — 开发供应商配置

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | BIGINT PK | 主键 |
| `channel_id` | BIGINT UNIQUE | 渠道 ID |
| `upstream_api_format` | VARCHAR(255) | API 格式 |
| `refresh_url` | VARCHAR(255) | Token 刷新 URL |
| `refresh_method` | VARCHAR(255) | 刷新方法 |
| `refresh_header` | VARCHAR(255) | 刷新头 |
| `custom_headers` | JSON | 自定义头 |
| `refresh_body_template` | VARCHAR(255) | 刷新请求体模板 |
| `response_token_key` | VARCHAR(255) | 响应中 Token 字段 |
| `response_refresh_token_key` | VARCHAR(255) | 响应中 Refresh Token 字段 |
| `tier1_coefficient` | BIGINT | Tier1 系数 |
| `tier2_coefficient` | BIGINT | Tier2 系数 |
| `tier3_coefficient` | BIGINT | Tier3 系数 |
| `default_daily_limit` | BIGINT | 默认日限额 |
| `model_tier_map` | JSON | 模型 Tier 映射 |
| `selection_script` | LONGTEXT | 选择脚本 |
| `org_patterns` | JSON | 组织模式 |
| `created_at` | TIMESTAMP DEFAULT NOW() | 创建时间 |
| `updated_at` | TIMESTAMP DEFAULT NOW() | 更新时间 |
| `deleted_at` | BIGINT DEFAULT 0 | 软删除标记 |

### dev_provider_members — 开发供应商成员

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | BIGINT PK | 主键 |
| `channel_id` | BIGINT | 渠道 ID |
| `name` | VARCHAR(255) | 成员名称 |
| `employee_id` | VARCHAR(255) | 员工 ID |
| `employee_org_id` | VARCHAR(255) | 员工组织 ID |
| `employee_org_name` | VARCHAR(255) | 员工组织名称 |
| `org_path` | VARCHAR(255) | 组织路径 |
| `api_key_id` | BIGINT UNIQUE | 关联 API Key |
| `status` | ENUM('enabled','disabled') | 状态 |
| `upstream_key` | MEDIUMTEXT | 上游 Key |
| `refresh_token` | MEDIUMTEXT | 刷新 Token |
| `daily_weighted_limit` | BIGINT | 日加权限额 |
| `upstream_exhausted_until` | TIMESTAMP | 上游耗尽时间 |
| `created_at` | TIMESTAMP DEFAULT NOW() | 创建时间 |
| `updated_at` | TIMESTAMP DEFAULT NOW() | 更新时间 |
| `deleted_at` | BIGINT DEFAULT 0 | 软删除标记 |

### dev_agent_configs — Dev Agent 配置

类似 `dev_provider_configs`，用于独立 Agent 场景。

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | BIGINT PK | 主键 |
| `channel_id` | BIGINT UNIQUE | 渠道 ID |
| `upstream_key` | MEDIUMTEXT | 上游 Key |
| `refresh_token` | MEDIUMTEXT | 刷新 Token |
| `upstream_api_format` | VARCHAR(255) | API 格式 |
| `refresh_url` | VARCHAR(255) | 刷新 URL |
| `refresh_method` | VARCHAR(255) | 刷新方法 |
| `refresh_header` | VARCHAR(255) | 刷新头 |
| `custom_headers` | JSON | 自定义头 |
| `refresh_body_template` | VARCHAR(255) | 刷新体模板 |
| `response_token_key` | VARCHAR(255) | 响应 Token Key |
| `response_refresh_token_key` | VARCHAR(255) | 响应 Refresh Key |
| `upstream_exhausted_until` | TIMESTAMP | 上游耗尽时间 |
| `created_at` | TIMESTAMP DEFAULT NOW() | 创建时间 |
| `updated_at` | TIMESTAMP DEFAULT NOW() | 更新时间 |
| `deleted_at` | BIGINT DEFAULT 0 | 软删除标记 |

---

## 其他表

### systems — 系统配置

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | BIGINT PK | 主键 |
| `key` | VARCHAR(255) UNIQUE | 配置键 |
| `value` | MEDIUMTEXT | 配置值 |
| `created_at` | TIMESTAMP DEFAULT NOW() | 创建时间 |
| `updated_at` | TIMESTAMP DEFAULT NOW() | 更新时间 |
| `deleted_at` | BIGINT DEFAULT 0 | 软删除标记 |

### data_storages — 数据存储配置

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | BIGINT PK | 主键 |
| `name` | VARCHAR(255) UNIQUE | 存储名称 |
| `description` | VARCHAR(255) | 描述 |
| `primary` | TINYINT(1) | 是否默认存储 |
| `type` | ENUM('database','fs','s3','gcs','webdav') | 存储类型 |
| `settings` | JSON | 设置 |
| `status` | ENUM('active','archived') | 状态 |
| `created_at` | TIMESTAMP DEFAULT NOW() | 创建时间 |
| `updated_at` | TIMESTAMP DEFAULT NOW() | 更新时间 |
| `deleted_at` | BIGINT DEFAULT 0 | 软删除标记 |

### api_key_profile_templates — API Key 配置模板

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | BIGINT PK | 主键 |
| `project_id` | BIGINT | 项目 ID |
| `name` | VARCHAR(255) | 模板名称 |
| `description` | VARCHAR(255) | 描述 |
| `profile` | JSON | 配置内容 |
| `created_at` | TIMESTAMP DEFAULT NOW() | 创建时间 |
| `updated_at` | TIMESTAMP DEFAULT NOW() | 更新时间 |
| `deleted_at` | BIGINT DEFAULT 0 | 软删除标记 |

### channel_override_templates — 渠道覆盖模板

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | BIGINT PK | 主键 |
| `name` | VARCHAR(255) | 模板名称 |
| `description` | VARCHAR(255) | 描述 |
| `override_parameters` | VARCHAR(255) | 覆盖参数 |
| `override_headers` | JSON | 覆盖 Header |
| `header_override_operations` | JSON | Header 覆盖操作 |
| `body_override_operations` | JSON | Body 覆盖操作 |
| `user_id` | BIGINT | 用户 ID |
| `created_at` | TIMESTAMP DEFAULT NOW() | 创建时间 |
| `updated_at` | TIMESTAMP DEFAULT NOW() | 更新时间 |
| `deleted_at` | BIGINT DEFAULT 0 | 软删除标记 |

### request_executions — 请求执行记录

`requests` 表的扩展，记录实际执行细节。

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | BIGINT PK | 主键 |
| `request_id` | BIGINT | 关联 requests 表 |
| `project_id` | BIGINT DEFAULT 1 | 项目 ID |
| `channel_id` | BIGINT | 渠道 ID |
| `model_id` | VARCHAR(255) | 模型标识 |
| `format` | VARCHAR(255) | 请求格式 |
| `status` | ENUM('pending','processing','completed','failed','canceled') | 状态 |
| `stream` | TINYINT(1) DEFAULT 0 | 是否流式 |
| `external_id` | VARCHAR(512) | 外部 ID |
| `request_body` | JSON | 请求体 |
| `response_body` | JSON | 响应体 |
| `response_chunks` | JSON | 流式响应块 |
| `error_message` | VARCHAR(255) | 错误信息 |
| `response_status_code` | BIGINT | 响应状态码 |
| `request_headers` | JSON | 请求头 |
| `data_storage_id` | BIGINT | 数据存储 ID |
| `metrics_latency_ms` | BIGINT | 延迟 |
| `metrics_first_token_latency_ms` | BIGINT | 首 Token 延迟 |
| `metrics_reasoning_duration_ms` | BIGINT | 推理耗时 |
| `created_at` | TIMESTAMP DEFAULT NOW() | 创建时间 |
| `updated_at` | TIMESTAMP DEFAULT NOW() | 更新时间 |

---

## 实体关系图

```
                        ┌──────────┐
                        │  users   │
                        └────┬─────┘
                             │ user_id
                             ↓
                     ┌───────────────┐
                     │   api_keys    │
                     │ (employee_id) │── employee_id 作为平台用户标识
                     └───────┬───────┘
                             │ api_key_id
                             ↓
     ┌───────┐    ┌──────────────────┐    ┌──────────┐
     │traces │◄───│    requests      │◄───│ threads  │
     └───────┘    └────────┬─────────┘    └──────────┘
                           │ request_id
                           ↓
     ┌──────────┐    ┌──────────────────┐    ┌──────────────┐
     │ channels │◄───│   usage_logs     │───►│    models    │
     └──────────┘    └──────────────────┘    └──────────────┘
                           │
                           ↓
                     ┌──────────┐
                     │ projects │
                     └──────────┘
```

**核心关联路径:**
- `usage_logs.api_key_id → api_keys.id` → 获取用户身份（employee_id）
- `usage_logs.request_id → requests.id` → 获取请求详情（状态、延迟）
- `usage_logs.channel_id → channels.id` → 获取渠道信息
- `usage_logs.project_id → projects.id` → 获取项目信息
- `requests.trace_id → traces.id` → 获取追踪信息（对话上下文）

---

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

### 关联用户（基于 employee_id 去重）
```sql
SELECT COUNT(DISTINCT ak.employee_id)
FROM usage_logs ul
LEFT JOIN api_keys ak ON ul.api_key_id = ak.id
WHERE ...
```

### 用户信息查询
```sql
-- 平台所有用户
SELECT DISTINCT employee_id, employee_name, employee_org_name
FROM api_keys
WHERE employee_id IS NOT NULL

-- 新用户（首次出现）
SELECT ak.employee_id, MIN(ul.created_at) as first_seen
FROM usage_logs ul
LEFT JOIN api_keys ak ON ul.api_key_id = ak.id
WHERE ak.employee_id IS NOT NULL
GROUP BY ak.employee_id
```

### 错误统计
```sql
SUM(CASE WHEN r.status IN ('failed', 'canceled') THEN 1 ELSE 0 END) as error_count
```
或者
```sql
COUNT(*) FILTER (WHERE r.status IN ('failed', 'canceled')) as error_count
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
