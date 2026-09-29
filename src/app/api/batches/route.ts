import { NextRequest, NextResponse } from 'next/server';
import { query, initDatabase, verifySessionToken } from '@/lib/db';
import { cookies } from 'next/headers';
import { CropBatch } from '@/types';
import crypto from 'crypto';

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
  return 'SHA256:' + crypto.createHash('sha256').update(raw).digest('hex').substring(0, 16).toUpperCase();
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
    const id = crypto.randomUUID();
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

    // 2. Insert Initial Field Note if provided
    if (initialNote && initialNote.trim()) {
      await query(
        `INSERT INTO batch_notes (id, batch_id, user_id, note_type, note, is_confidential, created_at)
         VALUES ($1, $2, $3, 'field', $4, true, CURRENT_TIMESTAMP)`,
        [crypto.randomUUID(), id, userId, initialNote.trim()]
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
