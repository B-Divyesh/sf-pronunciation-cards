import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import { relative, resolve } from 'node:path';
import { zipSync } from 'fflate';

const root = resolve(import.meta.dirname, '..');
const source = resolve(root, 'dist/extension/chrome-mv3');
const downloads = resolve(root, 'dist/site/downloads');

async function collect(directory, files = {}) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = resolve(directory, entry.name);
    if (entry.isDirectory()) await collect(path, files);
    else files[relative(source, path).replaceAll('\\\\', '/')] = new Uint8Array(await readFile(path));
  }
  return files;
}

await mkdir(downloads, { recursive: true });
const archive = zipSync(await collect(source), { level: 9 });
await writeFile(resolve(downloads, 'pronunciation-cards-chrome.zip'), archive);
