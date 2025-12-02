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
    database: parsed.pathname.substring(1),
    port: parseInt(parsed.port || '3306', 10),
    // ssl: parsed.searchParams.has('sslmode') && parsed.searchParams.get('sslmode') === 'REQUIRED' // Removed this line
  };
})();

let pool: Pool;

if (process.env.NODE_ENV === 'production') {
  pool = createPool({
    host: dbConfig.host,
    user: dbConfig.user,
    password: dbConfig.password,
    database: dbConfig.database,
    port: dbConfig.port,
    // ssl: dbConfig.ssl ? { rejectUnauthorized: false } : undefined, // Removed this line
  });
} else {
  if (!global.mysqlPool) {
    global.mysqlPool = createPool({
      host: dbConfig.host,
      user: dbConfig.user,
      password: dbConfig.password,
      database: dbConfig.database,
      port: dbConfig.port,
    });
  }
  pool = global.mysqlPool;
}

export { pool };