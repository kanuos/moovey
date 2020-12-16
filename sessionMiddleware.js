exports.redirectToLogin = function(req, res, next) {
    if(req.session.uid){
        next();
    }
    else {
        return res.redirect("/login")
    }
}

exports.preventLoginRoute = function (req, res, next){
    if(req.session.uid){
        return res.redirect("/blogs")
    }
    else {
        next();
    }
}