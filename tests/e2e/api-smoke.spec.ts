import { test, expect } from '@playwright/test';

test.describe('API smoke tests', () => {
  test('POST /api/chat with empty body returns 400', async ({ request }) => {
    const response = await request.post('/api/chat', {
      data: {},
      headers: { 'Content-Type': 'application/json' },
    });

    // Should get 400 (bad request) or 401/403 (auth required)
    expect([400, 401, 403]).toContain(response.status());
  });

  test('POST /api/feed/submit with missing fields returns 400 or 503', async ({ request }) => {
    const response = await request.post('/api/feed/submit', {
      data: {},
      headers: { 'Content-Type': 'application/json' },
    });

    // 400 (validation) or 503 (database not configured in dev)
    expect([400, 503]).toContain(response.status());
  });

  test('GET /api/feed/progress without sessionId returns 400 or 503', async ({ request }) => {
    const response = await request.get('/api/feed/progress');

    // 400 (missing param) or 503 (no database)
    expect([400, 503]).toContain(response.status());
  });

  test('GET /api/feed/compare without challengeId returns 400 or 503', async ({ request }) => {
    const response = await request.get('/api/feed/compare');

    // 400 (missing param) or 503 (no database)
    expect([400, 503]).toContain(response.status());
  });

  test('GET /api/feed/progress with sessionId but no DB returns 503', async ({ request }) => {
    const response = await request.get('/api/feed/progress?sessionId=test-123');

    // Without Supabase configured, should return 503
    // If DB is configured, might return 200 with empty data
    expect([200, 503]).toContain(response.status());
  });
});
