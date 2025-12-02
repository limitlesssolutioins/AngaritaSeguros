import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { customAlphabet } from 'nanoid';

const nanoid = customAlphabet('0123456789abcdefghijklmnopqrstuvwxyz', 12);

export async function GET() {
  try {
    const [rows] = await pool.query('SELECT id, name FROM Aseguradora ORDER BY name ASC');
    return NextResponse.json(rows);
  } catch (error) {
    console.error("Error fetching aseguradoras:", error);
    return NextResponse.json({ message: 'Error interno del servidor' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { name } = await request.json();
    if (!name) {
      return NextResponse.json({ message: 'El nombre es obligatorio' }, { status: 400 });
    }

    // Check if it already exists
    const [existingAseguradoraRows] = await pool.query('SELECT id FROM Aseguradora WHERE name = ?', [name]);
    if (Array.isArray(existingAseguradoraRows) && existingAseguradoraRows.length > 0) {
      return NextResponse.json({ message: 'La aseguradora ya existe' }, { status: 409 });
    }

    const newId = `cl${nanoid()}`; // Generate CUID
    await pool.query('INSERT INTO Aseguradora (id, name) VALUES (?, ?)', [newId, name]);

    return NextResponse.json({ id: newId, name }, { status: 201 });
  } catch (error: any) {
    console.error("Error creating aseguradora:", error);
    if (error.code === 'ER_DUP_ENTRY') {
      return NextResponse.json({ message: 'La aseguradora ya existe' }, { status: 409 });
    }
    return NextResponse.json({ message: 'Error interno del servidor' }, { status: 500 });
  }
}
