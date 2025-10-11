/**
 * @file Database configuration and connection pooling.
 * @description This file initializes the node-postgres connection pool, which is
 * used to interact with the PostgreSQL database throughout the application.
 */

// Import the Pool class from the node-postgres (pg) library.
const { Pool } = require('pg')

/**
 * A connection pool is a cache of database connections that can be reused for
 * future database requests. This is a standard practice for performance.
 *
 * Why use a pool?
 * - Performance: Opening/closing database connections for every query is slow. A pool
 * maintains open connections that can be quickly "checked out" and "returned".
 * - Resource Management: It prevents the application from creating too many simultaneous
 * connections, which could overwhelm the database server.
 */
const pool = new Pool({
  // The connectionString is a single string containing all the information needed
  // to connect to the database (user, password, host, port, database name).
  // It's read securely from the .env file.
  // Example format: postgresql://user:password@host:port/database
  connectionString: process.env.DATABASE_URL,
})

// Export the configured pool object. This creates a single, shared instance
// that can be imported and used by any other file in the application to query the database.
module.exports = pool