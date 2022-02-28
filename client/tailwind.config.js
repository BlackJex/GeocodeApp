module.exports = {
  purge: ['./public/**/*.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {
      maxHeight:
      {
        32: '8rem'
      },
      minWidth:
      {
        4: '1rem'
      }
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
}
