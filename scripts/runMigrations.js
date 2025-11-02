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

    // Read the SQL file
    const sqlFilePath = path.join(__dirname, '..', 'database-schema-simple.sql');
    const sql = fs.readFileSync(sqlFilePath, 'utf8');

    console.log('Running migrations...');
    await client.query(sql);

    console.log('✅ Database schema created successfully!');
    console.log('\nTables created:');
    console.log('- products');
    console.log('- customers');
    console.log('- orders');
    console.log('- order_items');
    console.log('- transactions');
    console.log('- refunds');
    console.log('- comments');
    console.log('- product_views');
    console.log('- traffic_sources');
    console.log('- sessions');
    console.log('- notifications');
    console.log('- messages');

  } catch (error) {
    console.error('❌ Error running migrations:', error.message);
    console.error(error);
  } finally {
    await client.end();
    console.log('\nDatabase connection closed.');
  }
}

runMigrations();
