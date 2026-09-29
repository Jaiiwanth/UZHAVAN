import { Pool, PoolConfig } from 'pg';
import crypto from 'crypto';

// Environment variable for PostgreSQL connection string
const connectionString =
  process.env.DATABASE_URL ||
  process.env.POSTGRES_URL ||
  process.env.POSTGRES_PRISMA_URL ||
  '';

export const isDatabaseConfigured = Boolean(
  connectionString &&
  !connectionString.includes('your-database-host') &&
  !connectionString.includes('placeholder')
);

// Global pool instance to prevent connection leaks during Next.js hot-reloading
const globalForDb = globalThis as unknown as {
  pgPool?: Pool;
  dbInitialized?: boolean;
};

function getPool(): Pool | null {
  if (!isDatabaseConfigured) return null;

  if (!globalForDb.pgPool) {
    const config: PoolConfig = {
      connectionString,
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    };

    // Enable SSL for remote providers (AWS, Neon, Render, Railway, etc.)
    if (connectionString.includes('sslmode=require') || connectionString.includes('render.com') || connectionString.includes('neon.tech')) {
      config.ssl = { rejectUnauthorized: false };
    }

    globalForDb.pgPool = new Pool(config);

    globalForDb.pgPool.on('error', (err) => {
      console.error('[PostgreSQL Pool Error]', err);
    });
  }

  return globalForDb.pgPool;
}

export async function query<T = any>(text: string, params: any[] = []): Promise<T[]> {
  const pool = getPool();
  if (!pool) {
    throw new Error('PostgreSQL database is not configured. Please set DATABASE_URL.');
  }

  const client = await pool.connect();
  try {
    const res = await client.query(text, params);
    return res.rows;
  } finally {
    client.release();
  }
}

// Auto-initialize schema on first execution
export async function initDatabase(): Promise<boolean> {
  if (!isDatabaseConfigured) return false;
  if (globalForDb.dbInitialized) return true;

  try {
    const ddl = `
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(64) PRIMARY KEY,
        email VARCHAR(255) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        full_name VARCHAR(255) NOT NULL,
        phone VARCHAR(32),
        preferred_language VARCHAR(8) DEFAULT 'en',
        role VARCHAR(32) DEFAULT 'farmer',
        village VARCHAR(128),
        district VARCHAR(128),
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

      CREATE TABLE IF NOT EXISTS crop_batches (
        id VARCHAR(64) PRIMARY KEY,
        batch_id VARCHAR(64) NOT NULL UNIQUE,
        user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        crop_name VARCHAR(128) NOT NULL,
        crop_name_tamil VARCHAR(128),
        variety VARCHAR(128) NOT NULL DEFAULT 'Local Standard',
        grade VARCHAR(64) NOT NULL DEFAULT 'Grade A',
        quantity_kg NUMERIC(12, 2) NOT NULL CHECK (quantity_kg > 0),
        harvest_date DATE NOT NULL DEFAULT CURRENT_DATE,
        farm_location VARCHAR(255) NOT NULL DEFAULT 'Salem Agro Cluster',
        notes TEXT,
        status VARCHAR(32) NOT NULL DEFAULT 'CREATED',
        seal_signature VARCHAR(128) NOT NULL,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_crop_batches_user ON crop_batches(user_id);
      CREATE INDEX IF NOT EXISTS idx_crop_batches_batch_id ON crop_batches(batch_id);
      CREATE INDEX IF NOT EXISTS idx_crop_batches_created ON crop_batches(created_at DESC);

      CREATE TABLE IF NOT EXISTS chain_stages (
        id VARCHAR(64) PRIMARY KEY,
        batch_id VARCHAR(64) NOT NULL REFERENCES crop_batches(id) ON DELETE CASCADE,
        stage_order INT NOT NULL,
        stage_type VARCHAR(32) NOT NULL,
        stage_name VARCHAR(128) NOT NULL,
        node_name VARCHAR(128),
        node_name_tamil VARCHAR(128),
        actor_name VARCHAR(128) NOT NULL,
        location VARCHAR(255) NOT NULL,
        quantity_kg NUMERIC(12, 2),
        price_per_kg NUMERIC(10, 2),
        recorded_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        status VARCHAR(32) NOT NULL DEFAULT 'PENDING',
        verified_evidence JSONB DEFAULT '[]'::jsonb,
        notes TEXT,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_chain_stages_batch ON chain_stages(batch_id, stage_order);

      CREATE TABLE IF NOT EXISTS batch_notes (
        id VARCHAR(64) PRIMARY KEY,
        batch_id VARCHAR(64) NOT NULL REFERENCES crop_batches(id) ON DELETE CASCADE,
        user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        note_type VARCHAR(32) NOT NULL DEFAULT 'field',
        note TEXT NOT NULL,
        is_confidential BOOLEAN DEFAULT true,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_batch_notes_batch ON batch_notes(batch_id, created_at DESC);

      CREATE TABLE IF NOT EXISTS transactions (
        id VARCHAR(64) PRIMARY KEY,
        batch_id VARCHAR(64) NOT NULL REFERENCES crop_batches(id) ON DELETE CASCADE,
        stage_id VARCHAR(64),
        transaction_type VARCHAR(32) NOT NULL DEFAULT 'SALE',
        quantity_kg NUMERIC(12, 2),
        price_per_kg NUMERIC(10, 2),
        total_amount NUMERIC(14, 2) NOT NULL,
        payment_mode VARCHAR(64) DEFAULT 'UPI / Direct Bank Transfer',
        recorded_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        notes TEXT,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_transactions_batch ON transactions(batch_id, recorded_at DESC);
    `;

    await query(ddl);
    globalForDb.dbInitialized = true;
    return true;
  } catch (err) {
    console.error('[PostgreSQL Schema Init Error]', err);
    return false;
  }
}

// ==========================================
// CRYPTOGRAPHIC UTILITIES (PASSWORD & SESSION)
// ==========================================

const SESSION_SECRET = process.env.SESSION_SECRET || 'uzhavar-os-secret-key-2026-tnoalp';

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, storedHash: string): boolean {
  const [salt, originalHash] = storedHash.split(':');
  if (!salt || !originalHash) return false;
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return hash === originalHash;
}

export function createSessionToken(userId: string): string {
  const payload = Buffer.from(JSON.stringify({ userId, exp: Date.now() + 7 * 24 * 3600 * 1000 })).toString('base64');
  const sig = crypto.createHmac('sha256', SESSION_SECRET).update(payload).digest('hex');
  return `${payload}.${sig}`;
}

export function verifySessionToken(token: string): string | null {
  try {
    const [payload, sig] = token.split('.');
    if (!payload || !sig) return null;
    const expectedSig = crypto.createHmac('sha256', SESSION_SECRET).update(payload).digest('hex');
    if (expectedSig !== sig) return null;
    const data = JSON.parse(Buffer.from(payload, 'base64').toString('utf8'));
    if (data.exp < Date.now()) return null;
    return data.userId;
  } catch {
    return null;
  }
}
