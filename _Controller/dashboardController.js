const DASHBOARD_LINKS = {
    profile : "profile",
    lists : "lists",
    articles : "articles",
    favorites : "favorites",
    watchlist : "watchlist",
}
const pool = require("../_Database")

const {
    searchMovieMetaInDB, 
    searchMovieMetaFromAPI, 
    storeMoviesMetaToDB, 
    searchIMDBInMovieMeta,
    searchIMDBMetaDataFromAPI,

    handleMovieDetailSearch
    
    } = require("./api_DB")


const {convert} = require("html-to-text")
const sharp = require("sharp");
const { readableDateStringFormat, minimumLength, maximumLength } = require("../functions");
const imgbb = require("imgbb-uploader");
const bcrypt = require("bcryptjs");


const {IMGBB_MAX_FILE_SIZE, IMGBB} = process.env



// on login redirects to /dashboard
// shows the profile page of the logged user
async function dashboard__getMyProfile(req, res) {
    try {
        const context = {
            loggedIn : req.session?.name,
            title : "My Dashboard",
            dashboardMode : true,
            dashboardPageName : req.session.name + "'s profile",
            activeDashboardLink : DASHBOARD_LINKS.profile,
            fileUploadError : false
        }
        const activeUser = (await pool.query("SELECT name, email,credential, date_joined AS joined, picture, location, u.uid, bio, facebook, twitter, website FROM users AS u LEFT JOIN profile AS p ON u.uid = p.uid WHERE u.uid = $1", [req.session.uid])).rows[0];

        if (!activeUser) {
            throw Error("User doesn't exist")
        }
        context.user = activeUser;
        context.user.joined = readableDateStringFormat(activeUser.joined)
        const {tab} = req.query;
        if (tab === "2") {
            return res.render("pages/dashboard/my-profile--tab-2", context)
        }
        return res.render("pages/dashboard/my-profile--tab-1", context)
    } catch (error) {
        console.log(error);
    }
}



// submit the EDIT profile pic
// REST type for AJAX req/res. No pages rendered
async function dashboard__changeProfilePic(req, res) {
    try {
        const {picture : {mimetype, data, size}} = req.files;
        // check if the received file is an image and adheres to the type of any of ["jpeg", "jpg", "png"]
        if (!["image/png", "image/jpg", "image/jpeg"].includes(mimetype)) {
            throw new Error("Profile picture must be a valid image")
        }
        // check if the image received is bigger than permitted size : 5MB
        if (size > parseInt(IMGBB_MAX_FILE_SIZE)) {
            throw new Error(`Profile picture can not be more than ${Math.floor(IMGBB_MAX_FILE_SIZE / 10**6)}}MB in size`)
        }
        // optimize image using sharp
        const resized = await (await sharp(data).resize(250, 250).toBuffer()).toString("base64");
        // uploading to imgbb server
        const {image : {url}} = await imgbb({
            apiKey : IMGBB,
            base64string : resized
        })

        // store URL to db as logged in user's profile pic
        const profile = (await pool.query("UPDATE profile SET picture = $1 WHERE uid = $2 RETURNING picture", [url, req.session.uid])).rows[0];
    
        if (!profile) {
            throw new Error("Something went wrong. Please try again later")
        }
        return res.status(201).json(profile)
    } catch (error) {
        return res.status(400).json({error : error.message})
    }
}

