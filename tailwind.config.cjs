/** @type {import('tailwindcss').Config} */

const twitchColors = [
  "blue",
  "coral",
  "dodgerblue",
  "springgreen",
  "yellowgreen",
  "green",
  "orangered",
  "red",
  "goldenrod",
  "hotpink",
  "cadetblue",
  "seagreen",
  "chocolate",
  "blueviolet",
  "firebrick",
];

const actualColors = [
  "rgb(0, 255, 127)",
  "rgb(154, 205, 50)",
  "rgb(49, 154, 36)",
  "rgb(180, 84, 255)",
  "rgb(165, 107, 166)",
  "rgb(124, 124, 225)",
  "rgb(139, 88, 255)",
  "rgb(95, 158, 160)",
  "rgb(79, 248, 255)",
  "rgb(85, 231, 250)",
  "rgb(30, 144, 255)",
  "rgb(122, 122, 122)",
  "rgb(124, 124, 124)",
  "rgb(218, 165, 32)",
  "rgb(226, 163, 102)",
  "rgb(255, 241, 71)",
  "rgb(220, 217, 0)",
  "rgb(220, 222, 148)",
  "rgb(252, 242, 204)",
  "rgb(231, 209, 255)",
  "rgb(242, 181, 241)",
  "rgb(255, 105, 180)",
  "rgb(255, 0, 0)",
  "rgb(219, 74, 63)",
  "rgb(255, 127, 80)",
];

/**
 * @type {import('tailwindcss').Config}
 */
module.exports = {
  content: [
    './entrypoints/**/*.{html,vue,js,ts,jsx,tsx}',
    './components/**/*.{html,vue,js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {},
  },
  corePlugins: {
    preflight: false
  },
  plugins: [
    'prettier-plugin-tailwindcss',
    // require('@tailwindcss/typography'),
    // require('@tailwindcss/forms'),
    // require('daisyui'),
  ],
}
