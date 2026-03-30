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
            maxAge: 60000 * 60 * 24, // 1 day
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

const checkLogin = (req, res, next) => {
    if (req.path === '/HTML/login.html' || req.path === '/login') {
        return next(); 
    }
    if (req.session && req.session.userId) {
        return next();
    } else {
        console.log("Unauthorized access attempt. Redirecting to login...");
        return res.redirect('/HTML/login.html'); 
    }
};

server.get('/HTML/marketplace.html', checkLogin, (req, res) => {
    res.sendFile(path.join(__dirname, '../client/HTML/marketplace.html')); 
});

server.get('/HTML/settings.html', checkLogin, (req, res) => {
    res.sendFile(path.join(__dirname, '../client/HTML/settings.html'));
});

server.get('/HTML/posted_jobs.html', checkLogin, (req, res) => {
    res.sendFile(path.join(__dirname, '../client/HTML/posted_jobs.html'));
});

server.get('/HTML/accepted_jobs.html', checkLogin, (req, res) => {
    res.sendFile(path.join(__dirname, '../client/HTML/accepted_jobs.html'));
});

server.get("/HTML/login.html", (req, res) => {
    res.sendFile(path.join(__dirname, "../client/HTML/login.html"));
});

server.get("/login", (req, res) => {
    res.sendFile(path.join(__dirname, "../client/HTML/login.html"));
});

server.get('/api/marketplace/jobs', checkLogin, (req, res, next) => {
    const sql = `
        SELECT 
            jobs.id,
            jobs.title, 
            jobs.description,
            jobs.dateCreated, 
            users.first_name, 
            users.last_name 
        FROM jobs
        INNER JOIN users ON jobs.poster_id = users.id
    `;
    db.all(sql, [], function(err, rows){
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(rows);
    });
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
            req.session.firstName = user.first_name;
            req.session.lastName = user.last_name;
            res.redirect('/HTML/marketplace.html');
        } else {
            return res.status(401).send("Invalid username or password <a href='/login.html'>Try again</a>");
        }
    });
});

server.post("/api/logout", (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ error: "Could not log out" });
        }
        
        res.clearCookie('connect.sid');
        
        res.json({ success: true });
    });
});

server.post("/api/jobs", async (req, res) => {
    const { jobtitle, jobdescription } = req.body;
    const posterId = req.session.userId;

    db.get(
        `SELECT COUNT(*) as count FROM jobs WHERE poster_id = ?`,
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

server.delete("/api/jobs/delete", (req, res) => {
    const sql = `DELETE FROM jobs WHERE id = ? AND poster_id = ?`;

    db.run(sql, [req.body.id, req.session.userId], function(err) {
        if (err) {
            console.log("SQL ERROR:", err.message);
            return res.status(500).json({ error: err.message });
        }
        res.json({ success: true });
    });
});

server.get("/api/jobs/posted", async (req, res) => {
    const posterID = req.session.userId;
    const firstName = req.session.firstName
    const lastName = req.session.lastName;

    const sql = `SELECT * FROM jobs 
                WHERE poster_id = ?`;

    db.all(sql, [posterID], (err, rows) => {
        if (err) {
            console.error(err.message);
            return res.status(500).json({ error: "Failed to fetch jobs" });
        }        
        res.json({
            jobs: rows,
            userFirstName: `${firstName}`,
            userLastName: `${lastName}`
        });
    });
});

server.get("/api/health", (req, res) => res.json({ ok: true }));
server.listen(PORT, () => console.log(`Server is running on http://localhost:${PORT}`))