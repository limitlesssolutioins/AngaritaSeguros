import { createPool, Pool } from 'mysql2/promise';

declare global {
  var mysqlPool: Pool | undefined;
}

const dbConfig = (() => {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not set');
  }

  const parsed = new URL(process.env.DATABASE_URL);
  return {
    host: parsed.hostname || 'localhost',
    user: parsed.username,
    password: parsed.password,
    database: parsed.pathname.substring(1), // Reverted to use the .env value
    port: parseInt(parsed.port || '3306', 10),
  };
})();

const poolOptions = {
    host: dbConfig.host,
    user: dbConfig.user,
    password: dbConfig.password,
    database: dbConfig.database,
    port: dbConfig.port,
    waitForConnections: true,
    connectionLimit: 5, // Reduced limit to be conservative with remote connections
    queueLimit: 0,
    enableKeepAlive: true, // Re-enabled to prevent server closing idle connections
    keepAliveInitialDelay: 0, // Send keepalive immediately/frequently
    connectTimeout: 20000,
    idleTimeout: 30000, // Close idle connections faster to avoid stale ones
};

let pool: Pool;

// In this specific environment, the singleton pattern is causing ECONNRESET issues
// because the global connection pool becomes stale or broken after a restart or timeout.
// We will force creating a new pool for every request in development to ensure reliability,
// even though it's less efficient.
if (process.env.NODE_ENV === 'production') {
  pool = createPool(poolOptions);
} else {
  // force new pool every time module is loaded/refreshed
   pool = createPool(poolOptions);
}

export { pool };