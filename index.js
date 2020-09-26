const express = require('express');
const path = require('path');
const app = express();

// ROUTES
const LoginRouter = require('./Controller/LoginController')
const RegisterRouter = require('./Controller/RegisterController')
const users = require('./Model/dummyDB');

app.set("view engine", "ejs");
app.set('views', './View');
app.use('/static',express.static(path.join(__dirname, 'static')));
app.disable('x-powered-by');
app.use(express.json());
app.use(express.urlencoded({extended : false}));

app.use(LoginRouter)
app.use(RegisterRouter)


app.get('/', (req, res) => {
    return res.render('pages/home', {users});
})



app.listen(8000, ()=> console.log("Server running on port 8000"));