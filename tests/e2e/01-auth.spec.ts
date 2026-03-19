import { test, expect } from '@playwright/test';

const BASE_URL = process.env.E2E_BASE_URL || 'http://localhost:3000';

test.describe('Authentication Flow', () => {
  const testEmail = `test_${Date.now()}@example.com`;
  const testPassword = 'TestPass2026!';

  test.describe('Registration', () => {
    test('should register a new user successfully', async ({ page }) => {
      await page.goto(`${BASE_URL}/register`);
      
      await page.fill('input[id="email"]', testEmail);
      await page.fill('input[id="password"]', testPassword);
      await page.click('button:has-text("申请入驻")');
      
      await page.waitForURL('**/dashboard', { timeout: 10000 });
      
      await expect(page).toHaveURL(/dashboard/);
    });

    test('should show error for duplicate email', async ({ page }) => {
      await page.goto(`${BASE_URL}/register`);
      
      await page.fill('input[id="email"]', 'admin@example.com');
      await page.fill('input[id="password"]', testPassword);
      await page.click('button:has-text("申请入驻")');
      
      await expect(page.locator('text=该企业邮箱已被注册')).toBeVisible();
    });

    test('should validate password requirements', async ({ page }) => {
      await page.goto(`${BASE_URL}/register`);
      
      await page.fill('input[id="email"]', testEmail);
      await page.fill('input[id="password"]', 'weak');
      await page.click('button:has-text("申请入驻")');
      
      await expect(page.locator('text=密码至少需要 8 个字符')).toBeVisible();
    });

    test('should rate limit registration', async ({ page }) => {
      for (let i = 0; i < 4; i++) {
        await page.goto(`${BASE_URL}/register`);
        await page.fill('input[id="email"]', `test${i}_${Date.now()}@example.com`);
        await page.fill('input[id="password"]', testPassword);
        await page.click('button:has-text("申请入驻")');
        await page.waitForTimeout(500);
      }
      
      await page.fill('input[id="email"]', `ratelimit_${Date.now()}@example.com`);
      await page.fill('input[id="password"]', testPassword);
      await page.click('button:has-text("申请入驻")');
      
      const response = await page.waitForResponse(response => 
        response.url().includes('/api/register') && response.status() === 429,
        { timeout: 5000 }
      ).catch(() => null);
      
      expect(response).toBeTruthy();
    });
  });

  test.describe('Login', () => {
    test('should login with correct credentials', async ({ page }) => {
      await page.goto(`${BASE_URL}/login`);
      
      await page.fill('input[id="email"]', 'admin@example.com');
      await page.fill('input[id="password"]', 'password');
      await page.click('button:has-text("登录")');
      
      await page.waitForURL('**/admin', { timeout: 10000 });
      
      await expect(page).toHaveURL(/admin/);
    });

    test('should show error with wrong credentials', async ({ page }) => {
      await page.goto(`${BASE_URL}/login`);
      
      await page.fill('input[id="email"]', 'admin@example.com');
      await page.fill('input[id="password"]', 'wrongpassword');
      await page.click('button:has-text("登录")');
      
      await expect(page.locator('text=Invalid credentials')).toBeVisible();
    });

    test('should rate limit failed login attempts', async ({ page }) => {
      for (let i = 0; i < 6; i++) {
        await page.goto(`${BASE_URL}/login`);
        await page.fill('input[id="email"]', 'ratelimit@example.com');
        await page.fill('input[id="password"]', 'wrongpass');
        await page.click('button:has-text("登录")');
        await page.waitForTimeout(300);
      }
      
      const response = await page.waitForResponse(response => 
        response.url().includes('/api/auth/callback') && response.status() === 429,
        { timeout: 5000 }
      ).catch(() => null);
      
      expect(response).toBeTruthy();
    });

    test('should redirect to dashboard for regular users', async ({ page }) => {
      await page.goto(`${BASE_URL}/login`);
      
      await page.fill('input[id="email"]', testEmail);
      await page.fill('input[id="password"]', testPassword);
      await page.click('button:has-text("登录")');
      
      await page.waitForURL('**/dashboard', { timeout: 10000 });
      
      await expect(page).toHaveURL(/dashboard/);
    });

    test('should redirect admin to admin page', async ({ page }) => {
      await page.goto(`${BASE_URL}/login`);
      
      await page.fill('input[id="email"]', 'admin@example.com');
      await page.fill('input[id="password"]', 'password');
      await page.click('button:has-text("登录")');
      
      await page.waitForURL('**/admin', { timeout: 10000 });
      
      await expect(page).toHaveURL(/admin/);
    });
  });

  test.describe('Session', () => {
    test('should maintain session after page reload', async ({ page }) => {
      await page.goto(`${BASE_URL}/login`);
      await page.fill('input[id="email"]', testEmail);
      await page.fill('input[id="password"]', testPassword);
      await page.click('button:has-text("登录")');
      
      await page.waitForURL('**/dashboard');
      await page.reload();
      
      await expect(page).toHaveURL(/dashboard/);
    });

    test('should logout successfully', async ({ page }) => {
      await page.goto(`${BASE_URL}/login`);
      await page.fill('input[id="email"]', testEmail);
      await page.fill('input[id="password"]', testPassword);
      await page.click('button:has-text("登录")');
      
      await page.waitForURL('**/dashboard');
      
      await page.goto(`${BASE_URL}/api/auth/signout`);
      await page.waitForURL('**/login');
      
      await expect(page).toHaveURL(/login/);
    });
  });
});
