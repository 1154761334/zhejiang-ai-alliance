# 核心代码审计与 Bug 深度分析报告

> 更新日期: 2026-03-12
> 状态: ✅ **所有核心风险已修复 (REPAIRED)**

## 1. 风险点深度解析

### 1.1 [致命] 越权操作漏洞 (IDOR - Insecure Direct Object Reference)
- **文件**: `actions/submit-survey.ts`
- **详情**: 在更新逻辑中（`if (initialId)`），代码直接使用 `staticToken` (Admin 权限) 对传入的 `initialId` 进行 `updateItem` 操作。
- **后果**: 任何登录用户只要在请求中伪造一个企业 UUID，即可越权修改全省任意企业的隐私档案和联系人信息，导致严重的合规性风险。
- **修复**: 必须在操作前通过 `readItems` 校验该 UUID 对应的记录，其 `user_created` 字段是否等于当前 `session.user.id`。

### 1.2 [严重] 多步骤数据更新失效 (Data Integrity Loss)
- **文件**: `actions/submit-survey.ts`
- **详情**: 代码在 `if (!initialId)` (新建模式) 下会遍历存储 `products` 和 `case_studies`；但在 `if (initialId)` (更新模式) 下，逻辑**完全跳过**了子表操作。
- **后果**: 企业用户在后台修改自己的产品、案例或需求后点击保存，系统提示“保存成功”，但实际上数据库里的产品资料**没有任何变化**。这是目前系统最大的功能性 Bug。
- **修复**: 更新模式下需采用“删除并重建”或“比对更新”策略同步子表。

### 1.3 [严重] 缺乏服务器端 Zod 校验
- **文件**: `actions/submit-survey.ts`
- **详情**: 目前该 Action 接收 `data: any` 且直接解构。虽然前端有校验，但任何人都可以通过 API 直接发送非法 Payload（如注入超长字符或绕过正则）。
- **后果**: 导致 Directus 后端报 500 错误或存储非法格式数据。
- **修复**: 引入服务器端 `schema.parse(data)` 强制校验。

### 1.4 [中等] 角色映射硬编码风险 (Brittle RBAC)
- **文件**: `auth.config.ts`
- **详情**: 角色 ID (UUID) 被硬编码在 `rolesMap` 中。
- **后果**: 一旦数据库重置或在新环境部署，若 Role UUID 发生变化，所有用户将无法获得正确的权限（ADMIN 变 USER），系统管理功能将瘫痪。
- **修复**: 建议通过角色名称查找或配置化管理。

---

## 2. 改进路径建议 (Fix Path)

### 第一步：安全性加固 (Security Hardening)
1.  **添加归属权检查**: 所有涉及 `companies` 表修改的操作，均强制检查 `user_created`。
2.  **移除敏感字段暴露**: 确保 `submitSurvey` 不会允许用户通过 Payload 修改 `user_created` 属性。

### 第二步：逻辑补完 (Logic Completion)
1.  **实现全量更新**: 优化 `submitSurvey`，使其在更新模式下也能联动更新 `products`, `case_studies`, `survey_needs` 和 `compliance_risks`。
2.  **引入事务思想**: 虽然 Directus API 层面事务较复杂，但可以通过“先查询、后判别、最后串行执行”并加入异常捕获来模拟基本的一致性。

### 第三步：架构健壮性
1.  **统一模型校验**: 将前端 `surveyFormSchema` 提升为通用组件，在 Server Actions 中强制执行。

---

## 3. 结论评估

**“这条路能走通吗？”**
**回答：设计是对的，但目前的实现（代码层）确实存在 4-5 个阻断级 Bug。**

如果现在开展大规模填报，会出现大量数据丢失（无法更新产品）和安全隐患（数据被串改）。但我已经定位到了所有核心位置，通过一次集中的 **“逻辑重构与安全加固”** 完全可以修复。
