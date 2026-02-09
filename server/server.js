const express = require("express");
const cors = require("cors");
const sqlite3 = require("sqlite3").verbose();

const server = express();
const PORT = process.env.PORT || 3000;

server.use(cors());
server.use(express.json());
server.use(express.urlencoded({ extended: true }));

const db = new sqlite3.Database("./server.js", (err) => {
    if (err) console.error("Failed to connect to SQLite:", err.message);
    else console.log("Connected to SQLite:", "./server.js");
});

db.run(`
  CREATE TABLE IF NOT EXISTS jobs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    firstname TEXT NOT NULL,
    lastname TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT,
    created_at TEXT NOT NULL DEFAULT (date('now'))
  )
`);

function getToday() {
  const today = new Date();

  const day = String(today.getDate()).padStart(2, "0");
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const year = today.getFullYear();

  return `${day}-${month}-${year}`;
}

server.post("/api/jobs", (req, res) => {
    const { firstname, lastname, title, description } = req.body;
});

server.get("/api/health", (req, res) => res.json({ ok: true }))
server.listen(PORT, () => console.log(`Server is running on http://locahost:${PORT}`))