import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { customAlphabet } from 'nanoid';

const nanoid = customAlphabet('0123456789abcdefghijklmnopqrstuvwxyz', 21);

// GET all templates
export async function GET() {
  try {
    const [rows] = await pool.query('SELECT * FROM Template ORDER BY category, type');
    return NextResponse.json(rows);
  } catch (error) {
    console.error("Error fetching templates:", error);
    return NextResponse.json({ message: 'Error interno del servidor al obtener las plantillas' }, { status: 500 });
  }
}

// POST (upsert) a template
export async function POST(request: Request) {
  try {
    const { category, type, subject, body } = await request.json();

    if (!category || !type || !body) {
      return NextResponse.json({ message: 'La categoría, el tipo y el cuerpo son obligatorios' }, { status: 400 });
    }
    if (type === 'email' && !subject) {
        return NextResponse.json({ message: 'El asunto es obligatorio para las plantillas de tipo email' }, { status: 400 });
    }

    const newId = `tpl_${nanoid(17)}`;
    const sql = `
      INSERT INTO Template (id, category, type, subject, body) 
      VALUES (?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE subject = VALUES(subject), body = VALUES(body), updatedAt = CURRENT_TIMESTAMP
    `;
    
    await pool.query(sql, [newId, category, type, subject || null, body]);

    // Fetch the created or updated record to return it
    const [result]: [any[], any] = await pool.query(
      'SELECT * FROM Template WHERE category = ? AND type = ?',
      [category, type]
    );

    return NextResponse.json(result[0], { status: 200 });

  } catch (error: any) {
    console.error("Error upserting template:", error);
    return NextResponse.json({ message: 'Error interno del servidor al guardar la plantilla' }, { status: 500 });
  }
}
