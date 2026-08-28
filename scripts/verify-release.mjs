import { readFile, readdir, stat } from 'node:fs/promises';
import { relative, resolve } from 'node:path';
import { unzipSync } from 'fflate';

const root = resolve(import.meta.dirname, '..');
const extensionRoot = resolve(root, 'dist/extension/chrome-mv3');
const archivePath = resolve(root, 'dist/site/downloads/pronunciation-cards-chrome.zip');

async function collect(directory, files = new Map()) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = resolve(directory, entry.name);
    if (entry.isDirectory()) await collect(path, files);
    else files.set(relative(extensionRoot, path).replaceAll('\\', '/'), new Uint8Array(await readFile(path)));
  }
  return files;
}

const archive = new Uint8Array(await readFile(archivePath));
if ((await stat(archivePath)).size <= 10_000) throw new Error('Release ZIP is unexpectedly small.');

const unpacked = unzipSync(archive);
const expected = await collect(extensionRoot);
if (Object.keys(unpacked).sort().join('\n') !== [...expected.keys()].sort().join('\n')) {
  throw new Error('Release ZIP file list does not match the built extension.');
}

for (const [name, bytes] of expected) {
  const packaged = unpacked[name];
  if (!packaged || !Buffer.from(packaged).equals(Buffer.from(bytes))) {
    throw new Error(`Release ZIP differs from the built extension at ${name}.`);
  }
}

const manifest = JSON.parse(Buffer.from(unpacked['manifest.json']).toString('utf8'));
if (manifest.manifest_version !== 3 || manifest.name !== 'Pronunciation Cards') {
  throw new Error('Release ZIP does not contain the expected MV3 extension.');
}

const deployment = JSON.parse(await readFile(resolve(root, 'dist/site/staticwebapp.config.json'), 'utf8'));
if (deployment.mimeTypes?.['.avif'] !== 'image/avif' || deployment.mimeTypes?.['.zip'] !== 'application/zip') {
  throw new Error('Deployment MIME mappings for AVIF and ZIP are missing.');
}
const assetRoute = deployment.routes?.find((route) => route.route === '/assets/*');
const downloadRoute = deployment.routes?.find((route) => route.route === '/downloads/*');
if (/immutable/i.test(assetRoute?.headers?.['Cache-Control'] ?? '')) {
  throw new Error('Stable asset URLs must not be cached as immutable.');
}
if (!/no-cache/i.test(downloadRoute?.headers?.['Cache-Control'] ?? '')) {
  throw new Error('The stable release ZIP URL must revalidate on every use.');
}

console.log(`Verified ${archive.byteLength}-byte release ZIP with ${expected.size} byte-identical extension files.`);
