const openProps = require('open-props');
const postcssJitProps = require('postcss-jit-props');
const autoprefixer = require('autoprefixer');
const tailwindcss = require('tailwindcss');


module.exports = {
  plugins: [
    postcssJitProps(openProps),
    tailwindcss,
    autoprefixer,
  ],
}
