const listRoutes = require('express').Router();
const {
    showNewListCreationPage,
    createNewList,
    getAllList,
    getListByID,
    showEditListPage,
    deleteList,
    editList,
    addMovieToList,
    showSearchMovieItemForm,
    submitSearchData, 
    showAddItemModal
} = require("../_Controller/listController")
const {redirectToLogin} = require("../sessionMiddleware")


listRoutes.get('/', getAllList)
listRoutes.get('/new',redirectToLogin, showNewListCreationPage)
listRoutes.post('/new',redirectToLogin, createNewList)
listRoutes.get('/:id', getListByID)

listRoutes.get('/:id/edit',redirectToLogin, showEditListPage)
listRoutes.post('/:id/edit',redirectToLogin, editList)
listRoutes.post('/:id/delete',redirectToLogin, deleteList)

listRoutes.get('/:lid/search',redirectToLogin, showSearchMovieItemForm)
listRoutes.post('/:lid/search',redirectToLogin, submitSearchData)


listRoutes.get('/:lid/add/',redirectToLogin, showAddItemModal)
listRoutes.post('/:lid/add/:imdbid',redirectToLogin, addMovieToList)

// listRoutes.post('/:lid/:itemID/delete',redirectToLogin, addMovieToList)


// listRoutes.get('/:lid/:itemID/edit', redirectToLogin, addMovieToList)
// listRoutes.post('/:lid/:itemID/edit', redirectToLogin, addMovieToList)




module.exports = listRoutes;
