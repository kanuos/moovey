const DASHBOARD_LINKS = {
    profile : "profile",
    lists : "lists",
    articles : "articles",
    favorites : "favorites",
    watchlist : "watchlist",
}


async function getMovieSearchPage(req, res){
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


module.exports = {
    getMovieSearchPage
}