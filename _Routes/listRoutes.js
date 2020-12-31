const listRoutes = require('express').Router();
const {getDashboardListPage, createNewList} = require("../_Controller/listController")

listRoutes.get('/', (req, res) => getDashboardListPage(req, res))

listRoutes.get('/user', (req,res) => res.json("list by current user" ))

listRoutes.get('/:id', (req, res) => res.json("get list with id → " + req.params.id))

listRoutes.post('/', (req, res) => createNewList(req, res))

listRoutes.get('*', (req, res) => res.json("error 404"))

module.exports = listRoutes;
