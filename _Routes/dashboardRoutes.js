const dashBoardRoutes = require('express').Router();
const {getMovieDetailFromAPI} = require("../_Controller/blogController")

dashBoardRoutes.get('/', (req, res) => res.render("pages/dashboard/profile", {title: "hello"}))

dashBoardRoutes.get('/profile', (req, res) => res.render("pages/dashboard/profile", {title: "hello"}))

dashBoardRoutes.post("/updateMovie", (req, res) => getMovieDetailFromAPI(req,res))

dashBoardRoutes.use("/list", require('../_Routes/listRoutes'))

module.exports = dashBoardRoutes;