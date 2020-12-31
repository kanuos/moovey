const {Pool} = require('pg');

const {DB_USER, DB_PASSWORD, DB_HOST, DB_NAME, DB_PORT} = process.env;

const pool = new Pool({
    user : DB_USER,
    password: DB_PASSWORD,
    port: DB_PORT,
    database: DB_NAME,
    host : DB_HOST,
});

module.exports = (async function createTables() {
    try {
        await pool.connect();
        await pool.query(`CREATE TABLE IF NOT EXISTS users (
            uid BIGSERIAL NOT NULL PRIMARY KEY,
            name VARCHAR(150) NOT NULL,
            email VARCHAR(150) NOT NULL UNIQUE,
            password VARCHAR(100) NOT NULL
        )`);
        console.log("users table created");
        await pool.query(`CREATE TABLE IF NOT EXISTS movies (
            imdbID VARCHAR(10) NOT NULL PRIMARY KEY,
            title TEXT NOT NULL,
            plot TEXT ,
            imdbRating REAL,
            actors TEXT,
            genre TEXT,
            released TEXT,
            director TEXT,
            poster TEXT NOT NULL
        )`);
        console.log("movies table created");
        await pool.query(`CREATE TABLE IF NOT EXISTS list_meta (
            list_id BIGSERIAL NOT NULL PRIMARY KEY,
            title TEXT NOT NULL,
            author INT NOT NULL REFERENCES  users(uid)
            )`)
        console.log("list_meta table created");
        await pool.query(`CREATE TABLE IF NOT EXISTS list_item (
            id BIGSERIAL NOT NULL PRIMARY KEY,
            l_id INT NOT NULL REFERENCES list_meta(list_id),
            movie VARCHAR(10) NOT NULL REFERENCES movies(imdbID)
            )`)
        console.log("list item table created");
        // return pool;
    }
    catch(err){
        console.log("DB table creation error");
        console.log(err);
        console.log("DB table creation error");
    }
})();

