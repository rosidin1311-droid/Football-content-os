/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        pitch: '#0A3D1F',
        'pitch-mid': '#0F5C2E',
        grass: '#1A7A3E',
        lime: '#7FFF00',
        gold: '#FFD700',
        'red-card': '#E8001E',
        dark: '#060E08',
        panel: '#0D2416',
      },
      fontFamily: {
        display: ['var(--font-barlow)', 'sans-serif'],
        body: ['var(--font-inter)', 'sans-serif'],
        mono: ['var(--font-jetbrains)', 'monospace'],
      },
    },
  },
  plugins: [],
};
