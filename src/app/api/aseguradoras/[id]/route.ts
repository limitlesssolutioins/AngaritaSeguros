import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const { name } = await request.json();

    if (!name) {
      return NextResponse.json({ message: 'El nombre es obligatorio' }, { status: 400 });
    }

    const [result]: any = await pool.query('UPDATE Aseguradora SET name = ? WHERE id = ?', [name, id]);

    if (result.affectedRows === 0) {
      return NextResponse.json({ message: 'Aseguradora no encontrada' }, { status: 404 });
    }

    return NextResponse.json({ id, name }, { status: 200 });
  } catch (error) {
    console.error('Error updating aseguradora:', error);
    return NextResponse.json({ message: 'Error interno del servidor' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    // Check for dependencies in Policy table before deleting could be a good idea, 
    // but for now we'll rely on foreign key constraints or just allow deletion if no constraints block it.
    // If foreign key restricts, it will throw an error which we catch.

    const [result]: any = await pool.query('DELETE FROM Aseguradora WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return NextResponse.json({ message: 'Aseguradora no encontrada' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Aseguradora eliminada' }, { status: 200 });
  } catch (error: any) {
    console.error('Error deleting aseguradora:', error);
    if (error.code === 'ER_ROW_IS_REFERENCED_2') {
         return NextResponse.json({ message: 'No se puede eliminar porque hay pólizas asociadas a esta aseguradora.' }, { status: 409 });
    }
    return NextResponse.json({ message: 'Error interno del servidor' }, { status: 500 });
  }
}
