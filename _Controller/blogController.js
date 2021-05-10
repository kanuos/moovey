const fn = require("../functions");
const pool = require("../_Database");
const axios = require('axios');
const format = require("pg-format");


exports.getAllBlogs = async function(req, res) {
    try{
        const {rows} = await pool.query("SELECT * FROM blogs");
        const context = {
            title : `Our moovey reviews `,
            loggedIn : req.session?.uid,
            message : "Search keyword cannot be empty.",
            data : rows ?? []
        }
        return res.render("pages/search_movie",context)
    }
    catch(err){
        return res.redirect("/dashboard")
    }
}

exports.getBlogCreateForm = async function (req, res) {
    // since this comes after search movie. the imdbid should already be in movies_meta
    try{
        const {imdbID} = req.query;
        let context;
        // if imdbid is not present in the request
        const movie = await searchMovieInDB(imdbID, true);
        console.log(movie);
        if (!movie.length){
            return res.redirect("/pageNotFound")
        }
        // imdbid is already present in movies_meta
        // search if movie detail exists in db
        const movies = await getMovieDetailFromDB(imdbID)
        if (movies.length > 0){
            context = {
                title : `Search Movie`,
                loggedIn : true,
                message : "",
                data : movies[0]
            }
            return res.render("pages/blog_create_form",context)
        }
        // data doesn't exist in movies_detail table
        const data = await getMovieDetailFromAPI(imdbID) 
        context = {
            title : `Search Movie`,
            loggedIn : true,
            message : "",
            data
        }
        return res.render("pages/blog_create_form",context)
    }
    catch(err){
        console.log(err);
        return res.redirect("/moovey/")
    }
}

async function searchMovieInDB(keyword, searchById=false) {
    try {
        let sql;
        if (searchById){
            sql = format("SELECT * FROM movies_meta WHERE imdbid = '%s'",keyword)
        }
        else{
            sql =format("SELECT * FROM movies_meta WHERE LOWER(title) LIKE %s",fn.dbLikeQueryString(keyword))
        }
        const {rows} =  await pool.query(sql);
        console.log(rows);
        return rows;
    }
    catch(err){
        return searchById ? null : []
    }
}

async function searchMovieFromAPI(keyword, searchById=false) {
    try {
        console.log("search movies from api, ", keyword, searchById)
        const url = searchById ? `http://www.omdbapi.com/?apikey=${process.env.MOVIE_API_KEY}&i=${keyword}` : `http://www.omdbapi.com/?apikey=${process.env.MOVIE_API_KEY}&s=${keyword}` 
        const {data} = await axios({
            method : 'GET',
            url,
        })
        console.log(data, url);
        if (!data || data.Error){
            throw data.Error
        }
        if (searchById){
            const dataArray = [data];
            return await storeMovieToDB(dataArray);
        }
        return await storeMovieToDB(data.Search);
    }
    catch(err){
        console.log(err);
        return null;
    }
}

async function getMovieDetailFromDB(imdbid){
    try{
        const {rows} = await pool.query("SELECT * FROM movies_meta INNER JOIN movies_detail ON movies_meta.imdbid = movies_detail.imdbid WHERE movies_meta.imdbid = $1", [imdbid])
        return rows;
    }
    catch{
        return null
    }
}

async function getMovieDetailFromAPI(imdbid){
    try {
        const {data} = await axios({
            method : 'GET',
            url : `http://www.omdbapi.com/?apikey=${process.env.MOVIE_API_KEY}&i=${imdbid}&plot=full`
        })
        if (data.Response === "False"){
            throw Error
        }
        const movie = await pool.query("INSERT INTO movies_detail (imdbid, metadata) VALUES ($1, $2) RETURNING *", [imdbid, fn.formatAPIResponse(data)]);
        return movie?.rows[0];
    }
    catch{
        return null;
    }
}

async function storeMovieToDB(items){
    if (items?.length > 1){
        valuesArray = items.map(item => {
            return Object.values(item)
        })
    } 
    try {
        const sql = format("INSERT INTO movies_meta (title, year, imdbID, type, poster) VALUES %L ON CONFLICT (imdbID) DO NOTHING RETURNING *", valuesArray)
        const {rows} = await pool.query(sql);
        console.log(rows);
        return rows;
        }
    catch(err){            
        return null;
    }
}
 
exports.searchMovie = async function(req, res) {
    try {
        const {keyword} = req.body;
        let key = fn.slugify(keyword)
        if(!key){
            const context = {
                title : `Search `,
                loggedIn : true,
                message : "Search keyword cannot be empty.",
                data : []
            }
            return res.render("pages/search_movie",context)
        }
        // check the database first
        const rows = await searchMovieInDB(keyword);
        if(rows?.length > 0) {
            const context = {
                title : `Search | ${keyword}`,
                loggedIn : true,
                message : "",
                data : rows ?? [],
            }
            console.log(keyword, " is in db");
            return res.render("pages/search_movie",context)
        }
        const data = await searchMovieFromAPI(key);
        const context = {
            title : `Search | ${keyword}`,
            loggedIn : true,
            message : "",
            data,
        }
        return res.render("pages/search_movie",context)
    }   
    catch(err){
        console.log(err);
        const context = {
            title : `Search`,
            loggedIn : true,
            message : err ?? "",
            data : []
        }
        return res.render("pages/search_movie",context)
    }
}


exports.addNewReview = async function(req, res) {

}