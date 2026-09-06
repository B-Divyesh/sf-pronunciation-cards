import { copyFile, mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import sharp from 'sharp';

const root = resolve(import.meta.dirname, '..');
const hero = resolve(root, 'assets/src/pronunciation-cards-hero.png');
const mark = resolve(root, 'assets/src/product-mark.svg');
const siteAssets = resolve(root, 'site/public/assets');
const icons = resolve(root, 'extension-public/icon');

await Promise.all([mkdir(siteAssets, { recursive: true }), mkdir(icons, { recursive: true })]);
await Promise.all([
  copyFile(mark, resolve(siteAssets, 'product-mark.svg')),
  sharp(hero).resize(960, 640, { fit: 'inside', withoutEnlargement: true }).webp({ quality: 76 }).toFile(resolve(siteAssets, 'pronunciation-cards-hero-960.webp')),
  sharp(hero).resize(1440, 960, { fit: 'inside', withoutEnlargement: true }).webp({ quality: 78 }).toFile(resolve(siteAssets, 'pronunciation-cards-hero-1440.webp')),
  sharp(hero).resize(960, 640, { fit: 'inside', withoutEnlargement: true }).avif({ quality: 52, effort: 5 }).toFile(resolve(siteAssets, 'pronunciation-cards-hero-960.avif')),
  sharp(hero).resize(1200, 630, { fit: 'cover', position: 'attention' }).webp({ quality: 80 }).toFile(resolve(siteAssets, 'pronunciation-cards-social.webp')),
  sharp(mark).resize(180, 180).png().toFile(resolve(siteAssets, 'apple-touch-icon.png')),
  ...[16, 32, 48, 128].map((size) => sharp(mark).resize(size, size).png().toFile(resolve(icons, `${size}.png`))),
]);
