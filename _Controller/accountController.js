const {
    minimumLength,
    validEmail, 
    maximumLength, 
} = require("../functions");

const pool = require("../_Database")
const bcrypt = require("bcryptjs");
const path = require("path")
const ejs = require("ejs")
const {v4 : uuid} = require("uuid");
const mailer = require("nodemailer");
const EmailValidator = require("email-deep-validator");
const deepEmailValidator = new EmailValidator();
const {
    MAIL_USER, MAIL_PASSWORD, MAIL_PORT, MAIL_HOST, SESSION_DURATION, SESSION_NAME
} = process.env;


/**
 * @param name          session will have a name property when logged in else null/undefined
 * @description         shows the landing page if not logged in. if logged in shows the logged in user's dashboard
 * @method              get
 * @URL :               /
 * @access              public
 */
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


/**
 * @description         shows the login page if not logged in.
 * @method              get
 * @URL :               /login
 * @access              public
 */
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
        return res.redirect("/")
    }
}


/**
 * @description         shows the register page if not logged in.
 * @method              get
 * @URL :               /register
 * @access              public
 */
exports.showRegisterPage = async (_, res) => {
    try {
        return res.render("pages/register", {title: "Register", accountError : null})
    } catch (error) {
        return res.redirect("/")
    }
}


/**
 * @param email         the request must have a valid email
 * @param password      the request must have a valid password
 * @description         Users submit their email and password combination to login
 *                      The input is validated. The password is then compared to the hashed password.
 *                      On success a user object is added to the session object 
 * @method              post
 * @URL :               /login
 * @access              public
 */
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
        const {rows} = await pool.query("SELECT * FROM users WHERE email = $1 LIMIT 1", [email]);

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


/**
 * @param name          the request must have a valid name
 * @param email         the request must have a valid email
 * @param password      the request must have a valid password
 * @description         Users submit their [email, password, name] combination to create an account
 *                      The input is validated. If no conflict of email occurs, the password is then hashed.
 *                      On success the user with hashed password is stored in database and is then redirected to /login route 
 * @method              post
 * @URL :               /register
 * @access              public
 */
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
        await pool.query("BEGIN")
        // insert into users table
        let user = (await pool.query("INSERT INTO users (uid, name, email, password) VALUES ($1, $2, $3, $4) RETURNING *", [uid, name, email, hashedPassword])).rows[0];

        if (!user || !user.uid) {
            throw new Error("Something went wrong. Please try again")
        }
        // insert into profile table
        await pool.query("INSERT INTO profile (uid) VALUES ($1)", [user.uid]);         

        await pool.query("COMMIT")
        return res.redirect(301, `/login?q=${user.uid}`)        
    }
    catch(err){
        await pool.query("ROLLBACK")
        return res.render("pages/register", 
        {
            title: "Register with Moovey", 
            accountError : err.message,
        })
    }
}


/**
 * @description         Logged in user is logged out. Session and cookies are cleared and then redirected to /login route 
 * @method              get
 * @URL :               /logout
 * @access              private
 */
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


/**
 * @description         Show all the users. Users can be searched by name. Sorted by name, overall ratings based on lists & reviews
 *                      pagination of 24 users per page 
 * @method              get
 * @URL :               /reviewers
 * @access              public
 */
exports.reviewerList = async function(req, res) {
    let searchName = req.query?.q?.trim() || '';
    const loggedIn = req.session?.name;
    try {
        if(searchName) {
            const {rows} = await pool.query(`SELECT u.name,u.uid, picture, location, bio, facebook, twitter, website, COUNT(DISTINCT lm.lid) AS totalLists, 
                COUNT(DISTINCT b.blog_id) AS totalBlogs FROM 
                users AS u INNER JOIN profile AS p ON u.uid = p.uid 
                LEFT JOIN list_meta AS lm ON lm.uid= u.uid 
                LEFT JOIN blogs AS b ON b.uid = u.uid 
                WHERE name ILIKE $1
                GROUP BY u.uid, u.name, picture, location, bio, facebook, twitter, website;`, ["%"+searchName+"%"]);
            
            return res.render("pages/user_list", {
                title : `Reviewers with the name "${searchName.toUpperCase()}"`, 
                reviewers : rows, 
                searchName, 
                loggedIn
            });
        } 
        else {
            const {rows} = await pool.query(`SELECT u.name,u.uid, picture, location, bio, facebook, twitter, website, COUNT(DISTINCT lm.lid) AS totalLists, 
                COUNT(DISTINCT b.blog_id) AS totalBlogs FROM 
                users AS u INNER JOIN profile AS p ON u.uid = p.uid 
                LEFT JOIN list_meta AS lm ON lm.uid= u.uid 
                LEFT JOIN blogs AS b ON b.uid = u.uid 
                GROUP BY u.uid, u.name, picture, location, bio, facebook, twitter, website;`);
        
            return res.render("pages/user_list", {title : 'All reviewers', reviewers : rows, searchName, loggedIn});
        }
    }
    catch(err) {
        return res.redirect("/reviewer-not-found")
    }
}


