import eslint from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    ignores: ['.wxt/**', 'dist/**', 'graphify-out/**', 'node_modules/**', 'playwright-report/**', 'site/public/assets/**', 'test-results/**'],
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.ts'],
    languageOptions: {
      globals: { ...globals.browser, ...globals.node, ...globals.webextensions },
    },
  },
  {
    files: ['site/public/sw.js'],
    languageOptions: { globals: globals.serviceworker },
  },
  {
    files: ['**/*.mjs', '*.config.js', '*.config.mjs'],
    languageOptions: { globals: globals.node },
  },
);
