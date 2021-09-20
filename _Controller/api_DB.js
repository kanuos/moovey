const axios = require("axios").default
const pool = require("../_Database");
const format = require("pg-format");

const {slugify, reformatMovieURL} = require("../functions")

const {MOVIE_API_KEY, MOVIE_API_URL} = process.env

const RESPONSE_BOOL = {
    "True" : true, 
    "False" : false
}


// search movies metadata from DB ♥ by keyword, type and year
async function searchMovieMetaInDB(keyword, type="movie", year){
    try {
        let sql;
        if (!year) {
            sql = format("SELECT * FROM movies_meta WHERE title ILIKE '%%%s%%' AND type = '%s'", keyword.toLowerCase(), type);
        }
        else {
            sql = format("SELECT * FROM movies_meta WHERE title ILIKE '%%%s%%' AND type= '%s' AND year= '%s'", keyword.toLowerCase(), type, year);
        }
        const {rows} = await pool.query(sql);
        if (rows.length === 0){
            throw Error
        }        
        return rows;
    } catch (error) {
        return [];
    }
}

// search movies metadata from API ♥ by keyword, type and year
async function searchMovieMetaFromAPI(keyword, type="movie", year){

    try {       
        let movies = []
        let page = 1;
        const params = {
            s : slugify(keyword.toLowerCase()),
            apiKey : MOVIE_API_KEY,
            page
        }
        if (type && ["movie", "series"].includes(type)) {
            params.type = type
        }
        if (year && (year >= 1900 && year <= new Date().getFullYear()) ) {
            params.y = year
        }
        const url = MOVIE_API_URL
        const {data} = await axios({
            url,
            params
        })

        if (data.totalResults > 50) {
            throw Error("too many results")
        }

        if (data.Error) {
            throw Error(`${type} with keyword "${keyword}" ${year && "(year)"} not found`)
        }
    
   
        movies = [...movies, ...data.Search]
    
        for (let i = 2; i <= Math.round(data.totalResults / 10); i++) {
            params.page = i;
            const {data} = await axios({
                url,
                params
            })
            if (data.Error) {
                throw Error(data.Error)
            }
            movies = [...movies, ...data.Search]
        }
        movies = movies.map(movie => ({...movie, Poster: reformatMovieURL(movie.Poster)}));
        return {
            result : movies,
            error: false,
            errorMsg : null
        }
    } catch (error) {
        return {
            result : [],
            error : true,
            errorMsg : error.message
        }
    }
}

// search movies metadata from DB ♥ by imdbid
async function searchIMDBInMovieMeta(imdbid){
    try {
        const {rows} = await pool.query("SELECT * FROM movies_meta WHERE imdbid = $1 LIMIT 1", [imdbid]);
        return rows;
    } catch (error) {
        return null;
    }
}

// search movie metadata from API ♥ by imdbid
async function searchIMDBMetaDataFromAPI(imdbid){

    try {       
        const params = {
            i : imdbid.trim(),
            apiKey : MOVIE_API_KEY,
        }
        const url = MOVIE_API_URL
        const {data} = await axios({
            url,
            params
        })
        if (!RESPONSE_BOOL[data.Response]) {
            throw Error(data.Error)
        }
        
        // store to movies_meta and movies_details
        // step 1: insert into movies_meta
        await pool.query("BEGIN")
        const result = (await pool.query("INSERT INTO movies_meta (title, year, imdbid, type, poster) VALUES ($1, $2, $3, $4, $5) ON CONFLICT DO NOTHING RETURNING *", 
        [data.Title, data.Year, data.imdbID, data.Type, reformatMovieURL(data.Poster)])).rows
        // STEP 2 : INSERT INTO movies details table 
        await pool.query("INSERT INTO movies_detail (imdbid, metadata) VALUES ($1, $2) ON CONFLICT(imdbid, metadata) DO NOTHING RETURNING *", [data.imdbID, JSON.stringify(data)])
        // commit the transaction
        await pool.query("COMMIT")
        
        
        return {
            result,
            error: false,
            errorMsg : null
        }
    } catch (error) {
        await pool.query("ROLLBACK")
        return {
            result : undefined,
            error : true,
            errorMsg : error.message
        }
    }
}



// store movie meta  to database 
async function storeMoviesMetaToDB(movies){
    try {
        const movieValues = movies.map(movie => Object.values(movie))
        const sql = format("INSERT INTO movies_meta (title, year, imdbid, type, poster) VALUES %L ON CONFLICT (imdbid) DO NOTHING RETURNING *", movieValues);
        const data = (await pool.query(sql)).rows;
        return {
            data,
            success : true
        }
    } catch (error) {
        console.log(error);
        return {
            data : "Something went wrong",
            success : false
        }
    }
}









/**
 * 
 * MOVIES DETAIL SECTION
 * 
 */

async function handleMovieDetailSearch(imdbid) {
    try {
        // check if imdbid is invalid
        if(!imdbid){
            throw Error("Invalid imdbid")
        }
        // search in database 
        const movieFromDB = (await pool.query("SELECT * FROM movies_detail WHERE imdbid = $1 LIMIT 1", [imdbid])).rows;
        if (movieFromDB.length === 0) {
            // if movie not in db
            // step 1: search movie detail from API
            const {data} = (await axios({
                url : MOVIE_API_URL,
                method : "GET",
                params : {
                    apiKey : MOVIE_API_KEY,
                    i : imdbid.trim(),
                    plot : "full"
                }
            }))
    
            if (!RESPONSE_BOOL[data.Response]) {
                throw Error(data.Error)
            }
    
            // storet the api data to DB
            const movie = (await pool.query("INSERT INTO movies_detail (imdbid, metadata) VALUES ($1, $2) ON CONFLICT(imdbid, metadata) DO NOTHING RETURNING *", [imdbid, data])).rows

            if (!movie) {
                throw new Error("Something went wrong")
            }
    
            return {
                result : movie,
                error : false,
                errorMsg : null
            }
        }
        return {
            result : movieFromDB, 
            error : false, 
            errorMsg : null
        }
        
    } catch (error) {
        return {
            result : [], 
            error : true, 
            errorMsg : error.message
        }
    }
}



module.exports = {
    searchMovieMetaFromAPI, searchMovieMetaInDB,storeMoviesMetaToDB, searchIMDBInMovieMeta, searchIMDBMetaDataFromAPI,

    handleMovieDetailSearch
}