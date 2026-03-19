import { test, expect } from '@playwright/test';

const BASE_URL = process.env.E2E_BASE_URL || 'http://localhost:3001';

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
      await page.waitForLoadState('load');
      await page.fill('input[id="email"]', testUser.email);
      await page.fill('input[id="password"]', testUser.password);
      await page.click('button:has-text("申请入驻")');
      
      await page.waitForURL('**/dashboard', { timeout: 20000 });
      await expect(page.locator('h1:has-text("会员专属工作台")')).toBeVisible({ timeout: 15000 });
      console.log('Registration Success (Dashboard Loaded)');
      
      console.log('Registration Success');
    });

    // STEP 2: 企业材料填报
    await test.step('P0-02: 企业四步向导材料填报 (真实 UI 交互)', async () => {
      // --- NEGATIVE TEST: Step 1 未选填必填项点击下一步 ---
      console.log('Running Negative Test: Missing Company Name');
      await page.getByPlaceholder('请填写营业执照上的完整名称').clear();
      await page.click('button:has-text("下一步：填写核心能力")');
      
      // 断言报错 Toast 出现
      await expect(page.locator('text=请先修正“基础信息”中的错误。')).toBeVisible({ timeout: 5000 });
      console.log('Negative Test Passed: Blocked by validation');

      // --- STEP 1: 基础信息 ---
      // 更加稳健的原子操作：先点击、后输入、再 Tab
      const fillInput = async (name: string, value: string) => {
        const loc = page.locator(`input[name="${name}"], textarea[name="${name}"]`).first();
        await loc.scrollIntoViewIfNeeded();
        await loc.fill(value);
        await loc.press('Tab');
        await page.waitForTimeout(100);
      };

      await fillInput('company_name', testUser.company);
      await fillInput('company_description', '专注AI智能体研发的冒烟测试企业。');
      await fillInput('credit_code', testUser.creditCode);
      
      // DatePicker
      await page.waitForSelector('button:has-text("请选择成立日期")');
      await page.click('button:has-text("请选择成立日期")');
      await page.waitForSelector('[role="dialog"]');
      await page.locator('[role="dialog"] [role="gridcell"]:not([disabled])').first().click();
      await page.waitForTimeout(500);

      // Select: 所在区域
      await page.locator('button:has(span:has-text("选择所在城市"))').click();
      await page.waitForSelector('[role="listbox"]');
      await page.locator('[role="option"]:has-text("杭州市")').click();
      await page.waitForTimeout(300);
      
      await fillInput('address', '测试街道 101 号');
      
      // Select: 企业性质
      await page.locator('button:has(span:has-text("请选择"))').first().click();
      await page.waitForSelector('[role="listbox"]');
      await page.locator('[role="option"]:has-text("民营企业")').click();
      await page.waitForTimeout(300);
      
      await fillInput('employee_count', '100');
      await fillInput('rnd_count', '50');

      // Select: 营收区间
      await page.locator('button:has(span:has-text("请选择"))').first().click();
      await page.waitForSelector('[role="listbox"]');
      await page.locator('[role="option"]:has-text("500万以下")').click();
      await page.waitForTimeout(300);
      
      await page.locator('label:has-text("智能制造")').click();
      await page.locator('label:has-text("应用解决方案层")').click();
      
      await fillInput('contact_name', '张三');
      await fillInput('contact_position', '测试岗');
      await fillInput('contact_phone', '18858172930');
      await fillInput('contact_email', testUser.email);
      
      // Select: 对接偏好
      await page.locator('button:has(span:has-text("选择"))').last().click();
      await page.waitForSelector('[role="listbox"]');
      await page.locator('[role="option"]:has-text("电话")').click();
      await page.waitForTimeout(300);
      
      await page.click('button:has-text("下一步：填写核心能力")');
      await expect(page.locator('text=第二板块：核心产品库构建')).toBeVisible({ timeout: 20000 });

      // --- STEP 2: 产品能力 ---
      await fillInput('products.0.name', 'Antigravity AI Engine');
      
      await page.getByLabel(/^产品形态/).click();
      await page.waitForSelector('[role="listbox"]');
      await page.locator('[role="option"]:has-text("智能体")').click();
      
      await page.getByLabel(/^成熟度阶段/).click();
      await page.waitForSelector('[role="listbox"]');
      await page.locator('[role="option"]:has-text("规模化商用")').click();
      
      await fillInput('products.0.description', '全自主研发的 AGI 核心引擎，支持全自动编码。');
      await fillInput('products.0.tech_stack', 'Transformer / RLHF / RAG');
      
      await page.locator('label:has-text("依赖商用闭源API")').click();
      await page.locator('label:has-text("编排")').click();
      await page.locator('label:has-text("采集")').click();
      
      const cycleInput = page.getByRole('spinbutton', { name: /交付周期典型值/ });
      await cycleInput.fill('3');
      await cycleInput.press('Tab');
      
      await page.getByLabel('定价方式').click();
      await page.waitForSelector('[role="listbox"]');
      await page.locator('[role="option"]:has-text("按量计费")').first().click();
      
      await page.getByLabel('可提供的试点方式').click();
      await page.waitForSelector('[role="listbox"]');
      await page.locator('[role="option"]:has-text("免费 PoC")').click();
      
      await page.waitForTimeout(500);
      await page.click('button:has-text("下一步：补充案例")');
      await expect(page.locator('text=第三板块：标杆案例库与量化效果')).toBeVisible({ timeout: 20000 });

      // --- STEP 3: 场景案例 (跳过选填项以确保主流程闭环) ---
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);
      
      console.log('Forcing navigation to Step 4 via Tab click');
      await page.evaluate(() => {
        const tabs = Array.from(document.querySelectorAll('button[role="tab"]'));
        const tab4 = tabs.find(t => t.innerText.includes('合规'));
        if (tab4) (tab4 as HTMLElement).click();
      });
      
      // Also try the button as a secondary action
      await page.evaluate(() => {
        const btn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('合规与赋能需求'));
        if (btn) (btn as HTMLElement).click();
      });
      
      await expect(page.locator('text=第四板块：核心生态需求与入库承诺')).toBeVisible({ timeout: 25000 });

      // --- STEP 4: 需求与合规 ---
      await page.locator('label:has-text("需股权融资(找VC)")').click();
      await page.locator('label:has-text("大客户对接联络")').click();
      
      const fillInputStep4 = async (name: string, value: string) => {
        const loc = page.locator(`input[name="${name}"], textarea[name="${name}"]`).first();
        await loc.fill(value);
        await loc.press('Tab');
      };
      await fillInputStep4('data_security_measures', '三级等保环境，全量数据加密留存。');
      await page.locator('label:has-text("涉密与保密承诺")').click();

      // FINAL SUBMISSION
      await page.click('button:has-text("确认并正式提交申请")');
      await expect(page.locator('text=申请提交成功')).toBeVisible({ timeout: 30000 });
      console.log('Form Submission Successful');
    });

    // STEP 3: 数据固化校验
    await test.step('P0-03: 数据锁定状态校验', async () => {
      await page.waitForTimeout(3000);
      await page.goto(`${BASE_URL}/dashboard`);
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
      await page.waitForLoadState('load');
      
      // 搜索刚注册的企业
      await page.getByPlaceholder('搜索企业全称...').fill(testUser.company);
      await page.waitForTimeout(1000);
      
      // 点击“更多”按钮
      await page.getByRole('button', { name: 'Open menu' }).click();
      await page.locator('div[role="menuitem"]:has-text("编辑/审核")').click();
      
      // 进入详情页修改状态
      await expect(page.locator('text=企业管理全景 (A 层)')).toBeVisible({ timeout: 20000 });
      
      // 修改为“正式入库”
      await page.getByLabel('当前状态').click();
      await page.waitForSelector('[role="listbox"]');
      await page.locator('[role="option"]:has-text("正式入库")').click();
      
      // 保存
      await page.click('button:has-text("保存全案")');
      await expect(page.locator('text=企业信息更新成功')).toBeVisible({ timeout: 20000 });
      
      console.log('Full E2E Lifecycle Verified Successfully!');
    });
  });
});
