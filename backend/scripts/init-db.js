// Database Initializer Script
// Reads schema.sql and applies it to MySQL
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from backend
dotenv.config({ path: path.join(__dirname, '../.env') });

const config = {
  host: process.env.DB_HOST || '127.0.0.1',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  multipleStatements: true,
};

async function initDatabase() {
  console.log('Connecting to MySQL server...');
  console.log(`Host: ${config.host}:${config.port}, User: ${config.user}`);
  
  try {
    const connection = await mysql.createConnection(config);
    console.log('✅ Connected successfully to MySQL server.');

    const schemaPath = path.join(__dirname, '../../database/schema.sql');
    const sql = fs.readFileSync(schemaPath, 'utf8');

    console.log('Applying schema.sql to daycraft database...');
    await connection.query(sql);

    console.log('✅ Schema and badges seed applied successfully!');
    await connection.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Database initialization failed:', error.message);
    if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('\n--> Hint: Please check your MySQL password and username in backend/.env');
    }
    process.exit(1);
  }
}

initDatabase();
