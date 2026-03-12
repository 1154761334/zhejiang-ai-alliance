# 浙江省 AI 智能体产业发展联盟 - 开发者/AI 接手指引 (Developer/AI Context Index)

**最后更新日期: 2026-03-12**

本文件旨在为接手本库代码的下一个开发者 (或 AI Agent) 提供最核心的上下文地图，帮助短平快地上手开发。本仓库包含了两个端：前端基于 **Next.js 14 App Router** 的展示与 B2B Dashboard；后端基于 **Directus 11 Headless CMS**。

## 1. 核心文档目录引导

如果你需要了解...

*   **当前项目做到什么程度了？** -> [docs/project_status.md](project_status.md) (宏观里程碑，功能完成情况概览)
*   **前后端架构与数据流怎么运作的？** -> [docs/architecture_design.md](architecture_design.md) (系统架构图、主要 API 数据流动方向)
*   **各个数据表是怎么建的、前端路由藏在哪里？** -> [docs/detailed_design.md](detailed_design.md) (详细的数据库 Schema 字段定义、文件路由树)
*   **目前卡住在哪里、什么还没测通？** -> [docs/test_plan.md](test_plan.md) (端到端测试用例表，Bug blocker 和遗留项)
*   **部署流程与配置** -> [docs/deployment_guide.md](deployment_guide.md) (生产环境部署步骤与配置说明)
*   **快速启动指南** -> [../STARTUP.md](../STARTUP.md) (本地开发环境快速启动步骤)
*   **(最核心)** **我是如何实现 Tier A/B/C 三段式企业资料审批台的？** -> 请阅读此目录外的 **`walkthrough.md`** 和 **`implementation_plan.md`** (这部分涉及了极重要的 Server Actions 修改与 Directus `org_verified_data`、`org_internal_investigations` 数据关联重构逻辑)
*   **(最重要)** **我是如何实现 产品与服务页面 的？** -> 前往前端查看 `frontend/app/(marketing)/services/page.tsx`。

## 2. 接手第一步与启动手法

环境已经非常成熟，只需要启动两个核心：

1.  **启动后端 (Directus)** (如果你不是连接线上服务器的情况):
    *   在项目根目录运行：`docker-compose up -d`
    *   Directus 管理后台: http://localhost:8055
    *   默认管理员账号: `admin@example.com` / `password`
    *   目前使用硬编码 Admin token `my-static-token-1234567890` (详见前端各配置项)
2.  **启动前端 (Next.js)**:
    ```bash
    cd frontend
    npm install      # 首次运行或依赖更新时执行
    npm run dev
    ```
    *   前端门户: http://localhost:3000

## 3. 前端核心文件快速索引

| 文件路径 | 功能说明 |
|----------|----------|
| `frontend/lib/directus.ts` | Directus SDK 客户端封装，所有 API 调用的统一入口 |
| `frontend/lib/utils.ts` | 通用工具函数 |
| `frontend/actions/` | 所有 Server Actions 定义，处理表单提交、数据修改等操作 |
| `frontend/auth.config.ts` | NextAuth 认证配置与角色映射 |
| `frontend/config/site.ts` | 站点全局配置信息 |
| `frontend/components/dashboard/survey-steps/` | 四步向导式填报组件 |
| `frontend/components/admin/` | 管理员后台专用组件 |
| `frontend/app/(protected)/admin/` | 管理员后台页面路由 |
| `frontend/app/(protected)/dashboard/` | 企业成员中心页面路由 |

## 4. 全量管理脚本索引 (frontend/*.mjs)

### 4.1 初始化与配置
| 脚本名 | 功能说明 | 使用场景 |
|--------|----------|----------|
| `setup-directus.mjs` | 初始化 Directus 核心配置 | 首次部署时执行 |
| `setup-permissions.mjs` | 配置基础角色权限 | 权限重置时使用 |
| `setup-crm-collections.mjs` | 创建核心业务表结构 | 数据库初始化时执行 |
| `enable-registration.mjs` | 开启公开注册功能 | 上线前配置 |
| `seed-test-data.mjs` | 录入测试数据（文章、企业、申请） | 开发环境测试时使用 |
| `create-secretariat-account.mjs` | 创建秘书处管理员账号 | 系统初始化时使用 |

### 4.2 数据结构升级
| 脚本名 | 功能说明 | 使用场景 |
|--------|----------|----------|
| `patch-matchmaking-fields.mjs` | 新增供需撮合相关字段 | 启用撮合功能前执行 |
| `patch-public-permissions.mjs` | 开放公开数据读取权限 | 企业公示墙上线前执行 |
| `patch-public-pbac.mjs` | 优化公开访问权限策略 | 权限升级时使用 |
| `patch-member-permissions.mjs` | 升级会员角色权限 | 会员功能迭代时使用 |
| `patch-member-permissions-sdk.mjs` | SDK 版本权限升级 | Directus SDK 版本更新时使用 |
| `add-audit-fields.mjs` | 新增审计字段 | 合规审计需求时使用 |
| `update-schema-v2.mjs` / `update-schema-v3.mjs` | 数据结构版本升级 | 大版本迭代时执行 |
| `refine-pbac-security.mjs` | 优化权限安全策略 | 安全审计后执行 |
| `harden-member-permissions.mjs` | 强化会员权限隔离 | 安全升级时使用 |

