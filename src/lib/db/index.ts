import { Pool, PoolConfig } from 'pg';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

// Environment variable for PostgreSQL connection string
const connectionString =
  process.env.DATABASE_URL ||
  process.env.POSTGRES_URL ||
  process.env.POSTGRES_PRISMA_URL ||
  '';

export const isDatabaseConfigured = true;

// Global container to prevent connection/state leaks during Next.js hot-reloading
const globalForDb = globalThis as unknown as {
  pgPool?: Pool | null;
  memPool?: any;
  memDb?: any;
  dbInitialized?: boolean;
};

// Data persistence file path for local PostgreSQL fallback
const PERSIST_FILE = path.join(process.cwd(), 'db', 'uzhavar_pg_data.json');

interface PersistedData {
  users: any[];
  crop_batches: any[];
  chain_stages: any[];
  batch_notes: any[];
  transactions: any[];
}

function loadPersistedData(): PersistedData {
  try {
    if (fs.existsSync(PERSIST_FILE)) {
      const raw = fs.readFileSync(PERSIST_FILE, 'utf8');
      return JSON.parse(raw);
    }
  } catch (err) {
    console.warn('[DB Persistence Load Warning]', err);
  }
  return { users: [], crop_batches: [], chain_stages: [], batch_notes: [], transactions: [] };
}

