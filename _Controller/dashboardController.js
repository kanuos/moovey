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


// // get the movie search result/ search page
// async function dashboard__searchMovieMeta(req, res){
//     try {
//         const context = {
//             loggedIn : req.session?.name,
//             title : "My Dashboard",
//             dashboardMode : true,
//             dashboardPageName : "Search Movies | TV shows",
//             activeDashboardLink : DASHBOARD_LINKS.watchlist,
//         }
//         return res.render("pages/dashboard/article[id]-write-edit", context)
        
//     } catch (error) {
//         console.log(error.message);
//     }
// }


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
    try {
        const context = {
            loggedIn : req.session?.name,
            title : "My Dashboard | My Articles",
            dashboardMode : true,
            dashboardPageName : req.session?.name + " lists",
            activeDashboardLink : DASHBOARD_LINKS.lists
        }
        return res.render("pages/dashboard/lists", context)
    } catch (error) {
        console.log(error);
    }
}



// show the create new list/edit list page for the logged user
// url : /dashboard/articles
async function dashboard__getCreateListPage(req, res) {
    const context = {
        loggedIn : req.session?.name,
        title : "My Dashboard | My Lists",
        dashboardMode : true,
        dashboardPageName : "Create new list",
        activeDashboardLink : DASHBOARD_LINKS.lists,
        pageError : false,
        actionURL : "/dashboard/my-lists/new",
        conflictDetail : false
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
        conflictDetail : false
    }
    try {
        const {title, description} = req.body;
        // check if inputs are valid or not
        if (!title.trim().length) {
            throw new Error("Title is required")
        }
        
        // check if list with same title by user already exists or not
        const {rows} = (await pool.query("SELECT lid, title, date_created FROM list_meta WHERE title = $1 AND uid = $2 LIMIT 1", [title.toLowerCase(), req.session.uid]))
        
        if (rows.length === 1) {
            context.conflictDetail = row[0]
            throw new Error("List with the same title already exists")
        }

        // insert list metadata into database
        const newListID = (await pool.query("INSERT INTO list_meta (title, description, uid) VALUES ($1, $2, $3) RETURNING lid", 
        [title.toLowerCase().trim(), description.toLowerCase().trim(), req.session.uid])).rows[0]


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
        actionURL : "/dashboard/my-lists/new",
    }
    try {
        const {id} = req.params;
        // check if list with same title by user already exists or not
        const {rows} = (await pool.query("SELECT lm.lid, lm.date_created, lm.uid,  lm.description as list_desc, lm.title as list_title FROM list_meta AS lm LEFT JOIN list_item AS li ON lm.lid = li.lid WHERE lm.lid = $1 AND lm.uid = $2 LIMIT 1", [id, req.session.uid]))
        
        if (rows.length === 0) {
            throw new Error("List with the same title already exists")
        }
        context.listData = rows[0];
        context.listData.listDeleteURL = `/dashboard/my-lists/${context.row[0].lid}/delete`

        return res.render("pages/dashboard/list[id]-read", context)
    } catch (error) {
        return res.redirect("/page-not-found")
    }
}










module.exports = {
    // dashboard__searchMovieMeta,
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
    dashboard__getListByID
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


