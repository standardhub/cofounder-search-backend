const express = require('express');
const { ApolloServer } = require('apollo-server-express');
const cors = require('cors');
const typeDefs = require('./schema');
const resolvers = require('./resolvers');
const { database, DB_TYPE, TABLE_NAME } = require('./database');
require('dotenv').config();

async function startServer() {
  const app = express();
  
  app.use(cors());

  // Test endpoint to check raw Supabase data
  app.get('/test-supabase', async (req, res) => {
    if (DB_TYPE !== 'supabase') {
      return res.json({ 
        error: 'Not using Supabase', 
        currentDbType: DB_TYPE 
      });
    }

    try {
      console.log(`🧪 Testing Supabase connection to table: ${TABLE_NAME}`);
      
      // Test basic connection and get first 5 records
      const { data, error, count } = await database
        .from(TABLE_NAME)
        .select('*', { count: 'exact' })
        .limit(5);

      if (error) {
        console.error('❌ Supabase test error:', error);
        return res.status(500).json({ 
          error: error.message,
          code: error.code,
          details: error.details 
        });
      }

      console.log(`✅ Supabase test successful. Found ${count} total records`);
      console.log('📋 Sample data:', JSON.stringify(data, null, 2));

      res.json({
        success: true,
        database: 'Supabase',
        table: TABLE_NAME,
        totalCount: count,
        sampleData: data,
        recordsReturned: data?.length || 0
      });

    } catch (err) {
      console.error('❌ Test endpoint error:', err);
      res.status(500).json({ 
        error: err.message,
        stack: err.stack 
      });
    }
  });

  // Test endpoint for PostgreSQL
  app.get('/test-postgresql', async (req, res) => {
    if (DB_TYPE !== 'postgresql') {
      return res.json({ 
        error: 'Not using PostgreSQL', 
        currentDbType: DB_TYPE 
      });
    }

    try {
      console.log('🧪 Testing PostgreSQL connection');
      
      const result = await database.query('SELECT * FROM cofounder_profiles LIMIT 5');
      const countResult = await database.query('SELECT COUNT(*) FROM cofounder_profiles');

      console.log(`✅ PostgreSQL test successful. Found ${countResult.rows[0].count} total records`);
      console.log('📋 Sample data:', JSON.stringify(result.rows, null, 2));

      res.json({
        success: true,
        database: 'PostgreSQL',
        table: 'cofounder_profiles',
        totalCount: parseInt(countResult.rows[0].count),
        sampleData: result.rows,
        recordsReturned: result.rows.length
      });

    } catch (err) {
      console.error('❌ PostgreSQL test error:', err);
      res.status(500).json({ 
        error: err.message,
        stack: err.stack 
      });
    }
  });
  
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    introspection: true,
    playground: true
  });

  await server.start();
  server.applyMiddleware({ app });

  const PORT = process.env.PORT || 4000;
  
  app.listen(PORT, () => {
    console.log(`🚀 Server ready at http://localhost:${PORT}${server.graphqlPath}`);
    console.log(`🧪 Test Supabase: http://localhost:${PORT}/test-supabase`);
    console.log(`🧪 Test PostgreSQL: http://localhost:${PORT}/test-postgresql`);
    console.log(`📊 Current database type: ${DB_TYPE}`);
  });
}

startServer().catch(error => {
  console.error('Error starting server:', error);
});