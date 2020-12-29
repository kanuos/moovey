const {Pool} = require('pg');

const {DB_USER, DB_PASSWORD, DB_HOST, DB_NAME, DB_PORT} = process.env;

const pool = new Pool({
    user : DB_USER,
    password: DB_PASSWORD,
    port: DB_PORT,
    database: DB_NAME,
    host : DB_HOST,
});


pool.connect()
    .then(() => {
        console.log(`Database Server running at port ${process.env.DB_PORT}`)
        pool.query(`CREATE TABLE IF NOT EXISTS users (
            uid BIGSERIAL NOT NULL PRIMARY KEY,
            name VARCHAR(150) NOT NULL,
            email VARCHAR(150) NOT NULL UNIQUE,
            password VARCHAR(100) NOT NULL
        )`)
    })    
    .then(() => {
        console.log(`Connected to users`)
        pool.query(`CREATE TABLE IF NOT EXISTS movies (
            imdbID VARCHAR(10) NOT NULL PRIMARY KEY,
            title TEXT NOT NULL,
            plot TEXT ,
            imdbRating REAL,
            actors TEXT,
            genre TEXT,
            released TEXT,
            director TEXT,
            poster TEXT NOT NULL
        )`)
    })
    .then(() => console.log("Connected to movies"))
    .catch((err)=> {
        console.log("Couldn't connect to DB server")
        console.log(err);
        console.log("------------------------------")
    });
    

module.exports = pool;