// submit the EDIT profile password
// REST type for AJAX req/res. No pages rendered
async function dashboard__changePassword(req, res) {
    try {
        let { currentPassword, newPassword, confirmPassword } = req.body;
        currentPassword = currentPassword.trim(), newPassword = newPassword.trim(), confirmPassword = confirmPassword.trim()
        // server side validation
        if (!currentPassword || !newPassword || !confirmPassword) {
            throw new Error("Please fill out all the fields")
        }
        if (confirmPassword !== newPassword) {
            throw new Error("Passwords don't match")
        }
        
        if(!minimumLength(newPassword, 6))
            throw new Error("Password must be at least six characters long")
        if(!maximumLength(newPassword, 20))
            throw new Error("Password cannot be more than twenty characters long")

        // get active user from DB
        const activeUserID = req.session.uid;
        const user = (await pool.query("SELECT * FROM users WHERE uid = $1", [activeUserID])).rows[0];

        if (!user) {
            throw new Error("Something went wrong!")
        }

        // check if currentPassword matches the user's password from DB
        const isValidPassword = await bcrypt.compare(currentPassword, user.password)

        if (!isValidPassword){
            throw new Error("Incorrect password. Please try again")
        }
        // hash the new password and update the database for the active user
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword.trim(), salt);

        await pool.query("UPDATE users SET password = $1 WHERE uid = $2", [hashedPassword, activeUserID])
        return res.status(200).json({message: "Password updated successfully", success: true})

    } catch (error) {
        return res.status(400).json({error: error.message, success: false})
    }
}


// submit the POST data to update the current user's data
async function dashboard__submitProfileUpdate(req, res) {
    try {
        let {location, bio, credential, facebook, twitter, website} = req.body;
        
        // check for valid URLS        
        if (facebook && facebook.trim().length > 0) {
            facebook = new URL(facebook).href;
        }
        if (twitter && twitter.trim().length > 0) {
            twitter = new URL(twitter).href;
        }
        if (website && website.trim().length > 0) {
            website = new URL(website).href;
        }
        // store the new data to db
        await pool.query("UPDATE profile SET credential = $1, bio = $2, location = $3, facebook = $4, twitter = $5, website = $6 WHERE uid = $7", [credential.trim(), bio.trim(), location.trim(), facebook, twitter, website, req.session.uid])

        return res.redirect("/dashboard/my-profile")
    } 
    catch (error) {
        return res.redirect("/dashboard/my-profile")
    }
}


// get all articles of the logged user
// url : /dashboard/my-articles
async function dashboard__getAllArticles(req, res) {
    try {
        const context = {
            loggedIn : req.session?.name,
            title : "My Dashboard | My Articles",
            dashboardMode : true,
            dashboardPageName : req.session?.name + " articles",
            activeDashboardLink : DASHBOARD_LINKS.articles
        }
        return res.render("pages/dashboard/articles", context)
    } catch (error) {
        console.log(error);
    }
}


// get article with id [ID] of the logged user
// url : /dashboard/my-articles/:id
async function dashboard__getArticleByID_RD(req, res) {
    try {
        const context = {
            loggedIn : req.session?.name,
            title : "My Dashboard",
            dashboardMode : true,
            dashboardPageName : "Article ID: " + req.params.id,
            activeDashboardLink : DASHBOARD_LINKS.articles,
            sortMode : false,
            optionsArray : []
        }
        return res.render("pages/dashboard/article[id]-read", context)
    } catch (error) {
        console.log(error);
    }
}



// get the new article creation form/ edit existing article form
// url : /dashboard/my-articles/new  
// url : /dashboard/my-articles/:id/edit  


