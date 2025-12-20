import 'dotenv/config';
import { db } from './db.js';
import { sql } from 'drizzle-orm';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function runMigration() {
  try {
    console.log('Running migration...');
    
    // Read the SQL file
    const migrationSQL = readFileSync(
      join(__dirname, '../migrations/add_scheduled_jobs.sql'),
      'utf-8'
    );
    
    // Execute the SQL
    await db.execute(sql.raw(migrationSQL));
    
    console.log('Migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

runMigration();
