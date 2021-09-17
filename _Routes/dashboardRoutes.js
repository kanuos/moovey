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
// description  :   Update active user's profile
// access       :   PRIVATE
// method       :   POST
dashboardRoutes.post("/my-profile/update", redirectToLogin, controller.dashboard__submitProfileUpdate)

// URL          :   /dashboard/my-profile/update-profile
// description  :   Update active user's profile picture
// access       :   PRIVATE
// method       :   POST
dashboardRoutes.post("/my-profile/update-picture", redirectToLogin, controller.dashboard__changeProfilePic)

// URL          :   /dashboard/my-profile/change-password
// description  :   Update active user's profile password
// access       :   PRIVATE
// method       :   POST
dashboardRoutes.post("/my-profile/change-password", redirectToLogin, controller.dashboard__changePassword)

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


// URL          :   /dashboard/my-lists/[id]/edit
// description  :   Show logged in user's list with [id] in edit mode
// access       :   PRIVATE
// method       :   GET
dashboardRoutes.get("/my-lists/:id/edit", redirectToLogin, controller.dashboard__getListEditPage)




// URL          :   /dashboard/my-lists/[id]/edit
// description  :   Show logged in user's list with [id] in edit mode
// access       :   PRIVATE
// method       :   POST
dashboardRoutes.post("/my-lists/:id/edit", redirectToLogin, controller.dashboard__submitListEditData)



// URL          :   /dashboard/my-lists/[id]/edit
// description  :   delete user's list/id
// access       :   PRIVATE
// method       :   POST
dashboardRoutes.post("/my-lists/:id/delete", redirectToLogin, controller.dashboard__deleteList)


// URL          :   /dashboard/my-lists/[id]/add-item
// description  :   add item to list with [id]
// access       :   PRIVATE
// method       :   GET
dashboardRoutes.get("/my-lists/:id/add-item", redirectToLogin, controller.dashboard__showSearchMovieForm)
dashboardRoutes.post("/my-lists/:id/add-item", redirectToLogin, controller.dashboard__addItemToList)


// URL          :   /dashboard/my-lists/[id]/remove-item
// description  :   remove item [imdbid] from list with [id]
// access       :   PRIVATE
// method       :   POST
dashboardRoutes.post("/my-lists/:id/remove-item", redirectToLogin, controller.dashboard__removeItemFromList)


// URL          :   /dashboard/my-lists/[id]/edit-item/[itemid]
// description  :   get the prefilled form to edit the list item description 
// Params       :   list id - id | item id - itemid
// access       :   PRIVATE
// method       :   GET
dashboardRoutes.get("/my-lists/:id/edit-item/:itemid", redirectToLogin, controller.dashboard__getEditListItemPage)

// URL          :   /dashboard/my-lists/[id]/edit-item/[itemid]
// description  :   submit the new description 
// Params       :   list id - id | item id - itemid
// access       :   PRIVATE
// method       :   GET
dashboardRoutes.post("/my-lists/:id/edit-item/:itemid", redirectToLogin, controller.dashboard__updateListItem)




module.exports = dashboardRoutes