async function dashboard__getArticleByID_CU(req, res) {
    const context = {
        loggedIn : req.session?.name,
        title : "My Dashboard",
        dashboardMode : true,
        mode : "C",
        dashboardPageName : "Search Movies | TV shows",
        activeDashboardLink : DASHBOARD_LINKS.watchlist,
        actionURL : `/dashboard/my-articles/new`,
        searchError : '',
        step : req.body?.step,
        conflictDetail : null,
        selectedMovie : null
    }
    try {
        const {step} = req.body;
        console.log("step : ", step);
        if (step === '1') {
            const {keyword, year, type, imdbid} = req.body;
            let movies;
            if (!imdbid) {
                context.keyword = keyword
                movies = await handleMovieMetaSearch(keyword, type, year)
                context.data = movies;
            }
            else {
                context.keyword = imdbid
                movies = await handleMovieMetaSearchByIMDB(imdbid)
                context.data = [movies];
            }
            context.step = "2"
            return res.render("pages/dashboard/article[id]-write-edit", context)
        }
        else if (step === "3") {
            const {imdbid} = req.body;
            // check if imdbid is valid. user did not manually tamper imdbid
            const movie = (await pool.query("SELECT * FROM movies_meta WHERE imdbID = $1", [imdbid])).rowCount;

            if (movie === 0) {
                throw Error("Movie doesn't exist")
            }

            // check if user has already written review on imdbid
            const existingBlog = (await pool.query("SELECT blog_id, blog_title, title, created FROM blogs INNER JOIN movies_meta ON blogs.imdbid = movies_meta.imdbid WHERE uid = $1 AND blogs.imdbID = $2 LIMIT 1", [req.session.uid, imdbid])).rows[0];

            if (existingBlog) {
                context.conflictDetail = existingBlog
                throw Error("review for particular movie already exists")
            }

            // imdbid valid. review of imdbid by active user not found. 
            // search movies_detail in [DB] and [API ► DB](if needed)
            // TODO fix blog detail issue
            const movieDetail = await handleMovieDetailSearch(imdbid)
            context.selectedMovie = movieDetail
s        }

        else if (step === "4") {
            const {review, title, conclusion, movie_title, imdbid} = req.body;
            console.log(req.body, "  at step 4");
            const plainTitle = convert(title)
            if(!plainTitle.trim().length) {
                context.step = "4"
                context.searchError = "Title cannot be empty"
                context.selectedMovie = {title : movie_title, imdbid : imdbid}
                return res.render("pages/dashboard/article[id]-write-edit", context)
            }
            const plainReview = convert(review)
            if(!plainReview.trim().length) {
                context.step = "4"
                context.searchError = "Review cannot be empty"
                context.selectedMovie = {title : movie_title, imdbid : imdbid}
                return res.render("pages/dashboard/article[id]-write-edit", context)
            }

        }
        return res.render("pages/dashboard/article[id]-write-edit", context)
    } 
    catch (error) {
        context.searchError = error.message
        context.step = '0'
        return res.render("pages/dashboard/article[id]-write-edit", context)
    }
}





// get all lists of the logged user
// url : /dashboard/lists
async function dashboard__getAllLists(req, res) {
    // TODO: add search query from dashboard
    try {
        const context = {
            loggedIn : req.session?.name,
            title : "My Dashboard | My Articles",
            dashboardMode : true,
            dashboardPageName : req.session?.name + "'s lists",
            activeDashboardLink : DASHBOARD_LINKS.lists
        }
        const listsByUser = (await pool.query("select l.lid,l.title,l.views, l.description as l_desc, date_created, l.uid from list_meta as l where l.uid = $1", [req.session.uid])).rows;
        context.lists = listsByUser
        return res.render("pages/dashboard/lists", context)
    } catch (error) {
        console.log(error);
    }
}



// show the create new list/edit list page for the logged user
// url : /dashboard/my-lists
async function dashboard__getCreateListPage(req, res) {
    const context = {
        loggedIn : req.session?.name,
        title : "My Dashboard | My Lists",
        dashboardMode : true,
        dashboardPageName : "Create new list",
        activeDashboardLink : DASHBOARD_LINKS.lists,
        pageError : false,
        actionURL : "/dashboard/my-lists/new",
        conflictDetail : false,
        listData: null
    }
    try {
        return res.render("pages/dashboard/create-edit-list", context)
    } catch (error) {
        context.pageError = error.message
        return res.render("pages/dashboard/create-edit-list", context)
    }
}


// create new list/edit list by the logged user
// url : /dashboard/articles
async function dashboard__submitNewListData(req, res) {
    const context = {
        loggedIn : req.session?.name,
        title : "My Dashboard | My Lists",
        dashboardMode : true,
        dashboardPageName : "Create new list",
        activeDashboardLink : DASHBOARD_LINKS.lists,
        pageError : false,
        actionURL : "/dashboard/my-lists/new",
        conflictDetail : false,
        listData : null
    }
    try {
        const {title, description} = req.body;
        // check if inputs are valid or not
        if (!title.trim().length) {
            throw new Error("Title is required")
        }
        
        // check if list with same title by user already exists or not
        const {rows} = (await pool.query("SELECT lid as id, title, date_created FROM list_meta WHERE title = $1 AND uid = $2 LIMIT 1", [title.toLowerCase(), req.session.uid]))

        if (rows.length === 1) {
            context.conflictDetail = rows[0]
            throw new Error("List with the same title already exists")
        }

        // insert list metadata into database
        const newListID = (await pool.query("INSERT INTO list_meta (title, description, uid) VALUES ($1, $2, $3) RETURNING lid", 
        [title.toLowerCase().trim(), description.toLowerCase().trim(), req.session.uid])).rows[0]

        console.log(newListID);

        return res.redirect(`/dashboard/my-lists/${newListID.lid}`)
    } catch (error) {
        context.pageError = error.message
        return res.render("pages/dashboard/create-edit-list", context)
    }
}



