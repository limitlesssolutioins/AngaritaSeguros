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
    connectionLimit: 10,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 30000,
    connectTimeout: 10000,
    idleTimeout: 60000,
};

let pool: Pool;

if (process.env.NODE_ENV === 'production') {
  pool = createPool(poolOptions);
} else {
  // Always create a new pool in development to avoid issues with hot-reloading
  // This is less efficient but more robust against ECONNRESET in dev
  pool = createPool(poolOptions);
}

export { pool };