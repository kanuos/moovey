// SERVER SETTINGS
require("dotenv").config();
const express = require('express');
const session = require("express-session");
const path = require('path');
const app = express();
const favicon = require("serve-favicon");

// SERVER CONFIGURATION

app.set("view engine", "ejs");
app.set('views', './View');
app.use('/static',express.static(path.join(__dirname, 'static')));
app.disable('x-powered-by');
app.use(express.json());
app.use(express.urlencoded({extended : true}));
app.use(favicon(path.join(__dirname, "static", "assets", "favicon.png")))


// MIDDLEWARES
require("./_Database")  // database connection
app.use(session({
    name : process.env.SESSION_NAME,
    secret : process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie : {
        httpOnly: true,
        maxAge : 1000 * 60 * 5,
        sameSite : true,
    }
    // store
}))

// ROUTE MIDDLEWARES
app.use('/', require('./_Routes/accountRoutes'))
app.use('/blogs', require('./_Routes/blogRoutes'))
app.use('/dashboard', require('./_Routes/dashboardRoutes'))

app.listen(8000, ()=> console.log("Server running on port 8000"));