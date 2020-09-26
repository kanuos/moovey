const RegisterRouter = require('express').Router();
const users = require('../Model/dummyDB')

RegisterRouter.get('/register', (req, res) => {
    return res.render('pages/register')
})

RegisterRouter.post('/register', async (req, res) => {
    users.push(req.body);
    res.redirect('/');
});

module.exports = RegisterRouter;