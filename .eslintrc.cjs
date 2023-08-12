module.exports = {
  extends: ['plugin:optimal-modules/recommended', '@antfu'],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    EXPERIMENTAL_useProjectService: true,
  },
  rules: {
    'no-console': 'off',

  },

  ignorePatterns: [
    'deno.jsonc',
    'settings.json',
    '*.json',
  ],
}
