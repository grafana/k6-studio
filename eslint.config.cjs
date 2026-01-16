const { FlatCompat } = require('@eslint/eslintrc')
const js = require('@eslint/js')

const legacyConfig = require('./.eslintrc.cjs')

const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
})

module.exports = [
  ...compat.config({
    ...legacyConfig,
    ignorePatterns: [...(legacyConfig.ignorePatterns ?? []), 'eslint.config.cjs'],
  }),
]
