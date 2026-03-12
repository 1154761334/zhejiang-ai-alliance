# 浙江省AI智能体产业联盟平台 — 全局测试计划与评估报告 (Global Test Plan)

**最后更新时间**: 2026-03-11
**当前版本**: V1.1 (包含自动化与浏览器端到端测试策略)

本测试计划旨在为联盟平台（前端 Next.js + 后端 Directus）提供一套标准化的验证流程。基于最新的开发进展，本报告不仅涵盖了已通过的测试模块，还包括了由于 CORS 拦截等原因导致的部分未决事项（Pending Items）及未来的进阶测试规划。

---

## 1. 测试概览与当前进展

| 测试阶段 | 测试目标 | 覆盖范围 | 当前进度 | 结果评估 |
| :--- | :--- | :--- | :--- | :--- |
| **Phase 1 (Backend)** | 验证数据流、权限与接口的稳定性 | T1-T8 (核心逻辑/API) | **100%** | **通过 ✅**。后端运行稳定，CRUD 与权限隔离完全符合预期。 |
| **Phase 2 (Frontend)** | 验证用户端到端旅程 (E2E) | F1-F12 (UI/CRM/展示页) | **100%** | **通过 ✅**。CORS 已修复，A/B/C 三级调查与服务大厅完全连通。 |
| **Phase 3 (Integration)** | 验证边界条件与真实压测 | 压力测试 / 大数据量展示 | **10%** | 移动端优化待启动 ⏳ (Tier-C) |

---

## 2. Phase 1：后端自动化测试 (Backend Automated Tests)

后端测试主要通过根目录下的自动化脚本 `test-backend.mjs` 执行。建议每次修改数据模型 (Schema) 后运行此脚本。

- **T1: TypeScript 编译检查 (`pnpm tsc`)**
  - **状态**: ✅ 已通过
  - **说明**: 确保前端代码零类型错误。
- **T2: Directus 实例健康检查 (`/server/health`)**
  - **状态**: ✅ 已通过 (状态: warn但可用)
  - **说明**: 验证数据库连通性、存储和缓存状态。
- **T3: Schema 完整性验证**
  - **状态**: ✅ 已通过
  - **说明**: 验证 `companies`, `products`, `case_studies`, `survey_needs`, `compliance_risks`, `articles` 五大实体表 + 新闻表是否存在。
- **T4: CRUD 端到端验证**
  - **状态**: ✅ 已通过
  - **说明**: 涵盖文章(Article)与企业资料(Company)的增删改查测试。
- **T5: 认证流程验证 (Authentication)**
  - **状态**: ✅ 已通过
  - **说明**: 使用 Directus SDK 进行登录/获取当前用户的 Token 机制。
- **T6: 角色权限隔离 (RBAC Isolation)**
  - **状态**: ✅ 已通过
  - **说明**: 普通 `USER` 角色无法读取其他企业的敏感信息（通过 Accountability）。
- **T7: 公开注册 API 验证**
  - **状态**: ✅ 已通过
  - **说明**: 验证前端专用的 `/api/register` 中转路由能否正常向 Directus 创建新用户。
- **T8: 新闻动态数据验证**
  - **状态**: ✅ 已通过
  - **说明**: 测试公开角色能否读取 `articles` 及其相关媒体资源。

---

## 3. Phase 2：前端端到端测试 (Frontend E2E Browser Tests)

前端测试需使用无头浏览器（或 AI Subagent）模拟真实用户流，验证页面渲染与 React 相关逻辑。

### 3.1 游客/公网链路 (Public Pages)
- **F1: 首页 (Landing Page)**: 验证导航条、Slogan、Hero 按钮（跳转至 `/register`）、生态版图、底部死链修复情况。 (✅ 验证通过)
- **F2: 新闻中心 (Blog/News)**: 验证能否正确拉取 `articles` 数据，文章封面与详情页路由 `[slug]` 渲染。 (✅ 验证通过)
- **F3: 价格与权益页 (Pricing)**: 验证三端（公众、PRO、核心成员）价格卡与“申请入驻”CTA 功能。 (✅ 验证通过)
- **F4: 文档中心 (Docs)**: 验证 `mdx` 页面加载，包括联盟简介和入会流程（5步入会法）。 (✅ 验证通过)

