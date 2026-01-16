import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import importPlugin from 'eslint-plugin-import';
import unusedImportsPlugin from 'eslint-plugin-unused-imports';
import queryPlugin from '@tanstack/eslint-plugin-query';
import globals from 'globals';
import path from 'path';
import { fileURLToPath } from 'url';
import prettierConfig from 'eslint-config-prettier';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default tseslint.config(
  {
    ignores: [
      'resources/*.js',
      'install-k6.js',
      'eslint.config.js',
      'eslint.config.mjs',
      '**/__snapshots__/',
      'dist/**',
      '.vite/**',
      'out/**',
      'node_modules/**'
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  {
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      parserOptions: {
        projectService: true,
        tsconfigRootDir: __dirname,
      },
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.es2021,
      },
    },
    settings: {
      react: {
        version: 'detect',
      },
      'import/resolver': {
        typescript: {
          project: './tsconfig.json',
        },
        node: true
      },
    },
  },
  {
    files: ['**/*.{ts,tsx}'],
    plugins: {
      react: reactPlugin,
      'react-hooks': reactHooksPlugin,
      import: importPlugin,
      'unused-imports': unusedImportsPlugin,
      '@tanstack/query': queryPlugin,
    },
    rules: {
      // React rules
      ...reactPlugin.configs.recommended.rules,
      ...reactPlugin.configs['jsx-runtime'].rules,
      'react/no-unknown-property': ['error', { ignore: ['css'] }],
      
      // React Hooks rules
      ...reactHooksPlugin.configs.recommended.rules,
      // Disable new strict rules from v7 that were not present in v4/previous
      'react-hooks/set-state-in-effect': 'off',
      'react-hooks/purity': 'off',
      'react-hooks/incompatible-library': 'off',
      // The old rule was less strict about useCallback dependencies
      'react-hooks/use-memo': 'off',
      
      // Query rules
      ...queryPlugin.configs.recommended.rules,
      
      // TypeScript rules
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          varsIgnorePattern: '^_',
          argsIgnorePattern: '^_',
          caughtErrors: 'none',
          ignoreRestSiblings: true,
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
        {
          allowShortCircuit: true,
          allowTernary: true,
          allowTaggedTemplates: true,
        },
      ],
      // Relax rules that were not present or stricter in previous version
      '@typescript-eslint/no-empty-object-type': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/prefer-promise-reject-errors': 'off',
      '@typescript-eslint/no-base-to-string': 'off',
      '@typescript-eslint/no-require-imports': 'off',
      '@typescript-eslint/no-duplicate-type-constituents': 'off',
      
      // Import rules
      ...importPlugin.configs.recommended.rules,
      ...importPlugin.configs.typescript.rules,
      'import/order': [
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
      'import/no-unresolved': ['error', { ignore: ['^k6'] }],
      'import/namespace': 'off',
      'import/default': 'off',

      // Other rules
      'no-param-reassign': 'error',
      'unused-imports/no-unused-imports': 'warn',
      'no-unused-private-class-members': 'warn',
    },
  },
  prettierConfig,
);