// create new list/edit list by the logged user
// url : /dashboard/my-lists/[id]
async function dashboard__getListByID(req, res) {
    const context = {
        loggedIn : req.session?.name,
        title : "My Dashboard | My Lists",
        dashboardMode : true,
        dashboardPageName : "Create new list",
        activeDashboardLink : DASHBOARD_LINKS.lists,
        pageError : false,
        activeTab : 0
    }
    try {
        const {params : {id}, query : {tab, dm}} = req;
        if (dm) {
            context.deletedMsg = dm
        }
        // show the main tab
        if (!tab || tab === "1") {
            context.activeTab = 0
            // check if list with same title by user already exists or not
            const {rows} = (await pool.query("SELECT lm.lid, lm.date_created, lm.uid,  lm.description as list_desc, lm.title as list_title, li.description as li_desc, itemid, mm.imdbid, mm.title as movie_title, mm.year as movie_year  FROM list_meta AS lm LEFT JOIN list_item AS li ON lm.lid = li.lid LEFT JOIN movies_meta AS mm ON mm.imdbid = li.imdbid WHERE lm.lid = $1 AND lm.uid = $2", [id, req.session.uid]))
                
            if (rows.length === 0) {
                throw new Error(`List #${id} does not exist`)
            }
            // for tab = 1 or no tab query param
            context.title = `${rows[0].list_title}`
            context.dashboardPageName = `${req.session.name}'s Lists  >  ${rows[0].list_title}`
            context.listData = rows;
        }
        // show the testimonials for list
        else if (tab === "2") {
            context.activeTab = 1
            // TODO: testimonial
            context.listData = []
        }
        // show the delete list tab
        else if (tab === "3") {
            context.activeTab = 2
            const {rows} = (await pool.query("SELECT lid, date_created, title, description FROM list_meta AS lm WHERE lm.lid = $1 AND lm.uid = $2", [id, req.session.uid]))
            
    
            if (rows.length === 0) {
                throw new Error(`List #${id} does not exist`)
            }
            // for tab = 1 or no tab query param
            context.actionURL = `/dashboard/my-lists/${id}/delete`
            context.type = "list"
            context.title = `Delete "${rows[0].list_title}"`
            context.dashboardPageName = `Delete List #${rows[0].lid}`
            context.data = rows;
            
            return res.render("pages/dashboard/delete-list", context) 
        }
        return res.render("pages/dashboard/read-list", context)
    } catch (error) {
        console.log(error);
        return res.redirect("/page-not-found")
    }
}



// show edit list [id] page by the logged user
// url : /dashboard/my-lists/[id]/edit
async function dashboard__getListEditPage(req, res) {
    const {id} = req.params;
    const context = {
        loggedIn : req.session?.name,
        title : "My Dashboard | My Lists",
        dashboardMode : true,
        dashboardPageName : "Create new list",
        activeDashboardLink : DASHBOARD_LINKS.lists,
        pageError : false,
        actionURL : `/dashboard/my-lists/${id}/edit`,
        conflictDetail : false
    }
    try {
        // check if list with same title by user already exists or not
        const {rows} = (await pool.query("SELECT * FROM list_meta WHERE lid = $1 AND uid = $2 LIMIT 1", [id, req.session.uid]))
        
        if (rows.length === 0) {
            throw new Error("List does not exist")
        }
        context.listData = rows[0];
        return res.render("pages/dashboard/create-edit-list", context)
    } 
    catch (error) {
        context.pageError = error.message
        return res.render("pages/dashboard/create-edit-list", context)
    }
}



