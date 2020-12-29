const blogRoute = require("express").Router();
// session middleware
const {redirectToLogin} = require("../sessionMiddleware");

// controller methods
const {getUserDashboard, getBlogCreateForm, searchMovie} = require("../_Controller/blogController")


blogRoute.get("/",  (req, res) => {
    // return res.render("pages/landing", {title: "Your personal movie universe"})
    return res.json("show all blogs")
})

blogRoute.post("/",  (req, res) => {
    // return res.render("pages/landing", {title: "Your personal movie universe"})
    return res.json("write new blog")
})

blogRoute.get("/new",  (req, res) => getBlogCreateForm(req, res))


blogRoute.get("/user/:id",  (req, res) => {
    // return res.render("pages/landing", {title: "Your personal movie universe"})
    return res.json("show all blogs by user " + req.params.id)
})

blogRoute.get("/:id",  (req, res) => {
    // return res.render("pages/landing", {title: "Your personal movie universe"})
    return res.json("show blog " + req.params.id)
})

// blogRoute.get("/dashboard", redirectToLogin, (req, res) => getUserDashboard(req, res))

blogRoute.post("/search", (req, res) => searchMovie(req, res))


module.exports = blogRoute;