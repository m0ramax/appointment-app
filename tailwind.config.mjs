/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'pm-bg': '#0f0f0f',
        'pm-surface': '#1a1a1a',
        'pm-elevated': '#222222',
        'pm-border': '#2a2a2a',
        'pm-gold': '#C9A84C',
        'pm-gold-light': '#D4B96A',
        'pm-gold-dim': 'rgba(201,168,76,0.12)',
        'pm-text': '#F0F0F0',
        'pm-muted': '#9A9A9A',
        'pm-dim': '#666666',
      },
      boxShadow: {
        'premium': '0 4px 24px rgba(0,0,0,0.5)',
        'premium-gold': '0 0 0 2px rgba(201,168,76,0.4)',
      }
    },
  },
  plugins: [],
};
