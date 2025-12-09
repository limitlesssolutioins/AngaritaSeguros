import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { hashPassword } from '@/lib/auth';
import { nanoid } from 'nanoid';

// GET all users
export async function GET() {
  try {
    const [rows] = await pool.query('SELECT id, name, email, role, office, createdAt FROM User');
    return NextResponse.json(rows);
  } catch (error) {
    console.error('Database Error:', error);
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}

// CREATE a new user
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, password, role, office } = body;

    // 1. Validation
    if (!name || !email || !password || !role || !office) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // 2. Check if user already exists
    const [existingUsers]: any = await pool.query('SELECT id FROM User WHERE email = ?', [email]);
    if (existingUsers.length > 0) {
      return NextResponse.json({ error: 'User already exists' }, { status: 409 });
    }

    // 3. Hash Password
    const hashedPassword = await hashPassword(password);

    // 4. Generate ID and Insert
    const id = nanoid();
    await pool.query(
      'INSERT INTO User (id, name, email, password_hash, role, office) VALUES (?, ?, ?, ?, ?, ?)',
      [id, name, email, hashedPassword, role, office]
    );

    return NextResponse.json({ 
      message: 'User created successfully',
      user: { id, name, email, role, office }
    }, { status: 201 });

  } catch (error) {
    console.error('Registration Error:', error);
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
  }
}