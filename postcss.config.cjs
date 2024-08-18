const openProps = require('open-props');
const postcssJitProps = require('postcss-jit-props');
const autoprefixer = require('autoprefixer');
const tailwindcss = require('tailwindcss');
const postcssNesting = require('postcss-nesting');

module.exports = {
  plugins: [
    postcssNesting,
    postcssJitProps(openProps),
    tailwindcss,
    autoprefixer,
  ],
}
