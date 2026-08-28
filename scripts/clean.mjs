import { rm } from 'node:fs/promises';
import { resolve } from 'node:path';

const repositoryRoot = resolve(import.meta.dirname, '..');
const targets = ['dist', '.wxt', '.output'].map((name) => resolve(repositoryRoot, name));

for (const target of targets) {
  if (!target.startsWith(`${repositoryRoot}/`)) throw new Error(`Refusing to clean ${target}`);
  await rm(target, { recursive: true, force: true });
}
