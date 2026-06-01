/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        'romantic-dark': {
          DEFAULT: '#1a0810',
          light: '#0f0f0f',
        },
        'romantic-pink': '#ff69b4',
        'romantic-coral': '#ff6b6b',
        'romantic-text': '#e0e0e0',
        'romantic-text-light': '#fdf0f4',
        'jesse-blue': '#4da8da',
        'spotify-green': '#1DB954',
        'youtube-red': '#ff0000',
      },
      fontFamily: {
        'romantic': ['"Brush Script MT"', '"Lucida Handwriting"', 'cursive'],
        'serif': ['Georgia', 'serif'],
      },
      animation: {
        'heartbeat': 'heartbeat 2s infinite',
        'pulse-glow': 'pulse-glow 3s infinite alternate',
        'shake': 'shake 1.5s infinite',
      },
      keyframes: {
        heartbeat: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.05)' },
        },
        'pulse-glow': {
          '0%': { textShadow: '0 0 10px rgba(255, 105, 180, 0.2)' },
          '100%': { textShadow: '0 0 20px rgba(255, 105, 180, 0.6), 0 0 30px rgba(255, 105, 180, 0.3)' },
        },
        shake: {
          '0%, 100%': { transform: 'rotate(0deg)' },
          '25%': { transform: 'rotate(-2deg)' },
          '50%': { transform: 'rotate(2deg)' },
          '75%': { transform: 'rotate(-1deg)' },
        },
      },
    },
  },
  plugins: [],
}
