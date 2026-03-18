import { test, expect } from '@playwright/test';

const BASE_URL = process.env.E2E_BASE_URL || 'http://localhost:3000';

async function projectContextClear(page) {
    await page.goto(BASE_URL);
    await page.evaluate(() => {
        localStorage.clear();
        sessionStorage.clear();
    });
}

test.describe('P0 冒烟测试 - 核心端到端全链路', () => {
  // 在 describe 级别定义全链路共享的变量
  const timestamp = Date.now();
  const testUser = {
    email: `smoke-${timestamp}@example.com`,
    password: 'Password123!',
    company: `Smog Test AI ${timestamp}`,
    creditCode: `91330101MA28${String(timestamp).slice(-6)}`,
  };

  test('P0: 从注册到审批的全链路闭环验证', async ({ page, context }) => {
    test.setTimeout(180000); // 设置 3 分钟超时

    page.on('console', msg => {
      if (msg.text().includes('Form Data:')) {
        console.log(`[FRONTEND_LOG] ${msg.text()}`);
      }
    });

    // STEP 0: 确保环境干净
    await context.clearCookies();
    await projectContextClear(page); // 假设我们有一个清除 localStorage 的方法，或者直接 goto 并清除

    // STEP 1: 账号注册
    await test.step('P0-01: 账号自动注册与登录跳转', async () => {
      await page.goto(`${BASE_URL}/register`);
      await page.waitForLoadState('networkidle');
      await page.fill('input[id="email"]', testUser.email);
      await page.fill('input[id="password"]', testUser.password);
      await page.click('button:has-text("申请入驻")');
      
      await page.waitForURL('**/dashboard', { timeout: 20000 });
      await expect(page).toHaveURL(/dashboard/);
      
      // 验证 UI 上的登录用户
      await page.waitForSelector('span.relative.flex.shrink-0'); // 头像
      await page.click('span.relative.flex.shrink-0'); // 点击头像打开下拉
      const loggedInEmail = await page.locator('p.truncate.text-sm.text-muted-foreground').textContent();
      console.log(`Logged in as: ${loggedInEmail}`);
      if (loggedInEmail !== testUser.email.toLowerCase()) {
         throw new Error(`Session mismatch! Expected ${testUser.email}, but UI shows ${loggedInEmail}`);
      }
      await page.keyboard.press('Escape'); // 关闭下拉
      
      console.log('Registration Success');
    });

    // STEP 2: 企业材料填报
    await test.step('P0-02: 企业四步向导材料填报', async () => {
      // 步骤1: 基础信息
      await page.waitForSelector('input[name="company_name"]');
      await page.getByPlaceholder('请填写营业执照上的完整名称').fill(testUser.company);
      await page.getByPlaceholder('简要描述企业核心业务与定位').fill('专注AI智能体研发的冒烟测试企业。');
      await page.getByPlaceholder('18 位代码').fill(testUser.creditCode);
      await page.locator('input[type="date"]').fill('2020-01-01');
      
      await page.click('button:has(span:has-text("选择所在城市"))');
      await page.click('div[role="option"]:has-text("杭州市")');
      await page.getByPlaceholder('省市区街道...').fill('测试街道 101 号');
      
      const companyTypeStep = page.locator('div').filter({ hasText: /^企业性质/ });
      await companyTypeStep.locator('button:has-text("请选择")').first().click();
      await page.click('div[role="option"]:has-text("民营企业")');
      
      await page.locator('input[type="number"]').first().fill('100');
      await page.locator('input[type="number"]').nth(1).fill('50');
      await page.click('label:has-text("智能制造")');
      await page.click('label:has-text("应用解决方案层")');
      
      await page.getByPlaceholder('姓名').fill('张三');
      await page.getByPlaceholder('CEO / 市场总监').fill('测试岗');
      await page.getByPlaceholder('11位手机号').fill('13812345678');
      await page.getByPlaceholder('email@example.com').fill(testUser.email);
      
      const preferenceStep = page.locator('div').filter({ hasText: /^首选对接偏好/ });
      await preferenceStep.locator('button:has-text("选择")').click();
      await page.click('div[role="option"]:has-text("电话")');
      
      await page.click('button:has-text("下一步：填写核心能力")');
      await page.waitForLoadState('networkidle');

      // 步骤2: 核心能力
      await page.locator('div:has(> label:has-text("产品/能力名称")) input').fill('智能体助手 Pro');
      await page.locator('div:has(> label:has-text("核心能力描述")) textarea').fill('核心能力描述文本。');
      await page.locator('button[role="combobox"]:has-text("请选择")').first().click();
      await page.click('div[role="option"]:has-text("智能体")');
      
      // 注意：成熟度 Select 的 ID 或文字可能需要精确匹配
      await page.locator('button[role="combobox"]:has-text("请选择")').first().click();
      await page.click('div[role="option"]:has-text("规模化商用")');
      
      await page.click('button:has-text("下一步：补充案例")');
      await page.waitForLoadState('networkidle');

      // 步骤3: 场景案例
      await page.click('button:has-text("下一步：合规与赋能需求"), button:has-text("下一步：填报需求")');
      await page.waitForLoadState('networkidle');

      // 步骤4: 填报需求与合规提交
      await page.click('label:has-text("需股权融资(找VC)")');
      await page.locator('div:has(> label:has-text("企业数据安全管控措施概述")) textarea').fill('安全措施文本');
      await page.click('label:has-text("涉密与保密承诺")');
      
      await page.click('button:has-text("确认无误，提交审核")');
      await expect(page.locator('text=基础档案提交成功')).toBeVisible({ timeout: 20000 });
      console.log('Submission Success');
    });

    // STEP 3: 数据固化校验
    await test.step('P0-03: 数据锁定状态校验', async () => {
      await page.waitForTimeout(3000);
      await page.reload();
      await page.waitForLoadState('networkidle');
      await expect(page.locator('text=处于锁定状态').first()).toBeVisible({ timeout: 15000 });
      console.log('Lock State Verified');
    });

    // STEP 4: 秘书处审批流转
    await test.step('P0-04: 管理员审批闭环', async () => {
      await context.clearCookies();
      await page.goto(`${BASE_URL}/login`);
      await page.fill('input[id="email"]', 'admin@example.com');
      await page.fill('input[id="password"]', 'password');
      await page.click('button:has-text("登录")');
      await page.waitForURL('**/admin', { timeout: 20000 });

      await page.goto(`${BASE_URL}/admin/companies`);
      await page.waitForLoadState('networkidle');
      
      console.log(`Searching for ${testUser.company}...`);
      await page.fill('input[placeholder="搜索企业全称..."]', testUser.company);
      await page.keyboard.press('Enter');
      await page.waitForTimeout(5000); // 增加等待时间
      
      let companyRow = page.locator('table tr').filter({ hasText: testUser.company });
      const rowCount = await companyRow.count();
      
      if (rowCount === 0) {
        console.log('Company not found via search. Clearing search and trying to find in the list...');
        await page.fill('input[placeholder="搜索企业全称..."]', '');
        await page.keyboard.press('Enter');
        await page.waitForTimeout(5000);
        companyRow = page.locator('table tr').filter({ hasText: testUser.company });
      }
      
      await expect(companyRow.first()).toBeVisible({ timeout: 15000 });
      console.log('Found company row. Proceeding to edit...');
      
      await companyRow.first().locator('button:has(svg)').last().click();
      await page.click('div[role="menuitem"]:has-text("编辑/审核")');
      
      await page.waitForURL('**/admin/companies/*', { timeout: 15000 });
      
      // 切换状态并保存
      const statusTrigger = page.locator('button:has(span:has-text("待出访尽调")), button:has(span:has-text("待审批")), button:has(span:has-text("状态"))').first();
      await statusTrigger.click();
      await page.click('div[role="option"]:has-text("正式入库")');
      
      await page.click('button:has-text("保存全案")');
      await expect(page.getByText('公共信息已同步至数据库')).toBeVisible({ timeout: 10000 });
      console.log('Approval Success');
    });
  });
});
