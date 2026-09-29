import { NextRequest, NextResponse } from 'next/server';
import { query, initDatabase, isDatabaseConfigured } from '@/lib/db';
import { ChainStage } from '@/types';

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
      return NextResponse.json({ stages: [], configured: false });
    }

    await initDatabase();

    // The id parameter could be batch UUID id or user-friendly batch_id (UZH-...)
    const batchRows = await query<any>(
      `SELECT id FROM crop_batches WHERE id = $1 OR batch_id = $1 LIMIT 1`,
      [id]
    );
    const resolvedBatchId = batchRows.length > 0 ? batchRows[0].id : id;

    const rows = await query<any>(
      `SELECT id, batch_id, stage_order, stage_type, stage_name, node_name, node_name_tamil,
              actor_name, location, quantity_kg, price_per_kg, recorded_at, status,
              verified_evidence, notes, created_at
       FROM chain_stages
       WHERE batch_id = $1
       ORDER BY stage_order ASC`,
      [resolvedBatchId]
    );

    const stages: ChainStage[] = rows.map((r) => ({
      id: r.id,
      batch_id: r.batch_id,
      stage_order: Number(r.stage_order),
      stage_type: r.stage_type,
      stage_name: r.stage_name,
      node_name: r.node_name || r.stage_name,
      node_name_tamil: r.node_name_tamil || undefined,
      actor_name: r.actor_name,
      location: r.location,
      quantity_kg: r.quantity_kg ? Number(r.quantity_kg) : undefined,
      price_per_kg: r.price_per_kg ? Number(r.price_per_kg) : undefined,
      recorded_at: new Date(r.recorded_at).toISOString(),
      status: r.status,
      verified_evidence: Array.isArray(r.verified_evidence)
        ? r.verified_evidence
        : typeof r.verified_evidence === 'string'
        ? JSON.parse(r.verified_evidence)
        : [],
      notes: r.notes || undefined,
      created_at: new Date(r.created_at).toISOString(),
    }));

    return NextResponse.json({ stages });
  } catch (err: any) {
    console.error('[API /api/batches/[id]/stages Error]', err);
    return NextResponse.json({ error: err.message || 'Failed to fetch stages' }, { status: 500 });
  }
}
