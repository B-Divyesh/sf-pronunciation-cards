import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { chromium, expect, test } from '@playwright/test';

declare global {
  interface Window {
    __spoken?: string[];
    __copied?: string;
  }
}

test('@claim:demo-isolation opens populated data without changing real browser data', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('pronunciation-cards:real-glossary', 'keep-this-real-value'));
  await page.goto('/');
  await page.getByRole('link', { name: 'Try it with sample data' }).click();
  await expect(page).toHaveURL(/\/demo\/$/);
  await expect(page.getByText(/Demo — sample data, nothing is saved to your real glossary/)).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Kubernetes' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'PostgreSQL' })).toBeVisible();
  await expect(page.locator('#spoken-output')).toContainText('cue burr NET eez');
  expect(await page.evaluate(() => localStorage.getItem('pronunciation-cards:real-glossary'))).toBe('keep-this-real-value');
  expect(await page.evaluate(() => localStorage.getItem('demo:pronunciation-cards:cards'))).not.toBeNull();
});

test('@claim:demo-reset restores the shipped sample after a change', async ({ page }) => {
  await page.goto('/demo/');
  await page.getByRole('button', { name: 'Remove ngrok from the sample' }).click();
  await expect(page.getByRole('heading', { name: 'ngrok' })).toHaveCount(0);
  await page.getByRole('button', { name: 'Reset demo' }).click();
  await expect(page.getByRole('heading', { name: 'ngrok' })).toBeVisible();
  await expect(page.locator('#demo-status')).toContainText('Sample restored');
});

test('@claim:browser-preview sends the saved spoken form to the browser speech API', async ({ page }) => {
  await page.addInitScript(() => {
    class DemoUtterance {
      text: string;
      rate = 1;
      onstart: (() => void) | null = null;
      onend: (() => void) | null = null;
      onerror: (() => void) | null = null;
      constructor(text: string) { this.text = text; }
    }
    Object.defineProperty(window, 'SpeechSynthesisUtterance', { configurable: true, value: DemoUtterance });
    Object.defineProperty(window, 'speechSynthesis', {
      configurable: true,
      value: {
        cancel: () => undefined,
        speak: (utterance: DemoUtterance) => {
          window.__spoken ??= [];
          window.__spoken.push(utterance.text);
          utterance.onstart?.();
          utterance.onend?.();
        },
      },
    });
  });
  await page.goto('/demo/');
  await page.getByRole('button', { name: 'Preview Kubernetes' }).click();
  expect(await page.evaluate(() => window.__spoken)).toEqual(['cue burr NET eez']);
  await expect(page.locator('#demo-status')).toContainText('Sample preview finished');
});

test('@claim:ssml-copy creates SSML from the selected sample card', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText: async (value: string) => { window.__copied = value; } },
    });
  });
  await page.goto('/demo/');
  await page.getByRole('button', { name: 'Copy SSML for Kubernetes' }).click();
  await expect.poll(() => page.evaluate(() => window.__copied)).toBe('<speak><phoneme alphabet="ipa" ph="ˌkuːbərˈnɛtiːz">Kubernetes</phoneme></speak>');
  await expect(page.locator('#demo-status')).toContainText('SSML copied');
});

test('@claim:json-export downloads a readable sample glossary', async ({ page }) => {
  await page.goto('/demo/');
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export sample JSON' }).click();
  const download = await downloadPromise;
  const path = await download.path();
  expect(path).not.toBeNull();
  const data = JSON.parse(await readFile(path!, 'utf8')) as { schemaVersion: number; cards: Array<{ term: string; alias: string }> };
  expect(data.schemaVersion).toBe(1);
  expect(data.cards).toHaveLength(4);
  expect(data.cards).toContainEqual(expect.objectContaining({ term: 'Kubernetes', alias: 'cue burr NET eez' }));
});

test('@claim:private-demo keeps demo requests first-party and storage namespaced', async ({ page, context }) => {
  const requests: string[] = [];
  page.on('request', (request) => requests.push(request.url()));
  await page.goto('/');
  await page.goto('/demo/');
  await page.getByRole('button', { name: 'Read with saved forms' }).click();
  expect(requests.every((url) => new URL(url).origin === 'http://127.0.0.1:4173')).toBe(true);
  expect(await context.cookies()).toEqual([]);
  expect(await page.evaluate(() => Object.keys(localStorage))).toEqual(['demo:pronunciation-cards:cards']);
});