// submit the list/[id]/edit by logged user data
// url : /dashboard/my-lists/[id]/edit
async function dashboard__submitListEditData(req, res) {
    const context = {
        loggedIn : req.session?.name,
        title : "My Dashboard | My Lists",
        dashboardMode : true,
        dashboardPageName : "Create new list",
        activeDashboardLink : DASHBOARD_LINKS.lists,
        pageError : false,
        actionURL : "/dashboard/my-lists/new",
        conflictDetail : false,
        listData : null
    }
    let {params : {id}, body : {title, description}} = req;
    title = title.trim() || "", description = description.trim() || ""
    const {uid} = req.session;
    try {
        // server side input validation
        if (title.trim().length === 0) {
            throw new Error("Title is required.")
        }
        // check if list with same title by user already exists or not
        const validList = (await pool.query("SELECT * FROM list_meta WHERE lid = $1 AND uid = $2 LIMIT 1", [id, uid])).rows
        if (validList.length === 0) {
            throw new Error("List does not exist")
        }
        
        // check if list of "title" by logged user already exists or not
        const existingList = (await pool.query("SELECT * FROM list_meta WHERE title = $1 AND uid = $2 AND lid != $3 LIMIT 1", [title, uid, id])).rows

        if (existingList.length !== 0) {
            context.conflictDetail = existingList[0]
            throw new Error(`List with the title "${existingList[0].title}" already exists`)
        }

        // update the list meta 
        await pool.query("UPDATE list_meta SET title = $1, description = $2 WHERE LID = $3 AND uid = $4", [title, description, id, uid])

        // on success redirect to the same page with fresh data
        return res.redirect(`/dashboard/my-lists/${id}`)
    } 
    catch (error) {
        console.log("dashbctrl 500 ", error.message);
        context.pageError = error.message
        return res.render("pages/dashboard/create-edit-list", context)
    }
}


// delete list/[id]/edit by logged user data
// url : /dashboard/my-lists/[id]/delete
async function dashboard__deleteList(req, res) {
    let {params : {id}, body : {code}, session : {uid}} = req;
    try {
        // if confirmation code is not provided
        if (!code) {
            throw new Error("Please fill in the confirmation code")
        }
       // check if list with same title by user already exists or not
        await pool.query("DELETE FROM list_meta WHERE lid = $1 AND uid = $2 AND title = $3", [id, uid, code.trim()])        
        // on success redirect to the same page with fresh data
        return res.redirect(`/dashboard/my-lists`)
    } 
    catch (error) {
        return res.redirect(`/dashboard/my-lists/${id}/delete`)
    }
}



async function dashboard__showSearchMovieForm(req, res) {
    const context = {
        title  : "Add movies, shows and more to list",
        data : [],
        loggedIn : req.session?.name,
        activeDashboardLink : DASHBOARD_LINKS.lists,
        searchError : null,
        conflictDetail : null,
        formMethod : "POST"
    }
    try {
        let {params : {id}} = req;
        // if no id is passed in the URL
        if (!id) {
            throw new Error("List ID is required")
        }
        // if list does not exist
        const listWithID = (await pool.query("SELECT * FROM list_meta WHERE lid = $1 LIMIT 1", [id])).rows[0]
        if (!listWithID) {
            throw new Error("List with ID doesn't exist")
        }
        // if logged user doesn't have permission to add to list
        if (listWithID.uid !== req.session.uid){
            throw new Error("You do not have permission to modify the list")
        }
        // define the action URL where the form will submit its data to
        context.actionURL = `/dashboard/my-lists/${id}/add-item`
        context.backURL = `/dashboard/my-lists/${id}/`
       
        // show the search movie page with step 
        context.step = 1
        return res.render("pages/dashboard/search-movie-page", context)

    } catch (error) {
        console.log(error);
    }
}



