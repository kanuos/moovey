const pool = require("../_Database");
const fn = require("../functions");
const {storeMoviesMetaToDB, searchMovieMetaInDB, searchMovieMetaFromAPI} = require("./api_DB")

const context = {
    title : "Create Favorite Lists",
    message : "",
    titleError : '',
    authError : ""
}

exports.getAllList = async function(req, res) {
    try{
        const {title} = req.query;
        let lists;
        if (title) {
            const {rows} = await pool.query("SELECT name, title, date_created AS date,lid, description FROM list_meta INNER JOIN users ON list_meta.uid = users.uid WHERE title LIKE $1 ORDER BY date DESC", [fn.dbLikeQueryString(title.toLowerCase().trim())]);
            if (rows.length === 0){
                context.message = `No list found with the title "${title.trim()}"`
            }
            lists = rows;
        }
        else {
            const {rows} = await pool.query("SELECT name, title, date_created AS date,lid, description FROM list_meta INNER JOIN users ON list_meta.uid = users.uid ORDER BY date DESC");
            lists = rows;
        }
        context.loggedIn = req.session?.name;
        context.data = lists ?? [];
        context.data?.forEach(datum => {
            datum.date = fn.readableDateStringFormat(`${datum.date}`)
        })
        return res.render("pages/list_list", context)
    }
    catch(err){
        return res.redirect("/")
    }
}

exports.showNewListCreationPage = async (req, res) => {
    try {
        context.loggedIn = req.session?.name
        context.defaultData = null;
        context.actionUrl = '/moovey/list/new'
        return res.render("pages/new_list", context)
    } catch (error) {
        context.message = error.message
        return res.render("pages/new_list", context)
    }
}

exports.createNewList = async (req, res) => {
    try {
        // get the title and description input from the active user
        const {title, description} = req.body;
        // check if user already has a list by the name [title]
        // if list already exists do nothing
        // else create new list and redirect to list/:new_list_id
        const {rows} = await pool.query("INSERT INTO list_meta (title, uid, description) VALUES ($1, $2, $3) ON CONFLICT (title, uid) DO NOTHING RETURNING *", [title.toLowerCase(), req.session.uid, description]); 
        const context = rows[0];
        console.log(context);
        if (!context){
            throw Error("You already have a list by the same title. Try a different title.")
        }
        return res.redirect(`/moovey/list/${context.lid}`)
    } 
    catch (error) {
        context.formTitle = '';
        context.loggedIn = req.session?.name;
        context.defaultData = null;
        context.actionUrl = '/moovey/list/new'
        console.log("crete new list error : ", error.message);
        context.message = JSON.stringify(error.message)
        return res.render("pages/new_list", context)
    }
}

exports.getListByID = async function(req, res) { 
    try{
        const {id} = req.params;
        const {rows} = await pool.query("select u.name, u.uid, lm.title as list_title,lm.lid,li.imdbid,li.description, lm.description as list_desc,lm.date_created, mm.poster, mm.title, mm.year from list_meta as lm inner join users as u on u.uid = lm.uid left join list_item as li on li.lid = lm.lid left join movies_meta as mm on mm.imdbid = li.imdbid where lm.lid = $1;", [id])
        
        if (rows.length === 0){
            throw Error
        }
        const formattedData = { movies : []}
        rows.forEach(row => {
            if (!formattedData.lid){
                formattedData.lid = row.lid
            }
            if (!formattedData.list_title){
                formattedData.list_title = row.list_title
            }
            if (!formattedData.list_desc){
                formattedData.list_desc = row.list_desc
            }
            if (!formattedData.date){
                formattedData.date = fn.readableDateStringFormat(""+row.date_created)
            }
            if (!formattedData.name){
                formattedData.name = row.name
            }
            if (!formattedData.uid){
                formattedData.uid = row.uid
            }
            if (row.imdbid) {
                if (formattedData.movies?.length === 0){
                    formattedData.movies = [
                        {
                            imdbid : row.imdbid,
                            desc : row.description,
                            poster : row.poster,
                            title : row.title,
                            year : row.year,
                        }
                    ]
                } 
                else {
                    formattedData.movies.push({
                            imdbid : row.imdbid,
                            desc : row.description,
                            poster : row.poster,
                            title : row.title,
                            year : row.year,
                        })
                }
            }
        })

        context.loggedIn = req.session?.name;
        context.authorized = req.session?.uid && (req.session?.uid === formattedData.uid)
        context.data = formattedData;
        context.showSearchForm = false;
        context.showAddModal = false;
        context.searchFor = ''
        console.log(context);
        return res.render("pages/list_detail", {...context})
    }
    catch(err){
        console.log("****",err);
        return res.redirect("/pageNotFound")
    }
}

