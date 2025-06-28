module.exports = {
  root: true,
  env: { browser: true, es2020: true, node: true },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react-hooks/recommended',
    'plugin:prettier/recommended', // Prettier 규칙을 ESLint에 통합
  ],
  ignorePatterns: ['dist', '.eslintrc.cjs'],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    project: ['./tsconfig.json'], // tsconfig.json 경로 지정
    tsconfigRootDir: __dirname // tsconfig.json의 root directory 지정
  },
  settings: { react: { version: '18.2' } }, // React 버전 명시
  plugins: ['react-refresh', '@typescript-eslint', 'prettier'],
  rules: {
    'react-refresh/only-export-components': [
      'warn',
      { allowConstantExport: true },
    ],
    // 추가적인 규칙 정의 (예: 줄 바꿈, 세미콜론 등 Prettier와 충돌하지 않는 규칙)
    'prettier/prettier': ['error', {
      'singleQuote': true,
      'semi': true,
      'useTabs': false,
      'tabWidth': 2,
      'trailingComma': 'all',
      'printWidth': 80,
      'arrowParens': 'always'
    }],
    'indent': 'off', // Prettier가 처리하므로 ESLint에서는 끔
    '@typescript-eslint/indent': ['error', 2], // 타입스크립트용 들여쓰기 2칸
    'linebreak-style': ['error', 'unix'],
    'quotes': ['error', 'single'],
    'semi': ['error', 'always'],
    '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }], // 사용하지 않는 변수에 대한 경고
    '@typescript-eslint/explicit-module-boundary-types': 'off', // 함수 반환 타입 강제 해제 (개인의 선호에 따라 변경 가능)
    '@typescript-eslint/no-explicit-any': 'off', // 'any' 타입 사용 허용 (개인의 선호에 따라 변경 가능)
  },
}
