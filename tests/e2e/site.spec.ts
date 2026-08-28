import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

for (const path of ['/', '/privacy/', '/terms/']) {
  test(`${path} has semantic structure and no serious axe violations`, async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on('console', (message) => { if (message.type() === 'error') consoleErrors.push(message.text()); });
    await page.goto(path);
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    await expect(page.locator('main')).toHaveCount(1);
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page).toHaveTitle(/Pronunciation Cards|Privacy|Terms/);
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations).toEqual([]);
    expect(consoleErrors).toEqual([]);
  });
}

test('home works at 390px and exposes the complete install path', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('technical words');
  await expect(page.getByRole('link', { name: /Download extension/ })).toHaveAttribute('download', '');
  await expect(page.locator('a[href="/downloads/pronunciation-cards-chrome.zip"]')).toHaveCount(3);
  await expect(page.locator('body')).toHaveJSProperty('scrollWidth', 390);
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'Skip to main content' })).toBeFocused();

  for (const target of [
    page.getByRole('link', { name: 'Pronunciation Cards home' }).first(),
    page.locator('footer .brand'),
    page.getByRole('link', { name: 'Privacy' }),
    page.getByRole('link', { name: 'Terms' }),
    page.getByRole('link', { name: 'Source' }),
  ]) {
    const box = await target.boundingBox();
    expect(box, 'expected touch target to have a box').not.toBeNull();
    expect(box!.width).toBeGreaterThanOrEqual(44);
    expect(box!.height).toBeGreaterThanOrEqual(44);
  }
});

test('download artifact and offline state are available', async ({ page, request, context }) => {
  const response = await request.get('/downloads/pronunciation-cards-chrome.zip');
  expect(response.ok()).toBeTruthy();
  const archive = await response.body();
  expect(archive.byteLength).toBeGreaterThan(10_000);
  expect(archive.subarray(0, 2).toString('ascii')).toBe('PK');
  const avif = await request.get('/assets/pronunciation-cards-hero-960.avif');
  expect(avif.headers()['content-type']).toContain('image/avif');
  await page.goto('/');
  await context.setOffline(true);
  await page.evaluate(() => window.dispatchEvent(new Event('offline')));
  await expect(page.getByText(/You’re offline/)).toBeVisible();
  await context.setOffline(false);
});

test('controlled clients bypass stale page and download cache entries', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => navigator.serviceWorker.ready);
  if (!await page.evaluate(() => Boolean(navigator.serviceWorker.controller))) await page.reload();
  await expect.poll(() => page.evaluate(() => Boolean(navigator.serviceWorker.controller))).toBe(true);

  await page.evaluate(async () => {
    const cache = await caches.open('pronunciation-cards-site-v2');
    await cache.put('/', new Response('STALE SHELL SENTINEL', { headers: { 'Content-Type': 'text/html' } }));
    await cache.put('/downloads/pronunciation-cards-chrome.zip', new Response('STALE ZIP SENTINEL'));
    await (await navigator.serviceWorker.getRegistration())?.update();
  });

  await page.reload();
  await expect(page.getByRole('heading', { level: 1 })).toContainText('technical words');
  expect(await page.locator('body').textContent()).not.toContain('STALE SHELL SENTINEL');
  const prefix = await page.evaluate(async () => {
    const bytes = new Uint8Array(await (await fetch('/downloads/pronunciation-cards-chrome.zip')).arrayBuffer());
    return String.fromCharCode(...bytes.slice(0, 2));
  });
  expect(prefix).toBe('PK');
});
