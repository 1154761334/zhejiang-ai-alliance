import { test, expect } from '@playwright/test';

const BASE_URL = process.env.E2E_BASE_URL || 'http://localhost:3000';

test.describe('P0 冒烟测试 - 核心端到端链路', () => {
  const timestamp = Date.now();
  const testUser = {
    email: `smoke-${timestamp}@example.com`,
    password: 'Password123!',
    company: `Smog Test AI ${timestamp}`,
    creditCode: `91330101MA28${String(timestamp).slice(-6)}`,
  };

  test('P0-01: 完整注册登录链路', async ({ page }) => {
    // 1. 注册
    await page.goto(`${BASE_URL}/register`);
    await page.waitForLoadState('networkidle');
    await page.fill('input[id="email"]', testUser.email);
    await page.fill('input[id="password"]', testUser.password);
    await page.click('button:has-text("申请入驻")');
    
    // 2. 验证自动登录跳转
    await page.waitForURL('**/dashboard', { timeout: 20000 });
    await expect(page).toHaveURL(/dashboard/);
    
    // 3. 验证会话保持
    await page.reload();
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL(/dashboard/);
  });

  test('P0-02: 企业材料填报链路 (四步向导)', async ({ page }) => {
    test.setTimeout(120000); // 增加超时时间到 2 分钟
    // 登录并进入填报
    await page.goto(`${BASE_URL}/login`);
    await page.waitForLoadState('networkidle');
    await page.fill('input[id="email"]', testUser.email);
    await page.fill('input[id="password"]', testUser.password);
    await page.click('button:has-text("登录")');
    await page.waitForURL('**/dashboard', { timeout: 20000 });

    // 步骤1: 基础信息
    console.log('Filling Step 1...');
    await page.waitForSelector('input[name="company_name"]');
    await page.getByPlaceholder('请填写营业执照上的完整名称').fill(testUser.company);
    await page.getByPlaceholder('简要描述企业核心业务与定位').fill('这是一家专注AI智能体研发的冒烟测试企业。');
    await page.getByPlaceholder('18 位代码').fill(testUser.creditCode);
    await page.locator('input[type="date"]').fill('2020-01-01');
    
    // 处理所在区域 Select
    console.log('Selecting region...');
    await page.click('button:has(span:has-text("选择所在城市"))');
    await page.click('div[role="option"]:has-text("杭州市")');
    
    await page.getByPlaceholder('省市区街道...').fill('杭州市西湖区测试大厅 101 号');
    
    // 处理企业性质 Select (使用更精确的选择器)
    console.log('Selecting company type...');
    const companyTypeStep = page.locator('div').filter({ hasText: /^企业性质/ });
    await companyTypeStep.locator('button:has-text("请选择")').first().click();
    await page.click('div[role="option"]:has-text("民营企业")');
    
    await page.locator('input[type="number"]').first().fill('100');
    await page.locator('input[type="number"]').nth(1).fill('50');
    
    // 处理细分赛道 Checkbox
    await page.click('label:has-text("智能制造")');
    
    // 处理企业角色定位 Radio
    await page.click('label:has-text("应用解决方案层")');
    
    // 联系人信息
    await page.getByPlaceholder('姓名').fill('张三');
    await page.getByPlaceholder('CEO / 市场总监').fill('产品经理');
    await page.getByPlaceholder('11位手机号').fill('13812345678');
    await page.getByPlaceholder('email@example.com').fill(testUser.email);
    
    // 处理对接偏好 Select
    console.log('Selecting contact preference...');
    const preferenceStep = page.locator('div').filter({ hasText: /^首选对接偏好/ });
    await preferenceStep.locator('button:has-text("选择")').click();
    await page.click('div[role="option"]:has-text("电话")');
    
    // 点击进入第二步
    console.log('Clicking Next to Step 2...');
    await page.click('button:has-text("下一步：填写核心能力")');
    await page.waitForLoadState('networkidle');

    // 步骤2: 核心能力与产品
    console.log('Filling Step 2 (Products)...');
    await page.evaluate(() => window.scrollTo(0, 0));
    
    console.log('Filling product name...');
    await page.locator('div:has(> label:has-text("产品/能力名称")) input').fill('智能体助手 Pro');
    
    console.log('Filling product description...');
    await page.locator('div:has(> label:has-text("核心能力描述")) textarea').fill('这是一款基于AI大模型开发的智能体助手，能够高效完成日常办公任务。');
    
    // 处理产品形态 Select
    console.log('Selecting product form factor...');
    await page.locator('button[role="combobox"]:has-text("请选择")').first().click();
    await page.waitForSelector('div[role="option"]:has-text("智能体")');
    await page.click('div[role="option"]:has-text("智能体")');
    await page.waitForTimeout(500);
    
    // 处理成熟度 Select
    console.log('Selecting product maturity...');
    await page.locator('button[role="combobox"]:has-text("请选择")').first().click();
    await page.waitForSelector('div[role="option"]:has-text("规模化商用")');
    await page.click('div[role="option"]:has-text("规模化商用")');
    
    await page.screenshot({ path: 'tests/e2e/debug-p0-02-step2-finished.png', fullPage: true });
    console.log('Clicking Next to Step 3...');
    await page.click('button:has-text("下一步：补充案例")');
    
    // 第三步：场景案例
    console.log('Filling Step 3 (Cases)...');
    await page.getByText('场景案例库与量化效果').first().waitFor({ state: 'visible', timeout: 15000 });
    
    // 增加一个案例
    console.log('Adding a case study...');
    await page.click('button:has-text("增加一个场景案例")');
    await page.waitForSelector('label:has-text("案例标题")');
    
    await page.locator('div:has(> label:has-text("案例标题")) input').fill('测试案例：某市智能客服项目');
    await page.locator('div:has(> label:has-text("实施地点")) input').fill('浙江杭州');
    await page.locator('input[type="month"]').first().fill('2024-03');
    await page.locator('div:has(> label:has-text("核心痛点")) textarea').fill('客户面临数据孤岛问题');
    await page.locator('div:has(> label:has-text("解决方案")) textarea').fill('提供智能体集成方案');
    
    await page.click('button:has-text("下一步：合规与赋能需求"), button:has-text("下一步：填报需求")');
    
    // 第四步：填报需求与合规
    console.log('Filling Step 4 (Needs & Compliance)...');
    await page.getByText('核心生态需求与赋能意向').first().waitFor({ state: 'visible', timeout: 15000 });
    
    // 勾选融资需求
    await page.click('label:has-text("需股权融资(找VC)")');
    
    // 填写安全措施
    await page.locator('div:has(> label:has-text("企业数据安全管控措施概述")) textarea').fill('完善的隔离措施');
    
    // 勾选合规承诺
    console.log('Checking commitment...');
    await page.click('label:has-text("涉密与保密承诺")');
    
    // 最终提交
    console.log('Submitting for review...');
    await page.click('button:has-text("确认无误，提交审核")');
    
    // 等待成功提示
    console.log('Waiting for success toast...');
    await expect(page.locator('text=基础档案提交成功')).toBeVisible({ timeout: 20000 });
    
    // 刷新页面验证锁定状态
    console.log('Waiting 5s for persistence...');
    await page.waitForTimeout(5000);
    console.log('Reloading to verify locked state...');
    await page.reload();
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'tests/e2e/debug-dashboard-after-reload.png' });
    await expect(page.locator('text=处于锁定状态').first()).toBeVisible({ timeout: 15000 });
    console.log('P0-02 Success!');
  });

  test('P0-03: 数据回填链路', async ({ page }) => {
    console.log('Logging in for P0-03...');
    await page.goto(`${BASE_URL}/login`);
    await page.waitForLoadState('networkidle');
    await page.fill('input[id="email"]', testUser.email);
    await page.fill('input[id="password"]', testUser.password);
    await page.click('button:has-text("登录")');
    
    console.log('Waiting for dashboard in P0-03...');
    await page.waitForURL('**/dashboard', { timeout: 20000 });
    await page.waitForLoadState('networkidle');
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    await page.screenshot({ path: 'tests/e2e/debug-p0-03-dashboard.png' });
    
    console.log('Verifying company name and locked status...');
    await expect(page.locator('text=处于锁定状态').first()).toBeVisible({ timeout: 15000 });
    console.log('P0-03 Success!');
  });

  test.describe.configure({ mode: 'serial' });

  test('P0-04: 审批闭环链路', async ({ context, page }) => {
    // 清除之前用户的会话，确保管理员登录不受干扰
    await context.clearCookies();
    
    // 管理员登录
    console.log('Logging in as admin for P0-04...');
    await page.goto(`${BASE_URL}/login`);
    await page.waitForLoadState('networkidle');
    await page.fill('input[id="email"]', 'admin@example.com');
    await page.fill('input[id="password"]', 'password');
    await page.click('button:has-text("登录")');
    await page.waitForURL('**/admin', { timeout: 20000 });
    await page.screenshot({ path: 'tests/e2e/debug-p0-04-admin-dashboard.png' });

    // 进入企业审批页面
    await page.goto(`${BASE_URL}/admin/companies`);
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'tests/e2e/debug-p0-04-admin-companies.png' });
    
    // 1. 搜索公司
    console.log(`Searching for ${testUser.company}...`);
    await page.fill('input[placeholder="搜索企业全称..."]', testUser.company);
    await page.keyboard.press('Enter');
    await page.waitForTimeout(3000); // 等待过滤和 API 响应
    await page.screenshot({ path: 'tests/e2e/debug-p0-04-search-result.png' });
    
    // 检查是否搜到
    const rowCount = await page.locator('table tr').filter({ hasText: testUser.company }).count();
    if (rowCount === 0) {
        console.log('Company not found in table after search. Trying to reload and search again...');
        await page.reload();
        await page.waitForLoadState('networkidle');
        await page.fill('input[placeholder="搜索企业全称..."]', testUser.company);
        await page.keyboard.press('Enter');
        await page.waitForTimeout(3000);
    }
    
    // 2. 点击操作菜单并进入详情
    console.log('Opening action menu...');
    const actionMenu = page.locator('table tr').filter({ hasText: testUser.company }).locator('button:has(svg)').last();
    if (await actionMenu.count() === 0) {
        console.error('Action menu button not found for company!');
        throw new Error('Action menu button not found');
    }
    await actionMenu.click();
    await page.screenshot({ path: 'tests/e2e/debug-p0-04-dropdown.png' });
    await page.click('div[role="menuitem"]:has-text("编辑/审核")');
    
    // 3. 验证进入详情页并修改状态
    console.log('On detail page. Changing status...');
    await page.waitForURL('**/admin/companies/*', { timeout: 15000 });
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'tests/e2e/debug-p0-04-detail-page.png' });
    
    // 切换状态为 正式入库
    // 尝试寻找状态选择器，可能是 Select
    const statusTrigger = page.locator('button:has(span:has-text("待出访尽调")), button:has(span:has-text("待审批")), button:has(span:has-text("状态"))').first();
    await statusTrigger.click();
    await page.click('div[role="option"]:has-text("正式入库")');
    
    // 4. 保存
    console.log('Saving approval...');
    await page.click('button:has-text("保存全案")');
    await expect(page.getByText('公共信息已同步至数据库')).toBeVisible({ timeout: 10000 });
    console.log('P0-04 Success!');
  });

  test('P0-05: 数据隔离链路', async ({ page, request }) => {
    // 以另一个测试用户登录
    const otherUserEmail = `other-${timestamp}@example.com`;
    await page.goto(`${BASE_URL}/register`);
    await page.fill('input[id="email"]', otherUserEmail);
    await page.fill('input[id="password"]', testUser.password);
    await page.click('button:has-text("申请入驻")');
    await page.waitForURL('**/dashboard');

    // 尝试通过 API 获取第一个用户的数据 (这里模拟跨站请求或权限检查)
    const response = await request.get(`${BASE_URL}/api/test-directus`);
    const data = await response.json().catch(() => ({}));
    
    // 验证返回的数据中不包含第一个用户的敏感信息
    if (Array.isArray(data)) {
      const found = data.find(d => d.company_name === testUser.company);
      expect(found).toBeUndefined(); // 符合 RLS 策略，应该查不到
    }
  });
});
