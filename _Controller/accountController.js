const {
    minimumLength, 
    validEmail, 
    maximumLength, 
    dbLikeQueryString,
    readableDateStringFormat, 
    titleCase
} = require("../functions");
const imdBB = require("imgbb-uploader");
const fs = require("fs/promises")
const pool = require("../_Database")
const bcrypt = require("bcryptjs");
const {v4 : uuid} = require("uuid")

exports.renderDisplayRoute = async function(req, res) {
    let redirect = undefined, isLoginMode = false, isRegisterMode = false, errorMsg = null;
    if(req.route.path === "/login"){
        isLoginMode = true
    }
    else if (req.query?.success) {
        const {rows} = await pool.query(`SELECT * FROM users`);
        if (rows[rows.length - 1]?.uid === req.query.success) {
            redirect = "Account created successfully. Log in to continue"
            isLoginMode = true
        } 
    } 
    else if (req.query?.redirect) {
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
        let user = await pool.query("INSERT INTO users (uid, name, email, password) VALUES ($1, $2, $3, $4) RETURNING *", [uid, name, email, hashedPassword]);         
        let profile = await pool.query("INSERT INTO profile (uid) VALUES ($1) RETURNING *", [user.rows[0].uid]);         
        const userProfile = {...user.rows[0], ...profile.rows[0]}
        console.log(userProfile);
        return res.redirect(301, `/?success=${userProfile.uid}`)        
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
        const {rows} = await pool.query(`SELECT * FROM users INNER JOIN profile ON users.uid = profile.uid WHERE users.uid = $1`, [req.session.uid]);
        const showProfile = rows[0].email === req.session.email;
        delete rows[0].password;
        rows[0].showProfile = showProfile
        rows[0].date_joined = readableDateStringFormat(rows[0].date_joined)
        rows[0].blogs = []
        rows[0].lists = []
        rows[0].recommendations = []
        rows[0].watchlist = []
        return res.render("pages/user_profile", 
            {
                loggedIn : true,
                title : `${titleCase(req.session.userName)}'s Profile`, 
                profile: rows[0]
            })
    }
    catch(err){
        console.log(err);
    }
}

exports.showEditProfilePage = async function(req, res) {
    try {
        const {rows} = await pool.query(`SELECT * FROM users JOIN profile ON profile.uid = users.uid WHERE users.uid = $1`, [req.session.uid]);
        delete rows[0].password
        rows[0].date_joined = readableDateStringFormat(rows[0].date_joined)
        console.log("show edit page for ", rows[0]);
        return res.render("pages/edit-profile", 
            {
                title : `${titleCase(req.session.userName)}'s Profile`, 
                loggedIn : true,
                authorized : req.session.uid === rows[0].uid ? true: false,
                profile: rows[0]
            })
    }
    catch(er){
        console.log("edit profile err, ", er);
    }
}

exports.submitEditProfile = async function(req, res) {
    //   {
    //     new_name: '',
    //     location: '',
    //     bio: '',
    //     facebook: '',
    //     twitter: '',
    //     'your instagram account link': 'sounak.theone@gmail.com',
    //     current_password: '1234',
    //     new_password: '',
    //     confirm_password: ''
    //   } null
    console.log(req.body, req.files);

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
    const searchName = req.query?.q;
    const loggedIn = req.session?.uid;
    try {
        if(searchName) {
            const cleanedName = searchName.trim().split('+').join(' ').trim();
            const {rows} = await pool.query(`SELECT u.uid, name, picture, count(b.blog_id) AS blogs
            FROM users AS u INNER JOIN profile AS p ON u.uid = p.uid LEFT JOIN blogs AS b ON b.uid = u.uid
            GROUP BY u.uid, name, picture WHERE name LIKE $1;`, 
            [dbLikeQueryString(`%${cleanedName.toLowerCase()}%`)]);
            
            return res.render("pages/user_list", {title : `Search result for "${cleanedName}"`, reviewers : rows, notFound : `No result for "${cleanedName}" found.`, loggedIn});
        } 
        else {
            const {rows} = await pool.query(`SELECT u.uid, name, picture, count(b.blog_id) AS blogs
            FROM users AS u INNER JOIN profile AS p ON u.uid = p.uid LEFT JOIN blogs AS b ON b.uid = u.uid
            GROUP BY u.uid, name, picture`);
        
            return res.render("pages/user_list", {title : 'All reviewers', reviewers : rows, notFound : "Be the first one to join!", loggedIn});
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
        const {rows} = await pool.query("SELECT * FROM users INNER JOIN profile ON users.uid = profile.uid WHERE users.uid = $1", [id]);
        if (loggedUser && loggedUser === rows[0].email) {
            return res.redirect('/dashboard');
        }
        if(rows[0]){
            delete rows[0].password
        }
        console.log(rows[0],loggedUser,req.session?.uid === rows[0].uid);
        return res.render("pages/user_profile", 
            {
                loggedIn : loggedUser,
                authorized : req.session?.uid === rows[0].uid,
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