/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        /* ── Cream / Pearl primary palette ── */
        primary: {
          50:  '#FDFAF5',   /* near-white cream       */
          100: '#F5EDD8',   /* light cream             */
          200: '#E8D5B0',   /* medium cream            */
          300: '#D4B483',   /* caramel tan             */
          400: '#C49A55',   /* warm gold               */
          500: '#A87C3A',   /* gold-brown              */
          600: '#8B6228',   /* medium brown            */
          700: '#6B4A1C',   /* dark brown              */
          800: '#4A3213',   /* deep brown              */
          900: '#2D1E0A',   /* near-black brown        */
        },
        /* ── Sidebar / brand tones ── */
        sidebar: {
          dark:   '#2C1A0E',
          mid:    '#3D2B1A',
          light:  '#4A3525',
          border: '#5C4535',
        },
        dairy: {
          cream:  '#F5EDD8',
          gold:   '#C49A55',
          brown:  '#8B6228',
          red:    '#dc2626',
          blue:   '#1d4ed8',
        }
      }
    }
  },
  plugins: [],
};
