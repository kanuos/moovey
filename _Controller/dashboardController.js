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

    searchMovieDetailInDB, 
    searchMovieDetailFromAPI,
    storeMoviesDetailToDB} = require("./api_DB")

// on login redirects to /dashboard
// shows the profile page of the logged user
async function dashboard__getMyProfile(req, res) {
    try {
        const context = {
            loggedIn : req.session?.name,
            title : "My Dashboard",
            dashboardMode : true,
            dashboardPageName : req.session.name + "'s profile",
            activeDashboardLink : DASHBOARD_LINKS.profile
        }
        return res.render("pages/dashboard/my-profile", context)
    } catch (error) {
        console.log(error);
    }
}

// submit the EDIT profile data
async function dashboard__postProfilePage(req, res) {
    try {
        // render the profile read page
    } catch (error) {
        
    }
}


// get the movie search result/ search page
async function dashboard__searchMovieMeta(req, res){
    try {
        const context = {
            loggedIn : req.session?.name,
            title : "My Dashboard",
            dashboardMode : true,
            dashboardPageName : "Search Movies | TV shows",
            activeDashboardLink : DASHBOARD_LINKS.watchlist,
        }
        return res.render("pages/dashboard/article[id]-write-edit", context)
        
    } catch (error) {
        console.log(error.message);
    }
}


// get all articles of the logged user
// url : /dashboard/articles
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
// url : /dashboard/articles/:id
async function dashboard__getArticleByID_RD(req, res) {
    try {
        const context = {
            loggedIn : req.session?.name,
            title : "My Dashboard",
            dashboardMode : true,
            dashboardPageName : "Article ID: " + req.params.id,
            activeDashboardLink : DASHBOARD_LINKS.articles
        }
        return res.render("pages/dashboard/article[id]-read", context)
    } catch (error) {
        console.log(error);
    }
}



// get the new article creation form/ edit existing article form
// url : /dashboard/articles/new  
// url : /dashboard/articles/:id/edit  


async function dashboard__getArticleByID_CU(req, res) {
    const context = {
        loggedIn : req.session?.name,
        title : "My Dashboard",
        dashboardMode : true,
        dashboardPageName : "Search Movies | TV shows",
        activeDashboardLink : DASHBOARD_LINKS.watchlist,
        actionURL : `/dashboard/my-articles/new`,
        searchError : '',
        step : req.body?.step,
        conflictDetail : null
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
            const movieDetail = await handleMovieDetailSearch(imdbid)
            console.log(movieDetail);
        }

        return res.render("pages/dashboard/article[id]-write-edit", context)
    } 
    catch (error) {
        context.searchError = error.message
        context.step = '0'
        return res.render("pages/dashboard/article[id]-write-edit", context)
    }
}




module.exports = {
    dashboard__searchMovieMeta,
    dashboard__getAllArticles,
    dashboard__getArticleByID_RD,
    dashboard__getArticleByID_CU,
    dashboard__getMyProfile
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



async function handleMovieDetailSearch(imdbid) {
    try {
        let movie;
        // searching movie details in the DB
        movie = await searchMovieDetailInDB(imdbid)
        if (!movie) {
            // movie detail not found in DB
            movie = await searchMovieDetailFromAPI(imdbid);
            console.log(movie);
            if (movie) {
                // movie detail not found in DB
                movie = await storeMoviesDetailToDB(imdbid);
                return movie;
            }
        }
        // movie exists in DB
        return movie;
        
    } catch {
        return null
    }
}