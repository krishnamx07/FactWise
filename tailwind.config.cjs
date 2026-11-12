module.exports = {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: 'hsl(200, 70%, 45%)', // tealish
        secondary: 'hsl(210, 15%, 30%)', // dark gray
        accent: 'hsl(340, 70%, 55%)', // vibrant accent for alerts
        success: 'hsl(120, 50%, 40%)',
        warning: 'hsl(40, 80%, 50%)',
        danger: 'hsl(0, 70%, 45%)',
      },
    },
  },
  plugins: [],
};
