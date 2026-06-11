module.exports = {
  root: true,
  env: { browser: true, es2020: true },
  extends: ['eslint:recommended'],
  parser: '@typescript-eslint/parser',
  parserOptions: { ecmaVersion: 'latest', sourceType: 'module' },
  ignorePatterns: ['dist', '.eslintrc.cjs'],
  rules: { 'no-unused-vars': 'off', 'no-undef': 'off' },
};
