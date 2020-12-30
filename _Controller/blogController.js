const fn = require("../functions");
const pool = require("../_Database");
const axios = require('axios');

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
exports.getBlogCreateForm = function (req, res) {
    const context = {
        title : `Search Movie`,
    }
    return res.render("pages/newReview",context)
}

async function searchMovieInDB(keyword) {
    try {
        const {rows} = 
        await pool.query("SELECT * FROM movies WHERE LOWER(title) LIKE $1", 
        [`%${keyword.toLowerCase()}%`]);
        return rows;
    }
    catch(err){
        console.log("search movie in db error");
    }
}

async function searchMovieFromAPI(keyword) {
    try {
        const response = await axios({
            method : 'GET',
            url : `http://www.omdbapi.com/?apikey=${process.env.MOVIE_API_KEY}&s=${fn.slugify(keyword)}`
        })
        const {data} = response;
        storeMovieToDB(data.Search);
        return data;
    }
    catch(err){
        console.log(err);
    }
}

async function storeMovieToDB(items){
    try {
        items.forEach(async ({Poster,Title,imdbID}) => {
            const {rows} = await pool.query("SELECT * FROM movies WHERE imdbID = $1", [imdbID]);
            if(rows.length === 0){
                await pool.query("INSERT INTO movies (imdbID, title, poster) VALUES ($1,$2,$3)", 
                [imdbID,Title.toLowerCase() ,fn.reformatMovieURL(Poster)])
            }
        })
    }
    catch(err){
        return res.status(403).json({message : "store to db error", err})
    }
}

 
exports.searchMovie = async function(req, res) {
    try {
        const {keyword} = req.body;
        if(!keyword){
            return res.status(400).json({message: "Keyword cannot be empty"})
        }
        // check the database first
        const rows = await searchMovieInDB(keyword);
        if(rows.length > 0) {
            return res.status(200).json({
                rows,
                dbMode : true
            })
        }
        return res.status(200).json({data : await searchMovieFromAPI(keyword), dbMode: false})
    }   
    catch(err){
        return res.status(500).json({message: "Something went wrong", err})
    }
}