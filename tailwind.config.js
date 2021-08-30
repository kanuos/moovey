// purge: {
//   enabled : true,
//   content: ['View/pages/*.ejs', 'View/partials/*.ejs']
// },

module.exports = {
  purge: [],
  darkMode: false, // or 'media' or 'class'
  theme: {
    fontFamily : {
      "special" : ['Quicksand'],
      "regular" : ['Poppins']
    },
    extend: {},
  },
  variants: {
    extend: {
      display: ["group-hover","group-focus"],
      translate : ["group-hover"],
      scale : ["group-hover"],
      brightness : ["group-hover"],
    },
  },
  plugins: [
    require("@tailwindcss/aspect-ratio")
  ],
}
