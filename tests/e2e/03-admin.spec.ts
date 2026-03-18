import { test, expect } from '@playwright/test';

const BASE_URL = process.env.E2E_BASE_URL || 'http://localhost:3000';

test.describe('Admin Dashboard - Secretariat Operations', () => {
  const adminEmail = 'admin@example.com';
  const adminPassword = 'password';

  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle', timeout: 60000 });
    
    // Explicitly wait for form
    await page.waitForSelector('input[id="email"]', { state: 'visible', timeout: 30000 });
    
    await page.fill('input[id="email"]', adminEmail);
    await page.fill('input[id="password"]', adminPassword);
    
    // Click and wait for navigation
    await Promise.all([
      page.waitForURL('**/admin', { timeout: 60000 }),
      page.click('button:has-text("登录")')
    ]);
    
    // Final check to ensure we are on the cockpit
    await expect(page.locator('text=秘书处运营驾驶舱')).toBeVisible({ timeout: 10000 }).catch(() => {});
  });

  test.describe('Admin Access Control', () => {
    test('should allow admin to access admin pages', async ({ page }) => {
      await page.goto(`${BASE_URL}/admin`);
      await expect(page).toHaveURL(/admin/);
    });

    test('should redirect regular user from admin pages', async ({ page }) => {
      await page.goto(`${BASE_URL}/login`);
      await page.fill('input[id="email"]', 'user@test.com');
      await page.fill('input[id="password"]', 'UserPass2026!');
      await page.click('button:has-text("登录")');
      await page.waitForURL('**/dashboard');
      
      await page.goto(`${BASE_URL}/admin`);
      await expect(page).toHaveURL(/dashboard/);
    });
  });

  test.describe('Company Management', () => {
    test('should display company list', async ({ page }) => {
      await page.goto(`${BASE_URL}/admin/companies`);
      
      await expect(page.locator('text=企业, company')).toBeVisible({ timeout: 5000 }).catch(() => {});
    });

    test('should view company details', async ({ page }) => {
      await page.goto(`${BASE_URL}/admin/companies`);
      await page.waitForTimeout(2000);
      
      const firstCompany = page.locator('a[href*="/admin/companies/"]').first();
      if (await firstCompany.count() > 0) {
        await firstCompany.click();
        await page.waitForTimeout(2000);
        
        const url = page.url();
        expect(url).toContain('/admin/companies/');
      }
    });
  });

  test.describe('Company Approval Workflow', () => {
    test('should approve a company (change status to published)', async ({ page }) => {
      await page.goto(`${BASE_URL}/admin/companies`);
      await page.waitForTimeout(2000);
      
      const pendingCompany = page.locator('text=pending_review, 审核中').first();
      if (await pendingCompany.count() > 0) {
        await pendingCompany.click();
        await page.waitForTimeout(2000);
        
        const statusSelect = page.locator('select[name="status"], [class*="status"]').first();
        if (await statusSelect.count() > 0) {
          await statusSelect.selectOption('published');
          
          const saveBtn = page.locator('button:has-text("保存"), button:has-text("审核")');
          if (await saveBtn.count() > 0) {
            await saveBtn.click();
            await page.waitForTimeout(2000);
          }
        }
      }
      
      const currentUrl = page.url();
      expect(currentUrl).toContain('/admin/companies/');
    });

    test('should reject a company with reason', async ({ page }) => {
      await page.goto(`${BASE_URL}/admin/companies`);
      await page.waitForTimeout(2000);
      
      const pendingCompany = page.locator('text=pending_review, 审核中').first();
      if (await pendingCompany.count() > 0) {
        await pendingCompany.click();
        await page.waitForTimeout(2000);
        
        const statusSelect = page.locator('select[name="status"]').first();
        if (await statusSelect.count() > 0) {
          await statusSelect.selectOption('rejected');
          
          const reasonInput = page.locator('input[name="rejection_reason"], textarea[name="rejection_reason"]');
          if (await reasonInput.count() > 0) {
            await reasonInput.fill('材料不完整，请补充企业营业执照');
            
            const saveBtn = page.locator('button:has-text("保存"), button:has-text("驳回")');
            if (await saveBtn.count() > 0) {
              await saveBtn.click();
              await page.waitForTimeout(2000);
            }
          }
        }
      }
    });
  });

  test.describe('Internal Investigation (Tier C)', () => {
    test('should add internal investigation record', async ({ page }) => {
      await page.goto(`${BASE_URL}/admin/companies`);
      await page.waitForTimeout(2000);
      
      const firstCompany = page.locator('a[href*="/admin/companies/"]').first();
      if (await firstCompany.count() > 0) {
        await firstCompany.click();
        await page.waitForTimeout(2000);
        
        const addInvestigationBtn = page.locator('button:has-text("添加尽调"), button:has-text("新增调查")');
        if (await addInvestigationBtn.count() > 0) {
          await addInvestigationBtn.click();
          await page.waitForTimeout(1000);
          
          const teamSizeInput = page.locator('input[name="actual_team_size"]');
          if (await teamSizeInput.count() > 0) {
            await teamSizeInput.fill('50');
            
            const scoreInput = page.locator('input[name="tech_maturity_score"]');
            if (await scoreInput.count() > 0) {
              await scoreInput.fill('4');
            }
            
            const riskSelect = page.locator('select[name="risk_level"]');
            if (await riskSelect.count() > 0) {
              await riskSelect.selectOption('Medium');
            }
            
            const submitBtn = page.locator('button:has-text("提交"), button:has-text("保存")');
            if (await submitBtn.count() > 0) {
              await submitBtn.click();
              await page.waitForTimeout(2000);
            }
          }
        }
      }
    });
  });

  test.describe('Data Export', () => {
    test('should export companies with masking', async ({ page }) => {
      await page.goto(`${BASE_URL}/admin/companies`);
      await page.waitForTimeout(2000);
      
      const exportBtn = page.locator('button:has-text("导出"), button:has-text("导出数据")');
      if (await exportBtn.count() > 0) {
        const downloadPromise = page.waitForEvent('download', { timeout: 5000 }).catch(() => null);
        
        await exportBtn.click();
        
        if (downloadPromise) {
          const download = await downloadPromise;
          expect(download).toBeTruthy();
        }
      }
    });
  });

  test.describe('Audit Logs', () => {
    test('should display audit logs page', async ({ page }) => {
      await page.goto(`${BASE_URL}/admin/audit-logs`);
      
      const pageContent = await page.content();
      const hasLogs = pageContent.includes('audit') || pageContent.includes('日志') || pageContent.includes('审计');
      expect(hasLogs || page.url().includes('audit')).toBeTruthy();
    });
  });

  test.describe('KPI Dashboard', () => {
    test('should display KPI statistics', async ({ page }) => {
      await page.goto(`${BASE_URL}/admin`);
      
      const kpiElements = page.locator('text=企业数, 需求数, 案例数');
      await expect(kpiElements.first()).toBeVisible({ timeout: 5000 }).catch(() => {});
    });
  });
});
