# 浙江省 AI 智能体产业发展联盟平台 - 系统架构设计

> 更新日期: 2026-03-12

## 1. 整体架构概述
本平台采用现代化的 **前后端分离** 架构，提供高性能、可扩展且易于维护的业务体验。

- **前端 (Frontend)**: 基于 Next.js 14 (React) 构建，负责门户展示、分步填报交互与管理员驾驶舱。
- **后端 (Backend)**: 基于 Directus 11 (Headless CMS)，提供 API、RBAC 权限控制与数据存储。
- **数据库 (Database)**: SQLite (当前开发/演示) 或 PostgreSQL。
- **基础设施**: Docker 容器化。

## 2. 项目目录规整

为了符合大型项目规范，本项目采用了清晰的职责分离结构：

- **`/frontend`**: 核心 Next.js 14 应用。
- **`/backend/scripts`**: 包含所有用于 Directus 初始化、权限配置和数据迁移的独立脚本。
- **`/docs`**: 集中管理所有技术与业务文档。
- **`/database` & `/uploads`**: 容器持久化挂载点。

```text
zhejiang-ai-alliance/
├── backend/                # 后端逻辑与管理
│   └── scripts/            # 管理脚本 (如 setup-survey-schema.mjs)
├── frontend/               # 前端展示与交互
│   ├── app/                # 路由与业务代码
│   └── ...
├── docs/                   # 全量技术文档
└── docker-compose.yml      # 全栈编排
```

## 2. 核心技术栈

### 2.1 前端门户
- **Next.js 14**: App Router 架构，深度使用 Server Components (数据拉取) 与 Server Actions (表单提交)。
- **Tailwind CSS + Shadcn UI**: 实现专业且响应式的 UI 设计。
- **NextAuth.js v5**: 对接 Directus 认证接口，实现角色映射 (Roles Map)。
- **Zod**: 严格的表单 Schema 校验。

### 2.2 后端 CMS
- **Directus 11**: 自动生成 REST API，提供强大的权限钩子 (Filters/Validation)。
- **RBAC 模型**:
    - `ADMIN`: 拥有全量数据访问权限，独享 `/admin` 路由。
    - `USER`: 基于 `user_created` 过滤，只能读写自有企业数据，访问权限受限。

## 3. 业务数据流 (Data Flow)

### 3.1 企业档案填报与回填
1. 用户进入 `/dashboard`：Next.js 调用 `readItems('companies', { filter: { user_created: { _eq: $userId } } })`。
2. 页面自动回填 (Auto-fill) 历史数据。
3. 用户分步修改：调用 `updateItem('companies', id, data)` 实现增量更新或草稿保存。

### 3.2 秘书处三层审批流 (Tier A/B/C)
1. 管理员访问 `/admin/companies`：拉取全量申请列表，进行概貌审阅。
2. 进入详情页按三层结构阅览材料：
   - **Tier A (公共展示)**: 阅读企业申请表单，核实表单基础信息的合理性。
   - **Tier B (第三方验证)**: 核对底层第三方 API 拉回的财务、法律关联涉诉等背景硬核查信息。
   - **Tier C (尽调核查)**: 录入秘书处线下拜访的实地调查记录、意愿度结论及隐藏缺陷。
3. 提交审核意见：管理员可以随时将审批通过的企业案例及基本信息点击"发布 (Published)" 以推流至 `/services` 前端等公域模块。

## 4. 安全性架构
- **数据隔离**: 基于 Directus 的 `Accountability` 系统，通过 Policy 确保 USER 角色无法跨企业越权。
- **认证集成**: 结合 JWT 生存周期管理，确保前端 Session 与后端 Token 同步。
- **公开访问控制**: 限制 `public` 角色仅能读取 `articles` 等脱敏字段。
