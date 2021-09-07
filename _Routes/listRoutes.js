const listRoutes = require('express').Router();
const {
    showNewListCreationPage,
    createNewList,
    getAllList,
    getListByID,
    showEditListPage,
    deleteList,
    editList,
    submitNewMovieToList,
    submitSearchData, 
    showSearchMovieItemPage,
    addMovieToListPage,
    deleteMovieFromList,
    showEditListItemPage,
    submitEditItem
} = require("../_Controller/listController")


listRoutes.get('/',  getAllList)
listRoutes.get('/:id',  getListByID)





module.exports = listRoutes;
