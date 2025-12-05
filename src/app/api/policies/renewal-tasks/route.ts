import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db'; // Import the mysql2 connection pool

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');
    const agentId = searchParams.get('agentId');
    const expirationStartDate = searchParams.get('expirationStartDate');
    const expirationEndDate = searchParams.get('expirationEndDate');
    const clientId = searchParams.get('clientId');

    let baseQuery = `
      SELECT 
        gp.id, gp.numeroPoliza, gp.fechaExpedicion, gp.fechaInicio, gp.fechaFinVigencia, 
        gp.placa, gp.valorPrimaNeta, gp.valorTotalAPagar, gp.financiado, gp.financiera, 
        gp.files, gp.createdAt, gp.updatedAt, gp.status, gp.responsibleAgentId, gp.lastReminderSent,
        a.name AS aseguradora,
        ec.name AS etiquetaCliente,
        eo.name AS etiquetaOficina,
        r.name AS ramo,
        c.id AS clientId,
        c.nombreCompleto AS clientNombreCompleto,
        c.tipoIdentificacion AS clientTipoIdentificacion,
        c.numeroIdentificacion AS clientNumeroIdentificacion
        -- Add user details if agentId is present and we need to display agent info
        -- JOIN User u ON gp.responsibleAgentId = u.id 
      FROM GeneralPolicy gp
      LEFT JOIN Aseguradora a ON gp.aseguradoraId = a.id
      LEFT JOIN Etiqueta ec ON gp.etiquetaClienteId = ec.id
      LEFT JOIN Etiqueta eo ON gp.etiquetaOficinaId = eo.id
      LEFT JOIN Ramo r ON gp.ramoId = r.id
      LEFT JOIN Client c ON gp.clientId = c.id
    `;

    const conditions: string[] = [];
    const params: any[] = [];

    if (status) {
      conditions.push('gp.status = ?');
      params.push(status);
    }
    if (agentId) {
      conditions.push('gp.responsibleAgentId = ?');
      params.push(agentId);
    }
    if (expirationStartDate) {
      conditions.push('gp.fechaFinVigencia >= ?');
      params.push(expirationStartDate);
    }
    if (expirationEndDate) {
      conditions.push('gp.fechaFinVigencia <= ?');
      params.push(expirationEndDate);
    }
    if (clientId) {
      conditions.push('gp.clientId = ?');
      params.push(clientId);
    }

    if (conditions.length > 0) {
      baseQuery += ' WHERE ' + conditions.join(' AND ');
    }

    baseQuery += ' ORDER BY gp.fechaFinVigencia ASC, gp.createdAt DESC'; // Order by expiration date

    const [rows] = await pool.query(baseQuery, params);
    
    const policies = rows as any[]; 
    
    const formattedPolicies = policies.map(p => ({
      ...p,
      fechaExpedicion: p.fechaExpedicion?.toISOString(),
      fechaInicio: p.fechaInicio?.toISOString(),
      fechaFinVigencia: p.fechaFinVigencia?.toISOString(),
      createdAt: p.createdAt?.toISOString(),
      updatedAt: p.updatedAt?.toISOString(),
      lastReminderSent: p.lastReminderSent?.toISOString(),
      files: p.files ? JSON.parse(p.files) : [] // Parse JSON string from DB, handle null
    }));

    return NextResponse.json(formattedPolicies);
  } catch (error) {
    console.error('Error fetching renewal tasks:', error);
    return NextResponse.json({ message: 'Error interno del servidor al obtener tareas de renovación' }, { status: 500 });
  }
}
