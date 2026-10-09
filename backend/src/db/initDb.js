import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pool from '../config/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const initializeDatabase = async () => {
  console.log('----------------------------------------------------');
  console.log('🔄 Starting ServeHub Database Initialization...');
  console.log('----------------------------------------------------');

  let connection;
  try {
    connection = await pool.getConnection();

    const parseStatements = (sqlText) => {
      return sqlText
        .split(';')
        .map(stmt => {
          return stmt
            .split('\n')
            .map(line => {
              const trimmed = line.trim();
              return trimmed.startsWith('--') ? '' : line;
            })
            .join('\n')
            .trim();
        })
        .filter(stmt => {
          if (!stmt) return false;
          const upper = stmt.toUpperCase().replace(/\s+/g, ' ').trim();
          if (upper.startsWith('CREATE DATABASE') || upper.startsWith('USE ')) return false;
          return true;
        });
    };

    // 1. Read schema.sql
    const schemaPath = path.join(__dirname, 'schema.sql');
    if (fs.existsSync(schemaPath)) {
      console.log('📦 Applying database schema...');
      const schemaSql = fs.readFileSync(schemaPath, 'utf8');
      const schemaStatements = parseStatements(schemaSql);

      for (const stmt of schemaStatements) {
        await connection.query(stmt);
      }
      console.log('✅ Schema tables verified/created successfully.');
    }

    // 2. Read seed.sql
    const seedPath = path.join(__dirname, 'seed.sql');
    if (fs.existsSync(seedPath)) {
      console.log('🌱 Applying database seed data...');
      const seedSql = fs.readFileSync(seedPath, 'utf8');
      const seedStatements = parseStatements(seedSql);

      for (const stmt of seedStatements) {
        try {
          await connection.query(stmt);
        } catch (stmtErr) {
          // Ignore duplicate key warnings on seed re-runs
          if (!stmtErr.message.includes('Duplicate entry')) {
            console.warn(`[Seed Note] ${stmtErr.message}`);
          }
        }
      }
      console.log('✅ Seed data verified/populated successfully.');
    }

    console.log('----------------------------------------------------');
    console.log('🎉 Database initialization completed successfully!');
    console.log('----------------------------------------------------');
    return true;
  } catch (error) {
    console.error('❌ Database initialization error:', error.message);
    throw error;
  } finally {
    if (connection) connection.release();
  }
};

// Execute directly if run via CLI: node src/db/initDb.js
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  initializeDatabase()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}
