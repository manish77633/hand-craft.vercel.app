import { test, expect } from "@playwright/test";

test('storefront and admin pages load with visible content and working navigation', async ({ page, request }, testInfo) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  for (const route of ['/', '/collections', '/collections/bags', '/collections/home-decor', '/collections/textiles', '/collections/jewellery', '/about', '/contact', '/search', '/wishlist', '/products/gulnaar-embroidered-tote', '/admin', '/admin/products', '/admin/categories', '/admin/media', '/admin/pages', '/admin/homepage', '/admin/settings']) {
    const response = await page.goto(route, { waitUntil: 'domcontentloaded' });
    expect(response?.status(), route).toBe(200);
    await expect(page.locator('h1:visible').first()).toBeVisible();
    await expect(page.getByText('We couldn’t load this page.')).toHaveCount(0);
    await expect(page.getByText(/MeeraHini/i)).toHaveCount(0);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1), `Horizontal overflow at ${route}`).toBeTruthy();
    if (route === '/admin/homepage') await expect(page.getByLabel('Question 1', { exact: true })).toHaveValue('How do I order a product?');
    if (route === '/admin/settings') await expect(page.getByRole('button', { name: 'Save settings' })).toBeVisible();
  }
  await page.goto('/');
  await expect(page.locator('.brand-splash')).toHaveCount(0);
  await expect(page.getByRole('link', { name: 'Ammaai home' })).toBeVisible();
  const hero = page.getByRole('link', { name: 'Explore Collection', exact: true }).first();
  await expect(hero).toBeVisible();
  const colors = await hero.evaluate(el => { const s = getComputedStyle(el); return { color: s.color, background: s.backgroundColor }; });
  expect(colors.color).not.toBe(colors.background);
  await hero.click(); await expect(page).toHaveURL(/\/collections$/);
  if (testInfo.project.name === 'mobile') { await page.getByRole('button', { name: 'Open menu' }).click(); await page.getByRole('link', { name: 'About Us', exact: true }).click(); await expect(page).toHaveURL(/\/about$/); }
  await page.goto('/contact#faq');
  const faq = page.locator('#faq details').first(); await faq.locator('summary').click(); await expect(faq.locator('.faq-answer')).toBeVisible();
  await page.goto('/products/gulnaar-embroidered-tote');
  await page.getByRole('button', { name: 'Play product video' }).click(); await expect(page.locator('video[controls]')).toBeVisible();
  for (const route of ['/robots.txt', '/sitemap.xml', '/images/ammaai-logo.webp']) expect((await request.get(route)).status()).toBe(200);
  expect((await request.get('/products/does-not-exist')).status()).toBe(404);
  expect(errors).toEqual([]);
});

test('admin FAQ edits persist and update the storefront', async ({ page, request }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop');
  const original = await (await request.get('/api/pages/home')).json();
  const section = original.sections.find((s: { type: string }) => s.type === 'faq');
  const question = `Can I edit this FAQ? ${Date.now()}`;
  try {
    await page.goto('/admin/homepage');
    await page.getByLabel('Question 1', { exact: true }).fill(question);
    await page.getByLabel('Answer 1', { exact: true }).fill('Yes, this answer was saved using the admin editor.');
    await page.getByRole('button', { name: 'Save page', exact: true }).click();
    await expect(page.getByText('Page saved.', { exact: true })).toBeVisible();
    await page.reload(); await expect(page.getByLabel('Question 1', { exact: true })).toHaveValue(question);
    await page.goto('/#faq'); await expect(page.getByText(question, { exact: true })).toBeVisible();
    await page.getByText(question, { exact: true }).click(); await expect(page.getByText('Yes, this answer was saved using the admin editor.', { exact: true })).toBeVisible();
    const saved = await (await request.get(`/api/page-sections/${section._id}`)).json(); expect(saved.faqs[0].question).toBe(question);
  } finally { expect((await request.patch(`/api/page-sections/${section._id}`, { data: { faqs: section.faqs } })).ok()).toBeTruthy(); }
});

