const accoutRoutes = require('express').Router();
const {generateLoginForm, generateRegisterForm} = require("../_Controller/accountController")
/**
 * ROUTES = /login, /register, /logout, /profile
 */

 accoutRoutes.get("/login", (req, res) => generateLoginForm(req, res))

 accoutRoutes.get("/register", (req, res) => generateRegisterForm(req, res))


module.exports = accoutRoutes;