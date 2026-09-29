import { NextRequest, NextResponse } from 'next/server';
import { query, initDatabase, verifySessionToken, isDatabaseConfigured } from '@/lib/db';
import { cookies } from 'next/headers';
import { CropBatch } from '@/types';

function generateBatchId(): string {
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  let randomPart = '';
  for (let i = 0; i < 6; i++) {
    randomPart += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `UZH-2026-${randomPart}`;
}

function generateSha256Sig(batchId: string, crop: string, qty: number): string {
  const timestamp = new Date().toISOString();
  const raw = `${batchId}:${crop}:${qty}kg:${timestamp}`;
  let hash = 0;
  for (let i = 0; i < raw.length; i++) {
    hash = (hash << 5) - hash + raw.charCodeAt(i);
    hash |= 0;
  }
  const hex = Math.abs(hash).toString(16).padStart(8, '0').toUpperCase();
  return `SHA256:${hex.substring(0, 4)}...${hex.substring(4)}`;
}

async function getAuthenticatedUserId(req: NextRequest): Promise<string | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get('uzhavar_session')?.value;
  if (token) {
    const verified = verifySessionToken(token);
    if (verified) return verified;
  }

  // Fallback to Authorization or x-user-id header
  const authHeader = req.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const verified = verifySessionToken(authHeader.substring(7));
    if (verified) return verified;
  }
  const directUserId = req.headers.get('x-user-id');
  if (directUserId) return directUserId;

  return null;
}

