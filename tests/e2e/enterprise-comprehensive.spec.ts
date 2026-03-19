import { test, expect } from '@playwright/test';

const BASE_URL = process.env.E2E_BASE_URL || 'http://localhost:3001';

test.describe('企业信息深度录入测试 - 正式版', () => {
  const timestamp = Date.now();
  const testEmail = `prod-${timestamp}@example.com`;

  test('全流程深度填报与提交验证', async ({ page, context }) => {
    test.setTimeout(300000);

    // 1. 注册登录
    await test.step('1. 注册登录', async () => {
      console.log('>>> [1] 注册登录');
      await context.clearCookies();
      await page.goto(`${BASE_URL}/register`);
      await page.fill('#email', testEmail);
      await page.fill('#password', 'Password123!');
      await page.click('button:has-text("申请入驻")');
      await page.waitForURL('**/dashboard', { timeout: 30000 });
      await page.waitForLoadState('networkidle');
    });

    // 2. Step 1
    await test.step('2. Step 1 基础信息', async () => {
      console.log('>>> [2] Step 1 填报');
      await page.waitForSelector('input[name="company_name"]', { timeout: 15000 });
      
      await page.locator('input[name="company_name"]').fill(`正式测试企业 ${timestamp}`);
      await page.locator('input[name="company_description"]').fill('自动填报描述内容。');
      await page.locator('input[name="credit_code"]').fill(`91330101MA2${String(timestamp).slice(-7)}`);
      
      // 日期选择
      await page.locator('button:has(.lucide-calendar)').first().click();
      await page.waitForSelector('table[role="grid"]', { timeout: 5000 });
      await page.locator('table[role="grid"] button:not([disabled])').first().click();
      await page.keyboard.press('Escape');
      
      const comboboxes = page.locator('button[role="combobox"]');
      
      // 2.1 所在区域 (Select 0)
      console.log('>>> [2.1] 选择城市');
      await comboboxes.nth(0).click();
      await page.click('[role="option"]:has-text("杭州市")');
      
      await page.locator('input[name="address"]').fill('杭州西湖区');
      
      // 2.2 企业性质 (Select 1)
      console.log('>>> [2.2] 选择企业性质');
      await comboboxes.nth(1).click();
      await page.click('[role="option"]:has-text("民营企业")');
      
      await page.locator('input[name="employee_count"]').fill('100');
      await page.locator('input[name="rnd_count"]').fill('80');

      // 2.3 营收区间 (Select 2)
      console.log('>>> [2.3] 选择营收区间');
      await comboboxes.nth(2).click();
      await page.locator('[role="option"]').first().click();
      
      // 细分赛道
      await page.click('label:has-text("智能制造")');
      await page.click('label:has-text("应用解决方案层")');
      
      await page.locator('input[name="contact_name"]').fill('Admin');
      await page.locator('input[name="contact_position"]').fill('Manager');
      await page.locator('input[name="contact_phone"]').fill('13000001111');
      await page.locator('input[name="contact_email"]').fill(testEmail);
      
      // 2.4 对接偏好 (Select 3)
      console.log('>>> [2.4] 选择对接偏好');
      await comboboxes.nth(3).click();
      await page.click('[role="option"]:has-text("微信")');
      
      await page.click('button:has-text("下一步：填写核心能力")');
      await expect(page.locator('text=第二板块')).toBeVisible({ timeout: 15000 });
      console.log('>>> [OK] Step 1 完成');
    });

    // 3. Step 2
    await test.step('3. Step 2 产品能力', async () => {
      console.log('>>> [3] Step 2 填报');
      await page.locator('input[name="products.0.name"]').fill('Prod Product');
      const comboboxes = page.locator('button[role="combobox"]');
      
      await comboboxes.nth(0).click();
      await page.click('[role="option"]:has-text("软件平台")');
      
      await comboboxes.nth(1).click();
      await page.click('[role="option"]:has-text("规模化商用")');

      await page.locator('textarea[name="products.0.description"]').fill('Prod description.');
      await page.click('button:has-text("下一步：补充案例")');
      await expect(page.locator('text=第三板块')).toBeVisible({ timeout: 15000 });
      console.log('>>> [OK] Step 2 完成');
    });

    // 4. Step 3
    await test.step('4. Step 3 场景案例', async () => {
      console.log('>>> [4] Step 3 填报');
      await page.click('button:has-text("+ 增加一个场景案例")');
      
      await page.locator('input[name="case_studies.0.title"]').fill('Prod Case');
      await page.locator('input[name="case_studies.0.location"]').fill('Hangzhou');
      
      await page.locator('button:has(.lucide-calendar)').first().click();
      await page.waitForSelector('table[role="grid"]', { timeout: 5000 });
      await page.locator('table[role="grid"] button:not([disabled])').first().click();
      await page.keyboard.press('Escape');
      
      await page.locator('textarea[name="case_studies.0.pain_points"]').fill('Prod pains.');
      await page.locator('textarea[name="case_studies.0.solution"]').fill('Prod solution.');
      
      await page.locator('label:has-text("目前是否正式上线运行？")').click();
      
      await page.click('button:has-text("下一步：合规与赋能需求")');
      await expect(page.locator('text=合规承诺与生态赋能')).toBeVisible({ timeout: 15000 });
      console.log('>>> [OK] Step 3 完成');
    });

    // 5. Step 4
    await test.step('5. Step 4 提交', async () => {
      console.log('>>> [5] Step 4 填报并提交');
      await page.locator('textarea[name="data_security_measures"]').fill('Prod level security.');
      await page.locator('label:has-text("涉密与保密承诺")').click();
      
      await page.click('button:has-text("确认无误，提交审核")');
      await expect(page.locator('text=基础档案提交成功')).toBeVisible({ timeout: 20000 });
      console.log('>>> [OK] 提交成功');
    });

    // 6. 最终验证
    await test.step('6. 最终验证', async () => {
      console.log('>>> [6] 确认提交状态');
      await expect(page.locator('text=基础档案提交成功')).toBeVisible();
      console.log('>>> [SUCCESS] 全流程验证已通过！');
    });
  });
});
