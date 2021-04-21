const {minimumLength, validEmail, maximumLength, readableDateStringFormat} = require("../functions");
const imdBB = require("imgbb-uploader");
const fs = require("fs/promises")
const pool = require("../_Database")
const bcrypt = require("bcryptjs");
const {v4 : uuid} = require("uuid")

exports.renderDisplayRoute = async function(req, res) {
    let redirect = undefined, isLoginMode = false, isRegisterMode = false, errorMsg = null;
    if (req.query?.success) {
        const {rows} = await pool.query(`SELECT * FROM users`);
        if (rows[rows.length - 1]?.uid === req.query.success) {
            redirect = "Account created successfully. Log in to continue"
            isLoginMode = true
        } 
    } else if (req.query?.redirect) {
        redirect = "You are not logged in or your session has expired. Please log in to continue."
        isLoginMode = true
    }
    return res.render("pages/landing", 
    {   
        loggedIn : false,
        title: "Welcome to your personal movie blog", 
        redirect, isLoginMode, isRegisterMode, errorMsg
    })
}

exports.submitLoginForm = async function(req, res) {
    try {
        let {loginEmail, loginPassword} = req.body;
        const email = loginEmail.trim(), password = loginPassword.trim();
        
        // valid email
        if(!minimumLength(email, 6))
            throw new Error("Email cannot be empty")
        if(!maximumLength(email, 26))
            throw new Error("Email cannot be more than 26 characters long")
        if(!validEmail(email))
            throw new Error("Invalid email format.")
        
        // valid password length
        if(!minimumLength(password, 6))
            throw new Error("Password must be at least six characters long")
        if(!maximumLength(password, 20))
            throw new Error("Password cannot more than twenty characters long.")


        // check whether user with email id exists
        const {rows} = await pool.query("SELECT * FROM users WHERE email = $1", [email]);

        if(rows.length === 0)
            throw new Error("User with credentials doesn't exist")

        const existingUser = rows[0];

        // validate password by comparing with the hash

        const isValidPassword = await bcrypt.compare(password, existingUser.password);

        if (!isValidPassword)
            throw new Error("Login credentials invalid.")

        req.session.uid = existingUser.uid;
        req.session.email = existingUser.email;
        req.session.userName = existingUser.name.split(" ")[0];  
        return res.redirect(301, "/dashboard")
            
    }
    catch(err){
        return res.render("pages/landing", 
        {
            loggedIn : false,
            title: "Welcome to your personal movie blog", 
            redirect : undefined, 
            isLoginMode : true, 
            isRegisterMode : false,
            errorMsg : err.message
        })
    }
}

exports.submitRegisterForm = async function(req, res) {
    try {
        let {registerName, registerEmail, registerPassword} = req.body;
        const name = registerName.trim(), email = registerEmail.trim(), password = registerPassword.trim();
        
        // check whether valid req.body
        if(!minimumLength(name, 2))
            throw new Error("Name must be at least two characters long")
        if(!maximumLength(name, 20))
            throw new Error("Name cannot be more than 20 characters long")


        if(!minimumLength(email, 6))
            throw new Error("Email cannot be empty.")       
        if(!maximumLength(email, 26))
            throw new Error("Email too long. Try different email ID")
        if(!validEmail(email))
            throw new Error("Invalid email format.")


        if(!minimumLength(password, 6))
            throw new Error("Password must be at least six characters long")
        if(!maximumLength(password, 20))
            throw new Error("Password cannot be more than twenty characters long")

        // check whether email unique
        const {rows} = (await pool.query("SELECT * FROM users WHERE email = $1", [email.trim()]));
        if(rows.length > 0)
            throw new Error("Email already taken. Try again with different email ID.")

        // hash password first        
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        
        // insert user to DB
        const uid = uuid()
        const user = await pool.query("INSERT INTO users (uid, name, email, password) VALUES ($1, $2, $3, $4) RETURNING *", [uid, name, email, hashedPassword]);         

        return res.redirect(301, `/?success=${user.rows[0]?.uid}`)        
    }
    catch(err){
        return res.render("pages/landing", 
        {
            title: "Welcome to your personal movie blog", 
            redirect : undefined, 
            isLoginMode : false, 
            isRegisterMode : true,
            errorMsg : err.message,
            loggedIn : false,

        })
    }
}

