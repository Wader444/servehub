import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const clean = (val) => (val ? String(val).replace(/^["']|["']$/g, '').trim() : '');

const buildPoolConfig = () => {
  const dbUrl = clean(process.env.DATABASE_URL || process.env.MYSQL_URL);
  const dbHost = clean(process.env.DB_HOST) || 'localhost';
  const isCloudHost = dbHost && !['localhost', '127.0.0.1'].includes(dbHost);
  const requiresSsl = clean(process.env.DB_SSL) === 'true' || clean(process.env.DB_SSL) === '1' || (isCloudHost && clean(process.env.DB_SSL) !== 'false');

  const sslOption = requiresSsl ? { minVersion: 'TLSv1.2', rejectUnauthorized: false } : undefined;

  if (dbUrl) {
    try {
      const parsed = new URL(dbUrl);
      return {
        host: parsed.hostname,
        port: Number(parsed.port) || 3306,
        user: decodeURIComponent(parsed.username),
        password: decodeURIComponent(parsed.password),
        database: parsed.pathname.replace(/^\//, '') || undefined,
        ssl: sslOption,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
        connectTimeout: 20000,
        enableKeepAlive: true
      };
    } catch {
      return {
        uri: dbUrl,
        ssl: sslOption,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
        connectTimeout: 20000,
        enableKeepAlive: true
      };
    }
  }

  return {
    host: dbHost,
    user: clean(process.env.DB_USER) || 'root',
    password: clean(process.env.DB_PASSWORD) || '',
    database: clean(process.env.DB_NAME) || 'community_portal_db',
    port: Number(clean(process.env.DB_PORT)) || 3306,
    ssl: sslOption,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    connectTimeout: 20000,
    enableKeepAlive: true
  };
};

const pool = mysql.createPool(buildPoolConfig());

export const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    const hostInfo = process.env.DB_HOST || (process.env.DATABASE_URL ? 'Cloud Database' : 'localhost');
    console.log(`[Database] Successfully connected to MySQL (${hostInfo})`);
    connection.release();
    return true;
  } catch (err) {
    console.error(`[Database Error] Failed to connect to MySQL: ${err.message}`);
    console.error(`[Tip] Please verify your DB credentials or DATABASE_URL.`);
    return false;
  }
};

export default pool;
