const {
    minimumLength,
    validEmail, 
    maximumLength, 
    dbLikeQueryString,
    readableDateStringFormat, 
    titleCase
} = require("../functions");

const pool = require("../_Database")
const bcrypt = require("bcryptjs");
const {v4 : uuid} = require("uuid");
const mailer = require("nodemailer");
const EmailValidator = require("email-deep-validator");
const deepEmailValidator = new EmailValidator();
const { renderEmailHtml } = require("./emailTemplate");
const {
    MAIL_USER, MAIL_PASSWORD, MAIL_PORT, MAIL_HOST, SESSION_DURATION, SESSION_NAME
} = process.env;

exports.showLandingPage = async function(req, res) {
    const {name} = req.session;

    if (name) {
        return res.redirect(301, "/dashboard")
    }
    return res.render("pages/landing", 
    {   
        title: "A place for cinephiles",
        loggedIn : req.session?.name
    })
}

exports.submitLoginForm = async function(req, res) {
    try {
        let {email, password} = req.body;
        email = email.trim(), password = password.trim();
        
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
        req.session.name = existingUser.name.split(" ")[0];  
        return res.redirect("/dashboard")
            
    }
    catch(err){
        return res.render("pages/login", 
        {
            title: "Login to your Moovey account", 
            accountError : err.message
        })
    }
}

exports.submitRegisterForm = async function(req, res) {
    try {
        let {name, email, password} = req.body;
        name = name.trim(), email = email.trim(), password = password.trim();
        
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

        // check whether email is legit and not just follows a valid format
        // check for a maximum of 5s
        deepEmailValidator.options.timeout = 5000
        const {wellFormed, validDomain, validMailbox} = await deepEmailValidator.verify(email)

        if (!wellFormed) {
            throw new Error("Invalid email syntax")
        }

        if (!validDomain) {
            throw new Error("Invalid email domain")
        }

        if (!validMailbox) {
            throw new Error("Blacklisted email address.")
        }

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
        return res.redirect(301, `/login?q=${userProfile.uid}`)        
    }
    catch(err){
        return res.render("pages/register", 
        {
            title: "Register with Moovey", 
            accountError : err.message,
        })
    }
}

exports.handleLogOut = function(req, res) {
    req.session.destroy();
    res.clearCookie(SESSION_NAME, {
        httpOnly: true,
        maxAge : parseInt(SESSION_DURATION),
        sameSite : true,
    })
    return res.render("pages/login", 
    {   
        title: "Login to Moovey", 
        accountError : "logged out successfully."
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
                loggedIn : req.session?.name,
                title : `${titleCase(req.session.name)}'s Profile`, 
                profile: rows[0]
            })
    }
    catch(err){
        console.log(err);
    }
}

exports.reviewerList = async function(req, res) {
    const searchName = req.query?.q;
    const loggedIn = req.session?.name;
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
        title : "Forgot password?",
        forgotMsg : ''
    })
}

exports.resetPassword = async function(req, res) {
    try {
        let {email} = req.body;
        email = email?.trim().toLowerCase();
        if (!email) {
            throw Error("Email cannot be empty")
        }
        const existingUser = (await pool.query("SELECT * FROM users WHERE email = $1", [email])).rows[0];
        if (!existingUser) {
            throw Error("User doesn't exist")
        }
        // user exists...
        // generate a code
        const code = uuid();
        const transport = await mailer.createTransport({
            host : `${MAIL_HOST}`,
            port : MAIL_PORT,
            auth : {
                user : MAIL_USER,
                pass : MAIL_PASSWORD
            },
            subject : `Reset password for ${existingUser.name}'s Moovey•• account`,
        })
        // add code to forgot table
        const recovery = (await pool.query("INSERT INTO recover (uid, token) VALUES ($1, $2) ON CONFLICT (uid) DO UPDATE SET token = $2 RETURNING *", [existingUser.uid, code])).rows[0]

        const request = new Date(`${recovery.request_valid}`).toLocaleTimeString();

        // send mail to user
        const mailResponse = await transport.sendMail({
            from : MAIL_USER,
            subject : `Reset password for ${existingUser.name}'s Moovey•• account`,
            to : existingUser.email,
            html : renderEmailHtml({
                name : existingUser.name,
                token : recovery.token,
                validity : request,
            })
        })

        if (mailResponse?.rejected.length > 0) {
            throw Error("Recovery email couldn't be sent to your registered email ID.")
        }

        return res.render("pages/reset_password", {title: "Recover password", formMsg: '', uid : existingUser.uid})
    } catch (error) {
        console.log(error);
        return res.render("pages/forgot_password", {
            title : "Forgot password?",
            forgotMsg : error.message
        })
    }
}


exports.updatePassword = async function(req, res) {
    try {
        console.log(req.body);
        let { uid, code, newPassword, confirmPassword } = req.body;
        newPassword = newPassword.trim()
        confirmPassword = confirmPassword.trim()
        code = code.trim()
        if (newPassword !== confirmPassword){
            throw Error("Passwords don't match")
        }
        if (!minimumLength(newPassword, 6)){
            throw Error("Password must be at least 6 characters")
        }
        if (!maximumLength(newPassword, 15)){
            throw Error("Password can be of maximum 15 characters")
        }

        const resetToken = (await pool.query("SELECT * FROM recover WHERE uid = $1", [uid])).rows[0];

        for (let i = 0; i < 100; i++) {
            const tokenValidFor = new Date().getTime() - new Date(`${resetToken.request_sent}`).getTime();
            console.log("TOken generated ", Math.floor(tokenValidFor / 1000),  " seconds ago")
        }
        console.log(resetToken);



    } catch (error) {
        console.log(error);
    }
}


exports.showLoginPage = async (req, res) => {
    try {
        let errorMsg = null;
        const {q} = req.query;
        switch(q) {
            case "login-required" : 
                errorMsg = "You are not logged in or your session has expired. Please log in to continue."
                break
            case null:
            case  undefined:
                errorMsg = null
                break
            default:
                const {rows} = await pool.query(`SELECT * FROM users`);
                if (rows[rows.length - 1]?.uid === q) {
                    errorMsg = "Account created successfully. Log in to continue"
                } 
        }
        return res.render("pages/login", {title: "Login", accountError : errorMsg})
    } catch (error) {
        console.log("login error");
        console.log(error);
    }
}

exports.showRegisterPage = async (req, res) => {
    try {
        return res.render("pages/register", {title: "Register", accountError : null})
    } catch (error) {
        console.log("register error");
        console.log(error);
    }
}