test('create, edit, feature, wishlist and delete a product in a new category', async ({ page, request }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop');
  const suffix = Date.now(); const categorySlug = `qa-category-${suffix}`; const title = `QA Handmade ${suffix}`; const slug = `qa-handmade-${suffix}`;
  let productId: string | undefined; let categoryId: string | undefined;
  const home = await (await request.get('/api/pages/home')).json();
  const automaticSections = home.sections.filter((s: { type: string }) => ['featured-products', 'made-in-motion'].includes(s.type));
  try {
    for (const section of automaticSections) expect((await request.patch(`/api/page-sections/${section._id}`, { data: { productSource: 'automatic' } })).ok()).toBeTruthy();
    await page.goto('/admin/categories'); await page.getByRole('button', { name: 'Add category' }).click();
    await page.getByLabel('Name', { exact: true }).fill(`QA Category ${suffix}`); await page.getByLabel('Slug', { exact: true }).fill(categorySlug);
    await page.getByLabel('Description', { exact: true }).fill('Category created for storefront verification.');
    const categorySaved = page.waitForResponse(r => r.url().endsWith('/api/categories') && r.request().method() === 'POST');
    await page.getByRole('button', { name: 'Save category' }).click(); const categoryResponse = await categorySaved; expect(categoryResponse.status()).toBe(201);
    await expect(page.getByText('Category created successfully.')).toBeVisible();
    categoryId = (await (await request.get(`/api/categories/${categorySlug}`)).json())._id;
    await page.goto('/admin/products'); await page.getByRole('button', { name: 'Add product' }).click();
    await page.getByLabel('Title', { exact: true }).fill(title); await page.getByLabel('Price (₹)', { exact: true }).fill('8250'); await page.getByLabel('Category', { exact: true }).selectOption(categoryId!);
    await page.getByLabel('Material', { exact: true }).fill('Handwoven cotton'); await page.getByLabel('Dimensions', { exact: true }).fill('30 × 40 cm');
    await page.getByLabel('Featured product', { exact: true }).check(); await page.getByLabel('Show in Made in Motion', { exact: true }).check();
    const productSaved = page.waitForResponse(r => r.url().endsWith('/api/products') && r.request().method() === 'POST'); await page.getByRole('button', { name: 'Save product' }).click(); const productResponse = await productSaved; expect(productResponse.status()).toBe(201);
    await expect(page.getByText('Product created successfully.')).toBeVisible();
    productId = (await (await request.get(`/api/products/${slug}`)).json())._id;
    await page.goto('/collections'); await expect(page.getByRole('heading', { name: title })).toBeVisible();
    await page.goto(`/collections/${categorySlug}`); await expect(page.getByRole('heading', { name: title })).toBeVisible();
    await page.goto('/'); await expect(page.getByRole('heading', { name: title })).toBeVisible(); await expect(page.locator('.motion-reel-title').filter({ hasText: title })).toBeVisible();
    await page.goto('/search'); await page.getByRole('textbox', { name: 'Search products' }).fill(title); await expect(page.getByRole('heading', { name: title })).toBeVisible();
    await page.getByRole('button', { name: 'Add to wishlist' }).click(); await page.goto('/wishlist'); await expect(page.getByRole('heading', { name: title })).toBeVisible();
    await page.reload(); await expect(page.getByRole('heading', { name: title })).toBeVisible();
    await page.goto(`/products/${slug}`); await expect(page.getByText('Handwoven cotton', { exact: true })).toBeVisible(); await expect(page.getByText('30 × 40 cm', { exact: true })).toBeVisible();
    const update = await request.patch(`/api/products/${productId}`, { data: { title: `${title} Updated`, available: false } }); expect(update.ok()).toBeTruthy();
    await page.goto('/collections'); await expect(page.getByRole('heading', { name: `${title} Updated` })).toHaveCount(0);
    await page.goto(`/products/${slug}`); await expect(page.getByText('Unavailable', { exact: true })).toBeVisible();
    expect((await request.delete(`/api/categories/${categoryId}`)).status()).toBe(409);
  } finally {
    for (const section of automaticSections) expect((await request.patch(`/api/page-sections/${section._id}`, { data: { productSource: section.productSource ?? 'automatic' } })).ok()).toBeTruthy();
    if (productId) expect((await request.delete(`/api/products/${productId}`)).status()).toBe(204);
    if (categoryId) expect((await request.delete(`/api/categories/${categoryId}`)).status()).toBe(204);
  }
  expect((await request.get(`/products/${slug}`)).status()).toBe(404);
});

