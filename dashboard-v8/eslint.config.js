import globals from 'globals';
import pluginImport from 'eslint-plugin-import';

export default [
  { files: ['src/**/*.js', 'boot.js', 'main.js'] },
  { languageOptions: { ecmaVersion: 2022, sourceType: 'module', globals: { ...globals.browser, window: 'readonly', document: 'readonly' } } },
  { plugins: { import: pluginImport } },
  {
    rules: {
      'import/no-cycle': 'error',
      'import/no-self-import': 'error',
      'no-duplicate-imports': 'error',
      'import/no-empty-named-blocks': 'warn',
      'import/first': 'warn',
      'import/newline-after-import': 'warn',
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }]
    }
  },
  { ignores: ['dist/**', 'node_modules/**', 'test/**', 'scripts/**'] }
];