async function dashboard__addItemToList(req, res) {
    const context = {
        title  : "Add movies, shows and more to list",
        data : [],
        loggedIn : req.session?.name,
        activeDashboardLink : DASHBOARD_LINKS.lists,
        searchError : null,
        conflictDetail : null,
        formMethod : "POST"
    }
    let {params : {id}, body : {step, keyword, year, type, imdbid, description}} = req;
    try {
        // if no id is passed in the URL
        if (!id) {
            throw new Error("List ID is required")
        }
        // if list does not exist
        const listWithID = (await pool.query("SELECT * FROM list_meta WHERE lid = $1 LIMIT 1", [id])).rows[0]
        if (!listWithID) {
            throw new Error("List with ID doesn't exist")
        }
        // if logged user doesn't have permission to add to list
        if (listWithID.uid !== req.session.uid){
            throw new Error("You do not have permission to modify the list")
        }
        // define the action URL where the form will submit its data to
        context.actionURL = `/dashboard/my-lists/${id}/add-item`
        context.backURL = `/dashboard/my-lists/${id}/`
        
        if (!step) {
            // a step hidden value must be submitted to denote the progress
            throw new Error("Something went wrong")
        }
        switch(parseInt(step)) {    
            case 1:
                context.step = 2
                // user submits movie search query in form of IMDBID
                if (imdbid) {
                    imdbid = imdbid.trim()
                    // search db for item with imdbid
                    const movie = await searchIMDBInMovieMeta(imdbid)
                    if (movie.length > 0){
                        // item present in database
                        context.data = movie;
                        return res.render("pages/dashboard/search-movie-page", {...context, keyword : imdbid})
                    }
                    // item is not present in database
                    // search api with imdbid
                    const {result, error, errorMsg} = await searchIMDBMetaDataFromAPI(imdbid);
                    if (error) {
                        throw new Error(errorMsg)
                    }
                    // valid data from api
                    context.data = result
                    return res.render("pages/dashboard/search-movie-page", {...context, keyword : imdbid})
                }

                // user submits keyword
                keyword = keyword.trim(), year = year.trim(), type = type.trim()
                // validation for corrupt data
                if (!keyword.length) {
                    throw new Error("Keyword is missing")
                }
                
                if (!["series", "movie"].includes(type)) {
                    throw new Error("Invalid category")
                }
                
                if (parseInt(year) > new Date().getFullYear()  || parseInt(year) < 1900 ) {
                    throw new Error("Year out of range")
                }

                // search in db with {keywod, year, type}
                const movies = await searchMovieMetaInDB(keyword, type, year);
                if (movies.length === 0) {
                    // no movies with said keyword in DB
                    // search keyword, year and type in API
                    const {result, error, errorMsg} = await searchMovieMetaFromAPI(keyword, type, year)
                    if (error) {
                        throw new Error(errorMsg)
                    }
                                        // valid data from api
                    // store data to db
                    const dataFromAPIDB = await storeMoviesMetaToDB([...result])
                    if (!dataFromAPIDB.success) {
                        throw new Error(dataFromAPIDB.data)
                    }
                    context.data = dataFromAPIDB.data
                    return res.render("pages/dashboard/search-movie-page", {...context, keyword: `${keyword} (${year})`})
                }
                context.data = movies
                return res.render("pages/dashboard/search-movie-page", {...context, keyword})


            case 3:
                // receives step and imdbid from body; list id from param
                let imdbidMetaData = req.body.imdbid?.trim(),
                    lid = req.params.id?.trim();
                // check if any of the input is missing
                if (!lid) {
                    throw new Error("list id is required")
                }
                if (!imdbidMetaData) {
                    throw new Error("imdbid is required")
                }
                // check if the imdbid is valid and is in movies_meta
                const validMovie = (await pool.query("SELECT * FROM movies_meta WHERE imdbid = $1 LIMIT 1", [imdbidMetaData])).rows[0]
                if (!validMovie) {
                    throw new Error("Invalid movie id")
                }
                // check if the imdbid is already present in the list 
                const existingItemInList = (await pool.query("SELECT li.itemid, lm.lid, lm.uid FROM list_meta AS lm INNER JOIN list_item AS li ON li.lid = lm.lid WHERE li.imdbid = $1 AND lm.uid = $2 AND li.lid = $3 LIMIT 1", [imdbidMetaData, req.session.uid, lid])).rows[0];

                if (existingItemInList) {
                    throw new Error("Item already present in list")
                }
                context.lid = lid;
                context.imdbid = imdbidMetaData
                context.moovey = {
                    title : validMovie.title,
                    year : validMovie.year,
                    type : validMovie.type,
                }
                // check if list already contains imdbid
                const movieAlreadyInList = (await pool.query("SELECT li.description FROM list_meta AS lm INNER JOIN list_item AS li ON li.lid = lm.lid WHERE imdbid = $1 AND lm.lid = $2 AND lm.uid = $3 LIMIT 1", [imdbidMetaData, lid, req.session.uid])).rows;

                if (movieAlreadyInList.length > 0) {
                    context.existing = {
                        description : movieAlreadyInList[0].description
                    }
                }
                // show the movie meta filled add item
                return res.render("pages/dashboard/create-edit-list-item", {...context, keyword})


            case 4:
                //  receiving {imdbid, step, description, id} from req.body
                // validate data for permission in case of attacks
                // check if any of the input is missing
                if (!id.trim()) {
                    throw new Error("list id is required")
                }
                if (!imdbid.trim()) {
                    throw new Error("imdbid is required")
                }
                // check if the imdbid is valid and is in movies_meta
                const movieFromMoviesMeta = (await pool.query("SELECT * FROM movies_meta WHERE imdbid = $1 LIMIT 1", [imdbid.trim()])).rows[0]
                if (!movieFromMoviesMeta) {
                    throw new Error("Invalid movie id")
                }
                // check if the imdbid is already present in the list 
                // PRIMARY KEY (uid, lid, imdbid) - list_item
                await pool.query(`INSERT INTO list_item (description, lid, uid, imdbid) VALUES ($1, $2, $3, $4) ON CONFLICT (uid, lid, imdbid) DO NOTHING`, 
                [description.trim(), id.trim(), req.session.uid, imdbid.trim()]);

                return res.redirect(`/dashboard/my-lists/${id}`)
            
        }
    } catch (error) {
        console.log(error);
        context.searchError = error.message;
        context.step = 1    // show the empty search movie page
        return res.render("pages/dashboard/search-movie-page", context)
    }
}


