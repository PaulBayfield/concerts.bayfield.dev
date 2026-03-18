import Database from 'better-sqlite3';
import path from 'path';
import { mkdirSync } from 'fs';
import { initializeDatabase } from './db-init';

let db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (!db) {
    const dbPath = process.env.DATABASE_PATH || path.join(process.cwd(), 'data', 'concerts.db');
    mkdirSync(path.dirname(dbPath), { recursive: true });
    db = new Database(dbPath);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
    initializeDatabase(db);
  }
  return db;
}
