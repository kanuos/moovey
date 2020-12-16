const accoutRoutes = require('express').Router();
const {generateLoginForm, generateRegisterForm, submitLoginForm, submitRegisterForm, handleLogOut} = require("../_Controller/accountController")

const {redirectToLogin, preventLoginRoute} = require("../sessionMiddleware")
/**
 * ROUTES = /login, /register, /logout, /profile
 */

// LOGIN ROUTES
// URL      :   /login
// ACCESS   :   PUBLIC
// METHODS  :   [POST, GET]

 accoutRoutes.get("/login", preventLoginRoute, (req, res) => generateLoginForm(req, res))

 accoutRoutes.post("/login", preventLoginRoute, (req, res) => submitLoginForm(req, res))


// REGISTER ROUTES
// URL      :   /register
// ACCESS   :   PUBLIC
// METHODS  :   [POST, GET]

 accoutRoutes.get("/register", preventLoginRoute, (req, res) => generateRegisterForm(req, res))
 
 accoutRoutes.post("/register", preventLoginRoute, (req, res) => submitRegisterForm(req, res))


 // REGISTER ROUTES
// URL      :   /logout
// ACCESS   :   PRIVATE
// METHODS  :   [POST]

accoutRoutes.get("/logout", redirectToLogin, (req, res) => handleLogOut(req, res))





module.exports = accoutRoutes;