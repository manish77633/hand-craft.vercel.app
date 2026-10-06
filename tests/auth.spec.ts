import { test, expect } from "@playwright/test";
test('production admin APIs reject anonymous access and cross-origin changes', async ({ request }) => {
  test.skip(!process.env.TEST_ADMIN_PASSWORD);
  const base = process.env.TEST_BASE_URL || 'http://localhost:3000';
    expect((await fetch(`${base}/`)).status).toBe(200);
    for (const route of ['/admin', '/api/products', '/api/media/signature']) {
      const response = await fetch(`${base}${route}`, { method: route.endsWith('signature') ? 'POST' : 'GET' });
      expect(response.status).toBe(401);
    }
    expect((await request.get('/admin')).status()).toBe(200);
    expect((await request.get('/api/products')).status()).toBe(200);
    expect((await request.patch('/api/site-settings', { headers: { Origin: 'https://untrusted.example' }, data: { whatsapp: '1234567890' } })).status()).toBe(403);
});