exports.searchMovie = async function(req, res) {
    try {
        const {keyword} = req.body;
    } catch (error) {
        
    }
}

exports.deleteList = async function(req, res) {
    try {
        const {id} = req.params;
        console.log("delete list with id ", id);
        const {rows} = await pool.query("DELETE FROM list_meta WHERE lid = $1 AND uid = $2 RETURNING *", [id, req.session?.uid]);
        if (rows.length === 0){
            throw Error
        }
        const date = new Date(`${rows[0].date_created}`).toDateString()
        return res.render("pages/redirect_temp", {
            message : `Operation Successful`,
            title: "Deleted List",
            description : `List "${rows[0].title}" created on ${date} was deleted successfully.`,
            links : [
                {
                    href : "/moovey/list",
                    hreflang: "Check out all lists"
                },
                {
                    href : "/",
                    hreflang: "Click here to go home"
                },
            ] 
        })
    } catch (error) {
        console.log(error);
        return res.redirect("/pageNotFound")
    }
}

exports.showEditListPage = async function(req, res) {
    try {
        const {id} = req.params;
        const {rows} = await pool.query("SELECT title, description FROM list_meta WHERE lid = $1", [id])
        if (rows[0].uid === req.session?.uid){
            throw Error("You do not have authorization to edit list.")
        }
        context.formTitle = `Edit list #${id}`;
        context.loggedIn = req.session?.name
        context.defaultData = rows[0];
        context.actionUrl = `/moovey/list/${id}/edit`
        return res.render("pages/new_list", context)        
    } catch (error) {
        context.authError = error.message
        return res.redirect("/moovey/list")
    }
}

exports.editList = async function(req, res) {
    try {
        const {title, description} = req.body;
        const {id} = req.params;
        // check if list with id exists
        const {rows} = await pool.query("SELECT uid, title, description FROM list_meta WHERE lid = $1",[id])
        if (rows.length === 0){
            throw Error(`404`)
        }
        if (rows[0].uid !== req.session?.uid){
            throw Error(`403`)
        }
        await pool.query("UPDATE list_meta SET title = $1, description = $2 WHERE lid = $3 AND uid = $4", [title, description, id, req.session.uid])
        return res.redirect(`/moovey/list/${id}`)
    } catch (error) {
        return res.render("pages/redirect_temp", {
            message : `Error ${error.message}`,
            title: "Edit List Error",
            description : error.message === '403' ? `You are not authorized to delete list #${req.params.id}`: `List #${req.params.id} does not exist`,
            links : [
                {
                    href : "/moovey/list",
                    hreflang: "Check out all lists"
                },
                {
                    href : `/moovey/list/${req.params.id}`,
                    hreflang: "Click here to go home"
                },
            ] 
        })
        console.log("This line runs!");
        context.loggedIn = req.session?.name
        context.defaultData = req.body;
        context.actionUrl = `/moovey/list/${id}/edit`
        context.authError = error.message
        return res.render("pages/new_list", context)        
     }
}

exports.removeMovieFromList = async function(req, res) {

}

