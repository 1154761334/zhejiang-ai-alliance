# 安全审计与漏洞修复报告

> 更新日期: 2026-03-13

## 一、漏洞修复总览

| 优先级 | 漏洞编号 | 漏洞描述 | 修复状态 |
|--------|----------|----------|----------|
| P0 | 1 | 无邮箱验证 - 恶意注册零成本 | ⏸️ 后续处理 |
| P0 | 3 | 静态 Token 权限过大 - 垂直越权风险 | ✅ 已完成 |
| P1 | 2 | 缺乏事务性 - 数据可能不一致 | ✅ 已完成 |
| P1 | 4 | 角色 ID 硬编码 - 配置漂移风险 | ✅ 已完成 |
| P1 | 5 | 公开数据 API 未正确过滤 | ✅ 已完成 |
| P2 | 6 | 审批流程无驳回详情反馈 | ✅ 已完成 |
| P2 | 7 | 无 Rate Limiting | ✅ 已完成 |
| P2 | 8 | 缺乏审计日志 | ✅ 已完成 |
| P2 | 9 | 导出无脱敏 | ✅ 已完成 |
| P2 | 10 | 前端权限校验依赖客户端代码 | ✅ 已完成 |
| Low | 11 | 密码重置功能缺失 | ✅ 已完成 |
| Low | 12 | Session 过期时间未配置 | ✅ 已完成 |

---

## 二、修复详情

### 2.1 P0-3: 静态 Token 权限问题

**问题描述**: Server Actions 使用静态 Token 调用 Directus API，权限过大。

**修复方案**:
- 改用用户会话动态 Token (`session.accessToken`)
- 限制静态 Token 仅用于管理员操作（审计日志写入）

**修改文件**:
- `frontend/actions/submit-survey.ts`
- `frontend/actions/update-company-crm.ts`
- `frontend/actions/account-actions.ts`
- `frontend/actions/export-actions.ts`

---

### 2.2 P1-2: 事务性改造

**问题描述**: 企业创建/更新操作非原子性，可能导致数据不一致。

**修复方案**:
- 使用 Directus `TransactionPromise` 将所有操作封装为事务
- 任一操作失败自动回滚

**修改文件**:
- `frontend/actions/submit-survey.ts`
- `frontend/actions/update-company-crm.ts`

---

### 2.3 P1-4: 角色配置校验

**问题描述**: 角色 ID 硬编码，配置变更会导致权限错误。

**修复方案**:
- 登录时动态获取 Directus 角色配置
- 新增 `verify-role-config.mjs` 校验脚本
- 后备机制：环境变量 + 动态获取双重保障

**修改文件**:
- `frontend/auth.config.ts` - 新增动态角色映射
- `backend/scripts/verify-role-config.mjs` - 新增

---

### 2.4 P1-5: 公开数据权限

**问题描述**: public 角色可能访问敏感字段。

**修复方案**:
- 创建 `patch-public-permissions-v2.mjs` 脚本
- 显式定义 public 角色可访问的字段白名单
- 导出时实施字段级脱敏

**修改文件**:
- `backend/scripts/patch-public-permissions-v2.mjs` - 新增
- `frontend/actions/export-actions.ts` - 新增脱敏函数

---

### 2.5 P2-6: 驳回原因反馈

**问题描述**: 企业被拒绝后无法得知具体原因。

**修复方案**:
- `rejection_reason` 字段已在代码中使用
- 前端可展示驳回原因给企业用户

**修改文件**:
- `frontend/actions/update-company-crm.ts`

---

### 2.6 P2-7: Rate Limiting

**问题描述**: 登录/注册接口无请求频率限制。

**修复方案**:
- Middleware 层实现内存式 Rate Limiting
- 配置：
  - 登录: 5次/15分钟
  - 注册: 3次/小时

**修改文件**:
- `frontend/middleware.ts`

---

### 2.7 P2-8: 审计日志

**问题描述**: 缺乏操作审计追踪。

**修复方案**:
- 创建 `audit_logs` 表
- 关键操作自动记录：
  - 用户登录/注册
  - 企业创建/更新/提交
  - 管理员审批/添加尽调
  - 数据导出

**修改文件**:
- `backend/scripts/create-audit-logs-table.mjs` - 新增
- `frontend/actions/update-company-crm.ts` - 集成审计
- `frontend/actions/export-actions.ts` - 集成审计

---

### 2.8 P2-9: 导出脱敏

**问题描述**: 管理员导出敏感数据无保护。

**修复方案**:
- 自动脱敏字段：
  - 手机号: `138****1234`
  - 邮箱: `ab***@example.com`
  - 内部备注: `[已脱敏]`
- 可选参数控制是否脱敏

**修改文件**:
- `frontend/actions/export-actions.ts`

---

### 2.9 P2-10: API 权限校验

**问题描述**: 前端权限校验可能被绕过。

**修复方案**:
- Server Actions 已有后端权限校验
- Middleware 层强制认证检查

---

### 2.10 Low-11: 密码重置

**问题描述**: 用户无法找回密码。

**修复方案**:
- 新增 `/api/forgot-password` 接口
- 后续可集成邮件发送

**修改文件**:
- `frontend/app/api/forgot-password/route.ts` - 新增

---

### 2.11 Low-12: Session 配置

**问题描述**: Session 过期时间未明确配置。

**修复方案**:
- 配置 JWT Session 有效期为 24 小时

**修改文件**:
- `frontend/auth.ts`

---

## 三、新增文件清单

| 文件路径 | 说明 |
|----------|------|
| `backend/scripts/create-audit-logs-table.mjs` | 创建审计日志表 |
| `backend/scripts/verify-role-config.mjs` | 角色配置校验脚本 |
| `backend/scripts/patch-public-permissions-v2.mjs` | 强化 public 权限 |
| `frontend/lib/role-utils.ts` | 角色工具函数 |
| `frontend/lib/rate-limit.ts` | 限流工具库 |
| `frontend/app/api/forgot-password/route.ts` | 密码重置接口 |
| `docs/security_audit.md` | 安全审计报告 |

---

## 四、待后续处理

| 编号 | 事项 | 优先级 | 说明 |
|------|------|--------|------|
| 1 | 邮箱验证 | 高 | 用户注册后需验证邮箱 |
| 2 | 多级审批流程 | 中 | 初审→复审→终审 |
| 3 | 消息通知 | 中 | 邮件/站内信通知 |
| 4 | 数据备份策略 | 中 | 定期备份机制 |

---

## 五、部署后验证清单

- [ ] 运行 `node backend/scripts/create-audit-logs-table.mjs` 创建审计日志表
- [ ] 运行 `node backend/scripts/verify-role-config.mjs` 校验角色配置
- [ ] 运行 `node backend/scripts/patch-public-permissions-v2.mjs` 强化权限
- [ ] 确认 `.env` 中 `DIRECTUS_STATIC_TOKEN` 已配置（管理员专用）
- [ ] 测试登录 Rate Limiting
- [ ] 测试企业创建事务性
- [ ] 测试导出脱敏功能