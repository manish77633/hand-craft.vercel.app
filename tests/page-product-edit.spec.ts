import { test, expect } from '@playwright/test';

test('drag ordering and shared product edits publish with Save page', async ({ page, request }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop');
  const original = await (await request.get('/api/pages/home')).json();
  const product = (await (await request.get('/api/products?limit=100')).json()).items.find((p: { slug: string }) => p.slug === 'gulnaar-embroidered-tote');
  const title = `Handmade test ${Date.now()}`;
  try {
    await page.goto('/admin/homepage');
    const section = page.locator('section').filter({ has: page.locator('header small', { hasText: /^featured-products$/ }) });
    const cards = section.locator('article[data-product-id]');
    await expect(cards).toHaveCount(4);
    const firstId = await cards.first().getAttribute('data-product-id');
    const handle = cards.first().getByRole('button', { name: /^Drag / });
    await handle.scrollIntoViewIfNeeded();
    const start = await handle.boundingBox(); const end = await cards.nth(1).boundingBox();
    await page.mouse.move(start!.x + 8, start!.y + 8); await page.mouse.down();
    await page.mouse.move(end!.x + end!.width / 2, end!.y + 80, { steps: 12 }); await page.mouse.up();
    await expect(cards.nth(1)).toHaveAttribute('data-product-id', firstId!);
    await section.locator(`article[data-product-id="${product._id}"]`).getByRole('button', { name: 'Edit product', exact: true }).click();
    const dialog = page.getByRole('dialog', { name: 'Edit linked product' });
    await dialog.getByLabel('Product name', { exact: true }).fill(title);
    await dialog.getByLabel('Price (₹)', { exact: true }).fill('3123');
    await dialog.getByRole('button', { name: 'Apply product changes' }).click();
    await expect(section.getByText(title, { exact: true })).toBeVisible();
    expect((await (await request.get(`/api/products/${product._id}`)).json()).title).toBe(product.title);
    await page.getByRole('button', { name: 'Save page', exact: true }).click();
    await expect(page.getByText('Page saved.', { exact: true })).toBeVisible();
    expect((await (await request.get(`/api/products/${product._id}`)).json()).price).toBe(3123);
    for (const route of ['/', '/collections', `/products/${product.slug}`]) {
      await page.goto(route); await expect(page.getByText(title, { exact: true }).first()).toBeVisible();
    }
    await page.goto('/admin/homepage');
    await expect(section.getByText(title, { exact: true })).toBeVisible();
  } finally {
    expect((await request.patch(`/api/products/${product._id}`, { data: { title: product.title, price: product.price } })).ok()).toBeTruthy();
    for (const section of original.sections) expect((await request.patch(`/api/page-sections/${section._id}`, { data: { products: section.products.filter(Boolean).map((p: string | { _id: string }) => typeof p === 'string' ? p : p._id), productSource: section.productSource ?? 'automatic' } })).ok()).toBeTruthy();
  }
});
