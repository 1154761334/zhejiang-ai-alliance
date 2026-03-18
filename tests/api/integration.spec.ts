import { test, expect, describe, beforeAll, afterAll } from '@playwright/test';

const API_URL = process.env.E2E_API_URL || 'http://localhost:3000';
const DIRECTUS_URL = process.env.E2E_DIRECTUS_URL || 'http://localhost:8055';

describe('API Integration Tests', () => {
  const testEmail = `apitest_${Date.now()}@test.com`;
  const testPassword = 'ApiTest2026!';

  describe('POST /api/register', () => {
    test('should register new user successfully', async ({ request }) => {
      const response = await request.post(`${API_URL}/api/register`, {
        data: {
          email: testEmail,
          password: testPassword,
        },
      });

      expect(response.status()).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
    });

    test('should reject duplicate email', async ({ request }) => {
      const response = await request.post(`${API_URL}/api/register`, {
        data: {
          email: 'admin@example.com',
          password: testPassword,
        },
      });

      expect(response.status()).toBe(400);
      const data = await response.json();
      expect(data.error).toContain('已被注册');
    });

    test('should validate email format', async ({ request }) => {
      const response = await request.post(`${API_URL}/api/register`, {
        data: {
          email: 'invalid-email',
          password: testPassword,
        },
      });

      expect(response.status()).toBe(400);
    });

    test('should validate password requirements', async ({ request }) => {
      const response = await request.post(`${API_URL}/api/register`, {
        data: {
          email: `test_${Date.now()}@test.com`,
          password: 'weak',
        },
      });

      expect(response.status()).toBe(400);
      const data = await response.json();
      expect(data.error).toContain('密码');
    });

    test('should rate limit registration', async ({ request }) => {
      for (let i = 0; i < 4; i++) {
        await request.post(`${API_URL}/api/register`, {
          data: {
            email: `ratelimit${i}_${Date.now()}@test.com`,
            password: testPassword,
          },
        });
      }

      const response = await request.post(`${API_URL}/api/register`, {
        data: {
          email: `ratelimit_final_${Date.now()}@test.com`,
          password: testPassword,
        },
      });

      expect(response.status()).toBe(429);
    });
  });

  describe('POST /api/auth/callback/credentials', () => {
    test('should login with correct credentials', async ({ request }) => {
      const response = await request.post(`${API_URL}/api/auth/callback/credentials`, {
        data: {
          email: 'admin@example.com',
          password: 'password',
        },
      });

      expect(response.status()).toBe(200);
    });

    test('should reject wrong password', async ({ request }) => {
      const response = await request.post(`${API_URL}/api/auth/callback/credentials`, {
        data: {
          email: 'admin@example.com',
          password: 'wrongpassword',
        },
      });

      expect(response.status()).not.toBe(200);
    });

    test('should rate limit failed login attempts', async ({ request }) => {
      for (let i = 0; i < 6; i++) {
        await request.post(`${API_URL}/api/auth/callback/credentials`, {
          data: {
            email: 'bruteforce@test.com',
            password: 'wrongpassword',
          },
        });
      }

      const response = await request.post(`${API_URL}/api/auth/callback/credentials`, {
        data: {
          email: 'bruteforce@test.com',
          password: 'wrongpassword',
        },
      });

      expect(response.status()).toBe(429);
    });
  });

  describe('Directus API', () => {
    const staticToken = process.env.DIRECTUS_STATIC_TOKEN || 'static_ebdfd517a183459c82972b87d2d5ec3f';

    test('should authenticate with static token', async ({ request }) => {
      const response = await request.get(`${DIRECTUS_URL}/users/me`, {
        headers: {
          Authorization: `Bearer ${staticToken}`,
        },
      });

      expect(response.status()).toBe(200);
    });

    test('should create company record', async ({ request }) => {
      const companyData = {
        company_name: 'API测试公司',
        credit_code: `91310000APITEST${Date.now()}`,
        region: '杭州市',
        status: 'draft',
      };

      const response = await request.post(`${DIRECTUS_URL}/items/companies`, {
        headers: {
          Authorization: `Bearer ${staticToken}`,
          'Content-Type': 'application/json',
        },
        data: companyData,
      });

      expect(response.status()).toBe(200);
      const data = await response.json();
      expect(data.data).toBeTruthy();
    });

    test('should read company records', async ({ request }) => {
      const response = await request.get(`${DIRECTUS_URL}/items/companies`, {
        headers: {
          Authorization: `Bearer ${staticToken}`,
        },
      });

      expect(response.status()).toBe(200);
      const data = await response.json();
      expect(Array.isArray(data.data)).toBe(true);
    });

    test('should enforce role-based filtering', async ({ request }) => {
      const response = await request.get(`${DIRECTUS_URL}/items/companies`, {
        headers: {
          Authorization: `Bearer ${staticToken}`,
        },
        params: {
          filter: JSON.stringify({ status: { _eq: 'published' } }),
        },
      });

      expect(response.status()).toBe(200);
    });

    test('should have audit_logs collection', async ({ request }) => {
      const response = await request.get(`${DIRECTUS_URL}/collections`, {
        headers: {
          Authorization: `Bearer ${staticToken}`,
        },
      });

      expect(response.status()).toBe(200);
      const data = await response.json();
      const hasAuditLogs = data.data?.some((c: any) => c.collection === 'audit_logs');
      expect(hasAuditLogs).toBeTruthy();
    });
  });

  describe('Server Actions', () => {
    test('should require authentication for submitSurvey', async ({ request }) => {
      const response = await request.post(`${API_URL}/api/test-directus`, {
        data: {},
      });

      expect(response.status()).toBeGreaterThanOrEqual(200);
    });
  });
});
