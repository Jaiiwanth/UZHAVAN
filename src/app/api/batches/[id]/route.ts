import { NextRequest, NextResponse } from 'next/server';
import { query, initDatabase, isDatabaseConfigured } from '@/lib/db';
import { CropBatch } from '@/types';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: 'Missing batch id' }, { status: 400 });
    }

    if (!isDatabaseConfigured) {
      return NextResponse.json({ batch: null, configured: false });
    }

    await initDatabase();

    const rows = await query<any>(
      `SELECT id, batch_id, user_id, crop_name, crop_name_tamil, variety, grade,
              quantity_kg, harvest_date, farm_location, notes, status, seal_signature,
              created_at, updated_at
       FROM crop_batches
       WHERE id = $1 OR batch_id = $1
       LIMIT 1`,
      [id]
    );

    if (rows.length === 0) {
      return NextResponse.json({ batch: null, error: 'Batch not found' }, { status: 404 });
    }

    const r = rows[0];
    const batch: CropBatch = {
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
    };

    return NextResponse.json({ batch });
  } catch (err: any) {
    console.error('[API /api/batches/[id] GET Error]', err);
    return NextResponse.json({ error: err.message || 'Failed to fetch batch' }, { status: 500 });
  }
}
