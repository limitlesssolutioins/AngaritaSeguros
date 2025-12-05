import { pool } from './src/lib/db';

async function addColumnsToGeneralPolicy() {
  try {
    const query = `
      ALTER TABLE GeneralPolicy
      ADD COLUMN status VARCHAR(50) DEFAULT 'upcoming',
      ADD COLUMN responsibleAgentId VARCHAR(255) NULL,
      ADD COLUMN lastReminderSent DATETIME NULL;
    `;
    await pool.query(query);
    console.log('Columns added to GeneralPolicy table successfully!');
  } catch (error) {
    console.error('Error adding columns to GeneralPolicy table:', error);
  } finally {
    await pool.end(); // Close the pool after execution
  }
}

addColumnsToGeneralPolicy();
