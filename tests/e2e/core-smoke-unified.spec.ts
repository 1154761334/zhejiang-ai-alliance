import { test, expect } from '@playwright/test';

const BASE_URL = process.env.E2E_BASE_URL || 'http://localhost:4000';

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
      
      // 第一个下拉：形态 (使用更明确的 label 关联定位)
      await page.locator('div:has(> label:has-text("产品形态")) button').click();
      await page.waitForSelector('[role="listbox"]');
      await page.locator('[role="option"]:has-text("智能体")').click();
      await page.waitForTimeout(300);
      
      // 第二个下拉：成熟度
      await page.locator('div:has(> label:has-text("成熟度阶段")) button').click();
      await page.waitForSelector('[role="listbox"]');
      await page.locator('[role="option"]:has-text("规模化商用")').click();
      await page.waitForTimeout(300);
      
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
      
      await page.waitForTimeout(1000);
      await page.click('button:has-text("下一步：补充案例")');
      await expect(page.locator('text=第三板块：行业场景与标杆案例')).toBeVisible({ timeout: 20000 });

      // --- STEP 3: 场景案例 (跳过选填项直接完成) ---
      await page.waitForTimeout(1000);
      await page.click('button:has-text("下一步：合规与赋能需求")');
      await expect(page.locator('text=第四/五板块：合规承诺与生态赋能')).toBeVisible({ timeout: 25000 });

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

      // --- STEP 4: 审核与回显断言 ---
      // 断言：在最终页面，Tab 1 的数据能够回显 (直接切回去看)
      await page.click('button[role="tab"]:has-text("1. 基础信息")');
      await expect(page.locator('input[name="company_name"]')).toHaveValue(testUser.company);
      await page.click('button[role="tab"]:has-text("4. 合规与需求")');

      // FINAL SUBMISSION
      await page.click('button:has-text("确认无误，提交审核")');
      await expect(page.locator('text=基础档案提交成功')).toBeVisible({ timeout: 30000 });
      console.log('Form Submission Successful');
    });

    // STEP 3: 数据固化校验
    await test.step('P0-03: 数据锁定状态校验', async () => {
      // 使用 expect.toPass 增强重试机制，等待服务端状态同步 (Next.js Revalidation 延迟)
      await expect(async () => {
        await page.goto(`${BASE_URL}/dashboard`);
        await page.waitForLoadState('networkidle');
        const lockText = page.locator('text=/锁定状态|待审|已收录|禁止修改/');
        await expect(lockText).toBeVisible({ timeout: 5000 });
      }).toPass({
        intervals: [1000, 2000, 5000],
        timeout: 20000,
      });
      console.log('Lock State Verified via expect.toPass');
    });

    // STEP 4: 秘书处审批流转
    await test.step('P0-04: 管理员审批闭环', async () => {
      await context.clearCookies();
      await page.goto(`${BASE_URL}/login`);
      await page.fill('input[id="email"]', 'admin@example.com');
      await page.fill('input[id="password"]', 'password');
      await page.click('button:has-text("登录")');
      
      // 等待登录成功 Toast 或跳转
      await expect(page.locator('text=登录成功')).toBeVisible({ timeout: 10000 });
      
      // 强制进入企业管理页面 
      await page.goto(`${BASE_URL}/admin/companies`, { waitUntil: 'networkidle' });
      
      // 如果被弹回了 dashboard，说明角色映射有问题，尝试重度诊断性跳转
      if (page.url().includes('/dashboard')) {
        console.log('Admin login redirected! Attempting direct sub-page access...');
        await page.goto(`${BASE_URL}/admin/companies`);
        await page.waitForLoadState('domcontentloaded');
      }

      await expect(page.locator('h1, h2, h3').filter({ hasText: '企业管理' })).toBeVisible({ timeout: 15000 });
      
      // 搜索刚注册的企业
      const searchInput = page.getByPlaceholder('搜索企业全称...');
      await searchInput.fill(testUser.company);
      await page.keyboard.press('Enter');
      await page.waitForTimeout(2000);
      
      // 点击“审核项”
      const registrationRow = page.locator('tr').filter({ hasText: testUser.company });
      await expect(registrationRow).toBeVisible({ timeout: 10000 });
      
      // 查找并点击该行的操作菜单 (假设是最后一个单元格的按钮或特定的 Select)
      await registrationRow.locator('button').last().click();
      await page.waitForSelector('[role="menu"]');
      await page.locator('div[role="menuitem"]:has-text("编辑/审核")').click();
      
      // 审核操作
      await expect(page.locator('text=企业管理全景')).toBeVisible({ timeout: 20000 });
      
      // 修改状态为“正式入库”
      await page.locator('button:has(span:has-text("待出访尽调"))').first().click();
      await page.waitForSelector('[role="listbox"]');
      await page.locator('[role="option"]:has-text("正式入库")').click();
      
      // 保存
      await page.click('button:has-text("保存全案")');
      await expect(page.locator('text=展示已更新')).toBeVisible({ timeout: 20000 });
      
      console.log('Full E2E Lifecycle Verified Successfully!');
    });
  });
});
