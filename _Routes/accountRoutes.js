const accoutRoutes = require('express').Router();
const {
    reviewerList,
    renderDisplayRoute, 
    submitLoginForm, 
    submitRegisterForm, 
    handleLogOut, 
    showMyProfile,
    showEditProfilePage,
    submitEditProfile
    } = require("../_Controller/accountController")

const {redirectToLogin, preventLoginRoute} = require("../sessionMiddleware")
/**
 * ROUTES = /, /login, /register, /logout, /profile
 */

// LANDING ROUTES
// URL      :   /login
// ACCESS   :   PUBLIC
// METHODS  :   [GET]

 accoutRoutes.get("/", preventLoginRoute, renderDisplayRoute)
 
 
 // LOGIN ROUTES
 // URL      :   /login
 // ACCESS   :   PUBLIC
 // METHODS  :   [POST, GET]
 
 accoutRoutes.post("/login", preventLoginRoute, submitLoginForm)
 
 
 // REGISTER ROUTES
 // URL      :   /register
 // ACCESS   :   PUBLIC
 // METHODS  :   [POST, GET]
 
 accoutRoutes.post("/register", preventLoginRoute, submitRegisterForm)


 // LOGOUT ROUTES
// URL      :   /logout
// ACCESS   :   PRIVATE
// METHODS  :   [POST]

accoutRoutes.get("/logout", redirectToLogin, handleLogOut)


 // USERS LIST ROUTES
// URL      :   /reviewers
// ACCESS   :   PUBLIC
// METHODS  :   [GET]

accoutRoutes.get("/reviewers", reviewerList)

accoutRoutes.get("/dashboard", redirectToLogin, showMyProfile)

accoutRoutes.get("/edit-profile", redirectToLogin, showEditProfilePage)

accoutRoutes.post("/edit-profile", redirectToLogin, submitEditProfile)






module.exports = accoutRoutes;