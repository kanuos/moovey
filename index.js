// SERVER SETTINGS
require("dotenv").config();
const express = require('express');
const path = require('path');
const app = express();
const favicon = require("serve-favicon");

// SERVER CONFIGURATION

app.set("view engine", "ejs");
app.set('views', './View');
app.use('/static',express.static(path.join(__dirname, 'static')));
app.disable('x-powered-by');
app.use(express.json());
app.use(express.urlencoded({extended : false}));
app.use(favicon(path.join(__dirname, "static", "assets", "favicon.png")))

// MIDDLEWARES


// ROUTE MIDDLEWARES
app.use('/', require('./_Routes/accountRoutes'))


app.listen(8000, ()=> console.log("Server running on port 8000"));