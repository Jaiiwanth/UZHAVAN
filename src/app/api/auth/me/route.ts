import { NextRequest, NextResponse } from 'next/server';
import { query, verifySessionToken, isDatabaseConfigured } from '@/lib/db';
import { cookies } from 'next/headers';

export async function GET(req: NextRequest) {
  try {
    if (!isDatabaseConfigured) {
      return NextResponse.json({ user: null });
    }

    const cookieStore = await cookies();
    const token = cookieStore.get('uzhavar_session')?.value;
    if (!token) {
      return NextResponse.json({ user: null });
    }

    const userId = verifySessionToken(token);
    if (!userId) {
      return NextResponse.json({ user: null });
    }

    const users = await query<{
      id: string;
      email: string;
      full_name: string;
      preferred_language: string;
      role: string;
      phone: string;
    }>('SELECT id, email, full_name, preferred_language, role, phone FROM users WHERE id = $1', [userId]);

    if (users.length === 0) {
      return NextResponse.json({ user: null });
    }

    const u = users[0];
    const user = {
      id: u.id,
      email: u.email,
      fullName: u.full_name,
      preferredLanguage: (u.preferred_language as 'en' | 'ta') || 'en',
      role: (u.role as any) || 'farmer',
      phone: u.phone || '',
    };

    return NextResponse.json({ user });
  } catch (err: any) {
    console.error('[API /api/auth/me Error]', err);
    return NextResponse.json({ user: null });
  }
}
