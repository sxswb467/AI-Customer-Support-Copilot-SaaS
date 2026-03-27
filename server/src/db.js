import fs from "node:fs";
import path from "node:path";
import initSqlJs from "sql.js";
import { seedData } from "./seed.js";

const dataDir = path.resolve(process.cwd(), "data");
const dbFile = path.join(dataDir, "copilot-demo.sqlite");

let SQL;
let db;

function ensureDataDir() {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
}

function persist() {
  ensureDataDir();
  const data = db.export();
  fs.writeFileSync(dbFile, Buffer.from(data));
}

export async function initDb() {
  if (db) return db;
  SQL = await initSqlJs({});
  ensureDataDir();

  if (fs.existsSync(dbFile)) {
    const fileBuffer = fs.readFileSync(dbFile);
    db = new SQL.Database(fileBuffer);
  } else {
    db = new SQL.Database();
    db.run(`
      CREATE TABLE tenants (
        id INTEGER PRIMARY KEY,
        name TEXT NOT NULL,
        plan TEXT NOT NULL
      );
      CREATE TABLE tickets (
        id INTEGER PRIMARY KEY,
        tenant_id INTEGER NOT NULL,
        customer_name TEXT NOT NULL,
        subject TEXT NOT NULL,
        priority TEXT NOT NULL,
        status TEXT NOT NULL,
        details TEXT NOT NULL,
        created_at TEXT NOT NULL
      );
      CREATE TABLE kb_articles (
        id INTEGER PRIMARY KEY,
        tenant_id INTEGER NOT NULL,
        title TEXT NOT NULL,
        body TEXT NOT NULL,
        tags TEXT NOT NULL
      );
      CREATE TABLE chat_messages (
        id INTEGER PRIMARY KEY,
        ticket_id INTEGER NOT NULL,
        role TEXT NOT NULL,
        content TEXT NOT NULL,
        created_at TEXT NOT NULL
      );
    `);

    seedData(db);
    persist();
  }

  return db;
}

export function all(sql, params = []) {
  const stmt = db.prepare(sql, params);
  const rows = [];
  while (stmt.step()) {
    rows.push(stmt.getAsObject());
  }
  stmt.free();
  return rows;
}

export function getOne(sql, params = []) {
  const rows = all(sql, params);
  return rows[0] ?? null;
}

export function execute(sql, params = []) {
  db.run(sql, params);
  persist();
}

export function saveMessage(ticketId, role, content) {
  execute(
    `INSERT INTO chat_messages (ticket_id, role, content, created_at) VALUES (?, ?, ?, ?)`,
    [ticketId, role, content, new Date().toISOString()]
  );
}
