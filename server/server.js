const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const sqlite3 = require("sqlite3").verbose();
const session = require("express-session");
const path = require("path");

const server = express();
const PORT = 3000;

server.use(
    session({
        secret: "top_secret_key_init",
        saveUninitialized: false,
        resave: false,
        cookie: {
            maxAge: 60000, // 1 minute
            httpOnly: true,
            secure: false
        }
    }));
server.use(cookieParser());
server.use(cors());
server.use(express.json());
server.use(express.urlencoded({ extended: true }));

const db = new sqlite3.Database("./jobs.db", (err) => {
    if (err) {
        console.error("Failed to connect:", err.message);
    } else {
        console.log("Connected to SQLite");
        db.run("PRAGMA foreign_keys = ON"); 
    }
});

db.run(`
    CREATE TABLE IF NOT EXISTS jobs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        
        poster_id INTEGER, 
        worker_id INTEGER,

        title TEXT NOT NULL,
        description TEXT NOT NULL,
        status TEXT DEFAULT 'available',
        dateCreated TEXT DEFAULT (date('now')),
                
        FOREIGN KEY (poster_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (worker_id) REFERENCES users(id) ON DELETE CASCADE
    )
`);

db.run(`
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT DEFAULT "freelancer"
    )
`);

server.get('/HTML/marketplace.html', (req, res, next) => {
    if (req.session && req.session.user) {
        next();
    } else {
        console.log("Unauthorized access attempt. Redirecting to login...");
        res.redirect('/HTML/login.html');
    }
});

server.use(express.static(path.join(__dirname, '../client')));

server.post("/login", (req, res) => {
    const {username, password} = req.body;

    db.get("SELECT * FROM users WHERE username = ?", [username], (err, user) => {
        if (err) {
            console.error(err);
            return res.status(500).send("Database error");
        }

        if (user && user.password === password) {
            req.session.userId = user.id;
            req.session.user = user.username;
            res.redirect('/HTML/marketplace.html');
        } else {
            return res.status(401).send("Invalid username or password <a href='/login'>Try again</a>");
        }
    });
});

server.post("/api/jobs", async (req, res) => {
    const { jobtitle, jobdescription } = req.body;
    const posterId = req.session.userId;

    db.get(
        `SELECT COUNT(*) as count FROM jobs WHERE posterId = ?`,
        [posterId],
        (err, row) => {
            if (err) {
                console.error(err.message);
                return res.status(500).json({ error: "Database error" });
            }
            if (row.count >= 3) {
                return res.status(400).json({ error: "Limit of 3 jobs reached for this person." });
            }
            db.run(
                `INSERT INTO jobs (poster_id, title, description) VALUES (?, ?, ?)`,
                [posterId, jobtitle, jobdescription],
                function(err) {
                    if (err) {
                        console.error(err.message);
                        return res.status(500).json({ error: "Failed to insert" });
                    }
                    res.json({ ok: true, id: this.lastID });
                }
            );
        }
    );
});

server.post("/api/delete", (req, res) => {
    const deletev = req.body.deleteB;
    db.run(
        'DELETE FROM jobs',
        function(e) {
            if (e) {
                console.error(e.message);
                return res.status(500).json({ error: "Failed to insert" });
            }
            res.json({ ok: true })
        }
    )
});

server.get("/api/jobs/posted", async (req, res) => {
    const sql = `SELECT * FROM jobs 
                WHERE LOWER(firstname) = LOWER(?)
                AND LOWER(lastname) = LOWER(?)`;

    db.all(sql, ["nik", "zhuk"], (err, rows) => {
        if (err) {
            console.error(err.message);
            return res.status(500).json({ error: "Failed to fetch jobs" });
        }        
        res.json(rows);
    });
});

server.get("/api/health", (req, res) => res.json({ ok: true }));
server.listen(PORT, () => console.log(`Server is running on http://localhost:${PORT}`))