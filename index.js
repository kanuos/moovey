// environment variables
require("dotenv").config();
const {
    REDIS_URL,
    SESSION_NAME,
    SESSION_SECRET,
    SESSION_DURATION,
    PORT
} = process.env

// SERVER SETTINGS
const express = require('express');
const session = require("express-session");
const redis = require("redis");
const redisClient = redis.createClient(REDIS_URL)
const RedisStore = require("connect-redis")(session)
const path = require('path');
const app = express();
const favicon = require("serve-favicon");
const fileUpload = require("express-fileupload");
const helmet = require("helmet");
const noCache = require("nocache")

// TODO: add compression
// TODO: add rate limiter

// SERVER CONFIGURATION

app.use(helmet.hidePoweredBy());
app.use(helmet.noSniff());
app.use(helmet.xssFilter());
app.use(noCache())

app.set("view engine", "ejs");
app.set('views', './View');
app.use('/static',express.static(path.join(__dirname, 'static')));
app.disable('x-powered-by');
app.use(express.json());
app.use(express.urlencoded({extended : true}));
app.use(favicon(path.join(__dirname, "static", "assets", "favicon.png")))
app.use(fileUpload())


// MIDDLEWARES
require("./_Database")  // database connection
app.use(session({
    name : SESSION_NAME,
    secret : SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie : {
        httpOnly: true,
        maxAge : parseInt(SESSION_DURATION),
        sameSite : true,
    },
    // store
    store : new RedisStore({
        client: redisClient,
        url : REDIS_URL ?? null
    })
}))


// ROUTE MIDDLEWARES
app.use('/', require('./_Routes/accountRoutes'))
app.use('/dashboard', require('./_Routes/dashboardRoutes'))
app.use('/moovey/list', require('./_Routes/listRoutes'))
app.use('/moovey', require('./_Routes/blogRoutes'))

app.get('*', (req, res) => res.render("pages/404", {title : 'Page Not Found'}))

app.listen(PORT, ()=> console.log(`Server running on port ${PORT}`));