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
            location VARCHAR(100),
            bio TEXT,
            credential TEXT,
            facebook VARCHAR(100),
            twitter VARCHAR(100),
            website VARCHAR(100),
            uid TEXT REFERENCES users(uid) ON DELETE CASCADE,
            PRIMARY KEY (uid, pid)
        )`);
        console.log("profile table created")
        await pool.query(`CREATE TABLE IF NOT EXISTS movies_meta (
            imdbID VARCHAR(20) NOT NULL PRIMARY KEY,
            title TEXT NOT NULL,
            year TEXT,
            poster TEXT NOT NULL,
            type TEXT
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
            blog_title VARCHAR(40),
            blog_content TEXT,
            plot_rating INT CHECK (plot_rating >= 0 AND plot_rating <= 10) DEFAULT 5,
            acting_rating INT CHECK (acting_rating >= 0 AND acting_rating <= 10) DEFAULT 5,
            direction_rating INT CHECK (direction_rating >= 0 AND direction_rating <= 10) DEFAULT 5,
            created TIMESTAMPTZ DEFAULT Now(),
            published BOOLEAN DEFAULT FALSE,
            completed_step INT DEFAULT 0 CHECK(completed_step >= 0 AND completed_step <= 4),
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
        await pool.query(`CREATE TABLE IF NOT EXISTS list_meta (
            lid BIGSERIAL NOT NULL UNIQUE,
            description VARCHAR(200),
            title VARCHAR(50) NOT NULL,
            uid TEXT NOT NULL REFERENCES users(uid) ON DELETE CASCADE,
            date_created TIMESTAMPTZ DEFAULT Now(), 
            views INT DEFAULT 0,
            PRIMARY KEY (uid, title)
            )`)
            console.log("list_meta table created");
        await pool.query(`CREATE TABLE IF NOT EXISTS list_item (
            itemid BIGSERIAL NOT NULL,
            description VARCHAR(250),
            lid BIGSERIAL NOT NULL REFERENCES list_meta(lid) ON DELETE CASCADE,
            imdbid VARCHAR(20) NOT NULL REFERENCES movies_meta(imdbid) ON DELETE CASCADE,
            uid TEXT NOT NULL REFERENCES users(uid) ON DELETE CASCADE,
            PRIMARY KEY (uid, lid, imdbid)
            )`)
            console.log("list_item table created");
        await pool.query(`CREATE TABLE IF NOT EXISTS watchlist (
            imdbid VARCHAR(20) NOT NULL REFERENCES movies_meta(imdbid) ON DELETE CASCADE,
            uid TEXT NOT NULL REFERENCES users(uid) ON DELETE CASCADE,
            PRIMARY KEY (uid,imdbid))`)
            console.log("watchlist table created");
        await pool.query(`CREATE TABLE IF NOT EXISTS watched (
            imdbid VARCHAR(20) NOT NULL REFERENCES movies_meta(imdbid) ON DELETE CASCADE,
            uid TEXT NOT NULL REFERENCES users(uid) ON DELETE CASCADE,
            PRIMARY KEY (uid,imdbid))`)
            console.log("watched table created");
        await pool.query(`CREATE TABLE IF NOT EXISTS recover (
            uid TEXT PRIMARY KEY REFERENCES users(uid) ON DELETE CASCADE ,
            token VARCHAR(150) NOT NULL,
            request_sent TIMESTAMPTZ,
            request_valid TIMESTAMPTZ)`)
            console.log("recover table created");
    }
    catch(err) {
        console.log("DB Creation error : ",err);
    }
};

initDB();

module.exports = pool;