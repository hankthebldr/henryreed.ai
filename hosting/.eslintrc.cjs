// ESLint legacy config - keeping for reference during migration
// TODO: Convert to flat config (eslint.config.js) when time permits
// For now, using this with --config flag to maintain compatibility

module.exports = {
  root: true,
  env: {
    browser: true,
    es2020: true,
    node: true,
  },
  extends: [
    'next/core-web-vitals', // This includes basic TypeScript support
  ],
  plugins: [],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
  },
  rules: {
    // Core rules to maintain (basic ESLint rules)
    'no-console': 'warn',
    'no-debugger': 'error',
    'no-duplicate-imports': 'error',
    'prefer-const': 'warn',
    
    // React/Next.js specific (handled by next/core-web-vitals)
    'react/no-unescaped-entities': 'off', // Next.js handles this
    'react/react-in-jsx-scope': 'off', // Not needed with Next.js
  },
  overrides: [
    {
      files: ['**/*.test.ts', '**/*.test.tsx', '**/*.spec.ts', '**/*.spec.tsx'],
      env: {
        jest: true,
      },
      rules: {
        'no-console': 'off', // Allow console in tests
      },
    },
  ],
  ignorePatterns: [
    '.next',
    'out',
    'node_modules',
    'dist',
    'build',
    '*.config.js',
    '*.config.ts',
  ],
};
