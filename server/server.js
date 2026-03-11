const express = require("express");
const cors = require("cors");
const sqlite3 = require("sqlite3").verbose();

const server = express();
const PORT = 3000;

server.use(cors());
server.use(express.json());
server.use(express.urlencoded({ extended: true }));

const db = new sqlite3.Database("./jobs.db", (err) => {
  if (err) {
    console.error("Failed to connect to SQLite:", err.message);
  } else {
    console.log("Connected to SQLite:", "./jobs.db");
  }
});

db.run(`
    CREATE TABLE IF NOT EXISTS jobs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        firstname TEXT NOT NULL,
        lastname TEXT NOT NULL,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        status TEXT DEFAULT "available", 
        dateCreated TEXT DEFAULT (date('now'))
    )    
`);

server.post("/api/jobs", async (req, res) => {
    const { firstname, lastname, jobtitle, jobdescription } = req.body;

    db.get(
        `SELECT COUNT(*) as count FROM jobs WHERE firstname = ? AND lastname = ?`,
        [firstname, lastname],
        (err, row) => {
            if (err) {
                console.error(err.message);
                return res.status(500).json({ error: "Database error" });
            }
            if (row.count >= 3) {
                return res.status(400).json({ error: "Limit of 3 jobs reached for this person." });
            }
            db.run(
                `INSERT INTO jobs (firstname, lastname, title, description) VALUES (?, ?, ?, ?)`,
                [firstname, lastname, jobtitle, jobdescription],
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
})

server.get("/api/jobs/posted", async (req, res) => {
    const sql = `SELECT * FROM jobs 
                WHERE LOWER(firstname) = LOWER(?)`;

    db.all(sql, ["nik"], (err, rows) => {
        if (err) {
            console.error(err.message);
            return res.status(500).json({ error: "Failed to fetch jobs" });
        }        
        res.json(rows);
    });
});


server.get("/api/health", (req, res) => res.json({ ok: true }));
server.listen(PORT, () => console.log(`Server is running on http://localhost:${PORT}`))