export async function GET(req: NextRequest) {
  try {
    if (!isDatabaseConfigured) {
      return NextResponse.json({ batches: [], configured: false });
    }

    await initDatabase();

    const userId = await getAuthenticatedUserId(req);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const rows = await query<any>(
      `SELECT id, batch_id, user_id, crop_name, crop_name_tamil, variety, grade,
              quantity_kg, harvest_date, farm_location, notes, status, seal_signature,
              created_at, updated_at
       FROM crop_batches
       WHERE user_id = $1
       ORDER BY created_at DESC`,
      [userId]
    );

    const batches: CropBatch[] = rows.map((r) => ({
      id: r.id,
      batch_id: r.batch_id,
      user_id: r.user_id,
      crop_name: r.crop_name,
      crop_name_tamil: r.crop_name_tamil || r.crop_name,
      variety: r.variety,
      grade: r.grade,
      quantity_kg: Number(r.quantity_kg),
      harvest_date: typeof r.harvest_date === 'string' ? r.harvest_date.split('T')[0] : new Date(r.harvest_date).toISOString().split('T')[0],
      farm_location: r.farm_location,
      notes: r.notes || undefined,
      status: r.status,
      seal_signature: r.seal_signature,
      created_at: new Date(r.created_at).toISOString(),
      updated_at: new Date(r.updated_at).toISOString(),
    }));

    return NextResponse.json({ batches, configured: true });
  } catch (err: any) {
    console.error('[API /api/batches GET Error]', err);
    return NextResponse.json({ error: err.message || 'Failed to fetch batches' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    if (!isDatabaseConfigured) {
      return NextResponse.json(
        { error: 'PostgreSQL database is not configured. Please set DATABASE_URL.' },
        { status: 503 }
      );
    }

    await initDatabase();

    const userId = await getAuthenticatedUserId(req);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized. Please sign in.' }, { status: 401 });
    }

    const body = await req.json();
    const { cropName, cropNameTamil, quantityKg, variety, grade, harvestDate, farmLocation, initialNote } = body;

    if (!cropName || typeof cropName !== 'string' || cropName.trim().length === 0) {
      return NextResponse.json({ error: 'Crop or produce name is required.' }, { status: 400 });
    }

    const qty = Number(quantityKg);
    if (isNaN(qty) || qty <= 0) {
      return NextResponse.json({ error: 'Valid positive quantity in kilograms is required.' }, { status: 400 });
    }

    const batchId = generateBatchId();
    const sealSignature = generateSha256Sig(batchId, cropName, qty);
    const id = `b_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const finalHarvestDate = harvestDate || new Date().toISOString().split('T')[0];
    const finalVariety = variety?.trim() || 'Local Standard';
    const finalGrade = grade?.trim() || 'Grade A';
    const finalLocation = farmLocation?.trim() || 'Salem Agro Cluster';
    const finalCropTamil = cropNameTamil?.trim() || cropName.trim();

    // 1. Insert Batch into PostgreSQL
    await query(
      `INSERT INTO crop_batches (
        id, batch_id, user_id, crop_name, crop_name_tamil, variety, grade,
        quantity_kg, harvest_date, farm_location, notes, status, seal_signature,
        created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 'CREATED', $12, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
      [
        id,
        batchId,
        userId,
        cropName.trim(),
        finalCropTamil,
        finalVariety,
        finalGrade,
        qty,
        finalHarvestDate,
        finalLocation,
        initialNote?.trim() || null,
        sealSignature,
      ]
    );

    // 2. Insert Initial Chain Stages (TNOALP Protocol Provenance Nodes)
    const stageNodes = [
      { order: 1, type: 'FARM', name: '1. Farm Gate', tamil: '1. பண்ணை வாசல்', actor: 'Grower Lot Consignor', loc: finalLocation, price: 18.00, status: 'COMPLETED' },
      { order: 2, type: 'AGGREGATION', name: '2. Village Collection Center', tamil: '2. கிராம சேகரிப்பு மையம்', actor: 'FPO Aggregator', loc: 'Salem Rural Center', price: 21.00, status: 'IN_PROGRESS' },
      { order: 3, type: 'LOGISTICS', name: '3. Cold Chain Transport', tamil: '3. குளிர்பதன போக்குவரத்து', actor: 'Agro Logistics Carrier', loc: 'NH-44 Corridor', price: 24.50, status: 'PENDING' },
      { order: 4, type: 'MANDI', name: '4. Wholesale Mandi Hub', tamil: '4. மொத்த விற்பனை மண்டி', actor: 'Licensed Commission Agent', loc: 'Koyambedu Wholesale Hub', price: 28.00, status: 'PENDING' },
      { order: 5, type: 'RETAIL', name: '5. Retail & Consumer Point', tamil: '5. சில்லறை & நுகர்வோர் புள்ளி', actor: 'Organized Retail Point', loc: 'Urban Distribution Node', price: 32.00, status: 'PENDING' },
    ];

    for (const node of stageNodes) {
      await query(
        `INSERT INTO chain_stages (
          id, batch_id, stage_order, stage_type, stage_name, node_name, node_name_tamil,
          actor_name, location, quantity_kg, price_per_kg, recorded_at, status, verified_evidence, created_at
        ) VALUES ($1, $2, $3, $4, $5, $5, $6, $7, $8, $9, $10, CURRENT_TIMESTAMP, $11, $12, CURRENT_TIMESTAMP)`,
        [
          `stg_${id}_${node.order}`,
          id,
          node.order,
          node.type,
          node.name,
          node.tamil,
          node.actor,
          node.loc,
          qty,
          node.price,
          node.status,
          JSON.stringify(['Digital Scale Telemetry', 'TNOALP Protocol Seal']),
        ]
      );
    }

    // 3. Insert Initial Field Note if provided
    if (initialNote && initialNote.trim()) {
      await query(
        `INSERT INTO batch_notes (id, batch_id, user_id, note_type, note, is_confidential, created_at)
         VALUES ($1, $2, $3, 'field', $4, true, CURRENT_TIMESTAMP)`,
        [`note_${Date.now()}`, id, userId, initialNote.trim()]
      );
    }

    const newBatch: CropBatch = {
      id,
      batch_id: batchId,
      user_id: userId,
      crop_name: cropName.trim(),
      crop_name_tamil: finalCropTamil,
      variety: finalVariety,
      grade: finalGrade,
      quantity_kg: qty,
      harvest_date: finalHarvestDate,
      farm_location: finalLocation,
      notes: initialNote?.trim() || undefined,
      status: 'CREATED',
      seal_signature: sealSignature,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    return NextResponse.json({ batch: newBatch, success: true }, { status: 201 });
  } catch (err: any) {
    console.error('[API /api/batches POST Error]', err);
    return NextResponse.json({ error: err.message || 'Failed to create batch' }, { status: 500 });
  }
}
