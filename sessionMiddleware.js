exports.redirectToLogin = function(req, res, next) {
    if(req.session.uid){
        next();
    }
    else {
        return res.redirect("/login?q=login-required")
    }
}

exports.preventLoginRoute = function (req, res, next){
    const sId = req.session?.uid
    if(sId){
        return res.redirect("/dashboard")
    }
    next();
}