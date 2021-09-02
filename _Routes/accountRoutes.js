const accountRoutes = require('express').Router();
const {
    reviewerProfile,
    reviewerList,
    showLandingPage, 
    showLoginPage,
    showRegisterPage,
    submitLoginForm, 
    submitRegisterForm, 
    handleLogOut, 
    forgotPasswordPage,
    resetPassword,
    updatePassword
    } = require("../_Controller/accountController");
    
const {redirectToLogin, preventLoginRoute} = require("../sessionMiddleware")
/**
 * ROUTES = /, /login, /register, /logout, /profile
 */

// LANDING ROUTES
// URL      :   /login
// ACCESS   :   PUBLIC
// METHODS  :   [GET]

 accountRoutes.get("/", preventLoginRoute, showLandingPage)
 accountRoutes.get("/login", preventLoginRoute, showLoginPage)
 accountRoutes.get("/register", preventLoginRoute, showRegisterPage)
 
 
 // LOGIN ROUTES
 // URL      :   /login
 // ACCESS   :   PUBLIC
 // METHODS  :   [POST, GET]
 
 accountRoutes.post("/login", preventLoginRoute, submitLoginForm)
 
 
 // REGISTER ROUTES
 // URL      :   /register
 // ACCESS   :   PUBLIC
 // METHODS  :   [POST, GET]
 
 accountRoutes.post("/register", preventLoginRoute, submitRegisterForm)


 // LOGOUT ROUTES
// URL      :   /logout
// ACCESS   :   PRIVATE
// METHODS  :   [POST]

accountRoutes.get("/logout", redirectToLogin, handleLogOut)

// FORGOT PASSWORD ROUTES
// URL      :   /forgot-password
// ACCESS   :   PUBLIC
// METHODS  :   [GET]

accountRoutes.get("/forgot-password", preventLoginRoute, forgotPasswordPage)
accountRoutes.post("/forgot-password", preventLoginRoute, resetPassword)
accountRoutes.post("/reset-password", preventLoginRoute, updatePassword)


 // USERS LIST ROUTES
// URL      :   /reviewers
// ACCESS   :   PUBLIC
// METHODS  :   [GET]

accountRoutes.get("/reviewers", reviewerList)

accountRoutes.get("/reviewers/:id", reviewerProfile)


module.exports = accountRoutes;