const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

// Database connection configuration
const connectionString = 'postgresql://postgres.hglkohwfvbbdqloaniyw:qLpKVbLBLxtxSzt0@aws-0-us-east-2.pooler.supabase.com:5432/postgres';

async function runMigrations() {
  const client = new Client({
    connectionString,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    console.log('Connecting to database...');
    await client.connect();
    console.log('Connected successfully!');

    // Read the fixes SQL file
    const sqlFilePath = path.join(__dirname, '..', 'database-schema-fixes.sql');
    const sql = fs.readFileSync(sqlFilePath, 'utf8');

    console.log('Running RLS policy fixes...');
    await client.query(sql);

    console.log('✅ RLS policies updated successfully!');
    console.log('\nPolicies updated:');
    console.log('- user_profiles - More permissive read access');
    console.log('- messages - Enabled for authenticated users');
    console.log('- notifications - Fully accessible');
    console.log('- storage.objects (avatars) - Public read, authenticated write');

  } catch (error) {
    console.error('❌ Error running migrations:', error.message);
    console.error(error);
  } finally {
    await client.end();
    console.log('\nDatabase connection closed.');
  }
}

runMigrations();
