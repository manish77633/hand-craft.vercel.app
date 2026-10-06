import { test, expect } from "@playwright/test";
const productId = (product: string | { _id: string }) => typeof product === 'string' ? product : product._id;

test('homepage editor previews products, categories and media; product ordering persists', async ({ page, request }, testInfo) => {
  const original = await (await request.get('/api/pages/home')).json();
  const sections = original.sections;
  try {
    await page.goto('/admin/homepage');
    for (const type of ['featured-products', 'made-in-motion']) {
      const editor = page.locator('section').filter({ has: page.locator('header small', { hasText: new RegExp(`^${type}$`) }) });
      await expect(editor.locator('article[data-product-id]')).not.toHaveCount(0);
      await expect(editor.locator('article[data-product-id] img').first()).toBeVisible();
      const first = editor.locator('article[data-product-id]').first();
      await expect(first.getByRole('button', { name: /earlier$/ })).toBeDisabled();
      if (testInfo.project.name === 'desktop') {
        const before = await editor.locator('article[data-product-id]').evaluateAll(nodes => nodes.map(node => node.getAttribute('data-product-id')));
        await first.getByRole('button', { name: /later$/ }).click();
        const expected = [before[1], before[0], ...before.slice(2)];
        await page.getByRole('button', { name: 'Save page', exact: true }).click();
        await expect(page.getByText('Page saved.', { exact: true })).toBeVisible();
        await page.reload();
        await expect(editor.locator('article[data-product-id]').first()).toHaveAttribute('data-product-id', expected[0]!);
        const saved = await (await request.get('/api/pages/home')).json();
        const section = saved.sections.find((section: { type: string }) => section.type === type);
        expect(section.productSource).toBe('manual');
        expect(section.products.map(productId)).toEqual(expected);
        await page.goto('/');
        const products = await (await request.get('/api/products?limit=100')).json();
        const expectedSlugs = expected.map(id => products.items.find((product: { _id: string }) => product._id === id).slug);
        const links = type === 'made-in-motion' ? page.locator('.made-in-motion a[href^="/products/"]') : page.locator('section').filter({ has: page.getByRole('heading', { name: section.heading, exact: true }) }).locator('a[href^="/products/"]');
        await expect(links.first()).toHaveAttribute('href', `/products/${expectedSlugs[0]}`);
        expect(await links.evaluateAll(nodes => [...new Set(nodes.map(node => node.getAttribute('href')))])).toEqual(expectedSlugs.map(slug => `/products/${slug}`));
        await page.goto('/admin/homepage');
      }
    }
    await expect(page.getByRole('heading', { name: 'Categories display order' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Media display order' }).first()).toBeVisible();
    await expect.poll(() => page.locator('article img').evaluateAll(images => images.every(image => (image as HTMLImageElement).complete && (image as HTMLImageElement).naturalWidth > 0)), { timeout: 30000 }).toBeTruthy();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBeTruthy();
    await page.screenshot({ path: `.artifacts/homepage-editor-${testInfo.project.name}.png`, fullPage: true });
  } finally {
    if (testInfo.project.name === 'desktop') for (const section of sections) {
      expect((await request.patch(`/api/page-sections/${section._id}`, { data: { products: section.products.filter(Boolean).map(productId), productSource: section.productSource ?? 'automatic' } })).ok()).toBeTruthy();
    }
  }
});
