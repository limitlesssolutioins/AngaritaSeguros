import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { pool } from '@/lib/db'; // Import the mysql2 connection pool
import { customAlphabet } from 'nanoid'; // For generating CUIDs

const nanoid = customAlphabet('0123456789abcdefghijklmnopqrstuvwxyz', 12); // Simulating CUIDs

export async function GET() {
  try {
    const [rows] = await pool.query(`
      SELECT 
        p.id, p.numeroPoliza, 
        c.nombreCompleto AS clientNombreCompleto, c.numeroIdentificacion, c.tipoIdentificacion,
        p.fechaExpedicion, p.fechaInicioVigencia, 
        p.fechaTerminacionVigencia, p.valorPrimaNeta, p.valorTotalAPagar, p.numeroAnexos, 
        p.tipoPoliza, p.files, p.createdAt, p.updatedAt,
        a.name AS aseguradora,
        eo.name AS etiquetaOficina,
        ec.name AS etiquetaCliente
      FROM Policy p
      LEFT JOIN Aseguradora a ON p.aseguradoraId = a.id
      LEFT JOIN Etiqueta eo ON p.etiquetaOficinaId = eo.id
      LEFT JOIN Etiqueta ec ON p.etiquetaClienteId = ec.id
      LEFT JOIN Client c ON p.clientId = c.id
      ORDER BY p.createdAt DESC
    `);
    
    const policies = rows as any[]; 
    
    const formattedPolicies = policies.map(p => ({
      ...p,
      // Ensure these properties exist before calling toISOString
      fechaExpedicion: p.fechaExpedicion ? new Date(p.fechaExpedicion).toISOString() : null,
      fechaInicioVigencia: p.fechaInicioVigencia ? new Date(p.fechaInicioVigencia).toISOString() : null,
      fechaTerminacionVigencia: p.fechaTerminacionVigencia ? new Date(p.fechaTerminacionVigencia).toISOString() : null,
      createdAt: p.createdAt ? new Date(p.createdAt).toISOString() : null,
      updatedAt: p.updatedAt ? new Date(p.updatedAt).toISOString() : null,
      files: JSON.parse(p.files || '[]')
    }));

    return NextResponse.json(formattedPolicies);
  } catch (error) {
    console.error('Error fetching cumplimiento policies:', error);
    return NextResponse.json({ message: 'Error interno del servidor al obtener pólizas de cumplimiento' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.formData();
    
    const etiquetaOficinaName = data.get('etiquetaOficina') as string;
    const etiquetaClienteName = data.get('etiquetaCliente') as string;
    const clientNombreCompleto = data.get('tomadorPoliza') as string; // Will be client's name
    const clientNumeroIdentificacion = data.get('numeroIdentificacion') as string; // New field for client identification
    const tipoIdentificacion = data.get('tipoIdentificacion') as string; // Added: Retrieve tipoIdentificacion
    const tipoPoliza = data.get('tipoPoliza') as string;
    const fechaExpedicion = data.get('fechaExpedicion') as string;
    const fechaInicioVigencia = data.get('fechaInicioVigencia') as string;
    const fechaTerminacionVigencia = data.get('fechaTerminacionVigencia') as string;
    const aseguradoraName = data.get('aseguradora') as string;
    const valorPrimaNeta = data.get('valorPrimaNeta') as string;
    const valorTotalAPagar = data.get('valorTotalAPagar') as string;
    const numeroPoliza = data.get('numeroPoliza') as string;
    const numeroAnexos = data.get('numeroAnexos') as string;
    const files = data.getAll('files') as File[];

    if (!etiquetaClienteName || !clientNombreCompleto || !clientNumeroIdentificacion || !tipoIdentificacion || !fechaExpedicion || !aseguradoraName || !valorPrimaNeta || !numeroPoliza) {
        return NextResponse.json({ message: 'Faltan campos obligatorios' }, { status: 400 });
    }

    const uploadedFilePaths: string[] = [];
    if (files && files.length > 0) {
      const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'cumplimiento');
      await mkdir(uploadDir, { recursive: true });
      for (const file of files) {
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const uniqueFilename = `${Date.now()}-${file.name}`;
        const filePath = path.join(uploadDir, uniqueFilename);
        await writeFile(filePath, buffer);
        uploadedFilePaths.push(`/uploads/cumplimiento/${uniqueFilename}`);
      }
    }

    let aseguradoraId: string;
    let etiquetaOficinaId: string | null = null;
    let etiquetaClienteId: string;
    let clientId: string; // New variable for client ID

    // Find or Create Aseguradora
    const [aseguradoraRows]: [any[], any] = await pool.query('SELECT id FROM Aseguradora WHERE name = ?', [aseguradoraName]);
    if (aseguradoraRows.length > 0) { aseguradoraId = aseguradoraRows[0].id; } else { aseguradoraId = `cl${nanoid()}`; await pool.query('INSERT INTO Aseguradora (id, name) VALUES (?, ?)', [aseguradoraId, aseguradoraName]); }

    // Find or Create Etiqueta Oficina
    if (etiquetaOficinaName) {
        const [oficinaRows]: [any[], any] = await pool.query('SELECT id FROM Etiqueta WHERE name = ?', [etiquetaOficinaName]);
        if (oficinaRows.length > 0) { etiquetaOficinaId = oficinaRows[0].id; } else { etiquetaOficinaId = `cl${nanoid()}`; await pool.query('INSERT INTO Etiqueta (id, name) VALUES (?, ?)', [etiquetaOficinaId, etiquetaOficinaName]); }
    }

    // Find or Create Etiqueta Cliente
    const [clienteEtiquetaRows]: [any[], any] = await pool.query('SELECT id FROM Etiqueta WHERE name = ?', [etiquetaClienteName]);
    if (clienteEtiquetaRows.length > 0) { etiquetaClienteId = clienteEtiquetaRows[0].id; } else { etiquetaClienteId = `cl${nanoid()}`; await pool.query('INSERT INTO Etiqueta (id, name) VALUES (?, ?)', [etiquetaClienteId, etiquetaClienteName]); }

    // Find or Create Client (NEW LOGIC)
    const [existingClientRows]: [any[], any] = await pool.query('SELECT id FROM Client WHERE numeroIdentificacion = ?', [clientNumeroIdentificacion]);
    if (existingClientRows.length > 0) {
      clientId = existingClientRows[0].id;
      // If client exists, update their name and type of identification if they changed
      await pool.query(
        `UPDATE Client SET nombreCompleto = ?, tipoIdentificacion = ?, updatedAt = NOW() WHERE id = ?`,
        [clientNombreCompleto, tipoIdentificacion, clientId]
      );
    } else {
      clientId = `cl${nanoid()}`;
      await pool.query(
        `INSERT INTO Client (id, nombreCompleto, numeroIdentificacion, tipoIdentificacion, createdAt, updatedAt) 
         VALUES (?, ?, ?, ?, NOW(), NOW())`,
        [clientId, clientNombreCompleto, clientNumeroIdentificacion, tipoIdentificacion]
      );
    }


    const policyId = `cl${nanoid()}`;
    await pool.query(
      `INSERT INTO Policy (
        id, numeroPoliza, fechaExpedicion, fechaInicioVigencia, 
        fechaTerminacionVigencia, valorPrimaNeta, valorTotalAPagar, numeroAnexos, 
        tipoPoliza, aseguradoraId, etiquetaOficinaId, etiquetaClienteId, clientId, files, createdAt, updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [
        policyId,
        numeroPoliza,
        new Date(fechaExpedicion),
        new Date(fechaInicioVigencia),
        new Date(fechaTerminacionVigencia),
        parseFloat(valorPrimaNeta),
        parseFloat(valorTotalAPagar),
        numeroAnexos ? parseInt(numeroAnexos, 10) : null,
        tipoPoliza || null,
        aseguradoraId,
        etiquetaOficinaId,
        etiquetaClienteId,
        clientId, // Use the client ID here
        JSON.stringify(uploadedFilePaths),
      ]
    );

    return NextResponse.json({ message: 'Póliza de cumplimiento creada exitosamente', policy: { id: policyId, numeroPoliza, clientNombreCompleto } }, { status: 201 });

  } catch (error: any) {
    console.error('Error creating cumplimiento policy:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      return NextResponse.json({ message: `Error: El número de póliza '${data.get('numeroPoliza')}' ya existe.` }, { status: 409 });
    }
    return NextResponse.json({ message: 'Error interno del servidor al crear la póliza' }, { status: 500 });
  }
}
