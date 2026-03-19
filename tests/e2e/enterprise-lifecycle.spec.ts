import { test, expect } from '@playwright/test';

const BASE_URL = process.env.E2E_BASE_URL || 'http://localhost:3001';

test.describe('企业全生命周期闭环测试 - 注册至入库审批', () => {
  const timestamp = Date.now();
  const testEmail = `lifecycle-${timestamp}@example.com`;
  const companyName = `生命周期测试企业 ${timestamp}`;

  test('完成从账号注册、表单填报到秘书处审核通过的全流程', async ({ page, context }) => {
    test.setTimeout(450000);

    // --- PHASE 1: 企业自主注册与填报 ---
    await test.step('PHASE 1: 企业注册与填报', async () => {
      console.log('>>> [1] 开始注册');
      await context.clearCookies();
      await page.goto(`${BASE_URL}/register`);
      await page.fill('#email', testEmail);
      await page.fill('#password', 'Password123!');
      await page.click('button:has-text("申请入驻")');
      await page.waitForURL('**/dashboard', { timeout: 30000 });

      console.log('>>> [2] Step 1 填报');
      await page.waitForSelector('input[name="company_name"]');
      await page.locator('input[name="company_name"]').fill(companyName);
      await page.locator('input[name="company_description"]').fill('闭环生命周期测试描述。');
      await page.locator('input[name="credit_code"]').fill(`91330101MA2${String(timestamp).slice(-7)}`);
      
      // 日期
      await page.locator('button:has(.lucide-calendar)').first().click();
      await page.locator('table[role="grid"] button:not([disabled])').first().click();
      await page.keyboard.press('Escape');

      const comboboxes = page.locator('button[role="combobox"]');
      await comboboxes.nth(0).click(); // 城市
      await page.click('[role="option"]:has-text("杭州市")');
      await page.locator('input[name="address"]').fill('杭州西湖区');
      await comboboxes.nth(1).click(); // 性质
      await page.click('[role="option"]:has-text("民营企业")');
      await page.locator('input[name="employee_count"]').fill('50');
      await page.locator('input[name="rnd_count"]').fill('20');
      await comboboxes.nth(2).click(); // 营收
      await page.locator('[role="option"]').first().click();
      await page.click('label:has-text("智能制造")');
      await page.click('label:has-text("应用解决方案层")');
      await page.locator('input[name="contact_name"]').fill('Lifecycle Admin');
      await page.locator('input[name="contact_position"]').fill('Admin');
      await page.locator('input[name="contact_phone"]').fill('13000002222');
      await page.locator('input[name="contact_email"]').fill(testEmail);
      await comboboxes.nth(3).click(); // 偏好
      await page.click('[role="option"]:has-text("微信")');
      await page.click('button:has-text("下一步：填写核心能力")');

      console.log('>>> [3] Step 2-4 快速填报并提交');
      await expect(page.locator('text=第二板块')).toBeVisible();
      await page.locator('input[name="products.0.name"]').fill('Lifecycle Product');
      const step2combos = page.locator('button[role="combobox"]');
      await step2combos.nth(0).click();
      await page.click('[role="option"]:has-text("软件平台")');
      await step2combos.nth(1).click();
      await page.click('[role="option"]:has-text("规模化商用")');
      await page.locator('textarea[name="products.0.description"]').fill('Lifecycle desc.');
      await page.click('button:has-text("下一步：补充案例")');

      await expect(page.locator('text=第三板块')).toBeVisible();
      await page.click('button:has-text("下一步：合规与赋能需求")'); // Step 3 选填，直接跳过

      await expect(page.locator('text=合规承诺与生态赋能')).toBeVisible();
      await page.locator('textarea[name="data_security_measures"]').fill('Standard security.');
      await page.locator('label:has-text("涉密与保密承诺")').click();
      await page.click('button:has-text("确认无误，提交审核")');
      await expect(page.locator('text=基础档案提交成功')).toBeVisible({ timeout: 20000 });
      console.log('>>> [OK] 企业端填报提交完成');
    });

    // --- PHASE 2: 秘书处审核通过 (UI 交互方式) ---
    await test.step('PHASE 2: 秘书处审核 (UI)', async () => {
      console.log('>>> [4] 正在登录管理后台进行审批...');
      await context.clearCookies();
      await page.goto(`${BASE_URL}/login`);
      await page.fill('#email', 'admin@example.com');
      await page.fill('#password', 'password');
      await page.click('button:has-text("登录")');
      
      // 增加鲁棒性：如果跳到了 /dashboard 则手动导向 /admin/companies
      await page.waitForTimeout(3000);
      if (page.url().includes('/dashboard')) {
        console.log('>>> [INFO] 管理员跳转到了企业看板，正在强制重定向至管理后台');
        await page.goto(`${BASE_URL}/admin/companies`, { waitUntil: 'networkidle' });
      } else {
        await page.waitForURL('**/admin/companies', { timeout: 15000 });
      }
      
      console.log('>>> [5] 正在搜索企业:', companyName);
      // 搜索企业
      await page.fill('input[placeholder="搜索单位名称..."]', companyName);
      await page.waitForTimeout(3000); // 给表格一点过滤时间
      
      // 找到匹配的行，并在该行操作菜单
      const row = page.locator(`tr:has-text("${companyName}")`);
      await row.locator('button:has(.lucide-more-horizontal)').click();
      
      // 点击“编辑/审核”
      await page.click('div[role="menuitem"]:has-text("编辑/审核")');
      await page.waitForURL('**/admin/companies/**', { timeout: 15000 });
      
      console.log('>>> [6] 正在变更状态为“正式入库”并保存');
      // 状态选择器
      await page.click('button[role="combobox"]:has-text("待出访尽调")');
      await page.click('div[role="option"]:has-text("正式入库")');
      
      // 保存
      await page.click('button:has-text("保存全案")');
      // 等待 Toast 成功信息
      await expect(page.locator('text=公共信息已同步至数据库')).toBeVisible({ timeout: 15000 });
      
      console.log('>>> [OK] 管理端审批流程完成');
    });

    // --- PHASE 3: 最终状态回访 ---
    await test.step('PHASE 3: 企业状态回访验证', async () => {
      console.log('>>> [7] 切回企业会话');
      await context.clearCookies();
      await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle' });
      await page.fill('#email', testEmail);
      await page.fill('#password', 'Password123!');
      await page.click('button:has-text("登录")');
      
      // 企业端应跳转至 /dashboard
      await page.waitForURL('**/dashboard');
      
      // 验证收录文本 (根据 DashboardPage.tsx)
      await expect(page.locator('text=已正式收录')).toBeVisible({ timeout: 15000 });
      console.log('>>> [SUCCESS] 全生命周期闭环测试圆满成功！');
    });
  });
});
