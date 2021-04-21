const {Pool} = require('pg');

const {DATABASE_URL, NODE_ENV} = process.env;

const pool = new Pool({
    connectionString : DATABASE_URL,
    ssl :NODE_ENV === "production" ?  {
        rejectUnauthorized : false
    } : undefined
});

async function initDB() {
    try {
        await pool.query(`CREATE TABLE IF NOT EXISTS users (
            uid TEXT PRIMARY KEY,
            name VARCHAR(150) NOT NULL,
            email VARCHAR(150) NOT NULL UNIQUE,
            password VARCHAR(100) NOT NULL,
            date_joined TIMESTAMPTZ DEFAULT NOW()
        )`);
        console.log("users table created")
        await pool.query(`CREATE TABLE IF NOT EXISTS profile (
            pid BIGSERIAL NOT NULL,
            picture TEXT,
            default_picture TEXT DEFAULT '',
            location VARCHAR(100),
            bio TEXT,
            facebook VARCHAR(100),
            twitter VARCHAR(100),
            instagram VARCHAR(100),
            uid TEXT REFERENCES users(uid) ON DELETE CASCADE,
            PRIMARY KEY (uid, pid)
        )`);
        console.log("profile table created")
        await pool.query(`CREATE TABLE IF NOT EXISTS movies_meta (
            imdbID VARCHAR(20) NOT NULL PRIMARY KEY,
            title TEXT NOT NULL,
            imdbRating REAL,
            year TEXT,
            poster TEXT NOT NULL
        )`)
        console.log("movies_meta table created")
        await pool.query(`CREATE TABLE IF NOT EXISTS movies_detail (
            imdbID VARCHAR(20) REFERENCES movies_meta(imdbID) ON DELETE RESTRICT,
            metadata JSONB NOT NULL,
            PRIMARY KEY (imdbID, metadata)
        )`)
        console.log("movies_detail table created");
        await pool.query(`CREATE TABLE IF NOT EXISTS blogs (
            blog_id BIGSERIAL NOT NULL UNIQUE,
            blog_title TEXT NOT NULL,
            blog_content TEXT NOT NULL,
            plot_rating INT CHECK (plot_rating >= 0 AND plot_rating <= 10) DEFAULT 5,
            acting_rating INT CHECK (acting_rating >= 0 AND acting_rating <= 10) DEFAULT 5,
            direction_rating INT CHECK (direction_rating >= 0 AND direction_rating <= 10) DEFAULT 5,
            created TIMESTAMPTZ DEFAULT Now(),
            imdbID VARCHAR(20) NOT NULL REFERENCES movies_meta(imdbID) ON DELETE RESTRICT,
            uid TEXT NOT NULL REFERENCES users(uid) ON DELETE CASCADE,
            PRIMARY KEY (uid, imdbID)
            )`)
        console.log("blogs table created");
        await pool.query(`CREATE TABLE IF NOT EXISTS recommendations (
            imdbID VARCHAR(20) NOT NULL REFERENCES movies_meta(imdbID) ON DELETE RESTRICT,
            uid TEXT NOT NULL REFERENCES users(uid) ON DELETE CASCADE,
            PRIMARY KEY (uid, imdbID)
            )`)
        console.log("recommendations table created");
    }
    catch(err) {
        console.log("DB Creation error : ",err);
    }
};

initDB();

module.exports = pool;