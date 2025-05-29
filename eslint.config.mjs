// @ts-check
import withNuxt from './.nuxt/eslint.config.mjs';
import eslintConfigPrettier from 'eslint-config-prettier';

export default withNuxt(
  [
    {
      rules: {
        'prefer-const': 'error',
        // Remove prettier/prettier rule to avoid conflicts
        // Let Prettier handle formatting separately
      },
    },
    // Add ignores for common files that don't need linting
    {
      ignores: ['dist/**', '.nuxt/**', '.output/**', 'node_modules/**'],
    },
  ],
  eslintConfigPrettier
);
