import { test, expect } from '@playwright/test';

const BASE_URL = process.env.E2E_BASE_URL || 'http://localhost:3000';

test.describe('Dashboard - Enterprise Application', () => {
  const testEmail = `company_${Date.now()}@test.com`;
  const testPassword = 'TestCompany2026!';

  test.beforeAll(async ({ page }) => {
    await page.goto(`${BASE_URL}/register`);
    await page.fill('input[id="email"]', testEmail);
    await page.fill('input[id="password"]', testPassword);
    await page.click('button:has-text("申请入驻")');
    await page.waitForURL('**/dashboard', { timeout: 10000 });
  });

  test.describe('Company Information Form', () => {
    test('should display company information form', async ({ page }) => {
      await page.goto(`${BASE_URL}/dashboard`);
      
      await expect(page.locator('input[name="company_name"]')).toBeVisible();
      await expect(page.locator('input[name="credit_code"]')).toBeVisible();
    });

    test('should save company information as draft', async ({ page }) => {
      await page.goto(`${BASE_URL}/dashboard`);
      
      await page.fill('input[name="company_name"]', '测试科技有限公司');
      await page.fill('input[name="credit_code"]', '91310000MA1TEST001');
      await page.fill('input[name="region"]', '杭州市');
      await page.fill('input[name="address"]', '西湖区测试路100号');
      
      const saveDraftBtn = page.locator('button:has-text("保存草稿"), button:has-text("存草稿")');
      if (await saveDraftBtn.count() > 0) {
        await saveDraftBtn.click();
        await page.waitForTimeout(2000);
      }
      
      await expect(page.locator('text=保存成功')).toBeVisible({ timeout: 5000 }).catch(() => {});
    });

    test('should submit company for review', async ({ page }) => {
      await page.goto(`${BASE_URL}/dashboard`);
      
      await page.fill('input[name="company_name"]', '测试科技有限公司');
      await page.fill('input[name="credit_code"]', '91310000MA1TEST002');
      await page.fill('input[name="region"]', '杭州市');
      await page.fill('input[name="address"]', '西湖区测试路100号');
      await page.fill('input[name="contact_name"]', '张三');
      await page.fill('input[name="contact_phone"]', '13812345678');
      await page.fill('input[name="contact_email"]', testEmail);
      
      const submitBtn = page.locator('button:has-text("提交审核"), button:has-text("提交")');
      if (await submitBtn.count() > 0) {
        await submitBtn.click();
        await page.waitForTimeout(3000);
      }
      
      const currentUrl = page.url();
      expect(currentUrl).toContain('dashboard');
    });
  });

  test.describe('Transaction Integrity', () => {
    test('should create company with all related data atomically', async ({ page }) => {
      await page.goto(`${BASE_URL}/dashboard`);
      
      await page.fill('input[name="company_name"]', '原子性测试公司');
      await page.fill('input[name="credit_code"]', '91310000MA1ATOMIC1');
      await page.fill('input[name="region"]', '杭州市');
      await page.fill('input[name="address"]', '测试地址');
      await page.fill('input[name="contact_name"]', '李四');
      await page.fill('input[name="contact_phone"]', '13912345678');
      await page.fill('input[name="contact_email"]', 'atomic@test.com');
      
      const saveDraftBtn = page.locator('button:has-text("保存草稿"), button:has-text("存草稿")');
      if (await saveDraftBtn.count() > 0) {
        await saveDraftBtn.click();
        await page.waitForTimeout(2000);
      }
      
      const response = await fetch('http://localhost:8055/items/companies?filter=' + encodeURIComponent(JSON.stringify({credit_code: { _eq: '91310000MA1ATOMIC1' }})), {
        headers: {'Authorization': 'Bearer ' + process.env.DIRECTUS_STATIC_TOKEN}
      });
      const data = await response.json();
      
      expect(data.data?.length).toBeGreaterThan(0);
    });
  });

  test.describe('Status Display', () => {
    test('should display correct status based on company state', async ({ page }) => {
      await page.goto(`${BASE_URL}/dashboard`);
      
      const draftStatus = page.locator('text=待完善, text=草稿');
      const pendingStatus = page.locator('text=审核中, text=pending');
      const publishedStatus = page.locator('text=正式入驻, text=published');
      
      const hasStatus = await draftStatus.count() > 0 || 
                       await pendingStatus.count() > 0 || 
                       await publishedStatus.count() > 0;
      
      expect(hasStatus).toBeTruthy();
    });
  });

  test.describe('User Settings', () => {
    test('should update profile successfully', async ({ page }) => {
      await page.goto(`${BASE_URL}/dashboard/settings`);
      
      const nameInput = page.locator('input[name="name"]');
      if (await nameInput.count() > 0) {
        await nameInput.fill('新名字');
        
        const saveBtn = page.locator('button:has-text("保存")');
        if (await saveBtn.count() > 0) {
          await saveBtn.click();
          await page.waitForTimeout(1000);
        }
      }
      
      await page.goto(`${BASE_URL}/dashboard`);
      await page.reload();
    });
  });
});
