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
        [`%${fn.dbLikeQueryString(keyword)}%`]);
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
        if (data.Error){
            return [];
        }
        storeMovieToDB(data.Search);
        return data.Search;
    }
    catch(err){
        console.log(err);
    }
}

exports.getMovieDetailFromAPI = async function(req, res){
    try {
        const {imdbid} = req.body;
        if(!imdbid.trim().length > 0) {
            return res.status(403).json({
                data : [],
                error : true
            })
        }
        const {data} = await axios({
            method : 'GET',
            url : `http://www.omdbapi.com/?apikey=${process.env.MOVIE_API_KEY}&i=${imdbid}`
        })
        // if data is not empty update the movies db with imdbid
        if (data.hasOwnProperty('Plot') && data.hasOwnProperty('imdbRating')){
            const {rows} = await pool.query(`UPDATE movies SET 
            plot = $1, imdbRating = $2, actors = $3, genre = $4, released = $5,
            director = $6 WHERE imdbID = $7 RETURNING *`, 
            [
                data.Plot,data.imdbRating, JSON.stringify(data.Actors), 
                JSON.stringify(data.Genre), JSON.stringify(data.Released),
                JSON.stringify(data.Director), imdbid
            ])
            return res.status(200).json({
                data: rows[0],
                error: false
            });
        }
    }
    catch(err){
        console.log('get movie detail error');
        console.log(err);
        console.log('get movie detail error');
        return res.status(400).json(err)
    }
}

async function storeMovieToDB(items){
    console.log(items);
    try {
        items.forEach(async ({Poster,Title,imdbID}) => {
            const {rows} = await pool.query("SELECT * FROM movies WHERE imdbID = $1", [imdbID]);
            if(rows.length === 0){
                await pool.query("INSERT INTO movies (imdbID, title, poster) VALUES ($1,$2,$3)", 
                [imdbID,Title.toLowerCase() ,Poster])
            }
        })
    }
    catch(err){
        console.log("store to db error ",err);
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
                data : rows,
                dbMode : true
            })
        }
        return res.status(200).json({data : await searchMovieFromAPI(keyword), dbMode: false})
    }   
    catch(err){
        return res.status(500).json({message: "Something went wrong", err})
    }
}