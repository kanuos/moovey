const blogRoute = require("express").Router();
// session middleware
const {redirectToLogin} = require("../sessionMiddleware");

// controller methods
const {getBlogCreateForm, searchMovie} = require("../_Controller/blogController")


blogRoute.get("/", redirectToLogin, searchMovie)

blogRoute.post("/",redirectToLogin,  (req, res) => {
    // return res.render("pages/landing", {title: "Your personal movie universe"})
    return res.json({msg: "write new blog", req})
})

blogRoute.get("/new-review", redirectToLogin, getBlogCreateForm)


blogRoute.post("/search", redirectToLogin, searchMovie)


blogRoute.get("/user/:id",  (req, res) => {
    // return res.render("pages/landing", {title: "Your personal movie universe"})
    return res.json("show all blogs by user " + req.params.id)
})

blogRoute.get("/:id",  (req, res) => {
    // return res.render("pages/landing", {title: "Your personal movie universe"})
    return res.json("show blog " + req.params.id)
})

// blogRoute.get("/dashboard", redirectToLogin, (req, res) => getUserDashboard(req, res))


module.exports = blogRoute;