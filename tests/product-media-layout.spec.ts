import { test, expect } from '@playwright/test';

test('four images and a video save; picker previews and vertical gallery work', async ({ page, request }, testInfo) => {
  const product = (await (await request.get('/api/products/gulnaar-embroidered-tote')).json());
  const media = (await (await request.get('/api/media?limit=100')).json()).items;
  const images = media.filter((item: { type: string }) => item.type === 'image').slice(0, 4);
  const video = media.find((item: { type: string }) => item.type === 'video');
  try {
    await page.goto('/admin/products');
    await page.locator('div').filter({ has: page.locator('strong', { hasText: /^Gulnaar Embroidered Tote$/ }) }).filter({ has: page.getByRole('button', { name: 'Edit', exact: true }) }).last().getByRole('button', { name: 'Edit', exact: true }).click();
    await page.getByRole('button', { name: 'Select from Media Library' }).click();
    const picker = page.getByRole('dialog', { name: 'Select product media' });
    await expect(picker.getByRole('button', { name: new RegExp(images[0].filename.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')) }).last()).toBeVisible();
    const selected = picker.getByRole('region', { name: 'Selected media order' });
    while (await selected.getByRole('button', { name: /^Remove selected / }).count()) await selected.getByRole('button', { name: /^Remove selected / }).first().click();
    for (const item of [...images, video]) await picker.locator('button').filter({ has: page.locator('span', { hasText: item.filename }) }).last().click();
    await expect(selected.locator('article')).toHaveCount(5);
    await expect.poll(() => selected.locator('img').evaluateAll(images => images.every(image => (image as HTMLImageElement).naturalWidth > 0))).toBeTruthy();
    await expect(picker.getByText('Select no more than 3 images.')).toHaveCount(0);
    await picker.screenshot({ path: `.artifacts/media-picker-${testInfo.project.name}.png` });
    await picker.getByRole('button', { name: 'Use selected media' }).click();
    await page.getByRole('button', { name: 'Save product', exact: true }).click();
    await expect(page.getByText('Product updated successfully.')).toBeVisible();
    const saved = await (await request.get(`/api/products/${product._id}`)).json();
    expect(saved.media).toHaveLength(5);
    await page.goto(`/products/${product.slug}`);
    const rail = page.getByRole('group', { name: 'Product media thumbnails' });
    await expect(rail.getByRole('button')).toHaveCount(5);
    const railBox = await rail.boundingBox(); const stage = await page.locator('.product-gallery-stage').boundingBox();
    expect(railBox!.x + railBox!.width).toBeLessThanOrEqual(stage!.x);
    await rail.getByRole('button', { name: 'View product image 5' }).click();
    await expect(rail.getByRole('button', { name: 'View product image 5' })).toHaveAttribute('aria-pressed', 'true');
    await rail.getByRole('button', { name: 'Play product video' }).click();
    await expect(page.locator('video[controls]')).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBeTruthy();
    await page.screenshot({ path: `.artifacts/product-gallery-${testInfo.project.name}.png` });
  } finally {
    expect((await request.patch(`/api/products/${product._id}`, { data: { media: product.media.map((item: { _id: string }) => item._id) } })).ok()).toBeTruthy();
  }
});
