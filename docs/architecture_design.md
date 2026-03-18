# 浙江省 AI 智能体产业发展联盟平台 - 系统架构设计

> 更新日期: 2026-03-17

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

## 3. 核心技术栈

### 3.1 前端门户
- **Next.js 14**: App Router 架构，深度使用 Server Components (数据拉取) 与 Server Actions (表单提交)。
- **Tailwind CSS + Shadcn UI**: 实现专业且响应式的 UI 设计。
- **NextAuth.js v5**: 对接 Directus 认证接口，实现动态角色映射。
- **Zod**: 严格的表单 Schema 校验。

### 3.2 后端 CMS
- **Directus 11**: 自动生成 REST API，提供强大的权限钩子 (Filters/Validation)。
- **RBAC 模型**:
    - `ADMIN`: 拥有全量数据访问权限，独享 `/admin` 路由。
    - `USER/MEMBER`: 基于 `user_created` 过滤，只能读写自有企业数据。

## 4. 业务数据流 (Data Flow)

### 4.1 企业档案填报与回填
1. 用户进入 `/dashboard`：Next.js 调用 `readItems('companies', { filter: { user_created: { _eq: $userId } } })`。
2. 页面自动回填 (Auto-fill) 历史数据。
3. 用户分步修改：调用 `submitSurvey` Server Action 实现事务性提交。

### 4.2 秘书处三层审批流 (Tier A/B/C)
1. 管理员访问 `/admin/companies`：拉取全量申请列表，进行概貌审阅。
2. 进入详情页按三层结构阅览材料：
   - **Tier A (公共展示)**: 阅读企业申请表单，核实表单基础信息的合理性。
   - **Tier B (第三方验证)**: 核对底层第三方 API 拉回的财务、法律关联涉诉等背景硬核查信息。
   - **Tier C (尽调核查)**: 录入秘书处线下拜访的实地调查记录、意愿度结论及隐藏缺陷。
3. 提交审核意见：管理员可将审批通过的企业案例及基本信息发布至公开模块。

## 5. 安全性架构 (已加固)

### 5.1 认证与授权
- **动态角色映射**: 登录时动态获取 Directus 角色配置，避免配置漂移风险。
- **JWT Session**: Session 有效期 24 小时，使用用户动态 Token 而非静态 Token。
- **Rate Limiting**: 登录/注册接口实施请求频率限制，防止暴力破解。

### 5.2 数据隔离
- **用户级隔离**: 基于 `user_created` 字段的 RLS 策略，确保企业只能访问自有数据。
- **角色级隔离**: 动态角色映射 + 后端 API 权限校验。

### 5.3 公开数据保护
- **字段级权限**: 强制限制 public 角色仅能读取脱敏字段。
- **导出脱敏**: 管理员导出数据时自动脱敏敏感字段（电话、邮箱、内部备注等）。

### 5.4 审计追踪
- **审计日志表**: 记录关键操作（登录、提交、审批、导出等）。
- **操作留痕**: 所有管理操作均记录时间、操作者、目标、详情。

### 5.5 Server Actions 安全性
- **事务性提交**: 企业创建/更新使用 Transaction Promise 确保原子性。
- **动态 Token**: Server Actions 使用用户会话 Token 而非静态 Token。
- **服务端校验**: 所有输入均经过 Zod Schema 校验。

## 6. 关键脚本说明

| 脚本 | 用途 |
|------|------|
| `create-audit-logs-table.mjs` | 创建审计日志表 |
| `verify-role-config.mjs` | 校验角色配置是否正确 |
| `patch-public-permissions-v2.mjs` | 强化 public 角色字段级权限 |
| `enable-registration.mjs` | 启用用户注册 |