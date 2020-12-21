const {minimumLength, validEmail} = require("../functions");
const pool = require("../_Database")
const bcrypt = require("bcryptjs");

exports.generateLoginForm = function (req, res){
    let {redirect} = req.query;
    return res.render("pages/login", {title : "Join Now", redirect})
}

exports.generateRegisterForm = function (req, res){
    return res.render("pages/register", {title : "Create your FREE account"})
}

exports.submitLoginForm = async function(req, res) {
    try {
        let {email, password} = req.body;
        email = email.trim(), password = password.trim();
        
        // valid input
        if(!minimumLength(password, 6)){
            const error = "Password must be at least six characters long"
            return res.status(403).json({
                error, field : "password"
            })
        }
        if(!validEmail(email)){
            const error = "Invalid email format."
            return res.status(403).json({
                error, field : "email"
            })
        }

        // check whether user with email id exists
        const {rows} = await pool.query("SELECT * FROM users WHERE email = $1", [email]);

        if(rows.length === 0){
            return res.status(404).json({
                error: "User with credentials doesn't exist.",
                field: "form"
            })
        }

        const existingUser = rows[0];

        // validate password by comparing with the hash

        const isValidPassword = await bcrypt.compare(password, existingUser.password);

        if(isValidPassword){
            req.session.uid = existingUser.uid;
            req.session.userName = existingUser.name.split(" ")[0];
            return res.status(200).json({
                success : true,
                redirectTo : "/dashboard"
            })
        }
        return res.status(400).json({
            success : false,
            redirectTo : null
        })
    }
    catch(err){
        console.log(err);
    }
}


exports.submitRegisterForm = async function(req, res) {
    try {
        let {name, email, password} = req.body;
        name = name.trim(), email = email.trim(), password = password.trim();
        
        // check whether valid req.body
        
        if(!minimumLength(name, 2)){
            const error = "Name must be at least two characters long"
            return res.status(403).json({
                error, field : "name"
            })
        }
        if(!validEmail(email)){
            const error = "Invalid email format."
            return res.status(403).json({
                error, field : "email"
            })
        }
        if(!minimumLength(password, 6)){
            const error = "Password must be at least six characters long."
            return res.status(403).json({
                error, field : "password"
            })
        }
        if(password.length >= 20){
            const error = "Password should not more than twenty characters long."
            return res.status(403).json({
                error, field : "password"
            })
        }
        
        // check whether email unique
        
        const {rows} = await pool.query("SELECT * FROM users WHERE email = $1", [email.trim()]);
        if(rows.length > 0){
            const error = "Email already taken. Try again with different email ID."
            return res.status(403).json({
                error, field : "form"
            })
        }

        // hash password first
        
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        
        // insert user to DB

        await pool.query("INSERT INTO users (name, email, password) VALUES ($1, $2, $3)", [name,email, hashedPassword]);
     
        return res.json({
            url : "/login?redirect=True",
            redirected : true,
        })
    }
    catch(err){
        return res.status(404).json(err)
    }
}

exports.handleLogOut = function(req, res) {
    res.session.destroy();
    res.clearCookie(process.env.SESSION_NAME)
    return res.redirect("/login")
}
