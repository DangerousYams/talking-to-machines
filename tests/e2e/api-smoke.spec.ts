import { test, expect } from '@playwright/test';

test.describe('API smoke tests', () => {
  test('POST /api/chat with empty body returns 400+', async ({ request }) => {
    const response = await request.post('/api/chat', {
      data: {},
      headers: { 'Content-Type': 'application/json' },
    });

    // Should get 400 (bad request) or 401/403 (auth required)
    expect([400, 401, 403]).toContain(response.status());
  });

  test('GET /api/admin/stats without auth returns 401 or data', async ({ request }) => {
    const response = await request.get('/api/admin/stats?days=7');

    // Either returns data (200) or requires auth (401/403) or no DB (503)
    expect([200, 401, 403, 503]).toContain(response.status());
  });
});
