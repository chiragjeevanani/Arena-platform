import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    rules: {
      // Flags the standard "fetch in useEffect, setLoading/setData" pattern used across the app.
      // It's a React Compiler performance hint, not a correctness issue; rewriting ~90 data
      // loaders without browser testing would be riskier than the hint is worth.
      'react-hooks/set-state-in-effect': 'off',
      // `motion` is used as <motion.div>; core ESLint can't see JSX member usage (same reason as ^[A-Z]).
      'no-unused-vars': ['error', {
        varsIgnorePattern: '^([A-Z_]|motion$)',
        // PascalCase params are components rendered as JSX; a leading _ marks a deliberately unused one.
        argsIgnorePattern: '^([A-Z]|_)',
      }],
    },
  },
  {
    files: ['tests/**/*.test.{js,jsx}', 'src/**/*.test.{js,jsx}'],
    languageOptions: {
      globals: {
        ...globals.vitest,
      },
    },
  },
])