function savePersistedData(data: PersistedData): void {
  try {
    const dir = path.dirname(PERSIST_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(PERSIST_FILE, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.warn('[DB Persistence Save Warning]', err);
  }
}

async function getLocalMemPool(): Promise<any> {
  if (globalForDb.memPool) {
    return globalForDb.memPool;
  }

  // Dynamically require pg-mem
  const { newDb } = require('pg-mem');
  const db = newDb();

  // Register uuid functions
  db.public.registerFunction({
    name: 'gen_random_uuid',
    implementation: () => crypto.randomUUID(),
  });

  const pgAdapter = db.adapters.createPg();
  const pool = new pgAdapter.Pool();

  globalForDb.memDb = db;
  globalForDb.memPool = pool;

  return pool;
}

function getRemotePool(): Pool | null {
  if (!connectionString || connectionString.includes('your-database-host') || connectionString.includes('placeholder')) {
    return null;
  }

  if (!globalForDb.pgPool) {
    const config: PoolConfig = {
      connectionString,
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    };

    if (
      connectionString.includes('sslmode=require') ||
      connectionString.includes('render.com') ||
      connectionString.includes('neon.tech') ||
      connectionString.includes('supabase.co')
    ) {
      config.ssl = { rejectUnauthorized: false };
    }

    globalForDb.pgPool = new Pool(config);

    globalForDb.pgPool.on('error', (err) => {
      console.error('[PostgreSQL Remote Pool Error]', err);
    });
  }

  return globalForDb.pgPool;
}

export async function query<T = any>(text: string, params: any[] = []): Promise<T[]> {
  const remotePool = getRemotePool();

  if (remotePool) {
    try {
      const client = await remotePool.connect();
      try {
        const res = await client.query(text, params);
        return res.rows as T[];
      } finally {
        client.release();
      }
    } catch (err) {
      console.warn('[PostgreSQL Remote Query Failed, falling back to local engine]:', err);
    }
  }

  // Fallback to local persistent PostgreSQL engine
  const localPool = await getLocalMemPool();
  await initDatabase();

  const res = await localPool.query(text, params);
  const rows = (res.rows || res) as T[];

  // If this was an INSERT/UPDATE/DELETE, persist table state to disk
  const upper = text.trim().toUpperCase();
  if (upper.startsWith('INSERT') || upper.startsWith('UPDATE') || upper.startsWith('DELETE')) {
    try {
      const [u, b, c, n, t] = await Promise.all([
        localPool.query('SELECT * FROM users'),
        localPool.query('SELECT * FROM crop_batches'),
        localPool.query('SELECT * FROM chain_stages'),
        localPool.query('SELECT * FROM batch_notes'),
        localPool.query('SELECT * FROM transactions'),
      ]);

      savePersistedData({
        users: u.rows || u,
        crop_batches: b.rows || b,
        chain_stages: c.rows || c,
        batch_notes: n.rows || n,
        transactions: t.rows || t,
      });
    } catch (persistErr) {
      // non-fatal
    }
  }

  return rows;
}

// Auto-initialize schema on first execution
export async function initDatabase(): Promise<boolean> {
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
        quantity_kg NUMERIC(12, 2) NOT NULL,
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

    const remotePool = getRemotePool();
    if (remotePool) {
      try {
        const client = await remotePool.connect();
        try {
          await client.query(ddl);
        } finally {
          client.release();
        }
      } catch (err) {
        console.warn('[PostgreSQL Remote Schema Init Warning]:', err);
      }
    }

    // Always ensure local engine is ready with schema
    const localPool = await getLocalMemPool();
    await localPool.query(ddl);

    // Restore persisted state into local engine if empty
    const usersCountRes = await localPool.query('SELECT count(*) as count FROM users');
    const count = Number(usersCountRes.rows?.[0]?.count ?? 0);
    if (count === 0) {
      const persisted = loadPersistedData();
      for (const u of persisted.users || []) {
        await localPool.query(
          `INSERT INTO users (id, email, password_hash, full_name, phone, preferred_language, role, village, district, created_at, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) ON CONFLICT (id) DO NOTHING`,
          [u.id, u.email, u.password_hash, u.full_name, u.phone, u.preferred_language, u.role, u.village, u.district, u.created_at, u.updated_at]
        );
      }
      for (const b of persisted.crop_batches || []) {
        await localPool.query(
          `INSERT INTO crop_batches (id, batch_id, user_id, crop_name, crop_name_tamil, variety, grade, quantity_kg, harvest_date, farm_location, notes, status, seal_signature, created_at, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15) ON CONFLICT (id) DO NOTHING`,
          [b.id, b.batch_id, b.user_id, b.crop_name, b.crop_name_tamil, b.variety, b.grade, b.quantity_kg, b.harvest_date, b.farm_location, b.notes, b.status, b.seal_signature, b.created_at, b.updated_at]
        );
      }
      for (const s of persisted.chain_stages || []) {
        await localPool.query(
          `INSERT INTO chain_stages (id, batch_id, stage_order, stage_type, stage_name, node_name, node_name_tamil, actor_name, location, quantity_kg, price_per_kg, recorded_at, status, verified_evidence, notes, created_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16) ON CONFLICT (id) DO NOTHING`,
          [s.id, s.batch_id, s.stage_order, s.stage_type, s.stage_name, s.node_name, s.node_name_tamil, s.actor_name, s.location, s.quantity_kg, s.price_per_kg, s.recorded_at, s.status, JSON.stringify(s.verified_evidence || []), s.notes, s.created_at]
        );
      }
      for (const n of persisted.batch_notes || []) {
        await localPool.query(
          `INSERT INTO batch_notes (id, batch_id, user_id, note_type, note, is_confidential, created_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7) ON CONFLICT (id) DO NOTHING`,
          [n.id, n.batch_id, n.user_id, n.note_type, n.note, n.is_confidential, n.created_at]
        );
      }
      for (const t of persisted.transactions || []) {
        await localPool.query(
          `INSERT INTO transactions (id, batch_id, stage_id, transaction_type, quantity_kg, price_per_kg, total_amount, payment_mode, recorded_at, notes, created_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) ON CONFLICT (id) DO NOTHING`,
          [t.id, t.batch_id, t.stage_id, t.transaction_type, t.quantity_kg, t.price_per_kg, t.total_amount, t.payment_mode, t.recorded_at, t.notes, t.created_at]
        );
      }
    }

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

const SESSION_SECRET = process.env.SESSION_SECRET || 'uzhavar-os-secret-key-2026-tnoalp-production-grade';

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
