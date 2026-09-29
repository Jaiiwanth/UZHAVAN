import { NextRequest, NextResponse } from 'next/server';
import { query, initDatabase, verifyPassword, createSessionToken, isDatabaseConfigured } from '@/lib/db';
import { cookies } from 'next/headers';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required.' }, { status: 400 });
    }

    if (!isDatabaseConfigured) {
      return NextResponse.json(
        { error: 'PostgreSQL database is not configured. Please set DATABASE_URL.' },
        { status: 503 }
      );
    }

    await initDatabase();

    const users = await query<{
      id: string;
      email: string;
      password_hash: string;
      full_name: string;
      preferred_language: string;
      role: string;
      phone: string;
    }>('SELECT * FROM users WHERE LOWER(email) = LOWER($1)', [email.trim()]);

    if (users.length === 0) {
      return NextResponse.json({ error: 'Invalid email or password.' }, { status: 401 });
    }

    const userRecord = users[0];
    const isMatch = verifyPassword(password, userRecord.password_hash);
    if (!isMatch) {
      return NextResponse.json({ error: 'Invalid email or password.' }, { status: 401 });
    }

    const token = createSessionToken(userRecord.id);
    const cookieStore = await cookies();
    cookieStore.set('uzhavar_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 3600,
    });

    const user = {
      id: userRecord.id,
      email: userRecord.email,
      fullName: userRecord.full_name,
      preferredLanguage: userRecord.preferred_language as 'en' | 'ta',
      role: userRecord.role as 'farmer' | 'trader' | 'fpo_admin' | 'inspector',
      phone: userRecord.phone || '',
    };

    return NextResponse.json({ user, success: true });
  } catch (err: any) {
    console.error('[API /api/auth/login Error]', err);
    return NextResponse.json({ error: err.message || 'Login failed.' }, { status: 500 });
  }
}
