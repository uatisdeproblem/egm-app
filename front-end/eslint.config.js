const { defineConfig, globalIgnores } = require('eslint/config');
const js = require('@eslint/js');
const { FlatCompat } = require('@eslint/eslintrc');

const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all
});

module.exports = defineConfig([
  {},
  globalIgnores(['projects/**/*']),
  {
    files: ['**/*.ts'],
    languageOptions: { parserOptions: { project: ['tsconfig.json'], tsconfigRootDir: __dirname } },
    extends: compat.extends(
      'plugin:@angular-eslint/recommended',
      'plugin:@angular-eslint/template/process-inline-templates'
    ),
    rules: {
      '@angular-eslint/component-selector': ['error', { type: 'element', style: 'kebab-case' }],
      '@angular-eslint/component-class-suffix': ['error', { suffixes: ['Page', 'Component'] }],
      '@angular-eslint/no-output-native': 0
    }
  },
  {
    files: ['**/*.html'],
    extends: compat.extends('plugin:@angular-eslint/template/recommended')
  }
]);
