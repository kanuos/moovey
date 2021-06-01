
module.exports = {
  // purge: [],
  purge: {
    enabled : true,
    content: ['View/pages/*.ejs', 'View/partials/*.ejs']
  },
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {
      fontFamily : {
        'title' : ['Quicksand'],
        'regular' : ['Poppins'],
      },
      height : {
        "half-vh" : "50vh",
        "65vh" : "65vh"
      }
    },
  },
  variants: {
    extend: {
      scale : ["group-hover"],
      translate : ["group-hover"],
    },
  },
  plugins: [],
}
