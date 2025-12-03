import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { customAlphabet } from 'nanoid';

const nanoid = customAlphabet('0123456789abcdefghijklmnopqrstuvwxyz', 12);

export async function GET() {
  try {
    const [rows] = await pool.query('SELECT * FROM Client ORDER BY nombreCompleto ASC');
    return NextResponse.json(rows);
  } catch (error) {
    console.error("Error fetching clients:", error);
    return NextResponse.json({ message: 'Error interno del servidor al obtener clientes' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { 
        nombreCompleto, 
        tipoIdentificacion, 
        numeroIdentificacion, 
        fechaNacimiento, 
        direccion, 
        telefono, 
        correo 
    } = await request.json();

    if (!nombreCompleto || !numeroIdentificacion) {
      return NextResponse.json({ message: 'El nombre completo y el número de identificación son obligatorios' }, { status: 400 });
    }

    const [existingClient]: [any[], any] = await pool.query('SELECT id FROM Client WHERE numeroIdentificacion = ?', [numeroIdentificacion]);
    if (existingClient.length > 0) {
      return NextResponse.json({ message: 'Ya existe un cliente con este número de identificación' }, { status: 409 });
    }

    const newId = `cl${nanoid()}`;
    await pool.query(
      `INSERT INTO Client (id, nombreCompleto, tipoIdentificacion, numeroIdentificacion, fechaNacimiento, direccion, telefono, correo) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        newId,
        nombreCompleto,
        tipoIdentificacion || null,
        numeroIdentificacion,
        fechaNacimiento || null,
        direccion || null,
        telefono || null,
        correo || null
      ]
    );

    return NextResponse.json({ id: newId, nombreCompleto }, { status: 201 });
  } catch (error: any) {
    console.error("Error creating client:", error);
    if (error.code === 'ER_DUP_ENTRY') {
      return NextResponse.json({ message: 'Ya existe un cliente con este número de identificación' }, { status: 409 });
    }
    return NextResponse.json({ message: 'Error interno del servidor al crear el cliente' }, { status: 500 });
  }
}