/**
 * @param id            uuid signifying a user's uid
 * @description         Show the profile page for user with uid of [id]. if not redirected to 404-not-found page 
 *                      If user/[id] and logged user are the same, show a link to open in dashboard
 *                      tab 1 : show the basic info of the user
 *                      tab 2 : show the reviews by the user
 *                      tab 3 : show the lists created by the user
 *                      tab 4 : show the movies/shows added to watchlist by user
 *                      tab 5 : show the movies/shows added to favorites by user
 * @method              get
 * @URL :               /reviewers/:id
 * @access              public
 */
exports.reviewerProfile = async function(req, res) {
    const {id} = req.params, loggedUser = req.session?.email;
    try {
        const {rows} = await pool.query("SELECT * FROM users INNER JOIN profile ON users.uid = profile.uid WHERE users.uid = $1 LIMIT 1", [id]);
        if(rows[0]){
            delete rows[0].password
        }
        return res.render("pages/user_profile", 
            {
                loggedIn : loggedUser,
                authorized : req.session?.uid === rows[0].uid,
                title : ``, 
                profile: rows[0]
            })
    }
    catch(err) {
        return res.redirect("/")
    }
}


/**
 * @description         if user clicks on forgot-password this method is invoked. 
 * @method              get
 * @URL :               /forgot-password
 * @access              public
 */
exports.forgotPasswordPage = async function(_, res) {
    try {

        return res.render("pages/forgot_password", {
            title : "Forgot password?",
            forgotMsg : '',
            step : 1
        })
    } catch (error) {
        return res.redirect("/")
    }
}


/**
 * @param email         a valid email ID
 * @description         an email is submitted. this email is checked in the database. if no user is found for the email ID
 *                      a failure email is sent. if user is found a random token is created. a URL consiting of userID and token 
 *                      is sent to the emailID as a success mail with the reset link. the token is hashed and stored alongside 
*                       the  user id and a validity of 10 mins to the recover table 
 * @method              post
 * @URL :               /forgot-password
 * @access              public
 */
exports.submitForgotPassword = async function(req, res) {
    try {
        let {body : {email}, protocol, headers : {host} } = req;
        email = email?.trim().toLowerCase();
        if (!email) {
            throw Error("Email cannot be empty")
        }
        const user = (await pool.query("SELECT uid, name FROM users WHERE email = $1 LIMIT 1", [email])).rows[0]
        // no explicit user check to mitigate hack attacks trying to get access to user email
        // send mail to entered email
        // if invalid mail return error 
        // only a valid email address holder can access the reset token anyway

        // step 0: create the mail sending transport client
        const transport = await mailer.createTransport({
            host : `${MAIL_HOST}`,
            port : MAIL_PORT,
            auth : {
                user : MAIL_USER,
                pass : MAIL_PASSWORD
            },
        })
        let mailResponse;

        // Step 1: send the failure mail to the email ID if email ID is syntactically corrent but doesn't exist
        if (!user) {
            const failureEmail = await ejs.renderFile(path.resolve(path.dirname(__dirname), "View", "email", "failure.ejs"))
            mailResponse = await transport.sendMail({
                from : MAIL_USER,
                to : email,
                html : failureEmail,
                subject : "M°ovey - Reset Password"    
            })
        } 
        // if user is valid
        // Step 2:  Create a random reset token and store the hash in the database
        else {
            // check whether the user already has a valid token in recover table and deleting if item is found
            const token = uuid()
            const hashedToken = await bcrypt.hash(token, 10);
            // insert the user and hashed token to DB
            const {rows} = await pool.query("INSERT INTO recover (uid, token, request_sent, request_valid) VALUES ($1, $2, $3, $4) ON CONFLICT (uid) DO UPDATE SET token = $2, request_sent = $3, request_valid = $4 RETURNING *", 
            [user.uid, hashedToken, new Date().toISOString(), new Date(Date.now() + 10 * 60 * 1000).toISOString()])
            
            // create success email
            const resetURL = `${protocol}://${host}/reset-password?u=${token}&t=${user.uid}`
            const successEmail = await ejs.renderFile(path.resolve(path.dirname(__dirname), "View", "email", "success.ejs"), {user : user.name, resetURL, validTill : rows[0].request_valid})
            mailResponse = await transport.sendMail({
                from : MAIL_USER,
                to : email,
                html : successEmail,
                subject : "M°ovey - Reset Password"
            })

        }

        if (mailResponse?.rejected.length > 0) {
            throw Error("Recovery email couldn't be sent to your email ID.")
        }

        return res.render("pages/forgot_password", {
            title : "Forgot password?",
            forgotMsg : '',
            step : 2,
            mailSuccessfullySent : true
        })
    } catch (error) {
        return res.render("pages/forgot_password", {
            title : "Forgot password?",
            forgotMsg : error.message,
            step : 1
        })
    }
}


