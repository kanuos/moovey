const blogRoute = require("express").Router();
const {redirectToLogin} = require("../sessionMiddleware");

blogRoute.get("/",  (req, res) => {
    return res.json("all blogs")
})

blogRoute.get("/secret", redirectToLogin, (req, res) => {
    return res.json("pvt route")
})


module.exports = blogRoute;