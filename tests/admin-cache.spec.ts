import { test, expect } from '@playwright/test';

test('admin tab switching reuses lists; saving refreshes only affected product data', async ({ page, request }, testInfo) => {
  const counts = { products: 0, categories: 0 };
  page.on('request', request => { if (request.method() !== 'GET') return; const path = new URL(request.url()).pathname; if (path === '/api/products') counts.products++; if (path === '/api/categories') counts.categories++; });
  await page.goto('/admin/products');
  await expect(page.getByText('gulnaar-embroidered-tote', { exact: false }).first()).toBeVisible();
  const initial = { ...counts };
  for (let i = 0; i < 2; i++) {
    await page.getByRole('link', { name: 'Categories', exact: true }).filter({ visible: true }).click();
    await expect(page.getByRole('button', { name: 'Add category' })).toBeVisible();
    await expect(page.getByText('Loading categories…')).toHaveCount(0);
    await page.getByRole('link', { name: 'Products', exact: true }).filter({ visible: true }).click();
    await expect(page.getByText('gulnaar-embroidered-tote', { exact: false }).first()).toBeVisible();
    await expect(page.getByText('Loading products…')).toHaveCount(0);
  }
  expect(counts).toEqual(initial);
  if (testInfo.project.name !== 'desktop') return;
  const original = await (await request.get('/api/products/gulnaar-embroidered-tote')).json();
  try {
    const row = page.locator('div').filter({ has: page.locator('strong', { hasText: /^Gulnaar Embroidered Tote$/ }) }).filter({ has: page.getByRole('button', { name: 'Edit', exact: true }) }).last();
    await row.getByRole('button', { name: 'Edit', exact: true }).click();
    await page.getByLabel('Price (₹)', { exact: true }).fill(String(original.price + 1));
    await page.getByRole('button', { name: 'Save product', exact: true }).click();
    await expect(page.getByText('Product updated successfully.')).toBeVisible();
    await expect.poll(() => counts.products).toBe(initial.products + 1);
    expect(counts.categories).toBe(initial.categories);
    await page.getByRole('link', { name: 'Categories', exact: true }).filter({ visible: true }).click();
    await page.getByRole('link', { name: 'Products', exact: true }).filter({ visible: true }).click();
    await expect(page.getByText(`₹${(original.price + 1).toLocaleString('en-IN')}`, { exact: true })).toBeVisible();
    expect(counts.products).toBe(initial.products + 1);
  } finally { expect((await request.patch(`/api/products/${original._id}`, { data: { price: original.price } })).ok()).toBeTruthy(); }
});
