const fn = require("../functions")
// return all the blogs 
// public view
exports.getAllBlogs = function (req, res) {
    return res.json("Show all blogs.. public blogs")
}

// return blog with id 
// public view
exports.getBlogWithID = function (req, res) {
    return res.json("Show blog with id: " + req.params.id)
}

// return the user dashboard 
// private view
exports.getUserDashboard = function (req, res) {
    let {userName} = req.session;
    userName = fn.titleCase(userName);
    const context = {
        title : `${userName}'s dashboard`,
        user : userName
    }
    return res.render("pages/dashboard",context)
}

// return the movie search UI 
// private view
exports.movieSearch = function (req, res) {
    const context = {
        title : `Search Movie`,
    }
    return res.render("pages/newReview",context)
}