test('Cloudinary browser upload, metadata edit and cleanup', async ({ page, request }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop');
  const filename = `qa-upload-${Date.now()}.png`; let mediaId: string | undefined;
  try {
    await page.goto('/admin/media');
    const saved = page.waitForResponse(r => r.url().endsWith('/api/media') && r.request().method() === 'POST', { timeout: 90000 });
    await page.locator('input[type=file]').setInputFiles({ name: filename, mimeType: 'image/png', buffer: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII=', 'base64') });
    const response = await saved; expect(response.status()).toBe(201); const media = (await (await request.get(`/api/media?q=${filename}`)).json()).items.find((item: { filename: string }) => item.filename === filename); mediaId = media._id;
    expect(media.cloudinaryUrl).toMatch(/^https:\/\/res.cloudinary.com\//);
    expect((await request.get(media.cloudinaryUrl)).status()).toBe(200);
    expect((await request.patch(`/api/media/${mediaId}`, { data: { altText: 'QA image description' } })).status()).toBe(200);
    expect((await (await request.get(`/api/media/${mediaId}`)).json()).altText).toBe('QA image description');
  } finally { if (mediaId) expect((await request.delete(`/api/media/${mediaId}`)).status()).toBe(204); }
});

test('invalid changes are rejected without modifying data', async ({ request }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop');
  expect((await request.post('/api/products', { data: { title: 'Invalid', slug: 'invalid', category: '000000000000000000000000', price: 1 } })).status()).toBe(400);
  expect((await request.post('/api/products', { data: '{broken', headers: { 'Content-Type': 'application/json' } })).status()).toBe(400);
  expect((await request.post('/api/page-sections', { data: { type: 'cta', button: { label: 'Unsafe', url: 'javascript:alert(1)' } } })).status()).toBe(400);
});

test('contact FAQs, content cards and visibility edits reach their pages', async ({ page, request }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop');
  const home = await (await request.get('/api/pages/home')).json();
  const faq = await (await request.get('/api/pages/faq')).json();
  const cardSection = home.sections.find((s: { type: string }) => s.type === 'experience');
  const faqSection = faq.sections.find((s: { type: string }) => s.type === 'faq-list');
  const marker = `Editable content ${Date.now()}`;
  try {
    await page.goto('/admin/pages'); await page.getByRole('button', { name: /^FAQ/ }).click();
    await expect(page.getByLabel('Question 1', { exact: true })).toHaveValue(faqSection.faqs[0].question);
    expect((await request.patch(`/api/page-sections/${faqSection._id}`, { data: { faqs: [{ question: marker, answer: 'Contact FAQ from the database' }] } })).ok()).toBeTruthy();
    await page.goto('/contact#faq', { waitUntil: 'domcontentloaded' }); await expect(page.getByText(marker, { exact: true })).toBeVisible();
    expect((await request.patch(`/api/page-sections/${cardSection._id}`, { data: { items: [{ title: marker, description: 'Edited homepage card', url: '/wishlist', label: 'Save favourites' }] } })).ok()).toBeTruthy();
    await page.goto('/', { waitUntil: 'domcontentloaded' }); await expect(page.getByText(marker, { exact: true })).toBeVisible();
    expect((await request.patch(`/api/page-sections/${cardSection._id}`, { data: { visible: false } })).ok()).toBeTruthy();
    await page.reload({ waitUntil: 'domcontentloaded' }); await expect(page.getByText(marker, { exact: true })).toHaveCount(0);
  } finally {
    expect((await request.patch(`/api/page-sections/${cardSection._id}`, { data: { items: cardSection.items, visible: cardSection.visible } })).ok()).toBeTruthy();
    expect((await request.patch(`/api/page-sections/${faqSection._id}`, { data: { faqs: faqSection.faqs } })).ok()).toBeTruthy();
  }
});

test('settings save updates footer and global search title', async ({ page, request }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop');
  const settings = await (await request.get('/api/site-settings')).json();
  const footer = await (await request.get('/api/footer')).json();
  const marker = `Ammaai QA Settings ${Date.now()}`;
  try {
    await page.goto('/admin/settings');
    await page.getByLabel('Default SEO title', { exact: true }).fill(marker);
    await page.getByLabel('Copyright name', { exact: true }).fill(marker);
    await page.getByRole('button', { name: 'Save settings' }).click();
    await expect(page.getByText('Settings saved. Refresh the storefront to see changes.')).toBeVisible();
    await page.goto('/', { waitUntil: 'domcontentloaded' }); await expect(page).toHaveTitle(marker); await expect(page.locator('footer').getByText(new RegExp(marker))).toBeVisible();
    const link = page.locator('.footer-social').first(); await expect(link).toHaveAttribute('href', new RegExp(`wa.me/${settings.whatsapp}`));
  } finally {
    expect((await request.patch('/api/site-settings', { data: { ...settings, logo: settings.logo?._id ?? null } })).ok()).toBeTruthy();
    expect((await request.patch('/api/footer', { data: footer || { description: 'Thoughtfully made pieces with warmth, character, and a little more meaning for everyday living.', copyright: 'Ammaai' } })).ok()).toBeTruthy();
  }
});
