# 浙江省AI智能体产业发展联盟平台 - 系统测试计划 (System Test Plan)

## 一、测试范围与架构概述
基于对系统代码的深度分析，本测试计划由资深自动化测试架构师设计，旨在覆盖联盟平台全业务闭环，涵盖以下三大核心支柱：

### 1.1 业务覆盖范围
- **阶段一：账号与认证体系** —— 注册、登录、角色路由保护、会话管理、CSRF 防护。
- **阶段二：企业端材料填报** —— 四步向导式填报、产品库多条目管理、数据持久化、事务性提交。
- **阶段三：秘书处审批台** —— 企业全量大表、三层数据审批模型（待出访、待审批、正式入库）、审计日志、建议反馈。
- **阶段四：安全与数据隔离** —— 基于 Directus 的行级安全（RLS）、公开接口权限强化、敏感数据脱敏导出。

### 1.2 技术架构
- **E2E 框架**: Playwright
- **测试语言**: TypeScript
- **运行环境**: 对齐 `NEXT_PUBLIC_API_URL` 环境变量
- **数据验证**: 提供 Directus SDK + REST API 结合的后端联调脚本

---

## 二、测试矩阵与缺陷等级定义

### 2.1 优先级定义 (Severity Matrix)
| 等级 | 名称 | 定义 | 修复期限 |
| :--- | :--- | :--- | :--- |
| **P0** | **阻断级 (Blocker)** | 核心业务路径不通（如无法注册、提交材料报错） | 立即 (ASAP) |
| **P1** | **关键级 (Critical)** | 功能不完整或权限越权（如普通用户能进入后台） | 24小时内 |
| **P2** | **常规级 (Major)** | 边缘功能异常或 UI 严重布局错乱 | 3个工作日内 |
| **P3** | **优化级 (Minor)** | 文案错误或微小视觉偏差 | 下个版本迭代 |

### 2.2 核心冒烟测试用例 (P0-P1)
| 编号 | 模块 | 场景描述 | 预期结果 |
| :--- | :--- | :--- | :--- |
| P0-01 | 身份认证 | 新企业邮箱注册并自动跳转 Dashboard | 账号成功创建，自动登录并进入填报大厅 |
| P0-02 | 核心填报 | 企业四步向导材料提交（含产品、案例） | 所有字段（含下拉框）成功落库至 Directus |
| P0-03 | 状态锁定 | 已提交全案后的 Dashboard 视图 | 显示“处于锁定状态”，表单变灰不可编辑 |
| P0-04 | 审批流 | 管理员在后台搜索企业并执行“正式入库” | 企业状态从 `pending_review` 变为 `published` |
| P0-05 | 数据保护 | USER A 尝试通过 API 修改 USER B 的企业数据 | 服务器返回 403 Forbidden (RLS 生效) |

---

## 三、自动化测试实现 (Playwright 代码示例)

### 3.1 核心全链路统一验证示例
此代码用于验证从注册到管理员审批的闭环：

```typescript
// tests/e2e/core-smoke-unified.spec.ts
import { test, expect } from '@playwright/test';

test.describe('P0 核心全链路冒烟测试', () => {
  const timestamp = Date.now();
  const testUser = {
    email: `smoke-${timestamp}@example.com`,
    password: 'Password123!',
    company: `Smog Test AI ${timestamp}`,
  };

  test('从注册到审批的全链路闭环验证', async ({ page, context }) => {
    // 1. 账号注册
    await page.goto('/register');
    await page.fill('input[id="email"]', testUser.email);
    await page.fill('input[id="password"]', testUser.password);
    await page.click('button:has-text("申请入驻")');
    await expect(page).toHaveURL(/dashboard/);

    // 2. 企业填报 (Step 1)
    await page.getByPlaceholder('请填写营业执照上的完整名称').fill(testUser.company);
    // ... 更多定位器操作 ...
    await page.click('button:has-text("确认无误，提交审核")');
    await expect(page.locator('text=基础档案提交成功')).toBeVisible();

    // 3. 状态锁定校验
    await page.reload();
    await expect(page.locator('text=处于锁定状态').first()).toBeVisible();

    // 4. 管理员审批 (清除 Cookies 切换身份)
    await context.clearCookies();
    await page.goto('/login');
    await page.fill('input[id="email"]', 'admin@example.com');
    await page.fill('input[id="password"]', 'password');
    await page.click('button:has-text("登录")');
    
    await page.goto('/admin/companies');
    await page.fill('input[placeholder="搜索企业全称..."]', testUser.company);
    await page.keyboard.press('Enter');
    await expect(page.locator('table tr').filter({ hasText: testUser.company }).first()).toBeVisible();
    
    // ... 执行状态变更操作 ...
  });
});
```

---

## 四、执行环境与诊断工具

### 4.1 运行指令
```bash
# 执行完整 P0 冒烟测试
npx playwright test tests/e2e/core-smoke-unified.spec.ts --project=chromium

# 执行分模块自动化测试
npx playwright test tests/e2e/01-auth.spec.ts    # 账号体系
npx playwright test tests/e2e/02-dashboard.spec.ts # 企业填报
npx playwright test tests/e2e/03-admin.spec.ts     # 秘书处后台
npx playwright test tests/e2e/05-security.spec.ts  # 安全与 RLS
```

### 4.2 诊断说明
项目已集成的自动化测试套件涵盖了从前端渲染到后端数据持久化的全过程，原有的临时诊断脚本已整合进 `tests/e2e` 文件夹中，确保持续集成（CI）的统一性。

---

## 五、测试验收标准 (Definition of Done)
1. **自动化覆盖率**: 所有 P0 级别链路必须集成到 Playwright CI 流程。
2. **回归成功率**: 每次迭代后，上述冒烟脚本必须 100% 通过。
3. **安全基线**: 所有公开 API 的 RLS 权限通过 `patch-public-permissions.mjs` 验证。
4. **归档与同步**: 测试计划应作为项目的核心文档，随业务逻辑变更同步更新。
