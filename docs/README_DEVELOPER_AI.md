# 浙江省 AI 智能体产业发展联盟 - 开发者/AI 接手指引 (Developer/AI Context Index)

**最后更新日期: 2026-03-11**

本文件旨在为接手本库代码的下一个开发者 (或 AI Agent) 提供最核心的上下文地图，帮助短平快地上手开发。本仓库包含了两个端：前端基于 **Next.js 14 App Router** 的展示与 B2B Dashboard；后端基于 **Directus 11 Headless CMS**。

## 1. 核心文档目录引导

如果你需要了解...

*   **当前项目做到什么程度了？** -> [docs/project_status.md](project_status.md) (宏观里程碑，功能完成情况概览)
*   **前后端架构与数据流怎么运作的？** -> [docs/architecture_design.md](architecture_design.md) (系统架构图、主要 API 数据流动方向)
*   **各个数据表是怎么建的、前端路由藏在哪里？** -> [docs/detailed_design.md](detailed_design.md) (详细的数据库 Schema 字段定义、文件路由树)
*   **目前卡住在哪里、什么还没测通？** -> [docs/test_plan.md](test_plan.md) (端到端测试用例表，Bug blocker 和遗留项)
*   **(最核心)** **我是如何实现 Tier A/B/C 三段式企业资料审批台的？** -> 请阅读此目录外，你大脑文件系统 (`.gemini/...`) 中的 **`walkthrough.md`** 和 **`implementation_plan.md`** (这部分涉及了极重要的 Server Actions 修改与 Directus `org_verified_data`、`org_internal_investigations` 数据关联重构逻辑)
*   **(最重要)** **我是如何实现 产品与服务页面 的？** -> 前往前端查看 `frontend/app/(marketing)/services/page.tsx`。

## 2. 接手第一步与启动手法

环境已经非常成熟，只需要启动两个核心：

1.  **启动后端 (Directus)** (如果你不是连接运城线上服务器的情况):
    *   在主目录下通常有 `docker-compose.yml` (如有配置)。如果没有本地数据库，确保具有对应在线测试/生产服的 `NEXT_PUBLIC_API_URL`。
    *   目前使用硬编码 Admin token `my-static-token-1234567890` (详见前端各配置项)。
2.  **启动前端 (Next.js)**:
    ```bash
    cd frontend
    npm install
    npm run dev
    ```

## 3. 下一步迭代建议 (Agent Action Checklist)

作为承接此工作流的新 Agent，你的任务池目前最重要的是：

1.  **移动端触控优化 (Mobile Optimization)**:
    *   这是最重要的遗留任务。调研系统的前两步 (基础信息与主营业务) 在手机上存在输入框触控缩放 (`16px` 问题) 和大尺寸表格越界的情况，需要去 `frontend/components/dashboard/survey-steps` 逐个使用 `hooks/use-media-query` 或者 Tailwind 的 `sm/md` 响应式前缀排演 UI。
2.  **供需打通 (Service Matchmaking)**:
    *   联盟后台的 `/admin/orders` 当前是空的。需要将 Member Dashboard 中填写的 `survey_needs` (如算力、融资需求) 自动落为一张张审批流的“工单”，分发给联盟特定的内部分布进行需求响应跟进。

## 4. 关键心智设定 (Critical Context Limits)

*   **Tailwind 约束**: 所有新的 CSS 必须继续沿用项目中配置的 Tailwind Design Token (不要新增外接的 css files，继续使用 `bg-muted`, `text-foreground`, `border-border` 等变量确保暗黑模式适配)。
*   **路由数据**: 此刻的 CMS 没有使用 React Context。大部分请求使用的是 React Server Components 进行获取，而修改全权交由 `/actions` 文件夹下的 Server Actions (`use server`) 进行防抖和提交管理，从而完美融合 NextAuth 的 session。

祝你好运！接下来的世界就交给你了。
