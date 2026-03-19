import { test, expect } from '@playwright/test';

const BASE_URL = process.env.E2E_BASE_URL || 'http://localhost:3001';

test('简单诊断：登录并查看控制台', async ({ page, context }) => {
  await context.clearCookies();
  await page.goto(`${BASE_URL}/login`);
  await page.fill('input[id="email"]', 'admin@example.com');
  await page.fill('input[id="password"]', 'password');
  await page.click('button:has-text("登录")');
  
  await page.waitForURL('**/admin', { timeout: 20000 });
  console.log('Admin logged in');
  
  await page.goto(`${BASE_URL}/dashboard`);
  await page.waitForLoadState('networkidle');
  console.log('Dashboard reached');
  
  await expect(page.locator('text=会员专属工作台')).toBeVisible({ timeout: 10000 });
  console.log('Dashboard Header Visible');
});
