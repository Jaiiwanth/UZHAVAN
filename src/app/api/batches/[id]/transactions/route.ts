import { NextRequest, NextResponse } from 'next/server';
import { query, initDatabase } from '@/lib/db';
import { Transaction } from '@/types';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: 'Missing batch id' }, { status: 400 });
    }

    await initDatabase();

    // Resolve UUID if user-friendly batch_id was provided
    const batchRows = await query<any>(
      `SELECT id FROM crop_batches WHERE id = $1 OR batch_id = $1 LIMIT 1`,
      [id]
    );
    const resolvedBatchId = batchRows.length > 0 ? batchRows[0].id : id;

    const rows = await query<any>(
      `SELECT id, batch_id, stage_id, transaction_type, quantity_kg, price_per_kg,
              total_amount, payment_mode, recorded_at, notes, created_at
       FROM transactions
       WHERE batch_id = $1
       ORDER BY recorded_at DESC`,
      [resolvedBatchId]
    );

    const transactions: Transaction[] = rows.map((r) => ({
      id: r.id,
      batch_id: r.batch_id,
      stage_id: r.stage_id || undefined,
      transaction_type: r.transaction_type,
      quantity_kg: r.quantity_kg ? Number(r.quantity_kg) : undefined,
      price_per_kg: r.price_per_kg ? Number(r.price_per_kg) : undefined,
      total_amount: Number(r.total_amount),
      gross_amount: Number(r.total_amount),
      net_amount: Number(r.total_amount),
      payment_mode: r.payment_mode,
      recorded_at: new Date(r.recorded_at).toISOString(),
      notes: r.notes || undefined,
      created_at: new Date(r.created_at).toISOString(),
    }));

    return NextResponse.json({ transactions });
  } catch (err: any) {
    console.error('[API /api/batches/[id]/transactions GET Error]', err);
    return NextResponse.json({ error: err.message || 'Failed to fetch transactions' }, { status: 500 });
  }
}
