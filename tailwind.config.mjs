/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'pm-bg':        'var(--pm-bg)',
        'pm-surface':   'var(--pm-surface)',
        'pm-elevated':  'var(--pm-elevated)',
        'pm-border':    'var(--pm-border)',
        'pm-gold':      'var(--pm-gold)',
        'pm-gold-light':'var(--pm-gold-light)',
        'pm-gold-dim':  'var(--pm-gold-dim)',
        'pm-text':      'var(--pm-text)',
        'pm-muted':     'var(--pm-muted)',
        'pm-dim':       'var(--pm-dim)',
      },
      boxShadow: {
        'premium':      'var(--shadow-premium)',
        'premium-gold': '0 0 0 2px rgba(201,168,76,0.4)',
      }
    },
  },
  plugins: [],
};
