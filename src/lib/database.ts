import sqlite3 from 'sqlite3';
import { promisify } from 'util';
import path from 'path';

// Database interface
export interface Database {
  run: (sql: string, params?: unknown[]) => Promise<sqlite3.RunResult>;
  get: (sql: string, params?: unknown[]) => Promise<unknown>;
  all: (sql: string, params?: unknown[]) => Promise<unknown[]>;
  close: () => Promise<void>;
}

// Parent/Guardian interface
export interface Parent {
  id: number;
  name: string;
  email: string;
  password: string;
  created_at: string;
}

// Kid interface
export interface Kid {
  id: number;
  parent_id: number;
  name: string;
  age?: number;
  created_at: string;
  total_points: number;
}

// Point transaction interface
export interface PointTransaction {
  id: number;
  kid_id: number;
  points: number;
  description: string;
  type: 'reward' | 'penalty';
  created_at: string;
}

// Goal interface
export interface Goal {
  id: number;
  kid_id: number;
  title: string;
  description: string;
  points_required: number;
  is_achieved: boolean;
  created_at: string;
  achieved_at?: string;
}

class DatabaseManager {
  private db: sqlite3.Database | null = null;
  private dbPath: string;

  constructor() {
    this.dbPath = path.join(process.cwd(), 'database.sqlite');
  }

  async connect(): Promise<Database> {
    if (this.db) {
      return this.createDatabaseInterface(this.db);
    }

    return new Promise((resolve, reject) => {
      this.db = new sqlite3.Database(this.dbPath, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve(this.createDatabaseInterface(this.db!));
        }
      });
    });
  }

  private createDatabaseInterface(db: sqlite3.Database): Database {
    const run = (sql: string, params?: unknown[]): Promise<sqlite3.RunResult> => {
      return new Promise((resolve, reject) => {
        db.run(sql, params || [], function(err) {
          if (err) {
            reject(err);
          } else {
            resolve({ lastID: this.lastID, changes: this.changes } as sqlite3.RunResult);
          }
        });
      });
    };

    const get = promisify(db.get.bind(db));
    const all = promisify(db.all.bind(db));
    const close = promisify(db.close.bind(db));

    return { run, get, all, close };
  }

  async initializeDatabase(): Promise<void> {
    const db = await this.connect();

    // Check if we need to migrate from old schema
    const oldUsersTable = await db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='users'");

    if (oldUsersTable) {
      console.log('Migrating from old schema to new parent/kids schema...');
      await this.migrateToNewSchema(db);
    }

    // Create parents table
    await db.run(`
      CREATE TABLE IF NOT EXISTS parents (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create kids table
    await db.run(`
      CREATE TABLE IF NOT EXISTS kids (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        parent_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        age INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        total_points INTEGER DEFAULT 0,
        FOREIGN KEY (parent_id) REFERENCES parents (id)
      )
    `);

    // Create point_transactions table
    await db.run(`
      CREATE TABLE IF NOT EXISTS point_transactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        kid_id INTEGER NOT NULL,
        points INTEGER NOT NULL,
        description TEXT NOT NULL,
        type TEXT CHECK(type IN ('reward', 'penalty')) NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (kid_id) REFERENCES kids (id)
      )
    `);

    // Create goals table
    await db.run(`
      CREATE TABLE IF NOT EXISTS goals (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        kid_id INTEGER NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        points_required INTEGER NOT NULL,
        is_achieved BOOLEAN DEFAULT FALSE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        achieved_at DATETIME,
        FOREIGN KEY (kid_id) REFERENCES kids (id)
      )
    `);

    // Create indexes for better performance
    await db.run(`CREATE INDEX IF NOT EXISTS idx_point_transactions_kid_id ON point_transactions(kid_id)`);
    await db.run(`CREATE INDEX IF NOT EXISTS idx_goals_kid_id ON goals(kid_id)`);
    await db.run(`CREATE INDEX IF NOT EXISTS idx_kids_parent_id ON kids(parent_id)`);
  }

  private async migrateToNewSchema(db: sqlite3.Database): Promise<void> {
    // This is a simple migration - in a real app you'd want more sophisticated migration logic
    console.log('Dropping old tables to start fresh with new schema...');

    await db.run('DROP TABLE IF EXISTS point_transactions');
    await db.run('DROP TABLE IF EXISTS goals');
    await db.run('DROP TABLE IF EXISTS users');

    console.log('Migration completed - old data has been cleared for new schema');
  }
}

// Singleton instance
const dbManager = new DatabaseManager();

export async function getDatabase(): Promise<Database> {
  return await dbManager.connect();
}

export async function initializeDatabase(): Promise<void> {
  return await dbManager.initializeDatabase();
}
