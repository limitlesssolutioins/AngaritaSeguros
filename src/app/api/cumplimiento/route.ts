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
        p.id, p.numeroPoliza, p.titularPoliza, p.fechaExpedicion, p.fechaInicioVigencia, 
        p.fechaTerminacionVigencia, p.valorPrimaNeta, p.valorTotalAPagar, p.numeroAnexos, 
        p.tipoAmparo, p.files, p.createdAt, p.updatedAt,
        a.name AS aseguradora,
        e.name AS etiqueta
      FROM Policy p
      JOIN Aseguradora a ON p.aseguradoraId = a.id
      JOIN Etiqueta e ON p.etiquetaId = e.id
      ORDER BY p.createdAt DESC
    `);
    
    // The query already returns formatted data with aseguradora.name and etiqueta.name
    // Cast to an array of objects for type compatibility
    const policies = rows as any[]; 
    
    // Format dates to ISO strings if needed by the frontend, mysql2 returns Date objects
    const formattedPolicies = policies.map(p => ({
      ...p,
      fechaExpedicion: p.fechaExpedicion.toISOString(),
      fechaInicioVigencia: p.fechaInicioVigencia.toISOString(),
      fechaTerminacionVigencia: p.fechaTerminacionVigencia.toISOString(),
      createdAt: p.createdAt.toISOString(),
      updatedAt: p.updatedAt.toISOString(),
      files: JSON.parse(p.files || '[]') // Parse JSON string from DB
    }));

    return NextResponse.json(formattedPolicies);
  } catch (error) {
    console.error('Error fetching policies:', error);
    return NextResponse.json({ message: 'Error interno del servidor al obtener pólizas' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.formData();
    
    // Read all fields from FormData
    const etiquetaName = data.get('etiqueta') as string;
    const titularPoliza = data.get('titularPoliza') as string;
    const fechaExpedicion = data.get('fechaExpedicion') as string;
    const fechaInicioVigencia = data.get('fechaInicioVigencia') as string;
    const fechaTerminacionVigencia = data.get('fechaTerminacionVigencia') as string;
    const aseguradoraName = data.get('aseguradora') as string;
    const valorPrimaNeta = data.get('valorPrimaNeta') as string;
    const valorTotalAPagar = data.get('valorTotalAPagar') as string;
    const numeroPoliza = data.get('numeroPoliza') as string;
    const numeroAnexos = data.get('numeroAnexos') as string;
    const tipoAmparo = data.get('tipoAmparo') as string;
    const files = data.getAll('files') as File[];

    // --- Validation ---
    if (!etiquetaName || !titularPoliza || !fechaExpedicion || !aseguradoraName || !valorPrimaNeta || !numeroPoliza) {
        return NextResponse.json({ message: 'Faltan campos obligatorios' }, { status: 400 });
    }

    // --- File Upload Logic (remains the same) ---
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

    // --- Database Logic ---
    let aseguradoraId: string;
    let etiquetaId: string;

    // 1. Find or Create Aseguradora
    const [existingAseguradoraRows] = await pool.query('SELECT id FROM Aseguradora WHERE name = ?', [aseguradoraName]);
    if (Array.isArray(existingAseguradoraRows) && existingAseguradoraRows.length > 0) {
      aseguradoraId = existingAseguradoraRows[0].id;
    } else {
      aseguradoraId = `cl${nanoid()}`; // Generate CUID
      await pool.query('INSERT INTO Aseguradora (id, name) VALUES (?, ?)', [aseguradoraId, aseguradoraName]);
    }

    // 2. Find or Create Etiqueta
    const [existingEtiquetaRows] = await pool.query('SELECT id FROM Etiqueta WHERE name = ?', [etiquetaName]);
    if (Array.isArray(existingEtiquetaRows) && existingEtiquetaRows.length > 0) {
      etiquetaId = existingEtiquetaRows[0].id;
    } else {
      etiquetaId = `cl${nanoid()}`; // Generate CUID
      await pool.query('INSERT INTO Etiqueta (id, name) VALUES (?, ?)', [etiquetaId, etiquetaName]);
    }

    // 3. Create the Policy
    const policyId = `cl${nanoid()}`; // Generate CUID
    const [result] = await pool.query(
      `INSERT INTO Policy (
        id, numeroPoliza, titularPoliza, fechaExpedicion, fechaInicioVigencia, 
        fechaTerminacionVigencia, valorPrimaNeta, valorTotalAPagar, numeroAnexos, 
        tipoAmparo, aseguradoraId, etiquetaId, files, createdAt, updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [
        policyId,
        numeroPoliza,
        titularPoliza,
        new Date(fechaExpedicion),
        new Date(fechaInicioVigencia),
        new Date(fechaTerminacionVigencia),
        parseFloat(valorPrimaNeta),
        parseFloat(valorTotalAPagar),
        numeroAnexos ? parseInt(numeroAnexos, 10) : null,
        tipoAmparo || null,
        aseguradoraId,
        etiquetaId,
        JSON.stringify(uploadedFilePaths), // Storing as JSON string
      ]
    );

    // Assuming the insert was successful, return a success response
    // For simplicity, we are not re-querying the created policy, just returning the input data
    return NextResponse.json({ message: 'Póliza creada exitosamente', policy: { id: policyId, numeroPoliza, titularPoliza } }, { status: 201 });

  } catch (error: any) {
    console.error('Error creating policy:', error);
    console.error('Error details:', error.message, error.stack, error.code); // More verbose logging
    // Check for duplicate entry error (ER_DUP_ENTRY for MySQL)
    if (error.code === 'ER_DUP_ENTRY') {
      return NextResponse.json({ message: `Error: El número de póliza '${data.get('numeroPoliza')}' ya existe.` }, { status: 409 });
    }
    return NextResponse.json({ message: 'Error interno del servidor al crear la póliza' }, { status: 500 });
  }
}
