import mysql, { Pool } from 'mysql2/promise';
import dotenv from 'dotenv';
import { getLocalStore } from './localStore';

dotenv.config();

let pool: Pool | null = null;
let mysqlAvailable = false;

export function isMysqlConnected(): boolean {
  return mysqlAvailable && pool !== null;
}

export function getMysqlPool(): Pool {
  if (!pool) {
    throw new Error('MySQL pool not initialized');
  }
  return pool;
}

export async function initDatabase(): Promise<{ engine: 'mysql' | 'local-relational' }> {
  const host = process.env.DB_HOST;
  const user = process.env.DB_USER;
  const database = process.env.DB_NAME || 'furever_db';

  if (host && user && process.env.DB_PASSWORD !== 'your_mysql_password') {
    try {
      pool = mysql.createPool({
        host,
        port: Number(process.env.DB_PORT || 3306),
        user,
        password: process.env.DB_PASSWORD || '',
        database,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
        connectTimeout: 3000,
      });

      const conn = await pool.getConnection();
      await conn.ping();
      conn.release();
      mysqlAvailable = true;
      console.log(`[DB] Connected to MySQL (${host}:${process.env.DB_PORT || 3306}/${database}) via mysql2`);
      return { engine: 'mysql' };
    } catch (err) {
      console.warn('[DB] MySQL unavailable in current environment; using relational JSON store fallback:', (err as Error).message);
      mysqlAvailable = false;
      pool = null;
    }
  } else {
    console.log('[DB] DB_HOST/DB_USER not configured; using persistent relational store (run database/schema.sql & seed.sql for MySQL).');
  }

  getLocalStore();
  return { engine: 'local-relational' };
}
