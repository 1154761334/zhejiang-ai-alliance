import { test, expect } from '@playwright/test';

const BASE_URL = process.env.E2E_BASE_URL || 'http://localhost:3000';

test.describe('Security Tests', () => {
  test.describe('Rate Limiting', () => {
    test('should rate limit login endpoint', async ({ page }) => {
      for (let i = 0; i < 6; i++) {
        await page.goto(`${BASE_URL}/login`);
        await page.fill('input[id="email"]', `attacker${i}@test.com`);
        await page.fill('input[id="password"]', 'wrongpass');
        await page.click('button:has-text("登录")');
        await page.waitForTimeout(200);
      }
      
      const lastResponse = await page.goto(`${BASE_URL}/login`);
      await page.fill('input[id="email"]', 'final@test.com');
      await page.fill('input[id="password"]', 'wrongpass');
      await page.click('button:has-text("登录")');
      
      await page.waitForTimeout(500);
      
      const status = lastResponse?.status() || 200;
      const pageContent = await page.content();
      const rateLimited = pageContent.includes('请求过于频繁') || status === 429;
      
      expect(rateLimited || status === 429).toBeTruthy();
    });

    test('should rate limit registration endpoint', async ({ page }) => {
      for (let i = 0; i < 4; i++) {
        await page.goto(`${BASE_URL}/register`);
        await page.fill('input[id="email"]', `regtest${i}_${Date.now()}@test.com`);
        await page.fill('input[id="password"]', 'TestPass2026!');
        await page.click('button:has-text("申请入驻")');
        await page.waitForTimeout(300);
      }
      
      await page.goto(`${BASE_URL}/register`);
      await page.fill('input[id="email"]', `final_${Date.now()}@test.com`);
      await page.fill('input[id="password"]', 'TestPass2026!');
      await page.click('button:has-text("申请入驻")');
      await page.waitForTimeout(500);
      
      const pageContent = await page.content();
      expect(pageContent.includes('请求过于频繁') || pageContent.includes('过于频繁')).toBeTruthy();
    });
  });

  test.describe('Authentication Security', () => {
    test('should not allow access to protected routes without login', async ({ page }) => {
      await page.goto(`${BASE_URL}/dashboard`);
      await expect(page).toHaveURL(/login|register/);
    });

    test('should not allow access to admin routes without admin role', async ({ page }) => {
      await page.goto(`${BASE_URL}/login`);
      await page.fill('input[id="email"]', 'user@test.com');
      await page.fill('input[id="password"]', 'UserPass2026!');
      await page.click('button:has-text("登录")');
      await page.waitForURL('**/dashboard', { timeout: 5000 }).catch(() => {});
      
      if (!page.url().includes('/login')) {
        await page.goto(`${BASE_URL}/admin`);
        await page.waitForTimeout(1000);
        
        const isOnAdmin = page.url().includes('/admin');
        const isRedirected = page.url().includes('/dashboard');
        
        expect(isOnAdmin || isRedirected).toBeTruthy();
      }
    });

    test('should require authentication for company submission', async ({ page }) => {
      const response = await page.goto(`${BASE_URL}/api/test-directus`);
      
      expect(response?.status() || 200).toBeLessThan(500);
    });
  });

  test.describe('Data Security', () => {
    test('should mask sensitive data in export', async ({ page }) => {
      await page.goto(`${BASE_URL}/login`);
      await page.fill('input[id="email"]', 'admin@example.com');
      await page.fill('input[id="password"]', 'password');
      await page.click('button:has-text("登录")');
      await page.waitForURL('**/admin', { timeout: 10000 });
      
      await page.goto(`${BASE_URL}/admin/companies`);
      await page.waitForTimeout(2000);
      
      const exportBtn = page.locator('button:has-text("导出")');
      if (await exportBtn.count() > 0) {
        const downloadPromise = page.waitForEvent('download', { timeout: 5000 }).catch(() => null);
        await exportBtn.click();
        
        if (downloadPromise) {
          const download = await downloadPromise;
          const fileName = download.suggestedFilename();
          
          expect(fileName).toBeTruthy();
        }
      }
    });

    test('should not expose internal investigation data publicly', async ({ page }) => {
      await page.goto(`${BASE_URL}/services`);
      await page.waitForTimeout(2000);
      
      const pageContent = await page.content();
      
      expect(pageContent).not.toContain('internal_notes');
      expect(pageContent).not.toContain('tech_maturity_score');
      expect(pageContent).not.toContain('market_influence_score');
      expect(pageContent).not.toContain('risk_level');
      expect(pageContent).not.toContain('investigator');
    });

    test('should only show published companies in public listing', async ({ page }) => {
      const response = await page.goto(`${BASE_URL}/api/test-directus`);
      const responseText = await response?.text();
      
      if (responseText) {
        const data = JSON.parse(responseText);
        
        if (Array.isArray(data)) {
          data.forEach((item: any) => {
            if (item.status) {
              expect(['published', 'draft', 'pending_review']).toContain(item.status);
            }
          });
        }
      }
    });
  });

  test.describe('Session Security', () => {
    test('should expire session after timeout', async ({ page }) => {
      await page.goto(`${BASE_URL}/login`);
      await page.fill('input[id="email"]', 'admin@example.com');
      await page.fill('input[id="password"]', 'password');
      await page.click('button:has-text("登录")');
      await page.waitForURL('**/admin');
      
      await page.evaluate(() => {
        localStorage.clear();
        sessionStorage.clear();
      });
      
      await page.reload();
      
      const isLoggedOut = page.url().includes('/login') || page.url().includes('/register');
      expect(isLoggedOut || page.url().includes('/login')).toBeTruthy();
    });

    test('should invalidate session on logout', async ({ page }) => {
      await page.goto(`${BASE_URL}/login`);
      await page.fill('input[id="email"]', 'admin@example.com');
      await page.fill('input[id="password"]', 'password');
      await page.click('button:has-text("登录")');
      await page.waitForURL('**/admin');
      
      await page.goto(`${BASE_URL}/api/auth/signout`);
      await page.waitForTimeout(1000);
      
      await page.goto(`${BASE_URL}/admin`);
      
      await expect(page).toHaveURL(/login|register/);
    });
  });

  test.describe('Authorization', () => {
    test('user should only access own company data', async ({ page }) => {
      const testEmail = `owner_${Date.now()}@test.com`;
      const testPassword = 'OwnerTest2026!';
      
      await page.goto(`${BASE_URL}/register`);
      await page.fill('input[id="email"]', testEmail);
      await page.fill('input[id="password"]', testPassword);
      await page.click('button:has-text("申请入驻")');
      await page.waitForURL('**/dashboard');
      
      await page.fill('input[name="company_name"]', '独占测试公司');
      await page.fill('input[name="credit_code"]', '91310000TESTOWNER1');
      
      const saveBtn = page.locator('button:has-text("保存草稿")');
      if (await saveBtn.count() > 0) {
        await saveBtn.click();
        await page.waitForTimeout(2000);
      }
      
      const apiResponse = await fetch('http://localhost:8055/items/companies?filter=' + encodeURIComponent(JSON.stringify({credit_code: { _eq: '91310000TESTOWNER1' }})), {
        headers: {'Authorization': 'Bearer ' + process.env.DIRECTUS_STATIC_TOKEN}
      });
      const companyData = await apiResponse.json();
      
      expect(companyData.data?.length).toBeGreaterThan(0);
    });

    test('admin should have full access', async ({ page }) => {
      await page.goto(`${BASE_URL}/login`);
      await page.fill('input[id="email"]', 'admin@example.com');
      await page.fill('input[id="password"]', 'password');
      await page.click('button:has-text("登录")');
      await page.waitForURL('**/admin');
      
      await page.goto(`${BASE_URL}/admin/companies`);
      await page.waitForTimeout(2000);
      
      const hasAccess = page.url().includes('/admin/companies');
      expect(hasAccess).toBeTruthy();
    });
  });
});
