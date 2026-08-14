import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

/** Framework/IO packages that must not leak past the application boundary. */
const ioPackages = [
  { name: 'react', message: 'The domain/application layers must stay framework-free.' },
  { name: 'react-dom', message: 'The domain/application layers must stay framework-free.' },
  { name: 'axios', message: 'Depend on the HttpClient port instead of a concrete HTTP library.' },
]

const restrict = (patterns, extraPaths = []) => ({
  'no-restricted-imports': [
    'error',
    { paths: [...ioPackages, ...extraPaths], patterns },
  ],
})

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
    },
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
    },
  },

  // domain layer
  {
    files: ['src/modules/*/domain/**/*.ts'],
    rules: restrict([
      {
        group: ['@survey/application/*', '@survey/infrastructure/*', '@survey/presentation/*', '@ds/*', '@app/*'],
        message: 'domain/ is the innermost layer — it may only import from itself and @core.',
      },
      {
        group: ['../application/*', '../infrastructure/*', '../presentation/*', '../../application/*', '../../infrastructure/*', '../../presentation/*'],
        message: 'domain/ is the innermost layer — it may only import from itself and @core.',
      },
    ]),
  },

  // application layer
  {
    files: ['src/modules/*/application/**/*.ts'],
    rules: restrict([
      {
        group: ['@survey/infrastructure/*', '@survey/presentation/*', '@ds/*', '@app/*'],
        message: 'application/ depends on domain ports, never on a concrete adapter or on the UI.',
      },
      {
        group: ['../infrastructure/*', '../presentation/*', '../../infrastructure/*', '../../presentation/*'],
        message: 'application/ depends on domain ports, never on a concrete adapter or on the UI.',
      },
    ]),
  },

  // infrastructure layer
  {
    files: ['src/modules/*/infrastructure/**/*.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@survey/presentation/*', '../presentation/*', '../../presentation/*', '@ds/*', '@app/*'],
              message: 'infrastructure/ must not depend on the UI layer.',
            },
          ],
        },
      ],
    },
  },

  // generic layers
  {
    files: ['src/core/**/*.ts', 'src/design-system/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@survey/*', '@app/*', '**/modules/**'],
              message: 'core/ and design-system/ are generic — they must not depend on a business module.',
            },
          ],
        },
      ],
    },
  },
])