async function dashboard__removeItemFromList(req, res) {
    // receives from the request object
    const {body : {imdbid}, params : {id}, session : {uid}} = req;
    try {
        // delete from the list item when all the parameters are met. 
        const movieID = (await pool.query("DELETE FROM list_item WHERE lid = $1 AND imdbid = $2 AND uid = $3 RETURNING imdbid", 
        [id.trim(), imdbid.trim(), uid])).rows[0]
        
        if (!movieID.imdbid) {
            throw Error("invalid movie ID")
        }
        // send custom message
        const {title, year} = (await pool.query("SELECT title, year FROM movies_meta WHERE imdbid = $1 LIMIT 1", [movieID.imdbid])).rows[0];
        if (!title) {
            throw Error("invalid movie")
        }
        return res.redirect(`/dashboard/my-lists/${id}?dm=${title}(${year})`)
    } catch (error) {
        return res.redirect(`/dashboard/my-lists/${id})`)
    }
}


async function dashboard__getEditListItemPage(req, res) {
    const context = {
        title  : "Edit item",
        loggedIn : req.session?.name,
        activeDashboardLink : DASHBOARD_LINKS.lists,
        searchError : null,
        conflictDetail : null,
        formMethod : "POST"
    }
    // receives as parameters
    let {params: {id, itemid}, session : {uid}} = req;
    try {
        id = id.trim(), itemid = itemid.trim()
        if (!id) {
            throw new Error("Invalid list")
        }
        if (!itemid) {
            throw new Error("Invalid moovey")
        }
        // check if list id has itemid and list's author is active author
        const validListItem = (await pool.query("SELECT * FROM list_meta AS lm INNER JOIN list_item AS li ON li.lid = lm.lid INNER JOIN movies_meta AS mm ON mm.imdbid = li.imdbid WHERE lm.lid = $1 AND li.itemid = $2 AND lm.uid = $3 LIMIT 1", [id.trim(), itemid.trim(), uid])).rows[0];

        if (!validListItem) {
            throw Error("Invalid List")     
        }
        context.lid = validListItem.lid;
        context.imdbid = validListItem.imdbid
        context.moovey = {
            title : validListItem.title,
            year : validListItem.year,
            type : validListItem.type,
        }
        context.existing = {
            description : validListItem.description,
            actionURL : `/dashboard/my-lists/${validListItem.lid}/edit-item/${validListItem.itemid}`
        }
        return res.render("pages/dashboard/create-edit-list-item", context)
    } catch (error) {
        console.log(error.message);
        return res.redirect("/page-not-found")
    }
}

