const accoutRoutes = require('express').Router();
const {reviewerList, submitLoginForm, submitRegisterForm, handleLogOut} = require("../_Controller/accountController")

const {redirectToLogin, preventLoginRoute} = require("../sessionMiddleware")
/**
 * ROUTES = /, /login, /register, /logout, /profile
 */

// LANDING ROUTES
// URL      :   /login
// ACCESS   :   PUBLIC
// METHODS  :   [GET]

 accoutRoutes.get("/", (req, res) => res.render("pages/landing", {title: "Welcome to your personal movie blog"}))
 
 
 // LOGIN ROUTES
 // URL      :   /login
 // ACCESS   :   PUBLIC
 // METHODS  :   [POST, GET]
 
 accoutRoutes.get("/login", preventLoginRoute, (req, res) => res.render("pages/landing", {title: "Login"}))
 accoutRoutes.post("/login", preventLoginRoute, (req, res) => submitLoginForm(req, res))
 
 
 // REGISTER ROUTES
 // URL      :   /register
 // ACCESS   :   PUBLIC
 // METHODS  :   [POST, GET]
 
 accoutRoutes.get("/register", preventLoginRoute, (req, res) => res.render("pages/landing", {title: "Register"}))
 accoutRoutes.post("/register", preventLoginRoute, (req, res) => submitRegisterForm(req, res))


 // LOGOUT ROUTES
// URL      :   /logout
// ACCESS   :   PRIVATE
// METHODS  :   [POST]

accoutRoutes.get("/logout", redirectToLogin, (req, res) => handleLogOut(req, res))


 // USERS LIST ROUTES
// URL      :   /reviewers
// ACCESS   :   PUBLIC
// METHODS  :   [GET]

accoutRoutes.get("/reviewers", (req, res) => reviewerList(req, res))






module.exports = accoutRoutes;