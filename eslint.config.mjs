import antfu from '@antfu/eslint-config'
import autoImports from './.wxt/eslint-auto-imports.mjs';

export default antfu(
    {
      stylistic: false,
      typescript: true,
      vue: true,
      comments: false,
    },
    {
      ignores: [
        '.idea',
        '..github',
        '.vscode',
        '.output',
        'node_modules',
        'json-loader.mjs',
        'node_modules',
        'dist',
        '**/*.js',
        '**/*.d.ts',
        'assets',
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
          // ...globals.browser,
          // ...globals.worker,
          // ...globals.webextensions,
          ...autoImports.globals,
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
        'unused-imports/no-unused-vars': "warn",
      },
    },
)
