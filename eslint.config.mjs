import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import importX from 'eslint-plugin-import-x';
import unusedImports from 'eslint-plugin-unused-imports';
import tanstackQuery from '@tanstack/eslint-plugin-query';
import eslintConfigPrettier from 'eslint-config-prettier';
import globals from 'globals';

export default tseslint.config(
  // Global ignores
  {
    ignores: [
      'resources/*.js',
      'install-k6.js',
      '.eslintrc.cjs',
      '**/__snapshots__/',
      'node_modules/',
      '.vite/',
      'out/',
      'dist/',
      '*.config.js',
      '*.config.ts',
      '*.config.mjs',
      '*.config.mts',
    ],
  },

  // Base ESLint recommended
  eslint.configs.recommended,

  // TypeScript ESLint recommended with type checking
  ...tseslint.configs.recommendedTypeChecked,

  // React recommended configuration
  {
    files: ['**/*.{ts,tsx}'],
    ...react.configs.flat.recommended,
    ...react.configs.flat['jsx-runtime'],
    settings: {
      react: {
        version: 'detect',
      },
    },
  },

  // React hooks configuration
  {
    files: ['**/*.{ts,tsx}'],
    plugins: {
      'react-hooks': reactHooks,
    },
    rules: reactHooks.configs.recommended.rules,
  },

  // Import plugin configuration - use recommended configs
  importX.flatConfigs.recommended,
  importX.flatConfigs.typescript,

  // Import plugin custom rules
  {
    files: ['**/*.{ts,tsx}'],
    settings: {
      'import-x/resolver': {
        typescript: true,
        node: true,
      },
    },
    rules: {
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
      'import-x/no-unresolved': ['error', { ignore: ['^k6'] }],
    },
  },

  // Unused imports configuration
  {
    files: ['**/*.{ts,tsx}'],
    plugins: {
      'unused-imports': unusedImports,
    },
    rules: {
      'unused-imports/no-unused-imports': 'warn',
    },
  },

  // TanStack Query configuration
  ...tanstackQuery.configs['flat/recommended'],

  // Main TypeScript/React configuration
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.es2021,
      },
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    rules: {
      'react/no-unknown-property': ['error', { ignore: ['css'] }],
      'no-param-reassign': 'error',
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
      // Disable to maintain backwards compatibility with previous eslint setup
      '@typescript-eslint/no-require-imports': 'off',
    },
  },

  // Prettier must be last to override other formatting rules
  eslintConfigPrettier
);