### 4.3 检查与验证
| 脚本名 | 功能说明 | 使用场景 |
|--------|----------|----------|
| `check-collections.mjs` | 检查数据表是否完整 | 部署后验证 |
| `check-fields.mjs` | 检查字段配置正确性 | 数据结构变更后验证 |
| `check-relations.mjs` / `probe-relations-v2.mjs` | 检查表间关系配置 | 关联功能异常时排查 |
| `check-policies.mjs` | 检查权限策略配置 | 权限异常时排查 |
| `check-roles-v2.mjs` | 检查角色配置正确性 | 角色功能异常时排查 |
| `check-role-detail.mjs` | 查看角色详细权限 | 权限问题调试 |
| `check-access.mjs` | 验证访问权限配置 | 权限测试 |
| `check-info.mjs` | 查看系统信息 | 系统状态检查 |
| `check-audit.mjs` / `check-final-audit.mjs` | 审计字段检查 | 合规检查 |
| `check-full-schema.mjs` | 全量 Schema 检查 | 大版本变更后验证 |
| `check-prod-field.mjs` | 生产环境字段检查 | 生产部署前验证 |
| `probe-schema.mjs` | 探测 Schema 结构 | 开发调试时使用 |
| `probe-all-fields.mjs` | 探测所有字段信息 | 结构分析时使用 |
| `probe-secondary.mjs` | 探测二级表结构 | 关联表调试时使用 |
| `verify-perms.mjs` | 权限配置验证 | 权限变更后验证 |
| `link-access.mjs` | 验证关联数据访问权限 | 关联功能测试 |

### 4.4 调试与测试
| 脚本名 | 功能说明 | 使用场景 |
|--------|----------|----------|
| `debug-auth.mjs` | 认证功能调试 | 登录/注册异常时排查 |
| `debug-fetch.mjs` | API 请求调试 | 接口调用异常时排查 |
| `debug-roles.mjs` | 角色配置调试 | 角色权限问题排查 |
| `test-backend.mjs` | 后端接口测试 | 后端服务健康检查 |
| `test-workflow-api.mjs` | 工作流 API 测试 | 业务流程测试 |
| `test-all-around.mjs` | 全功能测试 | 版本发布前验证 |
| `test-v2-refinements.mjs` | V2 版本功能测试 | V2 迭代验证 |
| `test-adversarial.mjs` | 安全性测试 | 安全审计时使用 |
| `silent-test.mjs` | 静默测试 | 无输出快速验证 |
| `force-patch-policy.mjs` | 强制覆盖权限策略 | 权限配置错误时紧急修复 |
| `grant-member-perms.mjs` | 授予会员权限 | 手动权限调整 |
| `grant-member-create-permissions.mjs` | 授予会员创建权限 | 功能开通时使用 |
| `set-token.mjs` | 设置访问令牌 | 临时调试时使用 |

## 5. 下一步迭代建议 (Agent Action Checklist)

作为承接此工作流的新 Agent，你的任务池目前最重要的是：

1.  **移动端触控优化 (Mobile Optimization)**:
    *   这是最重要的遗留任务。调研系统的前两步 (基础信息与主营业务) 在手机上存在输入框触控缩放 (`16px` 问题) 和大尺寸表格越界的情况，需要去 `frontend/components/dashboard/survey-steps` 逐个使用 `hooks/use-media-query` 或者 Tailwind 的 `sm/md` 响应式前缀排演 UI。
2.  **供需打通 (Service Matchmaking)**:
    *   联盟后台的 `/admin/orders` 当前是空的。需要将 Member Dashboard 中填写的 `survey_needs` (如算力、融资需求) 自动落为一张张审批流的“工单”，分发给联盟特定的内部分布进行需求响应跟进。
3.  **企业公示墙功能**: 实现 `/members` 页面动态展示审核通过的企业信息
4.  **统计大屏开发**: 实现 `/admin/charts` 页面的多维数据可视化

## 6. 关键心智设定 (Critical Context Limits)

*   **Tailwind 约束**: 所有新的 CSS 必须继续沿用项目中配置的 Tailwind Design Token (不要新增外接的 css files，继续使用 `bg-muted`, `text-foreground`, `border-border` 等变量确保暗黑模式适配)。
*   **路由数据**: 此刻的 CMS 没有使用 React Context。大部分请求使用的是 React Server Components 进行获取，而修改全权交由 `/actions` 文件夹下的 Server Actions (`use server`) 进行防抖和提交管理，从而完美融合 NextAuth 的 session。
*   **权限模型**: 所有数据访问都遵循 Directus RBAC 权限控制，不要硬编码绕过权限校验
*   **表单处理**: 所有表单提交都使用 Server Actions，不要在客户端直接调用 Directus API
*   **数据隔离**: USER 角色只能访问自己创建的企业数据，Admin 角色可以访问全量数据

## 7. 常见问题排查

### 7.1 前端无法连接后端
- 检查 Directus 服务是否正常运行：`docker-compose ps`
- 检查 `.env` 文件中的 `NEXT_PUBLIC_API_URL` 是否配置正确
- 检查 Directus 管理员 token 是否有效

### 7.2 权限访问异常
- 执行 `check-policies.mjs` 检查权限策略配置
- 执行 `check-roles-v2.mjs` 检查角色配置
- 查看用户角色是否正确映射到 `ADMIN`/`USER`

### 7.3 数据提交失败
- 检查 Zod Schema 校验规则是否正确
- 查看 Directus 接口返回的具体错误信息
- 验证用户是否有对应资源的写权限

祝你好运！接下来的世界就交给你了。
