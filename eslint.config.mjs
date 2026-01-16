import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import importXPlugin from 'eslint-plugin-import-x';
import unusedImportsPlugin from 'eslint-plugin-unused-imports';
import tanstackQueryPlugin from '@tanstack/eslint-plugin-query';
import prettierConfig from 'eslint-config-prettier';
import globals from 'globals';

export default tseslint.config(
  // Global ignores
  {
    ignores: [
      'resources/*.js',
      'install-k6.js',
      'eslint.config.mjs',
      '**/__snapshots__/',
      '.vite/',
      'out/',
      'dist/',
      'node_modules/',
    ],
  },

  // Base configuration for all files
  js.configs.recommended,

  // TypeScript configuration
  ...tseslint.configs.recommendedTypeChecked,

  // React configuration
  {
    files: ['**/*.{ts,tsx,js,jsx}'],
    plugins: {
      react: reactPlugin,
      'react-hooks': reactHooksPlugin,
      'import-x': importXPlugin,
      'unused-imports': unusedImportsPlugin,
      '@tanstack/query': tanstackQueryPlugin,
    },
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.es2021,
        ...globals.node,
      },
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    settings: {
      react: {
        version: 'detect',
      },
      'import-x/resolver': {
        typescript: {},
      },
    },
    rules: {
      // React rules
      ...reactPlugin.configs.recommended.rules,
      ...reactPlugin.configs['jsx-runtime'].rules,
      'react/no-unknown-property': ['error', { ignore: ['css'] }],

      // React hooks rules
      ...reactHooksPlugin.configs.recommended.rules,

      // TanStack Query rules
      ...tanstackQueryPlugin.configs.recommended.rules,

      // General rules
      'no-param-reassign': 'error',

      // Unused imports
      'unused-imports/no-unused-imports': 'warn',

      // TypeScript rules
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          varsIgnorePattern: '^_',
          argsIgnorePattern: '^_',
        },
      ],
      '@typescript-eslint/no-floating-promises': [
        'error',
        {
          ignoreIIFE: true,
        },
      ],
      '@typescript-eslint/no-misused-promises': [
        'error',
        { checksVoidReturn: false },
      ],
      '@typescript-eslint/no-unused-expressions': [
        'error',
        { allowShortCircuit: true, allowTernary: true },
      ],

      // Import rules
      'import-x/order': [
        'warn',
        {
          groups: [
            ['builtin', 'external'],
            'internal',
            'parent',
            'sibling',
            'index',
          ],
          'newlines-between': 'always',
          alphabetize: { order: 'asc' },
        },
      ],
      'import-x/no-unresolved': ['error', { ignore: ['^k6', '__USER_SCRIPT_PATH__'] }],
    },
  },

  // Prettier config (must be last to disable conflicting rules)
  prettierConfig
);
