import globals from 'globals';
import tseslint from 'typescript-eslint';
import pluginReactConfig from 'eslint-plugin-react/configs/recommended.js';
import { fixupConfigRules } from '@eslint/compat';
import pluginReactHooks from 'eslint-plugin-react-hooks';
import pluginReactRefresh from 'eslint-plugin-react-refresh';
import prettierConfig from 'eslint-config-prettier';
import prettierPlugin from 'eslint-plugin-prettier';

export default [
  // 1. 전역 설정
  {
    ignores: ['dist/', 'node_modules/', 'eslint.config.js'],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.es2020,
      },
    },
  },

  // 2. TypeScript 기본 설정
  ...tseslint.configs.recommended,

  // 3. React 관련 설정 (옛날 형식 변환)
  // 이전 코드의 { ... } 래퍼를 제거하고 배열을 직접 펼칩니다.
  ...fixupConfigRules(pluginReactConfig),

  // 4. React Hooks 규칙
  {
    files: ['**/*.{js,jsx,mjs,cjs,ts,tsx}'],
    plugins: {
      'react-hooks': pluginReactHooks,
    },
    rules: {
      ...pluginReactHooks.configs.recommended.rules,
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
  },

  // 5. React Refresh 규칙
  {
    files: ['**/*.{js,jsx,mjs,cjs,ts,tsx}'],
    plugins: {
      'react-refresh': pluginReactRefresh,
    },
    rules: {
      'react-refresh/only-export-components': 'warn',
    },
  },

  // 6. Prettier 관련 설정 (배열의 가장 마지막에 위치)
  {
    plugins: {
      prettier: prettierPlugin,
    },
    rules: {
      ...prettierConfig.rules, // prettierConfig는 객체이므로 그 안의 rules를 펼칩니다.
      'prettier/prettier': [
        'error',
        {
          singleQuote: true,
          semi: true,
          useTabs: false,
          tabWidth: 2,
          trailingComma: 'all',
          printWidth: 100,
          arrowParens: 'always',
        },
      ],
    },
  },

  // 7. 사용자 정의 규칙
  {
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        },
      ],
      '@typescript-eslint/no-explicit-any': 'warn',
    },
  },
];
