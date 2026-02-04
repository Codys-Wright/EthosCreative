/**
 * Check what tables exist in the database.
 */
import pg from 'pg';

const { Pool } = pg;

const connectionString = process.env.DATABASE_URL || process.env.NETLIFY_DATABASE_URL;

if (!connectionString) {
  console.error('No DATABASE_URL or NETLIFY_DATABASE_URL set');
  process.exit(1);
}

console.log('[check-tables] Connecting to database...');

const pool = new Pool({ connectionString });

try {
  // List all tables
  const result = await pool.query(`
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = 'public'
    ORDER BY table_name
  `);

  console.log('\n[check-tables] Tables in database:');
  if (result.rows.length === 0) {
    console.log('  (no tables found)');
  } else {
    for (const row of result.rows) {
      console.log(`  - ${row.table_name}`);
    }
  }

  // Check specifically for Better Auth tables
  const authTables = ['user', 'session', 'account', 'verification'];
  console.log('\n[check-tables] Better Auth tables:');
  for (const table of authTables) {
    const exists = result.rows.some(r => r.table_name === table);
    console.log(`  - ${table}: ${exists ? '✓ exists' : '✗ MISSING'}`);
  }

} catch (err) {
  console.error('[check-tables] Error:', err);
} finally {
  await pool.end();
}
