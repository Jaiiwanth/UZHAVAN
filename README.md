# UZHAVAR OS — Autonomous CropChain Lens & Agronomic Lineage Protocol

> **உழவர் OS** — The Operating System for the Modern Indian Farmer

A production-grade web application built for Tamil Nadu's agricultural producers, enabling full supply-chain transparency, value-chain analytics, and crop-batch provenance through an AI-assisted agronomic protocol.

---

## Table of Contents

- [Overview](#overview)
- [Core Features](#core-features)
- [Technology Stack](#technology-stack)
- [Architecture](#architecture)
- [Database Schema](#database-schema)
- [Storage System](#storage-system)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Project Structure](#project-structure)
- [Internationalization](#internationalization)
- [Authentication & Security](#authentication--security)
- [PostgreSQL Setup](#postgresql-setup)

---

## Overview

UZHAVAR OS is an **Autonomous CropChain Lens Workstation** — a digital twin platform for crop-batch lifecycle management. Each produce consignment from farm gate to retail receives a cryptographically-sealed **Crop Passport**, a full **CropChain provenance ledger**, and real-time **Value Journey analytics**.

| Role | Capability |
|------|-----------|
| **Farmer / Producer** | Create and track crop batches, view value breakdown, record field notes |
| **Trader / Aggregator** | Inspect chain stages, verify provenance, analyse transactions |
| **FPO Administrator** | Manage member batches, oversee aggregation nodes |
| **Quality Inspector** | Audit CropChain evidence, validate certifications |

---

## Core Features

### CropChain Lens Workstation
- Interactive provenance DAG visualising each supply-chain node (Farm → Aggregation → Logistics → Mandi → Retail)
- Node-level drill-down with verified evidence and estimated variables
- SHA-256 sealed batch signature for tamper-evident records

### Value Journey Analytics
- Gross-to-net waterfall chart with logistics cost, wastage, cess, and commission breakdowns
- Epistemic certainty scoring per chain stage
- Real-time transaction ledger with payment mode tracking

### Autonomous Decision Cockpit
- Simulation workbench with sensitivity sliders (price, volume, logistics, wastage)
- Outcome Memory cards recording past decision patterns
- Anomaly alert engine for market deviation detection

### Crop Passport
- QR-code shareable batch identity card
- Bilingual (English / Tamil) produce metadata
- Chain stage count and status lifecycle badge

### Full Bilingual Support
- Complete English <-> Tamil UI switching
- Persisted language preference per user profile
- Tamil Unicode throughout — no transliteration

### PostgreSQL-Backed Auth Supabase-Backed Auth & Data Data
- Email/password sign-up and sign-in via PostgreSQL backend
- Row Level Security (RLS) — strict tenant isolation
- Offline-first with local storage fallback

### Media & Document Storage
- Supabase Storage buckets for crop images and PDF reports
- `media_assets` table linking files to batches and profiles
- Signed URL generation for secure, time-limited file access

---

## Technology Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | Next.js 16 (App Router) |
| **UI** | React 19, Tailwind CSS |
| **Typography** | Plus Jakarta Sans, Inter |
| **Icons** | Lucide React |
| **Backend/DB** | PostgreSQL |
| **Auth** | Server-side Session Auth |
| **Storage** | Supabase Storage |
| **Language** | TypeScript 5 |
| **Linting** | ESLint (Next.js config) |

---

## Architecture

```
UZHAVAR OS (Next.js App Router)
├── /login             → Auth page
├── /dashboard         → Batch list & management
└── /batch/[id]        → CropChain Lens Workstation

Service Layer (src/lib/service.ts)
├── Auth: getCurrentUser, signIn, signUp, signOut
├── Batches: getBatches, createBatch, getBatchById
├── Chain Stages: getChainStages
├── Transactions: getTransactions
├── Batch Notes: getBatchNotes, addBatchNote
└── Media: uploadMedia, getMediaAssets, getSignedUrl

PostgreSQL Database Layer
├── PostgreSQL: profiles, crop_batches, chain_stages,
│              transactions, batch_notes, media_assets
├── Auth: Email/password sessions (cookie-based SSR)
└── Storage: crop-images, batch-documents (private buckets)
```

---

## Database Schema

Full schema: `db/schema.sql`

| Table | Purpose |
|-------|---------|
| `profiles` | User profile linked to `auth.users`; stores name, role, language preference |
| `crop_batches` | Core produce consignment records with SHA-256 seal signature |
| `chain_stages` | Supply-chain provenance nodes (FARM → RETAIL) |
| `transactions` | Audited economic events (SALE, HAULAGE, STORAGE, CESS, COMMISSION) |
| `batch_notes` | Confidential farmer field notes and tacit knowledge |
| `media_assets` | File metadata linking Supabase Storage objects to batches and profiles |

All tables enforce **strict tenant isolation** via RLS using `auth.uid()`.

---

## Storage System

Two Supabase Storage buckets for media files:

| Bucket | Content | Max Size |
|--------|---------|---------|
| `crop-images` | Crop photos, field images | 10 MB |
| `batch-documents` | PDF reports, certificates, receipts | 50 MB |

### media_assets table

```sql
media_assets (
  id            uuid PRIMARY KEY,
  user_id       uuid → auth.users,
  batch_id      uuid → crop_batches (nullable),
  asset_type    'crop_image' | 'pdf_report' | 'certificate' | 'receipt' | 'other',
  bucket_name   text,
  storage_path  text,
  file_name     text,
  file_size     bigint,
  mime_type     text,
  description   text,
  is_public     boolean,
  created_at    timestamptz
)
```

### Upload Flow

```
User selects file
  → supabaseService.uploadMedia(file, batchId, assetType)
  → Validates type & size
  → Uploads to Storage: {userId}/{batchId}/{timestamp}_{filename}
  → Inserts row into media_assets
  → Returns signed URL (1-hour expiry) for immediate access
```

---

## Getting Started

### Prerequisites

- Node.js 20+
- npm 10+
- A Supabase project (free tier sufficient)

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/uzhavar_os
SESSION_SECRET=your-secure-session-secret
```

### 3. Initialise the database

Run `db/schema.sql` in your Supabase SQL Editor.

### 4. Create Storage buckets

Configure your PostgreSQL connection in .env.local

| Bucket name | Public |
|-------------|--------|
| `crop-images` | No (private) |
| `batch-documents` | No (private) |

Then apply the RLS policies from `db/schema.sql`.

### 5. Start the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase public anon key |

> **Security**: Never expose the `service_role` key client-side. All operations use the anon key with RLS.

---

## Project Structure

```
UZHAVAN OS/
├── src/
│   ├── app/
│   │   ├── page.tsx                # Root redirect
│   │   ├── login/page.tsx          # Auth page
│   │   ├── dashboard/page.tsx      # Batch dashboard
│   │   └── batch/[id]/page.tsx     # CropChain Lens Workstation
│   ├── components/
│   │   ├── batch/                  # CreateBatchModal
│   │   ├── cropchain/              # CropChainVisualizer, NodeDetailDrawer
│   │   ├── crop/                   # CropPassportCard
│   │   ├── decision/               # AutonomousDecisionCockpit
│   │   ├── farmer/                 # TacitKnowledgePanel, AnomalyAlertCard
│   │   ├── layout/                 # TopNav, Footer, BatchContextBar
│   │   ├── qr/                     # QrPassportModal
│   │   ├── simulation/             # SimulationWorkbench
│   │   └── value-journey/          # ValueWaterfallCard
│   ├── contexts/
│   │   ├── AuthContext.tsx         # Supabase Auth session
│   │   └── LanguageContext.tsx     # EN/TA switching
│   ├── lib/supabase/
│   │   ├── client.ts               # Browser client
│   │   ├── server.ts               # SSR client
│   │   └── service.ts              # All DB & storage operations
│   ├── translations/
│   │   ├── en.ts                   # English strings
│   │   └── ta.ts                   # Tamil Unicode strings
│   └── types/index.ts              # TypeScript interfaces
├── supabase/
│   └── schema.sql                  # Full schema + RLS + Storage
├── .env.example
└── README.md
```

---

## Internationalization

- **English** (`en`) — default
- **Tamil** (`ta`) — complete Unicode translation

Language preference is persisted in `profiles.preferred_language` (authenticated) or `localStorage` (offline).

All strings live in `src/translations/`.

---

## Authentication & Security

| Feature | Implementation |
|---------|---------------|
| Sign-up/in | Email + password via Supabase Auth |
| Sessions | Cookie-based via `@supabase/ssr` middleware |
| Data isolation | PostgreSQL RLS on all tables |
| Storage isolation | RLS on `media_assets` + signed URLs |
| Offline mode | Local storage fallback |

---

## PostgreSQL Setup

### Storage RLS Policies

After creating buckets, apply these in Supabase → Storage → Policies:

```sql
-- crop-images: user isolation by folder
CREATE POLICY "Users upload own crop images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'crop-images'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users read own crop images"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'crop-images'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users delete own crop images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'crop-images'
  AND auth.uid()::text = (storage.foldername(name))[1]
);
```

Apply the same three policies for `batch-documents`.

---

*UZHAVAR OS — Built for the farmers of Tamil Nadu.*
# UZHAVAN