test('@claim:offline-demo reloads after the first visit without a network connection', async ({ browser }) => {
  const demoContext = await browser.newContext();
  const page = await demoContext.newPage();
  try {
    await page.goto('http://127.0.0.1:4173/demo/');
    await page.evaluate(() => navigator.serviceWorker.ready);
    if (!await page.evaluate(() => Boolean(navigator.serviceWorker.controller))) await page.reload();
    await expect(page.getByRole('heading', { name: 'Kubernetes' })).toBeVisible();
    await demoContext.setOffline(true);
    await page.reload();
    await expect(page.getByRole('heading', { name: 'Try a sample technical glossary' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Kubernetes' })).toBeVisible();
  } finally {
    await demoContext.setOffline(false);
    await demoContext.close();
  }
});

test('@claim:extension-local-storage saves a card in the packaged extension', async () => {
  const extensionPath = resolve('dist/extension/chrome-mv3');
  const context = await chromium.launchPersistentContext('', {
    headless: true,
    channel: 'chromium',
    args: [`--disable-extensions-except=${extensionPath}`, `--load-extension=${extensionPath}`],
  });
  try {
    const requests: string[] = [];
    context.on('request', (request) => requests.push(request.url()));
    let [worker] = context.serviceWorkers();
    worker ??= await context.waitForEvent('serviceworker');
    const extensionId = new URL(worker.url()).host;
    const page = await context.newPage();
    await page.goto(`chrome-extension://${extensionId}/popup.html`);
    await page.getByLabel('Written term').fill('Docker');
    await page.getByLabel('Say it like').fill('dock er');
    await page.getByRole('button', { name: 'Save card' }).click();
    await expect(page.locator('#status')).toContainText('Saved “Docker” locally');
    const stored = await page.evaluate(async () => (globalThis as unknown as { chrome: { storage: { local: { get: (key: string) => Promise<unknown> } } } }).chrome.storage.local.get('pronunciationCards')) as { pronunciationCards: Array<{ term: string; alias: string }> };
    expect(stored.pronunciationCards).toContainEqual(expect.objectContaining({ term: 'Docker', alias: 'dock er' }));
    expect(requests.every((url) => url.startsWith(`chrome-extension://${extensionId}/`))).toBe(true);
  } finally {
    await context.close();
  }
});

test('@claim:json-import merges or replaces a packaged extension glossary', async () => {
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
    await page.goto(`chrome-extension://${extensionId}/popup.html`);
    await page.getByLabel('Written term').fill('Kubernetes');
    await page.getByLabel('Say it like').fill('first alias');
    await page.getByRole('button', { name: 'Save card' }).click();
    await page.getByRole('tab', { name: 'Portable' }).click();
    const importValue = JSON.stringify({
      schemaVersion: 1,
      exportedAt: '2026-09-06T00:00:00.000Z',
      cards: [
        { id: 'imported-kube', term: 'Kubernetes', alias: 'cue burr NET eez', ipa: '', notes: '', createdAt: '2026-09-06T00:00:00.000Z', updatedAt: '2026-09-06T00:00:00.000Z' },
        { id: 'imported-docker', term: 'Docker', alias: 'dock er', ipa: '', notes: '', createdAt: '2026-09-06T00:00:00.000Z', updatedAt: '2026-09-06T00:00:00.000Z' },
      ],
    });
    await page.getByLabel('Or paste glossary JSON').fill(importValue);
    await page.getByRole('button', { name: 'Import JSON' }).click();
    await expect(page.getByRole('status')).toContainText('Imported 2 cards');
    await page.getByRole('tab', { name: /Cards/ }).click();
    await expect(page.getByText('Say: cue burr NET eez')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Docker' })).toBeVisible();
    await page.getByRole('tab', { name: 'Portable' }).click();
    await page.getByLabel('Or paste glossary JSON').fill(JSON.stringify({ schemaVersion: 1, exportedAt: '2026-09-06T00:00:00.000Z', cards: [] }));
    await page.getByRole('radio', { name: 'Replace my whole glossary' }).check();
    page.once('dialog', (dialog) => void dialog.accept());
    await page.getByRole('button', { name: 'Import JSON' }).click();
    await expect(page.getByRole('status')).toContainText('Imported 0 cards');
    const stored = await page.evaluate(async () => (globalThis as unknown as { chrome: { storage: { local: { get: (key: string) => Promise<unknown> } } } }).chrome.storage.local.get('pronunciationCards')) as { pronunciationCards: unknown[] };
    expect(stored.pronunciationCards).toEqual([]);
  } finally {
    await context.close();
  }
});

test('@claim:explicit-permissions packages only action-scoped page access', async () => {
  const manifest = JSON.parse(await readFile(resolve('dist/extension/chrome-mv3/manifest.json'), 'utf8')) as { permissions: string[]; host_permissions?: string[] };
  expect(manifest.permissions).toEqual(expect.arrayContaining(['storage', 'contextMenus', 'activeTab', 'scripting']));
  expect(manifest.host_permissions ?? []).toEqual([]);
});

test('@claim:free-download serves the installable extension ZIP without an account', async ({ request }) => {
  const response = await request.get('/downloads/pronunciation-cards-chrome.zip');
  expect(response.status()).toBe(200);
  expect(response.headers()['content-type']).toContain('application/zip');
  const body = await response.body();
  expect(body.subarray(0, 2).toString('ascii')).toBe('PK');
  expect(body.byteLength).toBeGreaterThan(10_000);
});
