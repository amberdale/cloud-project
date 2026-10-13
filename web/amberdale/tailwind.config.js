/** Amberdale tokens, taken from the brand guide (Edition 2, October 2026). */
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    borderRadius: { none: '0', sm: '4px', DEFAULT: '6px', md: '8px', lg: '12px', full: '9999px' },
    extend: {
      colors: {
        bone: '#F8F5EA',
        paper: '#FDFCF7',
        ribbon: '#1F1E1B',
        graphite: '#66625A',
        loden: { DEFAULT: '#3D5A4B', deep: '#2F4639' },
        sage: '#DFE7DC',
        cognac: '#97592B',
        rule: 'rgba(31, 30, 27, 0.12)',
        'rule-strong': 'rgba(31, 30, 27, 0.28)',
      },
      fontFamily: {
        serif: ['"EB Garamond"', 'Garamond', 'Georgia', 'serif'],
        mono: ['"DM Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
        display: ['"Romano Revival"', '"Bodoni Moda"', 'Didot', 'serif'],
        fraunces: ['Fraunces', 'Georgia', 'serif'],
        grotesk: ['"Instrument Sans"', 'system-ui', 'sans-serif'],
      },
      letterSpacing: {
        label: '0.14em',
        mark: '0.32em',
        tightest: '-0.035em',
      },
      fontSize: {
        label: ['11px', { lineHeight: '16px' }],
        ui: ['13px', { lineHeight: '20px' }],
      },
    },
  },
  plugins: [],
};
