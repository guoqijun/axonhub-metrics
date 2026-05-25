# 贡献指南

感谢你参与 AxonHub Metrics 的开发！

## 开发环境

见 [README](README.md#快速启动) 中的快速启动指南。

## 项目结构

项目采用前后端分离架构：

```
backend/       → Python FastAPI 后端
frontend/      → React + TypeScript 前端
docs/          → 文档
```

## 开发工作流

### 添加新指标/页面

1. **后端 Model** — `backend/app/models/` 定义 Pydantic 响应模型
2. **后端 Service** — `backend/app/services/` 实现 SQL 查询逻辑
3. **后端 Router** — `backend/app/routers/` 注册路由端点
4. **前端 API** — `frontend/src/api/metrics.ts` 添加 API 调用函数
5. **前端页面** — `frontend/src/pages/` 创建或更新页面组件
6. **前端路由** — `frontend/src/router.tsx` 注册路由和侧边栏菜单

### 代码规范

#### 后端
- 使用 `async/await`，所有数据库操作为异步
- SQL 使用参数化查询 (`:param` 语法)，禁止字符串拼接
- Pydantic 模型字段提供默认值
- Router 只做参数提取，不写业务逻辑
- Service 函数命名: `get_xxx`、`get_xxx_list`、`get_xxx_stats`

#### 前端
- 组件文件使用 PascalCase (`Overview.tsx`)
- API 函数使用 camelCase (`fetchOverviewKPI`)
- Store hook 使用 `useXxxStore` 命名
- 页面组件放在 `pages/`，通用组件放在 `components/`
- 新增 chart 优先使用 `ChartCard` 组件（自带 Loading/Error/Empty 三态）

### 筛选机制

所有业务 API 共用 `FilterParams`，支持的参数:
- `start_date` / `end_date`: 日期范围
- `granularity`: day / week / month
- `user_ids` / `channel_ids` / `model_ids`: 多选筛选

新增 API 时，使用 `app.services.base.apply_filters()` 生成 WHERE 子句。

### 浏览器兼容性

前端要求现代浏览器 (Chrome / Firefox / Safari / Edge 最新版本)。

## PR 提交

1. 确保代码通过 `npm run build` (前端) 和 Python 语法检查 (后端)
2. 提交信息格式: `type(scope): description`
   - `feat(overview): add new KPI card`
   - `fix(cost): correct cache hit rate calculation`
   - `docs: update API reference`
3. PR 描述中说明改动内容、原因和测试方式

## 问题反馈

提交 Issue 时请说明:
- 问题描述和复现步骤
- 预期的行为和实际行为
- 环境信息 (浏览器版本、Node/Python 版本等)
