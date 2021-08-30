const {Router} = require("express");
const dashboardRoutes = Router();

const controller = require("../_Controller/dashboardController");

dashboardRoutes.get("/", controller.dashboard__getAllArticles)


dashboardRoutes.get("/articles/new", controller.dashboard__getArticleByID_CU)
dashboardRoutes.get("/articles/:id/edit", controller.dashboard__getArticleByID_CU)

dashboardRoutes.get("/search", controller.dashboard__getMovieSearchPage)

dashboardRoutes.get("/:id", controller.dashboard__getArticleByID_RD)




module.exports = dashboardRoutes