exports.submitSearchData = async function(req, res) {
    try{
        const {lid} = req.params;
        const {searchKey} = req.body;
        const {rows} = await pool.query("SELECT * FROM list_meta WHERE lid = $1", [parseInt(lid)]);
        // check if logged in user is authorized 
        if (rows[0].uid !== req.session?.uid){
            throw Error("Not authorized")
        }
        // check if movie with title searchKey exists in movies_meta
        const movieInDB = await searchMovieMetaInDB(searchKey)
        // if data exists render data
        if (movieInDB.length > 0){
            context.loggedIn = req.session?.name;
            context.showSearchForm = false;
            context.authorized = req.session?.uid === rows[0].uid;
            context.data = rows[0];
            context.movies = movieInDB
            context.showAddModal = false;
            context.searchFor = searchKey
            context.data.date = fn.readableDateStringFormat(`${context.data.date}`)
            
            return res.render("pages/list_detail", context)
        }
        // if data doesn't exists search api for results
        const moviesFromAPI = await searchMovieMetaFromAPI(searchKey)
        // if search result is none throw error
        if (moviesFromAPI.length === 0){
            throw Error("Movie not found!")
        }
        // if search result exists store movies to db
        const {success, data} = await storeMoviesMetaToDB(moviesFromAPI);
        // return movies list
        if (!success){
            throw Error("Something went wrong")
        }
        context.loggedIn = req.session?.name;
        context.authorized = req.session?.uid === rows[0].uid
        context.showSearchForm = false;
        context.data = rows[0];
        context.movies = data.rows
        context.searchFor = searchKey
        context.showAddModal = false;
        context.data.date = fn.readableDateStringFormat(`${context.data.date}`)
        return res.render("pages/list_detail", context)
    }
    catch(err){
        const context = {
            title : err.message,
            message : err.message === 'Movie not found|' ? 'Error 404' : 'Error 403',
            description : err.message,
            links : [
                {
                    href : `/moovey/list/${req.params.lid}`,
                    hreflang : 'Go back to list'
                },
                {
                    href : `/`,
                    hreflang : 'Go to home'
                },
            ]
        }
        return res.render("pages/redirect_temp", context)
    }
}

exports.showSearchMovieItemForm = async function(req, res) {
    try{
        const {lid} = req.params;
        const {rows} = await pool.query("SELECT lid, users.uid AS uid, description, title, date_created AS date, name FROM list_meta INNER JOIN users ON list_meta.uid = users.uid WHERE lid = $1", [parseInt(lid)]);

        if (rows.length === 0){
            throw Error("List not found")
        }
        
        context.loggedIn = req.session?.name;
        context.authorized = req.session?.uid === rows[0].uid
        context.showSearchForm = true;
        context.data = rows[0];
        context.movies = []
        context.showAddModal = false;
        context.searchFor = ''
        context.data.date = fn.readableDateStringFormat(`${context.data.date}`)
        return res.render("pages/list_detail", context)
    }
    catch(err){
        return res.redirect("/pageNotFound")
    }
}

exports.showAddItemModal = async function(req, res) {
    try{
        const {lid} = req.params;
        const listMeta = (await pool.query("SELECT * FROM list_meta AS lm WHERE lm.lid = $1 AND lm.uid = $2", [lid, req.session.uid])).rows[0];
        console.log(listMeta);
        return res.render("pages/search_movie", {
            message : `Search Movie to add to "${listMeta.title}"`,
            data : [],
            title: 'Add to list #' + lid,
            loggedIn : req.session?.name
        })
    }
    catch(err){
        console.log(err);
        return res.redirect("/pageNotFound")
    }
}


exports.addMovieToList = async function(req, res) {
    try {
       const {itemDescription, imdbid} = req.body;
       const {lid} = req.params;
       if (req.params?.imdbid !== imdbid){
           throw Error("400")
       }
       const list = (await pool.query("SELECT * FROM list_meta WHERE lid = $1", [lid])).rows[0];
       if (list.uid !== req.session?.uid){
           throw Error("403")
       }
       const {rows} = await pool.query("INSERT INTO list_item (lid, uid, imdbid, description) VALUES ($1, $2, $3, $4) ON CONFLICT (uid, lid, imdbid) DO NOTHING RETURNING *", [lid, req.session?.uid, imdbid, itemDescription])
       if (rows.length === 0){
           throw Error("500")
       }
       return res.redirect(`/moovey/list/${lid}`);

    } catch (error) {
        const templateData = {
            title : "Whoa! That was not cool",
            links : [
                {
                    hreflang: 'Check out all the lists',
                    href : '/moovey/list'
                },
                {
                    hreflang: 'Go to home',
                    href : '/'
                },
            ]
        }
        switch(error.message){
            case "400":
                templateData.message = 'error 400'
                templateData.description = 'Bad request. List you are looking for does not exist or may have been deleted. Sorry for the inconvenience.'
                break;

            case "403":
                templateData.message = 'error 403'
                templateData.description = 'You are trying to add moovey to the list that you are not authorized to. To add movies to list, either create your own list or add to your existing lists. Sorry for the inconvenience.'
                break;
            case "500":
                templateData.message = 'error 500'
                templateData.description = 'Something went wrong at the server. Please try again later. Sorry for the inconvenience.'
                break;
                default: 
                    return res.redirect("/pageNotFound")
            }
            return res.render("pages/render_temp", templateData)
    }
}