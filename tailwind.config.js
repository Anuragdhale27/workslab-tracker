export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: { sans: ['Space Grotesk', 'system-ui', 'sans-serif'] },
      colors: {
        ink: '#000000', paper: '#ffffff', 'paper-2': '#f6f6f4',
        accent: '#ff3d00', ok: '#0a8a3a', bad: '#d61f1f'
      },
      borderRadius: { DEFAULT: '2px' }
    }
  },
  plugins: []
}
