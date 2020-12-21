const blogRoute = require("express").Router();
// session middleware
const {redirectToLogin} = require("../sessionMiddleware");

// controller methods
const {getUserDashboard, movieSearch} = require("../_Controller/blogController")


blogRoute.get("/",  (req, res) => {
    return res.json("all blogs")
})

blogRoute.get("/dashboard", redirectToLogin, (req, res) => getUserDashboard(req, res))

blogRoute.get("/search", redirectToLogin, (req, res) => movieSearch(req, res))

blogRoute.post("/search", redirectToLogin, (req, res) => movieSearch(req, res))


module.exports = blogRoute;