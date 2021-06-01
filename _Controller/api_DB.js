const axios = require("axios").default
const pool = require("../_Database");
const format = require("pg-format");


async function searchMovieMetaInDB(keyword){
    try {
        const sql = format("SELECT * FROM movies_meta WHERE title ILIKE '%%%s%%'", [keyword.toLowerCase()]);
        console.log(sql);
        const {rows} = await pool.query(sql);
        if (rows.length === 0){
            throw Error     // Movie not found in movie_meta
        }        
        return rows;
    } catch (error) {
        return [];
    }
}

async function searchMovieMetaFromAPI(keyword){
    try {
        const url = `http://www.omdbapi.com/?apikey=${process.env.MOVIE_API_KEY}&s=${keyword.toLowerCase()}`
        const {data} = await axios.get(url)
        if (data.Error){
            throw Error     // invalid search key or movies not found in API
        }
        return data.Search;
    } catch (error) {
        return [];
    }
}

async function storeMoviesMetaToDB(movies){
    try {
        const movieValues = movies.map(movie => Object.values(movie))
        const sql = format("INSERT INTO movies_meta (title, year, imdbid, type, poster) VALUES %L ON CONFLICT (imdbid) DO NOTHING RETURNING *", movieValues);
        const data = await pool.query(sql);
        return {
            data,
            success : true
        }
    } catch (error) {
        return {
            data : null,
            success : false
        }
    }
}



module.exports = {
    searchMovieMetaFromAPI, searchMovieMetaInDB,storeMoviesMetaToDB
}