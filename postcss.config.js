// module.exports ={
//   plugins: ['postcss-preset-env',require('tailwindcss'), require('autoprefixer')]
// }

const cssnano = require("cssnano");
module.exports = {
  plugins: [
    require("tailwindcss"),
    cssnano({
      preset: "default",
    }),
    require("autoprefixer"),
  ],
};