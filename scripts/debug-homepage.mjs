import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from '../src/lib/db/schema.ts';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle(pool, { schema });

const [content] = await db.select().from(schema.homepageContent).limit(1);
console.log('row:', content);
await pool.end();
