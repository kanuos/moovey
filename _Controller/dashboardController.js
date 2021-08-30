const DASHBOARD_LINKS = {
    profile : "profile",
    lists : "lists",
    articles : "articles",
    favorites : "favorites",
    watchlist : "watchlist",
}


// on login redirects to /dashboard
// shows the profile page of the logged user
async function dashboard__getProfilePage(req, res) {
    try {
        // render the profile read page
    } catch (error) {
        
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
async function dashboard__getMovieSearchPage(req, res){
    try {
        const context = {
            loggedIn : req.cookie,
            title : "My Dashboard",
            dashboardMode : true,
            dashboardPageName : "Search Movies | TV shows",
            activeDashboardLink : DASHBOARD_LINKS.watchlist
        }
        return res.render("pages/dashboard/search-movie-page", context)
        
    } catch (error) {
        console.log(error.message);
    }
}


// get all articles of the logged user
// url : /dashboard/articles
async function dashboard__getAllArticles(req, res) {
    try {
        const context = {
            loggedIn : req.cookie,
            title : "My Dashboard",
            dashboardMode : true,
            dashboardPageName : "Article ID: " + req.params.id,
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
            loggedIn : req.cookie,
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
    try {
        const context = {
            loggedIn : req.cookie,
            title : "My Dashboard",
            dashboardMode : true,
            dashboardPageName : "Search Movies | TV shows",
            activeDashboardLink : DASHBOARD_LINKS.watchlist
        }
        return res.render("pages/dashboard/article[id]-write-edit", context)
    } catch (error) {
        console.log(error);
    }
}

module.exports = {
    dashboard__getMovieSearchPage,
    dashboard__getAllArticles,
    dashboard__getArticleByID_RD,
    dashboard__getArticleByID_CU
}