async function dashboard__updateListItem(req, res) {
    let {body : {imdbid, description}, session : {uid}, params : {id, itemid}} = req;
    try {
        description = description.trim(), id = id.trim(), itemid = itemid.trim()
        // check if the inputs are valid syntatically
        if (!id || !itemid) {
            throw new Error("Invalid URL")
        }
        // check whether list has itemid and item id has imdbid and all are created by logged user (PERMISSION)
        const validExistingItem = (await pool.query("SELECT li.description FROM list_meta AS lm INNER JOIN list_item AS li ON lm.lid = li.lid WHERE lm.uid = $1 AND lm.lid = $2 AND li.itemid = $3 AND li.imdbid = $4 LIMIT 1", [uid, id, itemid, imdbid])).rows[0]

        if (!validExistingItem) {
            return res.redirect("/page-not-found")
        }

        // check if the new description and the old description are equal. only add to database if they are different
        if (validExistingItem.description !== description) {
            await pool.query("UPDATE list_item SET description = $1 WHERE lid = $2 AND itemid = $3 AND uid = $4 AND imdbid = $5", 
            [description, id, itemid, uid, imdbid])
            return res.redirect("/dashboard/my-lists/" + id)
        }
        return res.redirect("/dashboard/my-lists/" + id)
    
    } catch (error) {
        console.log(error);
        return res.redirect("/dashboard/my-lists")
    }
}

module.exports = {
    dashboard__getAllArticles,
    dashboard__getArticleByID_RD,
    dashboard__getArticleByID_CU,


    dashboard__getMyProfile,
    dashboard__submitProfileUpdate,
    dashboard__changeProfilePic,
    dashboard__changePassword,

    dashboard__getAllLists,
    dashboard__getCreateListPage,
    dashboard__submitNewListData,
    dashboard__getListByID,
    dashboard__getListEditPage,
    dashboard__submitListEditData,
    dashboard__deleteList,

    dashboard__showSearchMovieForm,
    dashboard__addItemToList,
    dashboard__removeItemFromList,
    dashboard__getEditListItemPage,
    dashboard__updateListItem
}



async function handleMovieMetaSearch(keyword, type='movie', year) {
    if (!keyword) {
        throw new Error("search keyword missing")
    }
    if (type && !["movie", "series"].includes(type)) {
        throw new Error("search type is not valid")
    }
    let movies;
    movies = await searchMovieMetaInDB(keyword,type, year)
    
    if (!movies.length) {
        const {result, error, errorMsg} = await searchMovieMetaFromAPI(keyword, type, year);
        if (error || !result.length) {
            throw Error(errorMsg)
        }
        const {data, success} = await storeMoviesMetaToDB(result);
        
        if (!success){
            throw Error("something went wrong")
        }
        return data;
    }
    return movies
}


async function handleMovieMetaSearchByIMDB(imdb) {
    if (!imdb) {
        throw new Error("imdb ID missing")
    }
    let movie = await searchIMDBInMovieMeta(imdb);
    if (!movie) {
        const {result, error, errorMsg} = await searchIMDBMetaDataFromAPI(imdb)
        if (error) {
            throw Error(errorMsg)
        }
        return result;
    }
    return movie;
}


