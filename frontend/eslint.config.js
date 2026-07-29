import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

/**
 * The dependency rule, enforced by the linter.
 *
 *   presentation ─┐
 *   infrastructure ─┼─> application ─> domain ─> (core)
 *
 * Arrows point inwards only. A layer may never import from a layer to its
 * left. `core` and `design-system` are generic and must never learn about
 * a business module. Without these rules "clean architecture" is just a
 * folder naming convention, so they are part of `npm run lint`.
 */

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
  },

  // The innermost layer: pure business rules. Knows nothing but itself + core.
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

  // Use cases: orchestrate the domain, talk to ports, never to adapters.
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

  // Adapters: implement ports. Allowed to use axios, never to import the UI.
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

  // Generic layers: reusable across projects, so no business knowledge.
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
