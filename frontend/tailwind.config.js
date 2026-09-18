/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          50: '#F0F4FA',
          100: '#D9E3F5',
          600: '#153A7B',
          800: '#0F2962',
          900: '#0B1F46',
          950: '#061129',
        },
        emerald: {
          50: '#F0FDF4',
          100: '#DCFCE7',
          500: '#10B981',
          600: '#059669',
          700: '#006B38',
          800: '#0B6E38',
          900: '#064E29',
        },
      },
      boxShadow: {
        'card': '0 4px 20px -2px rgba(15, 41, 98, 0.08)',
        'elevated': '0 12px 32px -4px rgba(15, 41, 98, 0.12)',
      },
    },
  },
  plugins: [],
};
