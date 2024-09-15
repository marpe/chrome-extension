const openProps = require("open-props");
const postcssJitProps = require("postcss-jit-props");
const autoprefixer = require("autoprefixer");
const tailwindcss = require("tailwindcss");
const postcssNesting = require("postcss-nesting");
const atImport = require("postcss-import");

module.exports = {
	plugins: [
		atImport,
		postcssNesting,
		postcssJitProps(openProps),
		tailwindcss,
		autoprefixer,
	],
};
