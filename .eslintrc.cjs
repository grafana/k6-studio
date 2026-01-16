module.exports = {
  env: {
    browser: true,
    es6: true,
    node: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:@typescript-eslint/recommended-type-checked',
    'plugin:import/recommended',
    'plugin:import/electron',
    'plugin:import/typescript',
    'plugin:react/recommended',
    'plugin:react/jsx-runtime',
    'plugin:react-hooks/recommended',
    'plugin:@tanstack/eslint-plugin-query/recommended',
    'prettier',
  ],
  parser: '@typescript-eslint/parser',
  ignorePatterns: [
    'resources/*.js',
    'install-k6.js',
    '.eslintrc.cjs',
    'eslint.config.*',
    '**/__snapshots__/',
  ],
  plugins: [
    'import',
    'unused-imports',
    '@tanstack/query',
    '@typescript-eslint',
  ],
  settings: {
    react: {
      version: 'detect',
    },
    'import/resolver': {
      typescript: {},
    },
  },
  rules: {
    'react/no-unknown-property': ['error', { ignore: ['css'] }],
    'no-param-reassign': 'error',
    'unused-imports/no-unused-imports': 'warn',
    // eslint-plugin-import + ESLint v9 can overflow stack on circular export maps
    'import/no-named-as-default': 'off',
    'import/no-named-as-default-member': 'off',
    // Keep lint surface stable across eslint-plugin-react-hooks major upgrades.
    'react-hooks/set-state-in-effect': 'off',
    'react-hooks/purity': 'off',
    'react-hooks/incompatible-library': 'off',
    'react-hooks/use-memo': 'off',
    '@typescript-eslint/no-unused-expressions': [
      'error',
      { allowShortCircuit: true, allowTernary: true, allowTaggedTemplates: true },
    ],
    '@typescript-eslint/no-empty-object-type': 'off',
    'no-unused-private-class-members': 'off',
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
  },

  parserOptions: {
    projectService: true,
    tsconfigRootDir: __dirname,
  },
}
