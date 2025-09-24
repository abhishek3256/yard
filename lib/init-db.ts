import { initializeDatabase } from './database';

// Initialize database on module load
let dbInitialized = false;

export async function ensureDatabaseInitialized() {
  if (!dbInitialized) {
    await initializeDatabase();
    dbInitialized = true;
  }
}
