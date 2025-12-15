import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';

// GET a single client
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  try {
    const [rows]: [any[], any] = await pool.query('SELECT * FROM Client WHERE id = ?', [id]);
    if (rows.length === 0) {
      return NextResponse.json({ message: 'Cliente no encontrado' }, { status: 404 });
    }
    return NextResponse.json(rows[0]);
  } catch (error) {
    console.error(`Error fetching client with id ${id}:`, error);
    return NextResponse.json({ message: 'Error interno del servidor' }, { status: 500 });
  }
}

// UPDATE a client
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;
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

    await pool.query(
      `UPDATE Client SET 
        nombreCompleto = ?, tipoIdentificacion = ?, numeroIdentificacion = ?, 
        fechaNacimiento = ?, direccion = ?, telefono = ?, correo = ?,
        updatedAt = NOW()
       WHERE id = ?`,
      [
        nombreCompleto,
        tipoIdentificacion || null,
        numeroIdentificacion,
        fechaNacimiento || null,
        direccion || null,
        telefono || null,
        correo || null,
        id
      ]
    );

    return NextResponse.json({ message: 'Cliente actualizado exitosamente' }, { status: 200 });
  } catch (error: any) {
    console.error(`Error updating client with id ${id}:`, error);
    if (error.code === 'ER_DUP_ENTRY') {
      return NextResponse.json({ message: 'Ya existe un cliente con este número de identificación' }, { status: 409 });
    }
    return NextResponse.json({ message: 'Error interno del servidor al actualizar el cliente' }, { status: 500 });
  }
}

// DELETE a client
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  try {
    // Check if this client is linked to any policies before deleting
    const [policyRows]: [any[], any] = await pool.query('SELECT id FROM Policy WHERE clientId = ? LIMIT 1', [id]);
    if (policyRows.length > 0) {
        return NextResponse.json({ message: 'No se puede eliminar el cliente porque tiene pólizas asociadas. Elimine las pólizas primero.' }, { status: 409 });
    }

    await pool.query('DELETE FROM Client WHERE id = ?', [id]);
    return NextResponse.json({ message: 'Cliente eliminado exitosamente' }, { status: 200 });
  } catch (error: any) {
    console.error(`Error deleting client with id ${id}:`, error);
    if (error.code === 'ER_ROW_IS_REFERENCED_2') {
        return NextResponse.json({ message: 'No se puede eliminar el cliente porque tiene pólizas asociadas.' }, { status: 409 });
    }
    return NextResponse.json({ message: 'Error interno del servidor al eliminar el cliente' }, { status: 500 });
  }
}
