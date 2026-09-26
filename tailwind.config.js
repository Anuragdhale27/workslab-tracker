// Colors come from CSS variables (see src/index.css) so themes switch at runtime.
const v = (n) => `rgb(var(${n}) / <alpha-value>)`
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: { sans: ['Space Grotesk', 'system-ui', 'sans-serif'], display: ['var(--font-display)', 'Space Grotesk', 'sans-serif'] },
      colors: {
        ink: v('--c-ink'), paper: v('--c-paper'), 'paper-2': v('--c-paper2'),
        accent: v('--c-accent'), 'accent-ink': v('--c-accent-ink'),
        muted: v('--c-muted'), line: v('--c-line'),
        ok: v('--c-ok'), bad: v('--c-bad')
      },
      borderRadius: { DEFAULT: 'var(--radius)' }
    }
  },
  plugins: []
}
