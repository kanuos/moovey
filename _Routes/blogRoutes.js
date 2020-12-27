const blogRoute = require("express").Router();
// session middleware
const {redirectToLogin} = require("../sessionMiddleware");

// controller methods
const {getUserDashboard, movieSearch} = require("../_Controller/blogController")


blogRoute.get("/",  (req, res) => {
    // return res.render("pages/landing", {title: "Your personal movie universe"})
    return res.json("show all blogs")
})

blogRoute.post("/",  (req, res) => {
    // return res.render("pages/landing", {title: "Your personal movie universe"})
    return res.json("write new blog")
})

blogRoute.get("/new",  (req, res) => {
    // return res.render("pages/landing", {title: "Your personal movie universe"})
    return res.render("pages/newReview", {title: ""});
})

blogRoute.get("/user/:id",  (req, res) => {
    // return res.render("pages/landing", {title: "Your personal movie universe"})
    return res.json("show all blogs by user " + req.params.id)
})

blogRoute.get("/:id",  (req, res) => {
    // return res.render("pages/landing", {title: "Your personal movie universe"})
    return res.json("show blog " + req.params.id)
})

// blogRoute.get("/dashboard", redirectToLogin, (req, res) => getUserDashboard(req, res))

blogRoute.post("/search", (req, res) => res.json("search movie"))


module.exports = blogRoute;