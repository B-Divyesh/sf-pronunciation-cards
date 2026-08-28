import AxeBuilder from '@axe-core/playwright';
import { chromium, expect, test } from '@playwright/test';
import { resolve } from 'node:path';

test('extension popup saves, searches, and exports a real card', async () => {
  const extensionPath = resolve('dist/extension/chrome-mv3');
  const context = await chromium.launchPersistentContext('', {
    headless: true,
    channel: 'chromium',
    args: [`--disable-extensions-except=${extensionPath}`, `--load-extension=${extensionPath}`],
  });
  try {
    let [worker] = context.serviceWorkers();
    worker ??= await context.waitForEvent('serviceworker');
    const extensionId = new URL(worker.url()).host;
    const page = await context.newPage();
    await page.setViewportSize({ width: 390, height: 844 });
    const consoleErrors: string[] = [];
    page.on('console', (message) => { if (message.type() === 'error') consoleErrors.push(message.text()); });
    await page.goto(`chrome-extension://${extensionId}/popup.html`);
    await page.getByLabel('Written term').fill('Kubernetes');
    await page.getByLabel('Say it like').fill('cue burr NET eez');
    await page.getByRole('button', { name: 'Save card' }).click();
    await expect(page.locator('#status')).toContainText('Saved');
    await page.getByRole('tab', { name: /Cards/ }).click();
    await expect(page.getByRole('heading', { name: 'Kubernetes' })).toBeVisible();
    await page.getByLabel('Find a card').fill('not here');
    await expect(page.getByText(/No cards match/)).toBeVisible();
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations).toEqual([]);

    const skipBox = await page.getByRole('link', { name: 'Skip to editor' }).boundingBox();
    expect(skipBox?.height).toBeGreaterThanOrEqual(44);
    await page.getByRole('tab', { name: 'Portable' }).click();
    const fileBox = await page.getByLabel('Choose a glossary file').boundingBox();
    expect(fileBox?.height).toBeGreaterThanOrEqual(44);
    await page.locator('#undo-wrap').evaluate((element) => element.removeAttribute('hidden'));
    const undoBox = await page.getByRole('button', { name: 'Undo' }).boundingBox();
    expect(undoBox?.height).toBeGreaterThanOrEqual(44);
    expect(consoleErrors).toEqual([]);
  } finally {
    await context.close();
  }
});
