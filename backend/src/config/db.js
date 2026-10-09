const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

let dbType = 'postgres';
let pool = null;
let sqliteDb = null;

// Determine if we should use PostgreSQL or local SQLite fallback
const databaseUrl = process.env.DATABASE_URL;
const useSqliteFallback = process.env.USE_SQLITE === 'true' || !databaseUrl || databaseUrl.includes('localhost') && process.env.NODE_ENV === 'test_fallback';

if (databaseUrl && !useSqliteFallback) {
  try {
    pool = new Pool({
      connectionString: databaseUrl,
      ssl: databaseUrl.includes('localhost') ? false : { rejectUnauthorized: false }
    });
    dbType = 'postgres';
    console.log('[Database] Initialized PostgreSQL connection pool.');
  } catch (err) {
    console.warn('[Database] PostgreSQL Pool creation error, falling back to SQLite:', err.message);
    dbType = 'sqlite';
  }
} else {
  dbType = 'sqlite';
}

if (dbType === 'sqlite') {
  const sqlite3 = require('sqlite3').verbose();
  const dbDir = path.join(__dirname, '../../database');
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }
  const dbPath = path.join(dbDir, 'society_local.db');
  sqliteDb = new sqlite3.Database(dbPath);
  console.log(`[Database] Using local SQLite database at: ${dbPath}`);
}

/**
 * Executes a SQL query with parameters.
 * Provides consistent { rows, rowCount } result format across PostgreSQL and SQLite.
 *
 * @param {string} text - SQL Query string with $1, $2 placeholders (or standard SQL)
 * @param {Array} params - Query parameters
 * @returns {Promise<{ rows: Array, rowCount: number, insertId?: number }>}
 */
const query = async (text, params = []) => {
  if (dbType === 'postgres' && pool) {
    try {
      const res = await pool.query(text, params);
      return {
        rows: res.rows || [],
        rowCount: res.rowCount || 0
      };
    } catch (err) {
      // If Postgres connection fails at runtime, we can log and throw
      console.error('[Database Error (PG)]:', err.message);
      throw err;
    }
  }

  // SQLite Adapter mode (translates $1, $2 to ? placeholders and handles RETURNING)
  return new Promise((resolve, reject) => {
    let sqliteQuery = text;
    // Replace $1, $2, etc. with ?
    sqliteQuery = sqliteQuery.replace(/\$\d+/g, '?');

    // Handle ILIKE for SQLite -> LIKE
    sqliteQuery = sqliteQuery.replace(/ILIKE/gi, 'LIKE');

    // Handle INTERVAL syntax for SQLite
    // e.g. NOW() - INTERVAL 'X days' -> datetime('now', '-X days')
    sqliteQuery = sqliteQuery.replace(/CURRENT_TIMESTAMP\s*-\s*INTERVAL\s*'(\d+)\s*days'/gi, "datetime('now', '-$1 days')");
    sqliteQuery = sqliteQuery.replace(/NOW\(\)\s*-\s*INTERVAL\s*'(\d+)\s*days'/gi, "datetime('now', '-$1 days')");
    sqliteQuery = sqliteQuery.replace(/CURRENT_TIMESTAMP/gi, "datetime('now')");

    const trimmed = sqliteQuery.trim();
    const isSelect = /^\s*(SELECT|PRAGMA)/i.test(trimmed);
    const isInsert = /^\s*INSERT/i.test(trimmed);
    const hasReturning = /RETURNING\s+(.+)$/i.test(trimmed);

    // If RETURNING is present in SQLite, strip it for execution and query back inserted/updated row
    let returningClause = null;
    let executableQuery = sqliteQuery;

    if (hasReturning && !isSelect) {
      const match = trimmed.match(/RETURNING\s+(.+)$/i);
      if (match) {
        returningClause = match[1].trim();
        executableQuery = trimmed.replace(/RETURNING\s+.+$/i, '').trim();
      }
    }

    if (isSelect) {
      sqliteDb.all(executableQuery, params, (err, rows) => {
        if (err) return reject(err);
        resolve({
          rows: rows || [],
          rowCount: rows ? rows.length : 0
        });
      });
    } else if (isInsert) {
      sqliteDb.run(executableQuery, params, function (err) {
        if (err) return reject(err);
        const lastID = this.lastID;
        const changes = this.changes;

        if (hasReturning) {
          // Fetch the inserted record
          // Extract table name from INSERT INTO tableName
          const tableMatch = executableQuery.match(/INSERT\s+INTO\s+([a-zA-Z0-9_]+)/i);
          if (tableMatch) {
            const table = tableMatch[1];
            sqliteDb.get(`SELECT * FROM ${table} WHERE id = ?`, [lastID], (fetchErr, row) => {
              if (fetchErr) return reject(fetchErr);
              resolve({
                rows: row ? [row] : [],
                rowCount: changes,
                insertId: lastID
              });
            });
            return;
          }
        }

        resolve({
          rows: [{ id: lastID }],
          rowCount: changes,
          insertId: lastID
        });
      });
    } else {
      // UPDATE or DELETE
      sqliteDb.run(executableQuery, params, function (err) {
        if (err) return reject(err);
        const changes = this.changes;

        if (hasReturning && /^\s*UPDATE/i.test(trimmed)) {
          // Extract table name from UPDATE tableName
          const tableMatch = executableQuery.match(/UPDATE\s+([a-zA-Z0-9_]+)/i);
          if (tableMatch) {
            const table = tableMatch[1];
            // If the query had "WHERE id = ?", the last parameter is likely the ID
            const whereIdMatch = executableQuery.match(/WHERE\s+id\s*=\s*\?/i);
            if (whereIdMatch) {
              // Find the index of the id parameter
              const matchIndex = executableQuery.substring(0, executableQuery.indexOf(whereIdMatch[0])).split('?').length - 1;
              const targetId = params[matchIndex];
              sqliteDb.get(`SELECT * FROM ${table} WHERE id = ?`, [targetId], (fetchErr, row) => {
                if (fetchErr) return reject(fetchErr);
                resolve({
                  rows: row ? [row] : [],
                  rowCount: changes
                });
              });
              return;
            }
          }
        }

        resolve({
          rows: [],
          rowCount: changes
        });
      });
    }
  });
};

