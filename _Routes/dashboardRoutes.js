const {Router} = require("express");
const dashboardRoutes = Router();

const controller = require("../_Controller/dashboardController");
const {redirectToLogin} = require("../sessionMiddleware")

// URL          :   /dashboard and /dashboard/my-profile
// description  :   Show logged in user's profile page
// access       :   PRIVATE
// method       :   GET
dashboardRoutes.get("/", redirectToLogin, controller.dashboard__getMyProfile)
dashboardRoutes.get("/my-profile", redirectToLogin, controller.dashboard__getMyProfile)


// URL          :   /dashboard/my-profile/update
// description  :   Show logged in user's profile page
// access       :   PRIVATE
// method       :   POST
dashboardRoutes.post("/my-profile/update", redirectToLogin, controller.dashboard__submitProfileUpdate)

// URL          :   /dashboard/my-profile/update-profile
// description  :   Show logged in user's profile page
// access       :   PRIVATE
// method       :   POST
dashboardRoutes.post("/my-profile/update-picture", redirectToLogin, controller.dashboard__changeProfilePic)


// URL          :   /dashboard/my-articles
// description  :   Show logged in user's articles in table format
// access       :   PRIVATE
// method       :   GET
dashboardRoutes.get("/my-articles", redirectToLogin, controller.dashboard__getAllArticles)


// URL          :   /dashboard/my-articles/new
// description  :   Add new review by logged in user
// access       :   PRIVATE
// method       :   POST
dashboardRoutes.post("/my-articles/new", redirectToLogin, controller.dashboard__getArticleByID_CU)



// URL          :   /dashboard/my-articles/id/edit
// description  :   Edit existing review by logged in user
// access       :   PRIVATE
// method       :   POST
dashboardRoutes.post("/my-articles/:id/edit", redirectToLogin, controller.dashboard__getArticleByID_CU)



// URL          :   /dashboard/my-articles/[ID]
// description  :   Get review by ID created by logged in user
// access       :   PRIVATE
// method       :   GET
dashboardRoutes.get("/my-articles/:id", redirectToLogin, controller.dashboard__getArticleByID_RD)




// LIST BASED ROUTES

// URL          :   /dashboard/my-lists
// description  :   Show logged in user's lists in table format
// access       :   PRIVATE
// method       :   GET
dashboardRoutes.get("/my-lists", redirectToLogin, controller.dashboard__getAllLists)


// URL          :   /dashboard/my-lists/new
// description  :   Show logged in user's create list page
// access       :   PRIVATE
// method       :   GET
dashboardRoutes.get("/my-lists/new", redirectToLogin, controller.dashboard__getCreateListPage)


// URL          :   /dashboard/my-lists/new
// description  :   Submit logged in user's create list data
// access       :   PRIVATE
// method       :   POST
dashboardRoutes.post("/my-lists/new", redirectToLogin, controller.dashboard__submitNewListData)



// URL          :   /dashboard/my-lists/[id]
// description  :   Show logged in user's list with [id]
// access       :   PRIVATE
// method       :   GET
dashboardRoutes.get("/my-lists/:id", redirectToLogin, controller.dashboard__getListByID)






module.exports = dashboardRoutes
