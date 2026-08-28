import { defineConfig } from 'wxt';

export default defineConfig({
  outDir: 'dist/extension',
  publicDir: 'extension-public',
  manifest: {
    name: 'Pronunciation Cards',
    description: 'Keep a local glossary of predictable pronunciations for technical terms and names.',
    version: '1.0.0',
    permissions: ['storage', 'contextMenus', 'activeTab', 'scripting'],
    action: {
      default_title: 'Open Pronunciation Cards',
    },
    icons: {
      16: 'icon/16.png',
      32: 'icon/32.png',
      48: 'icon/48.png',
      128: 'icon/128.png',
    },
  },
});
