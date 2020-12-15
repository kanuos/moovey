exports.generateLoginForm = function (req, res){
    return res.render("pages/login", {title : "Join Now"})
}

exports.generateRegisterForm = function (req, res){
    return res.render("pages/register", {title : "Create your FREE account"})
}