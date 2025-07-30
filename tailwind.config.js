/** @type {import('tailwindcss').Config} */
export default {
  content: [],
  theme: {
    extend: {
      container: {
        center: true,
        padding: '1rem',
        screens: {
          'sm': '640px',
          'md': '768px',
          'lg': '1024px',
          'xl': '1140px',
          '2xl': '1140px',
        },
      },
    },
  },
  plugins: [
    // Add scrollbar plugin or we can use CSS
    function({ addUtilities }) {
      addUtilities({
        '.scrollbar-thin': {
          'scrollbar-width': 'thin',
        },
        '.scrollbar-thumb-gray-300': {
          '--scrollbar-thumb': '#d1d5db',
        },
        '.scrollbar-track-gray-100': {
          '--scrollbar-track': '#f3f4f6',
        },
        '.scrollbar-thin::-webkit-scrollbar': {
          width: '6px',
        },
        '.scrollbar-thin::-webkit-scrollbar-track': {
          background: '#f3f4f6',
          'border-radius': '3px',
        },
        '.scrollbar-thin::-webkit-scrollbar-thumb': {
          background: '#d1d5db',
          'border-radius': '3px',
        },
        '.scrollbar-thin::-webkit-scrollbar-thumb:hover': {
          background: '#9ca3af',
        },
      });
    },
  ],
};
