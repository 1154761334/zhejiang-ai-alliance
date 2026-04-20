import { expect, test } from "@playwright/test";

const BASE_URL = process.env.E2E_BASE_URL || "http://localhost:4000";

test.describe("Product operations surface", () => {
  test("secretariat operation pages are protected", async ({ page }) => {
    await page.goto(`${BASE_URL}/admin/tasks`);
    await expect(page).toHaveURL(/\/login/);

    await page.goto(`${BASE_URL}/admin/audit`);
    await expect(page).toHaveURL(/\/login/);

    await page.goto(`${BASE_URL}/admin/matchmaking`);
    await expect(page).toHaveURL(/\/login/);
  });

  test("member service pages are protected", async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard/messages`);
    await expect(page).toHaveURL(/\/login/);

    await page.goto(`${BASE_URL}/dashboard/needs`);
    await expect(page).toHaveURL(/\/login/);

    await page.goto(`${BASE_URL}/dashboard/preview`);
    await expect(page).toHaveURL(/\/login/);
  });

  test("public entry points still render after product-ops additions", async ({
    page,
  }) => {
    await page.goto(`${BASE_URL}/`, { waitUntil: "domcontentloaded" });
    await expect(page.locator("body")).toContainText(/浙江省|AI|智能体/);

    await page.goto(`${BASE_URL}/members`, { waitUntil: "domcontentloaded" });
    await expect(page.locator("body")).toContainText(/成员|企业|联盟/);

    await page.goto(`${BASE_URL}/services`, { waitUntil: "domcontentloaded" });
    await expect(page.locator("body")).toContainText(/服务|案例|生态|算力/);
  });

  test("login page exposes the enterprise account form", async ({ page }) => {
    await page.goto(`${BASE_URL}/login`, { waitUntil: "domcontentloaded" });

    await expect(page.locator('input[id="email"]')).toBeVisible();
    await expect(page.locator('input[id="password"]')).toBeVisible();
    await expect(page.locator("button")).toContainText(/登录|Sign/);
  });
});
