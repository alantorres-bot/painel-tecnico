/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['Fraunces', 'Georgia', 'serif'],
        sans: ['DM Sans', 'system-ui', 'sans-serif'],
        mono: ['DM Mono', 'monospace'],
      },
      colors: {
        ink: {
          DEFAULT: '#0F1714',
          mid: '#3A4A45',
          light: '#6B7F79',
          faint: '#A8B8B3',
        },
        surface: '#F7F9F8',
        card: '#FFFFFF',
        border: {
          DEFAULT: '#E2ECEA',
          md: '#C8D9D5',
        },
        field: '#EEF4F2',
        accent: {
          DEFAULT: '#1B6B4A',
          md: '#2A9068',
          lt: '#D6EFE6',
        },
        amber: {
          DEFAULT: '#C07A1A',
          lt: '#FBF0DC',
        },
        danger: {
          DEFAULT: '#B83232',
          lt: '#FAEAEA',
        },
      },
    },
  },
  plugins: [],
}
