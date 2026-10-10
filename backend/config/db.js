import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

const pool = mysql.createPool({
  host: process.env.DB_HOST || '127.0.0.1',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'daycraft',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0
  ssl: process.env.DB_SSL_CA
    ? { ca: process.env.DB_SSL_CA }
    : undefined
});

// Helper to check DB connectivity
export async function testConnection() {
  try {
    const connection = await pool.getConnection();
    connection.release();
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err.message, code: err.code };
  }
}

export default pool;
