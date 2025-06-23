/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      keyframes: {
        // Defines a custom keyframe animation named 'centered-pulse'
        // This makes the element scale from its center and fade out
        'centered-pulse': {
          '0%': {
            transform: 'translate(-50%, -50%) scale(0.7)', // Start smaller, perfectly centered
            opacity: 0.7, // Start with some opacity
          },
          '50%': {
            opacity: 0.3, // Fade out slightly in the middle
          },
          '100%': {
            transform: 'translate(-50%, -50%) scale(1.3)', // Expand to a larger size, still centered
            opacity: 0, // Fully fade out
          },
        },
      },
      animation: {
        // Maps the keyframe animation to a utility class `animate-centered-pulse`
        // Runs for 1.5 seconds, eases out, and repeats infinitely
        'centered-pulse': 'centered-pulse 1.5s ease-out infinite',
      },
    },
  },
  plugins: [],
};