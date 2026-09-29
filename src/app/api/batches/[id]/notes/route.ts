import { NextRequest, NextResponse } from 'next/server';
import { query, initDatabase, verifySessionToken, isDatabaseConfigured } from '@/lib/db';
import { cookies } from 'next/headers';
import { BatchNote } from '@/types';

async function getAuthenticatedUserId(req: NextRequest): Promise<string | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get('uzhavar_session')?.value;
  if (token) {
    const verified = verifySessionToken(token);
    if (verified) return verified;
  }
  const authHeader = req.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const verified = verifySessionToken(authHeader.substring(7));
    if (verified) return verified;
  }
  const directUserId = req.headers.get('x-user-id');
  if (directUserId) return directUserId;
  return null;
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id) return NextResponse.json({ error: 'Missing batch id' }, { status: 400 });

    if (!isDatabaseConfigured) {
      return NextResponse.json({ notes: [], configured: false });
    }

    await initDatabase();

    const batchRows = await query<any>(
      `SELECT id FROM crop_batches WHERE id = $1 OR batch_id = $1 LIMIT 1`,
      [id]
    );
    const resolvedBatchId = batchRows.length > 0 ? batchRows[0].id : id;

    const rows = await query<any>(
      `SELECT id, batch_id, user_id, note_type, note, is_confidential, created_at
       FROM batch_notes
       WHERE batch_id = $1
       ORDER BY created_at DESC`,
      [resolvedBatchId]
    );

    const notes: BatchNote[] = rows.map((r) => ({
      id: r.id,
      batch_id: r.batch_id,
      user_id: r.user_id,
      note_type: r.note_type,
      note: r.note,
      content: r.note,
      is_confidential: Boolean(r.is_confidential),
      created_at: new Date(r.created_at).toISOString(),
    }));

    return NextResponse.json({ notes });
  } catch (err: any) {
    console.error('[API /api/batches/[id]/notes GET Error]', err);
    return NextResponse.json({ error: err.message || 'Failed to fetch notes' }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id) return NextResponse.json({ error: 'Missing batch id' }, { status: 400 });

    if (!isDatabaseConfigured) {
      return NextResponse.json({ error: 'Database is not configured' }, { status: 503 });
    }

    await initDatabase();

    const userId = await getAuthenticatedUserId(req);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { note, noteType = 'field' } = await req.json();
    if (!note || !note.trim()) {
      return NextResponse.json({ error: 'Note text is required' }, { status: 400 });
    }

    const batchRows = await query<any>(
      `SELECT id FROM crop_batches WHERE id = $1 OR batch_id = $1 LIMIT 1`,
      [id]
    );
    const resolvedBatchId = batchRows.length > 0 ? batchRows[0].id : id;

    const noteId = `note_${Date.now()}`;
    await query(
      `INSERT INTO batch_notes (id, batch_id, user_id, note_type, note, is_confidential, created_at)
       VALUES ($1, $2, $3, $4, $5, true, CURRENT_TIMESTAMP)`,
      [noteId, resolvedBatchId, userId, noteType, note.trim()]
    );

    return NextResponse.json({
      note: {
        id: noteId,
        batch_id: resolvedBatchId,
        user_id: userId,
        note_type: noteType,
        note: note.trim(),
        content: note.trim(),
        is_confidential: true,
        created_at: new Date().toISOString(),
      },
      success: true,
    }, { status: 201 });
  } catch (err: any) {
    console.error('[API /api/batches/[id]/notes POST Error]', err);
    return NextResponse.json({ error: err.message || 'Failed to add note' }, { status: 500 });
  }
}
