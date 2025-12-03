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
                gp.id, gp.numeroPoliza, gp.fechaExpedicion, gp.fechaInicio, gp.fechaFinVigencia, 
                gp.placa, gp.valorPrimaNeta, gp.valorTotalAPagar, gp.financiado, gp.financiera, 
                gp.files,
                a.name AS aseguradora,
                ec.name AS etiquetaCliente,
                eo.name AS etiquetaOficina,
                r.name AS ramo,
                c.nombreCompleto AS clientNombreCompleto,
                c.tipoIdentificacion AS clientTipoIdentificacion,
                c.numeroIdentificacion AS clientNumeroIdentificacion
            FROM GeneralPolicy gp
            LEFT JOIN Aseguradora a ON gp.aseguradoraId = a.id
            LEFT JOIN Etiqueta ec ON gp.etiquetaClienteId = ec.id
            LEFT JOIN Etiqueta eo ON gp.etiquetaOficinaId = eo.id
            LEFT JOIN Ramo r ON gp.ramoId = r.id
            LEFT JOIN Client c ON gp.clientId = c.id
            WHERE gp.id = ?
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
        console.error(`Error fetching general policy with id ${id}:`, error);
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
        const ramoName = data.get('ramo') as string;
        const clientNombreCompleto = data.get('nombreRazonSocial') as string;
        const clientTipoIdentificacion = data.get('tipoIdentificacion') as string;
        const clientNumeroIdentificacion = data.get('numeroIdentificacion') as string;
        // ... (rest of the fields)

        let aseguradoraId: string;
        let etiquetaOficinaId: string;
        let etiquetaClienteId: string;
        let ramoId: string;
        let clientId: string; // New variable for client ID

        // Find or Create Aseguradora
        const [existingAseguradoraRows]: [any[], any] = await pool.query('SELECT id FROM Aseguradora WHERE name = ?', [aseguradoraName]);
        if (existingAseguradoraRows.length > 0) { aseguradoraId = existingAseguradoraRows[0].id; } else { aseguradoraId = `cl${nanoid()}`; await pool.query('INSERT INTO Aseguradora (id, name) VALUES (?, ?)', [aseguradoraId, aseguradoraName]); }
        
        // Find or Create Etiqueta Oficina
        const [existingEtiquetaOficinaRows]: [any[], any] = await pool.query('SELECT id FROM Etiqueta WHERE name = ?', [etiquetaOficinaName]);
        if (existingEtiquetaOficinaRows.length > 0) { etiquetaOficinaId = existingEtiquetaOficinaRows[0].id; } else { etiquetaOficinaId = `cl${nanoid()}`; await pool.query('INSERT INTO Etiqueta (id, name) VALUES (?, ?)', [etiquetaOficinaId, etiquetaOficinaName]); }
        
        // Find or Create Etiqueta Cliente
        const [existingEtiquetaClienteRows]: [any[], any] = await pool.query('SELECT id FROM Etiqueta WHERE name = ?', [etiquetaClienteName]);
        if (existingEtiquetaClienteRows.length > 0) { etiquetaClienteId = existingEtiquetaClienteRows[0].id; } else { etiquetaClienteId = `cl${nanoid()}`; await pool.query('INSERT INTO Etiqueta (id, name) VALUES (?, ?)', [etiquetaClienteId, etiquetaClienteName]); }
        
        // Find or Create Ramo
        const [existingRamoRows]: [any[], any] = await pool.query('SELECT id FROM Ramo WHERE name = ?', [ramoName]);
        if (existingRamoRows.length > 0) { ramoId = existingRamoRows[0].id; } else { ramoId = `cl${nanoid()}`; await pool.query('INSERT INTO Ramo (id, name) VALUES (?, ?)', [ramoId, ramoName]); }

        // Find or Create Client (NEW LOGIC)
        const [existingClientRows]: [any[], any] = await pool.query('SELECT id FROM Client WHERE numeroIdentificacion = ?', [clientNumeroIdentificacion]);
        if (existingClientRows.length > 0) {
            clientId = existingClientRows[0].id;
        } else {
            clientId = `cl${nanoid()}`;
            await pool.query(
                `INSERT INTO Client (id, nombreCompleto, tipoIdentificacion, numeroIdentificacion, createdAt, updatedAt) 
                VALUES (?, ?, ?, ?, NOW(), NOW())`,
                [clientId, clientNombreCompleto, clientTipoIdentificacion, clientNumeroIdentificacion]
            );
        }

        await pool.query(
          `UPDATE GeneralPolicy SET 
            etiquetaOficinaId = ?, etiquetaClienteId = ?, aseguradoraId = ?, clientId = ?,
            ramoId = ?, numeroPoliza = ?, 
            fechaExpedicion = ?, fechaInicio = ?, fechaFinVigencia = ?, placa = ?, 
            valorPrimaNeta = ?, valorTotalAPagar = ?, financiado = ?, financiera = ?, 
            updatedAt = NOW()
           WHERE id = ?`,
          [
            etiquetaOficinaId,
            etiquetaClienteId,
            aseguradoraId,
            clientId, // Use the client ID here
            ramoId,
            data.get('numeroPoliza') as string,
            new Date(data.get('fechaExpedicion') as string),
            new Date(data.get('fechaInicio') as string),
            new Date(data.get('fechaFinVigencia') as string),
            data.get('placa') as string || null,
            parseFloat(data.get('valorPrimaNeta') as string),
            parseFloat(data.get('valorTotalAPagar') as string),
            data.get('financiado') === 'true',
            data.get('financiera') as string || null,
            id
          ]
        );

        return NextResponse.json({ message: 'Póliza general actualizada exitosamente' }, { status: 200 });

    } catch (error: any) {
        console.error(`Error updating general policy with id ${id}:`, error);
        if (error.code === 'ER_DUP_ENTRY') {
            return NextResponse.json({ message: `Error: El número de póliza ya existe.` }, { status: 409 });
        }
        return NextResponse.json({ message: 'Error interno del servidor al actualizar la póliza' }, { status: 500 });
    }
}


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
    const [policyRows]: [any[], any] = await pool.query('SELECT * FROM GeneralPolicy WHERE id = ?', [id]);

    if (policyRows.length === 0) {
      return NextResponse.json({ message: 'Póliza no encontrada' }, { status: 404 });
    }

    // TODO: Add logic here to delete associated files from the filesystem if necessary

    // Delete the policy from the database
    await pool.query('DELETE FROM GeneralPolicy WHERE id = ?', [id]);

    return NextResponse.json({ message: 'Póliza eliminada exitosamente' }, { status: 200 });

  } catch (error: any) {
    console.error('Error deleting general policy:', error);
    if (error.code === 'ER_ROW_IS_REFERENCED_2') {
        return NextResponse.json({ message: 'No se puede eliminar la póliza porque tiene datos asociados.' }, { status: 409 });
    }
    return NextResponse.json({ message: 'Error interno del servidor al eliminar la póliza' }, { status: 500 });
  }
}
