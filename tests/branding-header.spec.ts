import { test, expect } from '@playwright/test';

test('loader uses white logo, logo adapts to backgrounds and navbar stays fixed', async ({ page }, testInfo) => {
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('.brand-splash img')).toHaveAttribute('src', /ammaai-white/);
  await expect(page.locator('.brand-splash')).toHaveCount(0, { timeout: 10000 });
  await expect(page.locator('.site-header .brand-logo img')).toBeVisible();
  expect(await page.locator('.site-header .brand-logo').evaluate(el => getComputedStyle(el).color)).toBe('rgb(0, 0, 0)');
  expect(await page.locator('.brand-logo').first().evaluate(el => getComputedStyle(el).backgroundColor)).toBe('rgba(0, 0, 0, 0)');
  await page.evaluate(() => window.scrollTo(0, 1200));
  await expect.poll(() => page.locator('.site-header-fixed').evaluate(el => el.getBoundingClientRect().top)).toBe(0);
  await expect(page.getByRole('link', { name: 'Ammaai home' })).toBeVisible();
  if (testInfo.project.name === 'mobile') {
    await page.getByRole('button', { name: 'Open menu' }).click();
    const menu = page.getByRole('dialog', { name: 'Mobile menu' });
    expect(await menu.locator('.brand-logo').evaluate(el => getComputedStyle(el).color)).toBe('rgb(255, 255, 255)');
    await page.getByRole('button', { name: 'Close menu' }).click();
  }
  await page.locator('footer').scrollIntoViewIfNeeded();
  expect(await page.locator('footer .brand-logo').evaluate(el => getComputedStyle(el).color)).toBe('rgb(255, 255, 255)');
});
