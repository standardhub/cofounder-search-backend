const { Pool } = require('pg');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Database configuration
const DB_TYPE = process.env.DB_TYPE || 'postgresql'; // 'postgresql' or 'supabase'
const TABLE_NAME = process.env.SUPABASE_TABLE_NAME || 'cofounder_profiles';

let database;

if (DB_TYPE === 'supabase') {
  // Supabase configuration
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase environment variables (SUPABASE_URL, SUPABASE_ANON_KEY)');
  }

  database = createClient(supabaseUrl, supabaseKey);
  console.log(`🔗 Connected to Supabase database, table: ${TABLE_NAME}`);
} else {
  // PostgreSQL configuration
  if (!process.env.DATABASE_URL) {
    throw new Error('Missing PostgreSQL environment variable (DATABASE_URL)');
  }

  database = new Pool({
    connectionString: process.env.DATABASE_URL,
  });
  console.log('🔗 Connected to PostgreSQL database');
}

module.exports = { database, DB_TYPE, TABLE_NAME };