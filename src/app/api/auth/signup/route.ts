import { NextRequest, NextResponse } from 'next/server';
import { query, initDatabase, hashPassword, createSessionToken, isDatabaseConfigured } from '@/lib/db';
import { cookies } from 'next/headers';

export async function POST(req: NextRequest) {
  try {
    const { email, password, fullName, preferredLanguage = 'en' } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required.' }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters.' }, { status: 400 });
    }

    if (!isDatabaseConfigured) {
      return NextResponse.json(
        { error: 'PostgreSQL database is not configured. Please set DATABASE_URL.' },
        { status: 503 }
      );
    }

    await initDatabase();

    // Check if user already exists
    const existing = await query('SELECT id FROM users WHERE LOWER(email) = LOWER($1)', [email.trim()]);
    if (existing.length > 0) {
      return NextResponse.json({ error: 'An account with this email already exists.' }, { status: 409 });
    }

    const userId = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const passwordHash = hashPassword(password);
    const displayName = fullName?.trim() || email.split('@')[0];

    await query(
      `INSERT INTO users (id, email, password_hash, full_name, preferred_language, role, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
      [userId, email.trim().toLowerCase(), passwordHash, displayName, preferredLanguage, 'farmer']
    );

    const token = createSessionToken(userId);
    const cookieStore = await cookies();
    cookieStore.set('uzhavar_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 3600,
    });

    const user = {
      id: userId,
      email: email.trim().toLowerCase(),
      fullName: displayName,
      preferredLanguage: preferredLanguage as 'en' | 'ta',
      role: 'farmer' as const,
      phone: '',
    };

    return NextResponse.json({ user, success: true }, { status: 201 });
  } catch (err: any) {
    console.error('[API /api/auth/signup Error]', err);
    return NextResponse.json({ error: err.message || 'Registration failed.' }, { status: 500 });
  }
}
