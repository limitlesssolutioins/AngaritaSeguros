import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db'; // Import the mysql2 connection pool

export const dynamic = 'force-dynamic'; // Ensures this route is not statically optimized

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

    const [gpRows] = await pool.query(baseQuery, params);

    // --- Cumplimiento Policies Query ---
    let cpBaseQuery = `
      SELECT 
        p.id, p.numeroPoliza, 
        p.fechaExpedicion, p.fechaInicioVigencia AS fechaInicio, p.fechaTerminacionVigencia AS fechaFinVigencia, 
        p.valorPrimaNeta, p.valorTotalAPagar, 
        p.files, p.createdAt, p.updatedAt,
        p.userId AS responsibleAgentId, -- Map userId to responsibleAgentId
        'cumplimiento' AS status, -- Default status or map if possible
        a.name AS aseguradora,
        ec.name AS etiquetaCliente,
        eo.name AS etiquetaOficina,
        p.tipoPoliza AS ramo, -- Map tipoPoliza to ramo
        c.id AS clientId,
        c.nombreCompleto AS clientNombreCompleto,
        c.tipoIdentificacion AS clientTipoIdentificacion,
        c.numeroIdentificacion AS clientNumeroIdentificacion
      FROM Policy p
      LEFT JOIN Aseguradora a ON p.aseguradoraId = a.id
      LEFT JOIN Etiqueta ec ON p.etiquetaClienteId = ec.id
      LEFT JOIN Etiqueta eo ON p.etiquetaOficinaId = eo.id
      LEFT JOIN Client c ON p.clientId = c.id
    `;

    const cpConditions: string[] = [];
    const cpParams: any[] = [];

    if (agentId) {
      cpConditions.push('p.userId = ?');
      cpParams.push(agentId);
    }
    if (expirationStartDate) {
      cpConditions.push('p.fechaTerminacionVigencia >= ?');
      cpParams.push(expirationStartDate);
    }
    if (expirationEndDate) {
      cpConditions.push('p.fechaTerminacionVigencia <= ?');
      cpParams.push(expirationEndDate);
    }
    if (clientId) {
      cpConditions.push('p.clientId = ?');
      cpParams.push(clientId);
    }

    if (cpConditions.length > 0) {
      cpBaseQuery += ' WHERE ' + cpConditions.join(' AND ');
    } else if (status && status !== 'cumplimiento') {
       // If filtering by status (e.g. 'upcoming') and we hardcoded 'cumplimiento', 
       // we might need to be careful. For now, let's include them if no specific status 
       // excludes them, or just include them to be visible.
       // Ideally we'd calculate status based on dates.
    }

    const [cpRows] = await pool.query(cpBaseQuery, cpParams);
    
    // Combine rows
    const policies = [...(gpRows as any[]), ...(cpRows as any[])];
    
    // Sort combined result
    policies.sort((a, b) => new Date(a.fechaFinVigencia).getTime() - new Date(b.fechaFinVigencia).getTime());
    
    const formattedPolicies = policies.map(p => ({
      ...p,
      fechaExpedicion: p.fechaExpedicion ? new Date(p.fechaExpedicion).toISOString() : null,
      fechaInicio: p.fechaInicio ? new Date(p.fechaInicio).toISOString() : null,
      fechaFinVigencia: p.fechaFinVigencia ? new Date(p.fechaFinVigencia).toISOString() : null,
      createdAt: p.createdAt ? new Date(p.createdAt).toISOString() : null,
      updatedAt: p.updatedAt ? new Date(p.updatedAt).toISOString() : null,
      lastReminderSent: p.lastReminderSent ? new Date(p.lastReminderSent).toISOString() : null,
      files: p.files ? JSON.parse(p.files) : [] // Parse JSON string from DB, handle null
    }));

    return NextResponse.json(formattedPolicies);
  } catch (error) {
    console.error('Error fetching renewal tasks:', error);
    return NextResponse.json({ message: 'Error interno del servidor al obtener tareas de renovación' }, { status: 500 });
  }
}
