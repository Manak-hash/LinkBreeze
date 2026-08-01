import Database from "better-sqlite3";
import path from "path";

const db = new Database(path.join(process.cwd(), "sqlite.db"));
console.log(db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all());
db.close();
