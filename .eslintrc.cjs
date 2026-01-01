module.exports = {
  root: true,
  env: {
    node: true, // Cambio principal: node en lugar de browser
    es2022: true, // ES2022 para Node moderno
  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:@typescript-eslint/recommended-requiring-type-checking', // Reglas más estrictas
    'prettier', // Debe estar al final
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    project: './tsconfig.json', // Importante para reglas avanzadas
  },
  plugins: ['@typescript-eslint'],
  ignorePatterns: [
    'dist',
    'build',
    'node_modules',
    'coverage',
    '.eslintrc.cjs',
    '*.config.js',
  ],
  rules: {
    // TypeScript
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-unused-vars': [
      'error',
      {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
      },
    ],
    '@typescript-eslint/no-non-null-assertion': 'warn',
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-unsafe-assignment': 'off',
    '@typescript-eslint/no-unsafe-member-access': 'off',
    '@typescript-eslint/no-unsafe-call': 'off',
    '@typescript-eslint/no-unsafe-return': 'off',
    '@typescript-eslint/no-unsafe-argument': 'off',

    // General
    'no-console': 'off', // ✅ En Node.js console.log es normal
    'no-process-exit': 'error',
    'prefer-const': 'error',
  },
};
