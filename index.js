const express = require('express');
const path = require('path');

const app = express();
app.set("view engine", "ejs");
app.set('views', './View');

app.use('/static',express.static(path.join(__dirname, 'static')));
app.disable('x-powered-by');
app.use(express.json());
app.use(express.urlencoded({extended : false}));

const users = [];

app.get('/', (req, res) => {
    return res.render('pages/home', {users});
})

app.get('/login', (req, res) => {
    return res.render('pages/login')
})

app.post('/login', (req, res) => {
    users.push(req.body);
    res.redirect('/');
})


app.get('/register', (req, res) => {
    return res.render('pages/register')
})


app.listen(8000, ()=> console.log("Server running on port 8000"));