-- ==============================================================================
-- UZHAVAR OS — PostgreSQL Production Database Schema
-- ==============================================================================

-- Enable UUID extension if available
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. USERS & PROFILES TABLE
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

-- 2. CROP BATCHES TABLE (Primary Ledger Entities)
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

-- 3. CHAIN STAGES TABLE (Cryptographic Provenance Nodes)
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

-- 4. BATCH NOTES TABLE (Farmer Tacit Knowledge)
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

-- 5. TRANSACTIONS TABLE
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