/**
 * @query               t = valid user id and u = valid token. 
 * @description         a mail with reset link is sent to the email mailbox. on opening the link, a new page with new password and
 *                      confirm password fields is sent. 
 * @method              get
 * @URL :               /forgot-password
 * @access              public
 */
exports.getResetPasswordPage = async function(req, res) {
    try {
        const {t, u} = req.query;
        const token = u.trim();
        if (!u || !t){
            throw new Error("Invalid link format")
        }
        // check if user and token are valid.. if valid redirect
        const userTokenCombo = (await pool.query("SELECT name, token, request_valid, recover.uid FROM recover INNER JOIN users ON recover.uid = users.uid WHERE recover.uid = $1 LIMIT 1", [t.trim()])).rows[0];

        if (!userTokenCombo) {
            throw new Error("Invalid password reset URL")
        }

        // if expired token
        const isExpired = new Date(userTokenCombo.request_valid) > new Date(new Date().toISOString());

        if (!isExpired) {
            await pool.query("DELETE FROM recover WHERE uid = $1",[t.trim()])
            throw new Error("Password reset link expired.")
        }

        // check if valid token
        const isValid = await bcrypt.compare(token, userTokenCombo.token);

        if (!isValid) {
            throw new Error("Invalid or tampered reset URL")
        }

        return res.render("pages/reset_password", {
            title : "Forgot password?",
            t, u,
            accountError : '',
            user : {
                name : userTokenCombo.name
            }
        })
    } catch (error) {
        return res.render("pages/forgot_password", {
            title : "Forgot password?",
            forgotMsg : error.message,
            step : 1
        })
    }
}


/**
 * @param newPassword       a valid new password
 * @param confirmPassword   a valid confirm password that must be equal to the newPassword
 * @description             an email is submitted. this email is checked in the database. if no user is found for the email ID
    *                       a failure email is sent. if user is found a random token is created. a URL consiting of userID and token 
    *                       is sent to the emailID as a reset link. the token is hashed and stored alongside the user id and a                       validity of 10 mins to the recover table 
 * @method                  post
 * @URL :                   /forgot-password
 * @access                  public
 */
exports.submitNewPassword = async function(req, res) {
    const context = {
        title : "Forgot password?",
        accountError : null,
        user : {name : null}
    }
    try {
        let {t, u} = req.query;
        // IF THE URL IS CORRUPT
        if (!t || !u) {
            throw new Error("Tampered link")
        }
        t = t.trim(), u = u.trim();
        context.t = t, context.u = u

        // IF THE URL IS NOT CORRUPT BUT HAS BEEN TAMPERED
        const recoveryToken = (await pool.query("SELECT * FROM recover INNER JOIN users ON recover.uid = users.uid WHERE recover.uid = $1 LIMIT 1", [t])).rows[0]
        
        if (!recoveryToken){
            throw new Error("Invalid password reset link")
        }
        const isValidToken = await bcrypt.compare(u, recoveryToken.token);

        if (!isValidToken) {
            throw new Error("Invalid password reset link 1001")
        }
        
        context.user.name = recoveryToken.name 

        let {newPassword, confirmPassword} = req.body;
        if (!newPassword || !confirmPassword) {
            throw new Error("New password and confirm password required")
        }
        newPassword = newPassword.trim(), confirmPassword = confirmPassword.trim()
        
        if(!minimumLength(newPassword, 6))
            throw new Error("Password must be at least six characters long")

        if(!maximumLength(newPassword, 20))
            throw new Error("Password cannot be more than twenty characters long")

        if (newPassword !== confirmPassword) {
            throw new Error("Passwords don't match")
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);
        await pool.query("BEGIN")
        await pool.query("UPDATE users SET password = $1 WHERE uid = $2", [hashedPassword, t.trim()])
        await pool.query("DELETE FROM recover WHERE uid = $1",[t.trim()])
        await pool.query("COMMIT")


        return res.render("pages/login", {title: "Login", accountError : "Reset successful. Login to continue"})
    } catch (error) {
        await pool.query("ROLLBACK")
        return res.render("pages/reset_password", {
            ...context,
            accountError : error.message,
        })
    }
}

