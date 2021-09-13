const listRoutes = require('express').Router();
const {
    getAllList,
    getListByID,
} = require("../_Controller/listController")


listRoutes.get('/',  getAllList)
listRoutes.get('/:id',  getListByID)





module.exports = listRoutes;
