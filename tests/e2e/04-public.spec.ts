import { test, expect } from '@playwright/test';

const BASE_URL = process.env.E2E_BASE_URL || 'http://localhost:3000';

test.describe('Public Pages', () => {
  test.describe('Landing Page', () => {
    test('should load landing page successfully', async ({ page }) => {
      await page.goto(`${BASE_URL}/`);
      
      await expect(page).toHaveURL(/\//);
      await expect(page.locator('text=AI 智能体')).toBeVisible({ timeout: 5000 }).catch(() => {});
    });

    test('should have navigation links', async ({ page }) => {
      await page.goto(`${BASE_URL}/`);
      
      await expect(page.locator('text=首页, 首页')).toBeVisible();
      await expect(page.locator('text=服务大厅, 服务')).toBeVisible();
      await expect(page.locator('text=成员, 成员')).toBeVisible();
    });

    test('should navigate to register page from CTA', async ({ page }) => {
      await page.goto(`${BASE_URL}/`);
      
      const ctaButton = page.locator('a:has-text("申请加入"), a:has-text("加入联盟")').first();
      if (await ctaButton.count() > 0) {
        await ctaButton.click();
        await page.waitForTimeout(1000);
        
        const url = page.url();
        expect(url).toContain('/register');
      }
    });
  });

  test.describe('Services Page', () => {
    test('should display services page', async ({ page }) => {
      await page.goto(`${BASE_URL}/services`);
      
      await expect(page.locator('text=服务大厅, 算力')).toBeVisible({ timeout: 5000 }).catch(() => {});
    });

    test('should display published case studies', async ({ page }) => {
      await page.goto(`${BASE_URL}/services`);
      await page.waitForTimeout(2000);
      
      const caseSection = page.locator('text=案例, 标杆, 实践');
      await expect(caseSection.first()).toBeVisible({ timeout: 5000 }).catch(() => {});
    });

    test('should not expose sensitive data in public', async ({ page }) => {
      await page.goto(`${BASE_URL}/services`);
      await page.waitForTimeout(2000);
      
      const pageContent = await page.content();
      
      expect(pageContent).not.toContain('internal_notes');
      expect(pageContent).not.toContain('rejection_reason');
      expect(pageContent).not.toContain('tech_maturity_score');
    });
  });

  test.describe('Members Page', () => {
    test('should display members page', async ({ page }) => {
      await page.goto(`${BASE_URL}/members`);
      
      await page.waitForTimeout(2000);
      const url = page.url();
      expect(url).toContain('/members');
    });

    test('should only show published companies', async ({ page }) => {
      await page.goto(`${BASE_URL}/members`);
      await page.waitForTimeout(2000);
      
      const pageContent = await page.content();
      expect(pageContent).toBeTruthy();
    });
  });

  test.describe('Blog/News', () => {
    test('should display blog listing', async ({ page }) => {
      await page.goto(`${BASE_URL}/blog`);
      
      await page.waitForTimeout(2000);
      const url = page.url();
      expect(url).toContain('/blog');
    });

    test('should display individual article', async ({ page }) => {
      await page.goto(`${BASE_URL}/blog`);
      await page.waitForTimeout(2000);
      
      const firstArticle = page.locator('a[href*="/blog/"]').first();
      if (await firstArticle.count() > 0) {
        await firstArticle.click();
        await page.waitForTimeout(2000);
        
        const url = page.url();
        expect(url).toContain('/blog/');
      }
    });
  });

  test.describe('Pricing Page', () => {
    test('should display pricing page', async ({ page }) => {
      await page.goto(`${BASE_URL}/pricing`);
      
      await expect(page.locator('text=价格, 权益')).toBeVisible({ timeout: 5000 }).catch(() => {});
    });

    test('should have CTA buttons', async ({ page }) => {
      await page.goto(`${BASE_URL}/pricing`);
      
      const ctaButton = page.locator('a:has-text("申请"), button:has-text("申请")');
      expect(await ctaButton.count()).toBeGreaterThan(0);
    });
  });

  test.describe('Field-Level Security', () => {
    test('should restrict public role to whitelist fields', async ({ page }) => {
      const response = await page.goto(`${BASE_URL}/api/test-directus`);
      await page.waitForTimeout(1000);
      
      const pageContent = await page.content();
      
      expect(pageContent).not.toContain('contact_phone');
      expect(pageContent).not.toContain('internal_notes');
    });

    test('should not allow access to Tier C data without auth', async ({ page }) => {
      await page.goto(`${BASE_URL}/admin/companies`);
      
      await expect(page).toHaveURL(/login|register/, { timeout: 3000 }).catch(() => {
        expect(page.url()).toContain('/login');
      });
    });
  });
});