### 3.2 用户认证链路 (Auth Flow)
- **F5: 企业注册 (Register)**: 
  - **流程**: 使用新邮箱注册 -> 调用 `/api/register` -> 成功后自动 `signIn` -> 重定向至 `/dashboard`。
  - **状态**: ✅ 验证通过 (早期被禁用，现已打通)
- **F6: 会员登录 (Login)**:
  - **流程**: 输入正确账密 -> 成功提示 Toast -> 准确重定向。
  - **状态**: ✅ 验证通过 (修复了 `redirect: false` 时未跳页的 Bug)

### 3.3 核心业务：全线上企业入网 (Member Dashboard)
- **F7: 四步向导 - Step 1/2**: 表单 `companies`（工商校验、18位社会信用代码）与 `products`。 (✅ 验证通过)
- **F8: 四步向导 - Step 3/4**: 表单 `case_studies` 与 `survey_needs/compliance_risks`。
  - **状态**: ✅ 验证通过。CORS 已修复，多步骤数据顺利落库。
- **F9: 会员状态与缴费台 (Billing)**:
  - **验证点**: 读取企业的 `status`，若是 `draft` 显示“待完善”，`pending` 显示“审核中”，`published` 显示“正式入驻”。
  - **状态**: ✅ 验证通过。数据落库后界面状态流转正常。
- **F10: 个人设置 (Settings)**: 
  - **验证点**: Header 是否显示名字，个人信息可否修改。（已修复 `undefined` Bug） (✅ 验证通过)

### 3.4 秘书处管理台 (Admin Cockpit)
- **F11: 控制台概览**: 验证 KPI （入库企业数、模型能力数、意向需求数）的统计。 (✅ 验证通过)
- **F12: 企业审批三层模型与发布**: 验证管理员可将企业的 `status` 从 `pending` 改为 `published`，并录入 B/C 层尽调数据。
  - **状态**: ✅ 验证通过。A/B/C 三层结构清晰，Server Action 写库成功。

### 3.5 核心业务展示大厅 (Services Showcase)
- **F13: 算力与模型大厅**: 验证静态玻璃拟物材质 AI 生成图片的加载与排版。 (✅ 验证通过)
- **F14: 标杆案例瀑布流**: 验证连通 Directus 实时拉取已发布的企业的名下高质量案例。 (✅ 验证通过)

---

## 4. 当前已知问题与行动清单 (Blockers & Action Items)

为达到完美运营状态，需执行以下优化或关注项：

1. **已解决 (Resolved) **: 
   - Backend CORS 配置阻挡了前端对 `/dashboard` 等强行表单的数据提报。**已通过 Directus `.env` 放开 `CORS_ORIGIN=*` 或指定白名单处理。** 
2. **🟡 [UI/UX] 注册错误信息透传**:
   - **问题**: 目前如果邮箱已被占用，后端抛错但在前端 Toast 中不够人性化。
   - **解决**: 在 UserAuthForm 中加入对已知 Http Status Code 的中文捕获并格式化展示。

---

## 5. Phase 3：未来的进阶测试规划 (Tier-C Roadmap integration)

待上述流程打通并正式运营后，测试计划需扩展至性能与兼容方向：

- **C1: 供需撮合沙盘匹配度测试**: 创建 10 个需求 + 10 个能力，验证后台“匹配调度”能力准确度。
- **C2: 移动端 H5 响应式专项测试**: 核心走查 `/login`、四步申请表单在 iOS Safari 和微信内置浏览器的布局是否溢出。
- **C3: 大并发读写测试 (Load Testing)**: 在开启“平台公测”时，压测 `companies` 表的并发写入，验证数据库连接池与 Next.js 前端限流容灾。
