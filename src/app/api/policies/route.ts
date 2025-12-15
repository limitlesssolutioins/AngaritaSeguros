import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import { pool } from '@/lib/db'; // Import the mysql2 connection pool
import { customAlphabet } from 'nanoid'; // For generating CUIDs
import { uploadFileToS3 } from '@/lib/s3'; // Import S3 upload function

const nanoid = customAlphabet('0123456789abcdefghijklmnopqrstuvwxyz', 12); // Simulating CUIDs

export async function GET(request: NextRequest) {
  try {
    const clientId = request.nextUrl.searchParams.get('clientId');

    let baseQuery = `
      SELECT 
        gp.id, gp.numeroPoliza, gp.fechaExpedicion, gp.fechaInicio, gp.fechaFinVigencia, 
        gp.placa, gp.valorPrimaNeta, gp.valorTotalAPagar, gp.financiado, gp.financiera, 
        gp.files, gp.createdAt, gp.updatedAt,
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
    `;

    const params: any[] = [];
    if (clientId) {
      baseQuery += ' WHERE gp.clientId = ?';
      params.push(clientId);
    }

    baseQuery += ' ORDER BY gp.createdAt DESC';

    const [rows] = await pool.query(baseQuery, params);
    
    const policies = rows as any[]; 
    
    const formattedPolicies = policies.map(p => ({
      ...p,
      fechaExpedicion: p.fechaExpedicion?.toISOString(),
      fechaInicio: p.fechaInicio?.toISOString(),
      fechaFinVigencia: p.fechaFinVigencia?.toISOString(),
      createdAt: p.createdAt?.toISOString(),
      updatedAt: p.updatedAt?.toISOString(),
      files: p.files ? JSON.parse(p.files) : [] // Parse JSON string from DB, handle null
    }));

    return NextResponse.json(formattedPolicies);
  } catch (error) {
    console.error('Error fetching general policies:', error);
    return NextResponse.json({ message: 'Error interno del servidor al obtener pólizas generales' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.formData();
    
    const etiquetaOficinaName = data.get('etiquetaOficina') as string;
    const etiquetaClienteName = data.get('etiquetaCliente') as string;
    const aseguradoraName = data.get('aseguradora') as string;
    const clientNombreCompleto = data.get('nombreRazonSocial') as string; // Comes from form
    const clientTipoIdentificacion = data.get('tipoIdentificacion') as string; // Comes from form
    const clientNumeroIdentificacion = data.get('numeroIdentificacion') as string; // Comes from form
    const ramoName = data.get('ramo') as string;
    const numeroPoliza = data.get('numeroPoliza') as string;
    const fechaExpedicion = data.get('fechaExpedicion') as string;
    const fechaInicio = data.get('fechaInicio') as string;
    const fechaFinVigencia = data.get('fechaFinVigencia') as string;
    const placa = data.get('placa') as string | undefined;
    const valorPrimaNeta = data.get('valorPrimaNeta') as string;
    const valorTotalAPagar = data.get('valorTotalAPagar') as string;
    const financiado = data.get('financiado') === 'true'; 
    const financiera = data.get('financiera') as string | undefined;
    const files = data.getAll('files') as File[];

    // --- Validation ---
    if (!etiquetaOficinaName || !etiquetaClienteName || !aseguradoraName || !clientNombreCompleto || !clientTipoIdentificacion || !clientNumeroIdentificacion || !ramoName || !numeroPoliza || !fechaExpedicion || !fechaInicio || !fechaFinVigencia || !valorPrimaNeta || !valorTotalAPagar || (financiado && !financiera)) {
        return NextResponse.json({ message: 'Faltan campos obligatorios para la póliza general' }, { status: 400 });
    }

    // --- File Upload Logic ---
    const uploadedFilePaths: string[] = [];
    if (files && files.length > 0) {
      for (const file of files) {
        const s3Url = await uploadFileToS3(file, 'policies'); // Upload to 'policies' folder in S3
        uploadedFilePaths.push(s3Url);
      }
    }

    // --- Database Logic ---
    let aseguradoraId: string;
    let etiquetaOficinaId: string;
    let etiquetaClienteId: string;
    let ramoId: string;
    let clientId: string; // New variable for client ID


    // Find or Create Aseguradora
    const [existingAseguradoraRows] = await pool.query('SELECT id FROM Aseguradora WHERE name = ?', [aseguradoraName]);
    if (Array.isArray(existingAseguradoraRows) && existingAseguradoraRows.length > 0) {
      aseguradoraId = existingAseguradoraRows[0].id;
    } else {
      aseguradoraId = `cl${nanoid()}`;
      await pool.query('INSERT INTO Aseguradora (id, name) VALUES (?, ?)', [aseguradoraId, aseguradoraName]);
    }

    // Find or Create Etiqueta Oficina
    const [existingEtiquetaOficinaRows] = await pool.query('SELECT id FROM Etiqueta WHERE name = ?', [etiquetaOficinaName]);
    if (Array.isArray(existingEtiquetaOficinaRows) && existingEtiquetaOficinaRows.length > 0) {
      etiquetaOficinaId = existingEtiquetaOficinaRows[0].id;
    } else {
      etiquetaOficinaId = `cl${nanoid()}`;
      await pool.query('INSERT INTO Etiqueta (id, name) VALUES (?, ?)', [etiquetaOficinaId, etiquetaOficinaName]);
    }

    // Find or Create Etiqueta Cliente
    const [existingEtiquetaClienteRows] = await pool.query('SELECT id FROM Etiqueta WHERE name = ?', [etiquetaClienteName]);
    if (Array.isArray(existingEtiquetaClienteRows) && existingEtiquetaClienteRows.length > 0) {
      etiquetaClienteId = existingEtiquetaClienteRows[0].id;
    } else {
      etiquetaClienteId = `cl${nanoid()}`;
      await pool.query('INSERT INTO Etiqueta (id, name) VALUES (?, ?)', [etiquetaClienteId, etiquetaClienteName]);
    }

    // Find or Create Ramo (NEW)
    const [existingRamoRows] = await pool.query('SELECT id FROM Ramo WHERE name = ?', [ramoName]);
    if (Array.isArray(existingRamoRows) && existingRamoRows.length > 0) {
      ramoId = existingRamoRows[0].id;
    } else {
      ramoId = `cl${nanoid()}`;
      await pool.query('INSERT INTO Ramo (id, name) VALUES (?, ?)', [ramoId, ramoName]);
    }

    // Find or Create Client (NEW LOGIC)
    const [existingClientRows]: [any[], any] = await pool.query('SELECT id FROM Client WHERE numeroIdentificacion = ?', [clientNumeroIdentificacion]);
    if (existingClientRows.length > 0) {
      clientId = existingClientRows[0].id;
    } else {
      clientId = `cl${nanoid()}`;
      await pool.query(
        `INSERT INTO Client (id, nombreCompleto, tipoIdentificacion, numeroIdentificacion) 
         VALUES (?, ?, ?, ?)`,
        [clientId, clientNombreCompleto, clientTipoIdentificacion, clientNumeroIdentificacion]
      );
    }


    const policyId = `cl${nanoid()}`;
            await pool.query(
              `INSERT INTO GeneralPolicy (
                id, etiquetaOficinaId, etiquetaClienteId, aseguradoraId, clientId, ramoId, numeroPoliza,
                fechaExpedicion, fechaInicio, fechaFinVigencia, placa, valorPrimaNeta,
                valorTotalAPagar, financiado, financiera, files, createdAt, updatedAt
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
              [
                policyId,
                etiquetaOficinaId,
                etiquetaClienteId,
                aseguradoraId,
                clientId, // Use the client ID here
                ramoId,
                numeroPoliza,
                new Date(fechaExpedicion),
                new Date(fechaInicio),
                new Date(fechaFinVigencia),
                placa || null,
                parseFloat(valorPrimaNeta),
                parseFloat(valorTotalAPagar),
                financiado,
                financiera || null,
                JSON.stringify(uploadedFilePaths), // Storing as JSON string
                new Date(), // Value for createdAt
                new Date(), // Value for updatedAt
              ]
            );    return NextResponse.json({ message: 'Póliza general creada exitosamente', policy: { id: policyId, numeroPoliza, clientNombreCompleto } }, { status: 201 });

  } catch (error: any) {
    console.error('Error creating general policy:', error);
    console.error('Error details:', error.message, error.stack, error.code); 
    if (error.code === 'ER_DUP_ENTRY') {
      return NextResponse.json({ message: `Error: El número de póliza '${data.get('numeroPoliza')}' ya existe.` }, { status: 409 });
    }
    return NextResponse.json({ message: 'Error interno del servidor al crear la póliza general' }, { status: 500 });
  }
}
