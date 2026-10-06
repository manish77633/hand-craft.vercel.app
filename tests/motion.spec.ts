import { test, expect } from '@playwright/test';

test('hero roll and one-time bottom-up reveals preserve layout', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/');
  await expect(page.locator('h1 .text-roll')).toHaveAttribute('aria-label', /treasure/i);
  await expect(page.locator('.brand-splash')).toHaveCount(0);
  await page.waitForTimeout(1200);
  const roll = page.locator('.text-roll-copy').first();
  expect(await roll.evaluate(el => getComputedStyle(el).transform)).toBe('matrix(1, 0, 0, 1, 0, 0)');
  const pending = page.locator('[data-scroll-reveal="pending"]').first();
  await expect(pending).toBeAttached();
  const target = await pending.elementHandle();
  await target!.scrollIntoViewIfNeeded();
  await expect.poll(() => target!.getAttribute('data-scroll-reveal')).toBe('visible');
  await page.waitForTimeout(650);
  expect(await target!.evaluate(el => getComputedStyle(el).opacity)).toBe('1');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBeTruthy();
  await page.goto('/collections');
  await expect(page.locator('h1:visible').first()).toBeVisible();
  expect(errors).toEqual([]);
});

test('reduced motion keeps content readable without rolling or smooth scrolling', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await expect(page.locator('.brand-splash')).toHaveCount(0);
  expect(await page.evaluate(() => getComputedStyle(document.documentElement).scrollBehavior)).toBe('auto');
  await expect(page.locator('[data-scroll-reveal="pending"]')).toHaveCount(0);
  expect(await page.locator('.text-roll-original').first().evaluate(el => getComputedStyle(el).animationName)).toBe('none');
});
