// @ts-check
import withNuxt from './.nuxt/eslint.config.mjs';

export default withNuxt(
  {
    rules: {
      // Disable problematic rules for Nuxt development
      'vue/multi-word-component-names': 'off',
      'vue/custom-event-name-casing': 'off', // Allow kebab-case events
      'no-alert': 'warn', // Allow alerts for now
      'node/prefer-global/process': 'off', // Allow process.env
      
      // Make TypeScript rules more lenient for development
      '@typescript-eslint/no-explicit-any': 'warn', // Allow 'any' but warn
      '@typescript-eslint/unified-signatures': 'off', // Allow multiple overloads
      '@typescript-eslint/no-dynamic-delete': 'off', // Allow dynamic delete
      '@typescript-eslint/no-invalid-void-type': 'off', // Allow void in types
      
      // Vue rules - more lenient
      'vue/require-default-prop': 'off', // Don't require default props
      'vue/require-prop-types': 'off', // Don't require prop types
      
      // Vue component order
      'vue/block-order': [
        'error',
        {
          order: ['template', 'script', 'style'],
        },
      ],
      
      // Unused variables - warn only
      '@typescript-eslint/no-unused-vars': ['warn', { 
        args: 'all', 
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
        ignoreRestSiblings: true
      }],
    },
  },
);
