/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        campus: {
          blue: '#3B82F6',
          purple: '#8B5CF6',
          orange: '#F97316',
          green: '#10B981',
          pink: '#EC4899',
          cyan: '#06B6D4',
        },
      },
      borderRadius: {
        xl2: '1.25rem',
      },
      backgroundImage: {
        'grad-blue': 'linear-gradient(135deg, #3B82F6, #06B6D4)',
        'grad-purple': 'linear-gradient(135deg, #8B5CF6, #EC4899)',
        'grad-orange': 'linear-gradient(135deg, #F97316, #F59E0B)',
        'grad-green': 'linear-gradient(135deg, #10B981, #06B6D4)',
      },
    },
  },
  plugins: [],
}