module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended',
    'plugin:import/errors',
    'plugin:import/warnings',
    'plugin:import/typescript',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint', 'import', 'prettier'],
  rules: {
    'no-unused-vars': 'off',
    'no-explicit-any': 'off',
    '@typescript-eslint/no-unused-vars': ['Error'],
    '@typescript-eslint/no-explicit-any': 'off', //there are some problems in Keystone where proper typing is not achievable
    'prettier/prettier': [
      'warn',
      {
        printWidth: 120,
        singleQuote: true,
        trailingComma: 'all',
      },
    ],
    'import/order': [
      'warn',
      {
        alphabetize: {
          order: 'asc',
          caseInsensitive: true,
        },
      },
    ],
  },
};
