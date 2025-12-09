const { createPool } = require('mysql2/promise');
const { hash } = require('bcryptjs');
const { nanoid } = require('nanoid');
require('dotenv').config();

// Fix for .env loading if needed, but usually strictly typed imports are the issue in TS files ran as JS
// I will use standard JS requires for this standalone script.

async function seed() {
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
      };
    })();

  const pool = createPool({
      ...dbConfig,
      waitForConnections: true,
      connectionLimit: 1,
  });

  try {
    const email = 'admin@angaritaseguros.com';
    const password = 'admin'; // Temporary password
    const hashedPassword = await hash(password, 12);
    const id = nanoid();

    // Check if exists
    const [rows] = await pool.query('SELECT * FROM User WHERE email = ?', [email]);
    if (rows.length > 0) {
      console.log('Admin user already exists.');
      return;
    }

    await pool.query(
      'INSERT INTO User (id, name, email, password_hash, role, office) VALUES (?, ?, ?, ?, ?, ?)',
      [id, 'Super Admin', email, hashedPassword, 'Superadmin', 'Principal']
    );

    console.log(`Superadmin created! Email: ${email}, Password: ${password}`);
  } catch (err) {
    console.error('Error seeding admin:', err);
  } finally {
    await pool.end();
  }
}

seed();
