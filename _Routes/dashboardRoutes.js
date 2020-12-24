const dashBoardRoutes = require('express').Router();

dashBoardRoutes.get('/', (req, res) => res.render("pages/dashboard/home", {title: "hello"}))

dashBoardRoutes.get('/profile', (req, res) => res.render("pages/dashboard/profile", {title: "hello"}))


module.exports = dashBoardRoutes;