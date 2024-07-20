import antfu from '@antfu/eslint-config'
import globals from 'globals'
import { autoImportGlobals } from './json-loader.mjs'

export default antfu(
  {
    stylistic: false,
    typescript: true,
    vue: true,
    comments: false,
  },
  {
    ignores: [
      'json-loader.mjs',
      'node_modules',
      'dist',
      '**/*.js',
      '**/*.d.ts',
      'public',
      'build',
      'coverage',
      'tests',
      'cypress',
    ],
  },
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.worker,
        ...globals.webextensions,
        ...autoImportGlobals.globals,
      },
    },
  },
  {
    rules: {
      'no-console': 'off',
      'no-restricted-globals': 'warn',
      'import/order': 'warn',
      '@typescript-eslint/ban-ts-comment': 'warn',
      '@typescript-eslint/explicit-function-return-type': 'off',
      'vue/multi-word-component-names': 'off',
      '@eslint-community/eslint-comments/no-unlimited-disable': 'off',
      'no-alert': 'off',
    },
  }
)