exports.handleLogOut = function(req, res) {
    req.session.destroy();
    res.clearCookie(process.env.SESSION_NAME)
    return res.render("pages/landing", 
    {   
        loggedIn : false,
        title: "Welcome to your personal movie blog", 
        redirect : "You have been logged out successfully.", 
        isLoginMode : true, 
        isRegisterMode : false, 
        errorMsg : false
    })
}

exports.showMyProfile = async function(req, res) {
    try {
        const {rows} = await pool.query(`SELECT * FROM users WHERE uid = $1`, [req.session.uid]);
        const showProfile = rows[0].email === req.session.email;
        delete rows[0].password;
        rows[0].showProfile = showProfile
        rows[0].date_joined = readableDateStringFormat(rows[0].date_joined)
        return res.render("pages/user_profile", 
            {
                loggedIn : true,
                title : `${req.session.userName}'s Profile`, 
                profile: rows[0]
            })
    }
    catch(er){

    }
}

exports.showEditProfilePage = async function(req, res) {
    try {
        const {rows} = await pool.query(`SELECT * FROM users WHERE uid = $1`, [req.session.uid]);
        return res.render("pages/edit_profile", 
            {
                title : `${req.session.userName}'s Profile`, 
                loggedIn : false,
                user: rows[0]
            })
    }
    catch(er){

    }
}

exports.submitEditProfile = async function(req, res) {
    const valuesArray = [...Object.values(req.body)?.map(el => el.trim() ?? "")]
    try {
        if (req.files?.picture?.name) {
            await req.files.picture.mv(req.tempPath)
            const data = await imdBB(process.env.IMGBB, req.tempPath)
            valuesArray.push(data.url);
            fs.rm(req.tempPath, {
                force : true
            })
            valuesArray.push(req.session.email);
            await pool.query(`UPDATE users SET name = $1, location = $2, quote = $3, bio = $4, picture = $5 WHERE email = $6`, valuesArray);
        } 
        else {
            valuesArray.push(req.session.email);
            await pool.query(`UPDATE users SET name = $1, location = $2, quote = $3, bio = $4 WHERE email = $5`, valuesArray);
        }   
        return res.status(302).json("")
    } catch (error) {
        return res.status(400).json("Something went wrong! pls try again")
    }
}

exports.reviewerList = async function(req, res) {
    // generate all the users and return
    const searchName = req.query?.name;
    try {
        if(searchName) {
            const cleanedName = searchName.trim().split('+').join(' ').trim();
            const {rows} = await pool.query("SELECT * FROM users WHERE name LIKE $1", [`%${cleanedName.toLowerCase()}%`]);
            return res.render("pages/user_list", {title : `Search result for "${cleanedName}"`, reviewers : rows, notFound : `No result for "${cleanedName}" found.`});
        } 
        else {
            const {rows} = await pool.query("SELECT * FROM users");
            return res.render("pages/user_list", {title : 'All reviewers', reviewers : rows, notFound : "Be the first one to join!"});
        }
    }
    catch(err) {
        console.log(err);
        return res.redirect("/")
    }
}

exports.reviewerProfile = async function(req, res) {
    const {id} = req.params, loggedUser = req.session?.email;
    try {
        const {rows} = await pool.query("SELECT * FROM users WHERE uid = $1", [id]);
        if (loggedUser && loggedUser === rows[0].email) {
            return res.redirect('/dashboard');
        }
        return res.render("pages/uder_profile", 
            {
                loggedIn : false,
                title : ``, 
                profile: rows[0] ?? []
            })
    }
    catch(err) {
        console.log(err, "profile detail error");
    }
}

exports.forgotPasswordPage = async function(req, res) {
    return res.render("pages/forgot_password", {
        title : "Forgot password?"
    })
}