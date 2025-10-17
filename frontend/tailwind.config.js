module.exports = {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        'flyquest-neon': '#00FF85',
        'flyquest-green': '#00D66B',
        'flyquest-green-dark': '#00A855',
        'flyquest-black': '#0A0E12',
        'flyquest-dark': '#151922',
        'flyquest-darker': '#0D1117',
        'flyquest-gray': '#B0BAC5',
        'flyquest-gray-dark': '#6B7280',
        'flyquest-white': '#F5F5F5',
        'flyquest-blue': '#1A2E46',
        'flyquest-blue-light': '#2E4A6B'
      },
      fontFamily: {
        inter: ['Inter', 'sans-serif']
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'slide-in': 'slideIn 0.5s ease-out',
        'fade-in': 'fadeIn 0.6s ease-out',
        'bounce-slow': 'bounce 3s infinite'
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(0, 255, 133, 0.5), 0 0 10px rgba(0, 255, 133, 0.3)' },
          '100%': { boxShadow: '0 0 20px rgba(0, 255, 133, 0.8), 0 0 30px rgba(0, 255, 133, 0.4)' }
        },
        slideIn: {
          '0%': { transform: 'translateY(-20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' }
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' }
        }
      }
    }
  },
  plugins: []
}
