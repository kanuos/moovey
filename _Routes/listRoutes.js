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
const {redirectToLogin} = require("../sessionMiddleware")


listRoutes.get('/', getAllList)
listRoutes.get('/new',redirectToLogin, showNewListCreationPage)
listRoutes.post('/new',redirectToLogin, createNewList)
listRoutes.get('/:id', getListByID)

listRoutes.get('/:id/edit',redirectToLogin, showEditListPage)
listRoutes.post('/:id/edit',redirectToLogin, editList)
listRoutes.post('/:id/delete',redirectToLogin, deleteList)

listRoutes.post('/:lid/search',redirectToLogin, submitSearchData)
listRoutes.get('/:lid/search/',redirectToLogin, showSearchMovieItemPage)

listRoutes.get('/:lid/add/:imdbid',redirectToLogin, addMovieToListPage)
listRoutes.post('/:lid/add/:imdbid',redirectToLogin, submitNewMovieToList)

listRoutes.post('/:lid/delete/:imdbid',redirectToLogin, deleteMovieFromList)


listRoutes.get('/:lid/edit/:imdbid',redirectToLogin, showEditListItemPage)
listRoutes.post('/:lid/edit/:imdbid',redirectToLogin, submitEditItem)





module.exports = listRoutes;
