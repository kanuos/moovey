const dashBoardRoutes = require('express').Router();

dashBoardRoutes.get('/', (req, res) => res.render("pages/dashboard/home", {title: "hello"}))

dashBoardRoutes.get('/profile', (req, res) => res.render("pages/dashboard/profile", {title: "hello"}))

dashBoardRoutes.use("/list", require('../_Routes/listRoutes'))

module.exports = dashBoardRoutes;