/**
 * Initializes database tables
 */
const initDb = async () => {
  if (dbType === 'postgres' && pool) {
    const schemaPath = path.join(__dirname, '../../database/schema.sql');
    if (fs.existsSync(schemaPath)) {
      const schemaSql = fs.readFileSync(schemaPath, 'utf8');
      await pool.query(schemaSql);
      console.log('[Database] PostgreSQL schema initialized successfully.');
    }
  } else if (sqliteDb) {
    // Run SQLite compatible schema
    const sqliteSchema = `
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'resident' CHECK (role IN ('resident', 'admin')),
        phone TEXT,
        flat_number TEXT,
        created_at TEXT DEFAULT (datetime('now')),
        updated_at TEXT DEFAULT (datetime('now'))
      );

      CREATE TABLE IF NOT EXISTS complaints (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        resident_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        category TEXT NOT NULL,
        title TEXT NOT NULL DEFAULT 'Maintenance Request',
        description TEXT NOT NULL,
        photo_url TEXT,
        status TEXT NOT NULL DEFAULT 'Open' CHECK (status IN ('Open', 'In Progress', 'Resolved')),
        priority TEXT NOT NULL DEFAULT 'Medium' CHECK (priority IN ('Low', 'Medium', 'High')),
        created_at TEXT DEFAULT (datetime('now')),
        updated_at TEXT DEFAULT (datetime('now')),
        resolved_at TEXT
      );

      CREATE TABLE IF NOT EXISTS complaint_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        complaint_id INTEGER NOT NULL REFERENCES complaints(id) ON DELETE CASCADE,
        previous_status TEXT,
        new_status TEXT NOT NULL,
        note TEXT,
        actor_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
        created_at TEXT DEFAULT (datetime('now'))
      );

      CREATE TABLE IF NOT EXISTS notices (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        is_important INTEGER DEFAULT 0,
        created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
        created_at TEXT DEFAULT (datetime('now')),
        updated_at TEXT DEFAULT (datetime('now'))
      );

      CREATE INDEX IF NOT EXISTS idx_complaints_resident ON complaints(resident_id);
      CREATE INDEX IF NOT EXISTS idx_complaints_status ON complaints(status);
      CREATE INDEX IF NOT EXISTS idx_complaints_created_at ON complaints(created_at);
      CREATE INDEX IF NOT EXISTS idx_complaints_priority ON complaints(priority);
      CREATE INDEX IF NOT EXISTS idx_complaint_history_complaint ON complaint_history(complaint_id);
      CREATE INDEX IF NOT EXISTS idx_notices_important ON notices(is_important, created_at DESC);
    `;

    return new Promise((resolve, reject) => {
      sqliteDb.exec(sqliteSchema, (err) => {
        if (err) {
          console.error('[Database] SQLite schema initialization failed:', err);
          return reject(err);
        }
        console.log('[Database] Local database schema initialized successfully.');
        resolve();
      });
    });
  }
};

module.exports = {
  query,
  initDb,
  getDbType: () => dbType,
  getPool: () => pool
};
