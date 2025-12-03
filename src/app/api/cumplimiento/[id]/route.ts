import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { customAlphabet } from 'nanoid';

const nanoid = customAlphabet('0123456789abcdefghijklmnopqrstuvwxyz', 12);

export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    const { id } = params;

    if (!id) {
        return NextResponse.json({ message: 'El ID de la póliza es obligatorio' }, { status: 400 });
    }

    try {
        const [rows]: [any[], any] = await pool.query(`
            SELECT 
                p.id, p.numeroPoliza, p.fechaExpedicion, p.fechaInicioVigencia, 
                p.fechaTerminacionVigencia, p.valorPrimaNeta, p.valorTotalAPagar, p.numeroAnexos, 
                p.tipoPoliza, p.files,
                a.name AS aseguradora,
                eo.name AS etiquetaOficina,
                ec.name AS etiquetaCliente,
                c.nombreCompleto AS tomadorPoliza,
                c.numeroIdentificacion AS clientNumeroIdentificacion
            FROM Policy p
            LEFT JOIN Aseguradora a ON p.aseguradoraId = a.id
            LEFT JOIN Etiqueta eo ON p.etiquetaOficinaId = eo.id
            LEFT JOIN Etiqueta ec ON p.etiquetaClienteId = ec.id
            LEFT JOIN Client c ON p.clientId = c.id
            WHERE p.id = ?
        `, [id]);

        if (rows.length === 0) {
            return NextResponse.json({ message: 'Póliza no encontrada' }, { status: 404 });
        }

        const policy = {
            ...rows[0],
            files: JSON.parse(rows[0].files || '[]')
        };

        return NextResponse.json(policy);
    } catch (error) {
        console.error(`Error fetching policy with id ${id}:`, error);
        return NextResponse.json({ message: 'Error interno del servidor' }, { status: 500 });
    }
}

export async function PUT(
    request: Request,
    { params }: { params: { id: string } }
) {
    const { id } = params;
    if (!id) {
        return NextResponse.json({ message: 'El ID de la póliza es obligatorio' }, { status: 400 });
    }

    try {
        const data = await request.formData();
        const etiquetaOficinaName = data.get('etiquetaOficina') as string;
        const etiquetaClienteName = data.get('etiquetaCliente') as string;
        const aseguradoraName = data.get('aseguradora') as string;
        const tomadorPoliza = data.get('tomadorPoliza') as string; // Will be clientNombreCompleto from form
        const clientNumeroIdentificacion = data.get('numeroIdentificacion') as string; // New field for client identification
        const tipoPoliza = data.get('tipoPoliza') as string;
        
        let aseguradoraId: string;
        let etiquetaOficinaId: string | null = null;
        let etiquetaClienteId: string;
        let clientId: string; // New variable for client ID


        const [aseguradoraRows]: [any[], any] = await pool.query('SELECT id FROM Aseguradora WHERE name = ?', [aseguradoraName]);
        if (aseguradoraRows.length > 0) { aseguradoraId = aseguradoraRows[0].id; } else { aseguradoraId = `cl${nanoid()}`; await pool.query('INSERT INTO Aseguradora (id, name) VALUES (?, ?)', [aseguradoraId, aseguradoraName]); }

        if (etiquetaOficinaName) {
            const [oficinaRows]: [any[], any] = await pool.query('SELECT id FROM Etiqueta WHERE name = ?', [etiquetaOficinaName]);
            if (oficinaRows.length > 0) { etiquetaOficinaId = oficinaRows[0].id; } else { etiquetaOficinaId = `cl${nanoid()}`; await pool.query('INSERT INTO Etiqueta (id, name) VALUES (?, ?)', [etiquetaOficinaId, etiquetaOficinaName]); }
        }

        const [clienteEtiquetaRows]: [any[], any] = await pool.query('SELECT id FROM Etiqueta WHERE name = ?', [etiquetaClienteName]);
        if (clienteEtiquetaRows.length > 0) { etiquetaClienteId = clienteEtiquetaRows[0].id; } else { etiquetaClienteId = `cl${nanoid()}`; await pool.query('INSERT INTO Etiqueta (id, name) VALUES (?, ?)', [etiquetaClienteId, etiquetaClienteName]); }

        // Find or Create Client (NEW LOGIC)
        const [existingClientRows]: [any[], any] = await pool.query('SELECT id FROM Client WHERE numeroIdentificacion = ?', [clientNumeroIdentificacion]);
        if (existingClientRows.length > 0) {
            clientId = existingClientRows[0].id;
        } else {
            clientId = `cl${nanoid()}`;
            await pool.query(
                `INSERT INTO Client (id, nombreCompleto, numeroIdentificacion, createdAt, updatedAt) 
                VALUES (?, ?, ?, NOW(), NOW())`,
                [clientId, tomadorPoliza, clientNumeroIdentificacion]
            );
        }
        
        await pool.query(
          `UPDATE Policy SET 
            fechaExpedicion = ?, fechaInicioVigencia = ?, 
            fechaTerminacionVigencia = ?, valorPrimaNeta = ?, valorTotalAPagar = ?, 
            numeroAnexos = ?, tipoPoliza = ?, aseguradoraId = ?, etiquetaOficinaId = ?,
            etiquetaClienteId = ?, clientId = ?, numeroPoliza = ?, updatedAt = NOW()
           WHERE id = ?`,
          [
            new Date(data.get('fechaExpedicion') as string),
            new Date(data.get('fechaInicioVigencia') as string),
            new Date(data.get('fechaTerminacionVigencia') as string),
            parseFloat(data.get('valorPrimaNeta') as string),
            parseFloat(data.get('valorTotalAPagar') as string),
            parseInt(data.get('numeroAnexos') as string, 10) || null,
            tipoPoliza,
            aseguradoraId,
            etiquetaOficinaId,
            etiquetaClienteId,
            clientId, // Use the client ID here
            data.get('numeroPoliza') as string,
            id
          ]
        );

        return NextResponse.json({ message: 'Póliza de cumplimiento actualizada exitosamente' }, { status: 200 });

    } catch (error: any) {
        console.error(`Error updating policy with id ${id}:`, error);
        if (error.code === 'ER_DUP_ENTRY') {
            return NextResponse.json({ message: `Error: El número de póliza ya existe.` }, { status: 409 });
        }
        return NextResponse.json({ message: 'Error interno del servidor al actualizar la póliza' }, { status: 500 });
    }
}

// Apparently, the DELETE method needs a request object, even if unused.
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  if (!id) {
    return NextResponse.json({ message: 'El ID de la póliza es obligatorio' }, { status: 400 });
  }

  try {
    // First, check if the policy exists
    const [policyRows]: [any[], any] = await pool.query('SELECT * FROM Policy WHERE id = ?', [id]);

    if (policyRows.length === 0) {
      return NextResponse.json({ message: 'Póliza no encontrada' }, { status: 404 });
    }

    // TODO: Add logic here to delete associated files from the filesystem if necessary

    // Delete the policy from the database
    await pool.query('DELETE FROM Policy WHERE id = ?', [id]);

    return NextResponse.json({ message: 'Póliza eliminada exitosamente' }, { status: 200 });

  } catch (error: any) {
    console.error('Error deleting policy:', error);
    // Handle foreign key constraint errors, e.g., ER_ROW_IS_REFERENCED_2
    if (error.code === 'ER_ROW_IS_REFERENCED_2') {
        return NextResponse.json({ message: 'No se puede eliminar la póliza porque tiene datos asociados.' }, { status: 409 });
    }
    return NextResponse.json({ message: 'Error interno del servidor al eliminar la póliza' }, { status: 500 });
  }
}
