import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema.js';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:123@localhost:5433/headless_document_management',
});

export const db = drizzle(pool, { schema });
export type Database = typeof db;

