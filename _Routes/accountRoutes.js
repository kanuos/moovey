const accoutRoutes = require('express').Router();
const {generateLoginForm, generateRegisterForm, submitLoginForm, submitRegisterForm, handleLogOut} = require("../_Controller/accountController")
/**
 * ROUTES = /login, /register, /logout, /profile
 */

// LOGIN ROUTES
// URL      :   /login
// ACCESS   :   PUBLIC
// METHODS  :   [POST, GET]

 accoutRoutes.get("/login", (req, res) => generateLoginForm(req, res))

 accoutRoutes.post("/login", (req, res) => submitLoginForm(req, res))


// REGISTER ROUTES
// URL      :   /register
// ACCESS   :   PUBLIC
// METHODS  :   [POST, GET]

 accoutRoutes.get("/register", (req, res) => generateRegisterForm(req, res))
 
 accoutRoutes.post("/register", (req, res) => submitRegisterForm(req, res))


 // REGISTER ROUTES
// URL      :   /logout
// ACCESS   :   PRIVATE
// METHODS  :   [POST]

accoutRoutes.post("/logout", (req, res) => handleLogOut(req, res))





module.exports = accoutRoutes;