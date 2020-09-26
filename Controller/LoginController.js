const loginRouter = require('express').Router();

loginRouter.get('/login', async (req, res) => {
    return res.render('pages/login')
})

loginRouter.post('/login', async (req, res) => {
    return res.render('pages/login')
});

module.exports = loginRouter;