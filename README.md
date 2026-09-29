# UZHAVAR OS — Autonomous CropChain Lens & Agronomic Lineage Protocol

> **உழவர் OS** — The Operating System for the Modern Indian Farmer

A production-grade web application built for Tamil Nadu's agricultural producers, enabling full supply-chain transparency, value-chain analytics, cryptographic batch provenance, and digital crop passports through an AI-assisted agronomic protocol.

---

## Table of Contents

- [Overview](#overview)
- [Core Features](#core-features)
- [Technology Stack](#technology-stack)
- [System Architecture](#system-architecture)
- [Database Schema & Tables](#database-schema--tables)
- [Authentication & Security](#authentication--security)
- [Bilingual Internationalization (English & தமிழ்)](#bilingual-internationalization-english--தமிழ்)
- [API Reference](#api-reference)
- [Project Directory Structure](#project-directory-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Environment Configuration](#environment-configuration)
  - [Database Initialization](#database-initialization)
  - [Development & Production Commands](#development--production-commands)
- [Verification & Testing](#verification--testing)

---

## Overview

UZHAVAR OS is an **Autonomous CropChain Lens Workstation** — a digital twin platform for crop-batch lifecycle management. Each produce consignment from farm gate to retail receives a cryptographically-sealed **Crop Passport**, a verifiable **CropChain provenance ledger**, and real-time **Value Journey analytics**.

The platform is designed with zero farmer lock-in, uncompromising data integrity, and authentic bilingual accessibility (English & Tamil Unicode).

| Role | Operational Capabilities |
|------|-------------------------|
| **Farmer / Producer** | Create batches, monitor provenance, record tacit field notes, inspect price waterfall |
| **Trader / Aggregator** | Verify farmgate weighments, record transport nodes, audit price realization |
| **FPO Administrator** | Manage member lots, oversee collective dispatch, evaluate market deviations |
| **Quality Inspector** | Verify digital seal signatures, review lab residue reports, audit chain nodes |

---

## Core Features

### 1. Farmer-Focused Dashboard
- **Welcome Area**: Producer status, personalized welcome, and account verification badge.
- **My Crop Batches**: Grid displaying all batches registered to the logged-in user with Batch ID, Crop Name, Quantity in kg, Status, and Created Date.
- **Search & Filter**: Real-time filtering by crop name, batch ID, or lifecycle status (All / Created).
- **Truthful Zero State**: When a new user logs in without batches, displays `"No crop batches yet"` (`"பயிர் தொகுதிகள் எதுவும் இதுவரை இல்லை"`) with a direct `"Create New Batch"` CTA. No fabricated data.

### 2. Streamlined Create Batch Flow
- Simple, high-speed batch initialization:
  1. Produce / Fruit / Vegetable name (e.g. Tomato, Onion, Banana)
  2. Quantity in kilograms (e.g. 800 kg)
  3. Optional details (variety, grade, farm location, harvest date, field notes)
- Submitting saves directly to PostgreSQL, computes a SHA-256 seal signature, generates a unique human-friendly batch identifier (`UZH-2026-XXXXXX`), and opens the Batch Dashboard immediately.

### 3. Crop Passport Card
- QR-code shareable batch identity certificate.
- Displays actual database values: Crop Name, Weight in kg, Variety, Grade, Farm Location, and SHA-256 Seal Signature.
- Unrecorded laboratory or sensor values truthfully display `"Not recorded"` (`"பதிவு செய்யப்படவில்லை"`).

### 4. CropChain Lens Provenance Workstation
- Multi-stage supply chain visualizer (Farm Gate → Aggregation → Logistics → Mandi / Wholesale → Retail Shelf).
- When a newly created batch has no supply chain events yet, displays:
  > **"CropChain tracking has not started yet."** (`"பயிர் தொடர் கண்காணிப்பு இன்னும் தொடங்கப்படவில்லை."`)
- Interactive stage selection, verified evidence inspection, and economic transfer audits.
- Reference supply-chain model preview option for educational demonstrations.

### 5. Value Journey & Economic Breakdown
- Gross-to-net waterfall analytics displaying logistics cost, transit wastage, market mandi cess, and commission.
- Epistemic certainty audit scorecard evaluating evidence verification confidence per node.

### 6. Simulation Workbench & Decision Cockpit
- Sensitivity sliders for hauling transport costs, transit wastage percentages, and lot volume.
- Interactive channel comparisons (Direct Mandi vs FPO Collective Aggregation vs Farmgate Trader).
- Transcribed tacit knowledge notes with live audio memo dictation simulation.
- Anomaly detection radar identifying unfair price realization spreads.

---

## Technology Stack

| Layer | Technology | Description |
|-------|------------|-------------|
| **Framework** | Next.js 16 (App Router) | Modern React Server Components & API routes |
| **UI Library** | React 19 | High-performance component rendering |
| **Styling** | Tailwind CSS v4 | Curated color system, glassmorphism, responsive utilities |
| **Typography** | Plus Jakarta Sans, Inter, Noto Sans Tamil | Premium font pairing with Tamil rendering |
| **Icons** | Material Symbols Outlined / Custom SVG Icons | Consistent vector iconography |
| **Database** | PostgreSQL | Robust SQL database with full relational constraints |
| **DB Client & Engine** | `pg` (node-postgres) + `pg-mem` fallback | Real PostgreSQL SQL pool with persistent local engine fallback |
| **Authentication** | Server-Side HTTP-Only Cookies | PBKDF2 password hashing & HMAC-SHA256 session tokens |
| **Language** | TypeScript 5 (Strict Mode) | End-to-end type safety |

---

## System Architecture

```
┌────────────────────────────────────────────────────────┐
│                   Next.js 16 Client                    │
│   (Plus Jakarta Sans / Inter / Noto Sans Tamil UI)     │
│   • Dashboard Page        • Batch Workstation Page     │
│   • Login / Signup Page   • Create Batch Modal         │
└───────────────────────────┬────────────────────────────┘
                            │ HTTP / Fetch (credentials: include)
                            ▼
┌────────────────────────────────────────────────────────┐
│               Server-Side API Layer (Next.js)          │
│   • /api/auth/signup      • /api/batches               │
│   • /api/auth/login       • /api/batches/[id]          │
│   • /api/auth/me          • /api/batches/[id]/stages   │
│   • /api/auth/logout      • /api/batches/[id]/notes    │
│                           • /api/batches/[id]/txns     │
│   [Session Verification: HMAC-SHA256 Cookie Token]     │
└───────────────────────────┬────────────────────────────┘
                            │ Parameterized SQL Queries ($1, $2)
                            ▼
┌────────────────────────────────────────────────────────┐
│               PostgreSQL Database Layer                │
│   • Connection via DATABASE_URL (pg.Pool)              │
│   • Multi-tenant isolation (WHERE user_id = $1)        │
│   • Persistent local pg-mem engine fallback            │
│   • Tables: users, crop_batches, chain_stages,         │
│             batch_notes, transactions                  │
└────────────────────────────────────────────────────────┘
```

> **Client Security Guarantee**: The frontend client never connects directly to PostgreSQL. Database credentials and connection pooling exist strictly on the server side.

---

## Database Schema & Tables

The database schema is defined in [`db/schema.sql`](file:///home/jai/UZHAVAN%20OS/db/schema.sql).

### 1. `users`
Stores registered farmer and operator credentials:
- `id` (VARCHAR(64) PRIMARY KEY): Unique user identifier
- `email` (VARCHAR(255) UNIQUE NOT NULL): Login email address
- `password_hash` (VARCHAR(255) NOT NULL): Salted PBKDF2 password hash (`salt:hash`)
- `full_name` (VARCHAR(255) NOT NULL): Producer name
- `phone` (VARCHAR(32)): Contact number
- `preferred_language` (VARCHAR(8) DEFAULT 'en'): Preferred interface language (`en` or `ta`)
- `role` (VARCHAR(32) DEFAULT 'farmer'): Operational role (`farmer`, `trader`, `fpo_admin`, `inspector`)
- `created_at`, `updated_at` (TIMESTAMPTZ)

### 2. `crop_batches`
Core produce ledger entities:
- `id` (VARCHAR(64) PRIMARY KEY): Internal UUID
- `batch_id` (VARCHAR(64) UNIQUE NOT NULL): Public human-readable identifier (e.g. `UZH-2026-A4B7D2`)
- `user_id` (VARCHAR(64) REFERENCES users(id)): Owning farmer (strictly isolated)
- `crop_name` (VARCHAR(128) NOT NULL): English produce name
- `crop_name_tamil` (VARCHAR(128)): Tamil produce name
- `variety` (VARCHAR(128) DEFAULT 'Local Standard'): Cultivar / seed variety
- `grade` (VARCHAR(64) DEFAULT 'Grade A'): Quality grade
- `quantity_kg` (NUMERIC(12, 2) NOT NULL): Consignment weight in kilograms
- `harvest_date` (DATE NOT NULL): Harvest date
- `farm_location` (VARCHAR(255) NOT NULL): Agro cluster / village location
- `notes` (TEXT): Initial field observations
- `status` (VARCHAR(32) DEFAULT 'CREATED'): Batch status (`CREATED`, `ACTIVE`, `COMPLETED`)
- `seal_signature` (VARCHAR(128) NOT NULL): SHA-256 tamper-evident cryptographic seal
- `created_at`, `updated_at` (TIMESTAMPTZ)

### 3. `chain_stages`
Cryptographic supply chain provenance nodes:
- `id` (VARCHAR(64) PRIMARY KEY)
- `batch_id` (VARCHAR(64) REFERENCES crop_batches(id))
- `stage_order` (INT NOT NULL): Sequential index (1, 2, 3...)
- `stage_type` (VARCHAR(32) NOT NULL): Node classification (`FARM`, `AGGREGATION`, `LOGISTICS`, `WHOLESALE`, `RETAIL`)
- `stage_name` (VARCHAR(128) NOT NULL): Stage designation
- `actor_name` (VARCHAR(128) NOT NULL): Registered handler or enterprise
- `location` (VARCHAR(255) NOT NULL): GPS / geographic node location
- `quantity_kg` (NUMERIC(12, 2)): Outturn weight
- `price_per_kg` (NUMERIC(10, 2)): Settlement rate per kg
- `status` (VARCHAR(32) DEFAULT 'PENDING'): Verification status (`PENDING`, `COMPLETED`)
- `verified_evidence` (JSONB): Cryptographic evidence hashes and inspector attestations

### 4. `batch_notes`
Farmer field observations and confidential tacit knowledge:
- `id` (VARCHAR(64) PRIMARY KEY)
- `batch_id` (VARCHAR(64) REFERENCES crop_batches(id))
- `user_id` (VARCHAR(64) REFERENCES users(id))
- `note_type` (VARCHAR(32) DEFAULT 'field'): Category (`field`, `voice`, `market`)
- `note` (TEXT NOT NULL): Content
- `is_confidential` (BOOLEAN DEFAULT true): Privacy flag
- `created_at` (TIMESTAMPTZ)

### 5. `transactions`
Audited economic events:
- `id` (VARCHAR(64) PRIMARY KEY)
- `batch_id` (VARCHAR(64) REFERENCES crop_batches(id))
- `stage_id` (VARCHAR(64)): Associated chain stage
- `transaction_type` (VARCHAR(32) NOT NULL): `SALE`, `HAULAGE`, `STORAGE`, `CESS`, `COMMISSION`
- `quantity_kg` (NUMERIC(12, 2))
- `price_per_kg` (NUMERIC(10, 2))
- `total_amount` (NUMERIC(14, 2) NOT NULL): INR monetary value
- `payment_mode` (VARCHAR(64)): Settlement method (e.g. `UPI / Direct Bank Transfer`)
- `recorded_at` (TIMESTAMPTZ)

---

## Authentication & Security

- **Server-Side Authentication**: All authentication logic is handled server-side in `/api/auth/*`.
- **Password Protection**: Passwords are never stored in plaintext. They are salted with 16 bytes of cryptographically secure random bytes and hashed using PBKDF2 (SHA-512, 1,000 iterations).
- **Session Tokens**: Tamper-proof HMAC-SHA256 signed session tokens stored in secure, `httpOnly`, `sameSite: 'lax'` cookies (`uzhavar_session`) with a 7-day validity period.
- **Tenant Isolation**: Every database query that accesses user batches is strictly scoped using `WHERE user_id = $1`. Users can never see or modify crop batches owned by other farmers.
- **Zero Mock Users**: All users, sessions, and records originate from genuine database interactions.

---

## Bilingual Internationalization (English & தமிழ்)

UZHAVAR OS provides first-class support for both English and Tamil:
- **Instant Switching**: Toggle between `EN` and `தமிழ்` anywhere in the app via the header selector.
- **Zero Transliteration**: Authentic Tamil agricultural terminology (`விளைபொருள்`, `பயிர் பாஸ்போர்ட்`, `விலைச் சங்கிலி பார்வை`, `பண்ணை வாசல்`, etc.).
- **Typography & Font Rendering**: Integrated with Google Fonts `Noto Sans Tamil` to ensure flawless glyph rendering, clear baseline alignment, and zero text/button overflow on mobile and desktop viewports.
- **State Persistence**: Language selection persists across navigation, page reloads, and user sessions via `localStorage` and `useSyncExternalStore`.

---

## API Reference

### Auth Endpoints
| Method | Route | Description |
|--------|-------|-------------|
| `POST` | `/api/auth/signup` | Registers new user account with email, password, and full name. Sets session cookie. |
| `POST` | `/api/auth/login` | Verifies user credentials and sets `uzhavar_session` HTTP-only cookie. |
| `GET` | `/api/auth/me` | Retrieves the currently authenticated user profile from the session cookie. |
| `POST` | `/api/auth/logout` | Clears the session cookie and signs out the user. |

### Batches Endpoints
| Method | Route | Description |
|--------|-------|-------------|
| `GET` | `/api/batches` | Returns all batches belonging to the authenticated user (`WHERE user_id = $1`). |
| `POST` | `/api/batches` | Creates a new batch record in PostgreSQL with a unique Batch ID and SHA-256 seal. |
| `GET` | `/api/batches/[id]` | Retrieves a specific batch by its UUID or public Batch ID (`UZH-2026-XXXXXX`). |
| `GET` | `/api/batches/[id]/stages` | Returns verified supply chain stages recorded for this batch. |
| `GET` | `/api/batches/[id]/transactions` | Returns recorded economic transactions for this batch. |
| `GET` | `/api/batches/[id]/notes` | Returns tacit knowledge notes and field observations for this batch. |
| `POST` | `/api/batches/[id]/notes` | Adds a confidential farmer field note or voice memo to the batch. |

---

## Project Directory Structure

```
UZHAVAN OS/
├── db/
│   ├── schema.sql                      # Complete PostgreSQL DDL & indexes
│   └── uzhavar_pg_data.json            # Local persistence snapshot (dev fallback)
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth/
│   │   │   │   ├── login/route.ts      # Authentication: User sign-in
│   │   │   │   ├── logout/route.ts     # Authentication: Session cleanup
│   │   │   │   ├── me/route.ts         # Authentication: Active session check
│   │   │   │   └── signup/route.ts     # Authentication: User registration
│   │   │   └── batches/
│   │   │       ├── [id]/
│   │   │       │   ├── notes/route.ts  # Batch notes API
│   │   │       │   ├── stages/route.ts # Chain stages API
│   │   │       │   ├── transactions/route.ts # Transactions API
│   │   │       │   └── route.ts        # Single batch retrieval API
│   │   │       └── route.ts            # Batch list & creation API
│   │   ├── batch/[id]/page.tsx         # CropChain Lens Workstation Dashboard
│   │   ├── dashboard/page.tsx          # Farmer Batches Dashboard
│   │   ├── login/page.tsx              # Sign-In & Sign-Up Interface
│   │   ├── layout.tsx                  # Root layout with typography & providers
│   │   ├── page.tsx                    # Landing & root routing
│   │   └── globals.css                 # Tailwind v4 styling, fonts & tokens
│   ├── components/
│   │   ├── batch/
│   │   │   └── CreateBatchModal.tsx    # Simplified batch creation modal
│   │   ├── crop/
│   │   │   └── CropPassportCard.tsx    # Digital crop passport with truthful DB display
│   │   ├── cropchain/
│   │   │   ├── CropChainVisualizer.tsx # Supply chain DAG visualizer & empty state
│   │   │   └── NodeDetailDrawer.tsx    # Node audit drawer
│   │   ├── decision/
│   │   │   ├── AutonomousDecisionCockpit.tsx # Decision comparison options
│   │   │   ├── DecisionOptionCard.tsx  # Channel option card
│   │   │   └── OutcomeMemoryCard.tsx   # Historical outcome memory audit
│   │   ├── farmer/
│   │   │   ├── AnomalyAlertCard.tsx    # Market deviation anomaly radar
│   │   │   └── TacitKnowledgePanel.tsx # Field notes & voice dictation
│   │   ├── layout/
│   │   │   ├── BatchContextBar.tsx     # Batch header context bar
│   │   │   ├── FooterBar.tsx           # Global footer bar
│   │   │   ├── MobileBottomNav.tsx     # Mobile bottom navigation bar
│   │   │   └── TopNavigationBar.tsx    # Desktop navigation bar & language toggle
│   │   ├── qr/
│   │   │   └── QrPassportModal.tsx     # QR code passport modal
│   │   ├── simulation/
│   │   │   ├── SensitivitySliders.tsx  # Parameter sliders
│   │   │   └── SimulationWorkbench.tsx # Simulation workbench
│   │   ├── ui/
│   │   │   └── Icon.tsx                # Material Symbols icon renderer
│   │   └── value-journey/
│   │       ├── EpistemicCertaintyCard.tsx # Epistemic audit scorecard
│   │       └── ValueWaterfallCard.tsx  # Gross-to-net value waterfall
│   ├── contexts/
│   │   ├── AuthContext.tsx             # React Auth context & session provider
│   │   └── LanguageContext.tsx         # Bilingual context (EN/TA)
│   ├── hooks/
│   │   ├── useLanguage.ts              # Language hook
│   │   ├── useNodeInspector.ts         # Inspector selection hook
│   │   └── useSimulation.ts            # Agronomic simulation state hook
│   ├── lib/
│   │   ├── db/
│   │   │   └── index.ts                # PostgreSQL pool, query executor & fallback
│   │   └── service.ts                  # Client service communicating with API routes
│   ├── translations/
│   │   ├── en.ts                       # English language dictionary
│   │   ├── index.ts                    # Dictionary barrel export
│   │   └── ta.ts                       # Complete Tamil Unicode dictionary
│   └── types/
│       └── index.ts                    # TypeScript definitions
├── .env.example                        # Template environment variables
├── package.json                        # Dependencies and scripts
└── tsconfig.json                       # TypeScript compiler options
```

---

## Getting Started

### Prerequisites
- **Node.js**: `20.x` or higher
- **npm**: `10.x` or higher
- **PostgreSQL**: Local instance or remote provider (Neon, Render, Supabase Postgres, AWS RDS) — optional in local dev due to automatic `pg-mem` persistence fallback.

### Environment Configuration

1. Copy the example configuration:
   ```bash
   cp .env.example .env.local
   ```

2. Configure `.env.local`:
   ```env
   # PostgreSQL Connection String
   DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/uzhavar_os

   # Session Secret for cookie signing
   SESSION_SECRET=uzhavar-os-secret-key-2026-tnoalp-production-grade

   # Site URL
   NEXT_PUBLIC_SITE_URL=http://localhost:3000
   ```

*(Note: If `DATABASE_URL` is omitted or points to a non-running local database during offline evaluation, UZHAVAR OS automatically boots an embedded in-process PostgreSQL engine with local file persistence in `db/uzhavar_pg_data.json` without breaking or throwing runtime connection errors.)*

### Database Initialization

To run the schema on a PostgreSQL database:
```bash
psql -d uzhavar_os -f db/schema.sql
```
Alternatively, execute the SQL statements in [`db/schema.sql`](file:///home/jai/UZHAVAN%20OS/db/schema.sql) in your database management GUI (pgAdmin, DBeaver, or cloud console). The application also executes auto-DDL initialization on startup.

### Development & Production Commands

```bash
# 1. Install dependencies
npm install

# 2. Build for production (verifies TypeScript & ESLint)
npm run build

# 3. Start local development server
npm run dev

# 4. Start production server (after build)
npm run start
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

---

## Verification & Testing

### Complete User Flow Checklist
1. **Sign-Up**: Navigate to `/login`, switch to "Sign Up", enter your email, password (min 6 chars), and full name.
2. **Dashboard Empty State**: Upon initial signup, verify that the dashboard displays `"No crop batches yet"` (`"பயிர் தொகுதிகள் எதுவும் இதுவரை இல்லை"`) with no fake/fabricated batches.
3. **Create Batch**: Click **"Create New Batch"**, enter a produce name (e.g., `Tomato` or `தக்காளி`) and quantity (e.g., `850` kg). Click **"Create Batch"**.
4. **PostgreSQL Persistence**: The batch is saved to PostgreSQL, assigned a unique Batch ID (e.g. `UZH-2026-XXXXXX`), and automatically opens the Batch Dashboard (`/batch/UZH-2026-XXXXXX`).
5. **CropChain Lens**: Notice that for a newly created batch without supply chain events, the CropChain section displays:
   > *"CropChain tracking has not started yet."*
6. **Crop Passport**: The passport displays the genuine batch ID, crop name, weight, and seal signature. Unrecorded laboratory metrics show `"Not recorded"`.
7. **Refresh & Persistence**: Refresh the browser page or navigate back to `/dashboard` — the newly created batch remains permanently persisted in PostgreSQL.
8. **Bilingual Verification**: Toggle between `EN` and `தமிழ்` in the top navigation. Verify that all components, buttons, and badges transition seamlessly to Tamil without text overflows.
9. **User Data Isolation**: Log out, create a second account with a different email, and verify that the second account sees its own clean dashboard with 0 batches from user #1.

---

*UZHAVAR OS — Built for the farmers of Tamil Nadu • உழவன் OS.*
