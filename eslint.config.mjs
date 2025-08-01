import js from '@eslint/js'
import pluginTs from '@typescript-eslint/eslint-plugin'
import parserTs from '@typescript-eslint/parser'
import pluginPrettier from 'eslint-plugin-prettier'
import simpleImportSort from 'eslint-plugin-simple-import-sort'
import globals from 'globals'
import eslintPluginImport from 'eslint-plugin-import'

/** @type {import('eslint').Linter.Config} */
export default [
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser: parserTs,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        project: ['./tsconfig.json'],
      },
      globals: {
        ...globals.node,
        ...globals.es2021,
      },
    },
    plugins: {
      '@typescript-eslint': pluginTs,
      prettier: pluginPrettier,
      'simple-import-sort': simpleImportSort,
      import: eslintPluginImport,
    },
    rules: {
      ...js.configs.recommended.rules,
      ...pluginTs.configs['recommended-type-checked'].rules,

      // Import organization
      'simple-import-sort/imports': 'warn',
      'simple-import-sort/exports': 'warn',
      
      // TODO: Gradually migrate to absolute imports
      // 'no-restricted-imports': [
      //   'error',
      //   {
      //     patterns: ['../*', './/*'],
      //   },
      // ],
      
      // 'import/no-unresolved': ['error'], // TODO: Enable after path mapping is configured
      'import/no-empty-named-blocks': ['warn'],

      // TypeScript rules (gradually stricter)
      '@typescript-eslint/consistent-type-definitions': ['error', 'type'],
      // '@typescript-eslint/strict-boolean-expressions': 'error',
      // '@typescript-eslint/no-unnecessary-type-assertion': 'error',
      // '@typescript-eslint/no-unnecessary-condition': 'error',
      // '@typescript-eslint/consistent-type-assertions': [
      //   'error',
      //   { assertionStyle: 'never' },
      // ],
      '@typescript-eslint/consistent-type-imports': [
        'error', 
        { prefer: 'type-imports', fixStyle: 'inline-type-imports' }
      ],

      // Prettier integration
      'prettier/prettier': [
        'error',
        {
          printWidth: 100,
          tabWidth: 2,
          useTabs: true,
          singleQuote: true,
          trailingComma: 'es5',
          arrowParens: 'avoid',
          semi: true,
          endOfLine: 'auto',
        },
      ],

      // Disable conflicting rules
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/no-throw-literal': 'off',
      '@typescript-eslint/prefer-readonly-parameter-types': 'off',
      'require-await': 'off',
      '@typescript-eslint/require-await': 'off',

      // Unused variables with ignore pattern
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          args: 'all',
          argsIgnorePattern: '^_',
          caughtErrors: 'all',
          caughtErrorsIgnorePattern: '^_',
          destructuredArrayIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          ignoreRestSiblings: true,
        }
      ],
    },
    settings: {
      'import/parsers': {
        [parserTs]: ['.ts', '.tsx', '.d.ts'],
      },
      'import/resolver': {
        typescript: {
          alwaysTryTypes: true,
          project: ['./tsconfig.json'],
        },
      },
    },
  },
  {
    files: ['.eslintrc.js', '.eslintrc.cjs', 'eslint.config.js'],
    languageOptions: {
      sourceType: 'script',
      globals: globals.node,
    },
  },
  {
    ignores: [
      'node_modules',
      'out',
      'dist',
      'build',
      'coverage',
      '*.vsix',
      '.vscode-test',
      'macroflows',
    ],
  },
]