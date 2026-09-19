import { Pool } from '@neondatabase/serverless';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL must be defined in the .env file');
}

// Create a connection pool to Neon Postgres
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

/**
 * Utility function to execute a database query.
 * 
 * Example usage:
 * const result = await query('SELECT NOW()');
 * console.log(result.rows);
 */
export async function query(text: string, params?: unknown[]) {
  const client = await pool.connect();
  try {
    return await client.query(text, params);
  } finally {
    client.release();
  }
}
