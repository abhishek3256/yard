import sqlite3 from 'sqlite3';
import { promisify } from 'util';
import path from 'path';

const dbPath = process.env.NODE_ENV === 'production' 
  ? '/tmp/database.sqlite' 
  : path.join(process.cwd(), 'database.sqlite');

const db = new sqlite3.Database(dbPath);

// Promisify database methods
const dbRun = promisify(db.run.bind(db));
const dbGet = promisify(db.get.bind(db));
const dbAll = promisify(db.all.bind(db));

// Custom wrapper functions to handle parameters correctly
export async function dbGetWithParams(sql: string, params: any[] = []): Promise<any> {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) {
        reject(err);
      } else {
        resolve(row);
      }
    });
  });
}

export async function dbAllWithParams(sql: string, params: any[] = []): Promise<any[]> {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
}

// Custom function to run INSERT and return the lastID
export async function dbInsert(sql: string, params: any[] = []): Promise<{ lastID: number }> {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) {
        reject(err);
      } else {
        resolve({ lastID: this.lastID });
      }
    });
  });
}

export interface User {
  id: number;
  email: string;
  password: string;
  role: 'admin' | 'member';
  tenant_id: number;
  created_at: string;
}

export interface Tenant {
  id: number;
  name: string;
  slug: string;
  subscription_plan: 'free' | 'pro';
  created_at: string;
}

export interface Note {
  id: number;
  title: string;
  content: string;
  tenant_id: number;
  user_id: number;
  created_at: string;
  updated_at: string;
}

// Initialize database
export async function initializeDatabase() {
  try {
    // Create tenants table
    await dbRun(`
      CREATE TABLE IF NOT EXISTS tenants (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        slug TEXT UNIQUE NOT NULL,
        subscription_plan TEXT DEFAULT 'free' CHECK (subscription_plan IN ('free', 'pro')),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create users table
    await dbRun(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT NOT NULL CHECK (role IN ('admin', 'member')),
        tenant_id INTEGER NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (tenant_id) REFERENCES tenants (id)
      )
    `);

    // Create notes table
    await dbRun(`
      CREATE TABLE IF NOT EXISTS notes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        tenant_id INTEGER NOT NULL,
        user_id INTEGER NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (tenant_id) REFERENCES tenants (id),
        FOREIGN KEY (user_id) REFERENCES users (id)
      )
    `);

    // Create indexes for better performance
    await dbRun(`CREATE INDEX IF NOT EXISTS idx_users_tenant_id ON users(tenant_id)`);
    await dbRun(`CREATE INDEX IF NOT EXISTS idx_notes_tenant_id ON notes(tenant_id)`);
    await dbRun(`CREATE INDEX IF NOT EXISTS idx_notes_user_id ON notes(user_id)`);

    // Insert default tenants and users
    await seedDatabase();
    
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
}

async function seedDatabase() {
  // Check if data already exists
  const existingTenants = await dbAllWithParams('SELECT COUNT(*) as count FROM tenants');
  if (existingTenants[0].count > 0) {
    return; // Database already seeded
  }

  const bcrypt = require('bcryptjs');
  const hashedPassword = await bcrypt.hash('password', 10);

  // Insert tenants
  await dbInsert(`INSERT INTO tenants (name, slug, subscription_plan) VALUES (?, ?, ?)`, 
    ['Acme Corp', 'acme', 'free']);
  await dbInsert(`INSERT INTO tenants (name, slug, subscription_plan) VALUES (?, ?, ?)`, 
    ['Globex Corp', 'globex', 'free']);

  // Get tenant IDs
  const acmeTenant = await dbGetWithParams('SELECT id FROM tenants WHERE slug = ?', ['acme']);
  const globexTenant = await dbGetWithParams('SELECT id FROM tenants WHERE slug = ?', ['globex']);

  // Insert users
  await dbInsert(`INSERT INTO users (email, password, role, tenant_id) VALUES (?, ?, ?, ?)`, 
    ['admin@acme.test', hashedPassword, 'admin', acmeTenant.id]);
  await dbInsert(`INSERT INTO users (email, password, role, tenant_id) VALUES (?, ?, ?, ?)`, 
    ['user@acme.test', hashedPassword, 'member', acmeTenant.id]);
  await dbInsert(`INSERT INTO users (email, password, role, tenant_id) VALUES (?, ?, ?, ?)`, 
    ['admin@globex.test', hashedPassword, 'admin', globexTenant.id]);
  await dbInsert(`INSERT INTO users (email, password, role, tenant_id) VALUES (?, ?, ?, ?)`, 
    ['user@globex.test', hashedPassword, 'member', globexTenant.id]);

  console.log('Database seeded with default data');
}

export { db, dbRun, dbGet, dbAll, dbGetWithParams, dbAllWithParams };
