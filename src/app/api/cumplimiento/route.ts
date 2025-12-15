import { NextResponse } from 'next/server';
import { pool } from '@/lib/db'; // Import the mysql2 connection pool
import { customAlphabet } from 'nanoid'; // For generating CUIDs
import { cookies } from 'next/headers'; // Import cookies
import { verifyToken } from '@/lib/auth'; // Import verifyToken
import { uploadFileToS3 } from '@/lib/s3'; // Import S3 upload function

const nanoid = customAlphabet('0123456789abcdefghijklmnopqrstuvwxyz', 12); // Simulating CUIDs

// Helper to get user info, handling middleware header propagation issues
async function getAuthenticatedUser(request: Request) {
  let userId = request.headers.get('x-user-id');
  let userRole = request.headers.get('x-user-role');
  let userOffice = request.headers.get('x-user-office');

  // Fallback: Check cookie directly if headers are missing (middleware bypass issue)
  if (!userId) {
    const token = cookies().get('auth_token')?.value;
    if (token) {
      try {
        const decoded = await verifyToken(token);
        userId = decoded.id as string;
        userRole = decoded.role as string;
        userOffice = decoded.office as string;
      } catch (error) {
        console.error('Token verification failed in API route fallback:', error);
      }
    }
  }
  return { userId, userRole, userOffice };
}

export async function GET(request: Request) {
  try {
    const { userId, userRole } = await getAuthenticatedUser(request);

    if (!userId) {
      return NextResponse.json({ message: 'User not authenticated' }, { status: 401 });
    }

    const url = new URL(request.url);
    const clientId = url.searchParams.get('clientId');

    let query = `
      SELECT 
        p.id, p.numeroPoliza, 
        c.nombreCompleto AS clientNombreCompleto, c.numeroIdentificacion AS clientNumeroIdentificacion, c.tipoIdentificacion,
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
    `;
    const queryParams: (string | undefined)[] = [];
    const whereConditions: string[] = [];

    if (userRole === 'Agent' && userId) {
      whereConditions.push(`p.userId = ?`);
      queryParams.push(userId);
    }

    if (clientId) {
      whereConditions.push(`p.clientId = ?`);
      queryParams.push(clientId);
    }

    if (whereConditions.length > 0) {
      query += ` WHERE ${whereConditions.join(' AND ')}`;
    }

    query += ` ORDER BY p.createdAt DESC`;
    
    const [rows] = await pool.query(query, queryParams);
    
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
    const { userId, userOffice } = await getAuthenticatedUser(request);

    if (!userId) {
      // console.log('[API/Cumplimiento] Missing x-user-id header.'); // Removed debugging log
      // console.log('Headers:', Object.fromEntries(request.headers)); // Removed debugging log
      return NextResponse.json({ message: 'User not authenticated' }, { status: 401 });
    }

    // Fetch user's office to automatically assign 'etiquetaOficina'
    // This logic relies on userOffice coming from getAuthenticatedUser now, not from a DB query
    let etiquetaOficinaName = userOffice;
    if (!etiquetaOficinaName) {
       // Fallback if office not in token or not set
       const [userRows]: any = await pool.query('SELECT office FROM User WHERE id = ?', [userId]);
       if (userRows.length === 0 || !userRows[0].office) {
          return NextResponse.json({ message: 'User office not found. Cannot assign office tag.' }, { status: 400 });
       }
       etiquetaOficinaName = userRows[0].office;
    }

    const data = await request.formData();
    
    // const etiquetaOficinaName = data.get('etiquetaOficina') as string; // Removed manual retrieval
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
      for (const file of files) {
        const s3Url = await uploadFileToS3(file, 'cumplimiento'); // Upload to 'cumplimiento' folder in S3
        uploadedFilePaths.push(s3Url);
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
        `INSERT INTO Client (id, nombreCompleto, numeroIdentificacion, tipoIdentificacion) 
         VALUES (?, ?, ?, ?)`,
        [clientId, clientNombreCompleto, clientNumeroIdentificacion, tipoIdentificacion]
      );
    }


    const policyId = `cl${nanoid()}`;
    await pool.query(
      `INSERT INTO Policy (
        id, numeroPoliza, fechaExpedicion, fechaInicioVigencia, 
        fechaTerminacionVigencia, valorPrimaNeta, valorTotalAPagar, numeroAnexos, 
        tipoPoliza, aseguradoraId, etiquetaOficinaId, etiquetaClienteId, clientId, files, userId, createdAt, updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
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
        userId, // Assign the authenticated user's ID
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

