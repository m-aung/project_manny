module.exports = {
  mode:'jit',
  content: ["./frontend/**/*.{html,js}"],
  theme: {
    extend: {
      fontFamily: {
        'sans-serif': ['Poppins', 'sans-serif'],
      },
    },
    screen: {
      'se' : '375px',
      // => @media (min-width: 375px) { ... }
    },
  },
  plugins: [],
}
