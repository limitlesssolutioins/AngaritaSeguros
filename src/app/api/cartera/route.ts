import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';

export const dynamic = 'force-dynamic'; // Ensures this route is not statically optimized

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const officeEtiquetaId = searchParams.get('officeEtiquetaId');
    const ramoId = searchParams.get('ramoId');
    const clientName = searchParams.get('clientName');
    const paymentStatus = searchParams.get('paymentStatus');

    let baseQuery = `
      SELECT
        gp.id,
        gp.numeroPoliza,
        gp.fechaExpedicion,
        gp.fechaFinVigencia,
        gp.valorTotalAPagar,
        gp.paidAmount,
        gp.currentBalance,
        gp.paymentStatus AS paymentStatus,
        gp.status AS policyStatus, -- The renewal status
        DATEDIFF(CURDATE(), gp.fechaExpedicion) AS daysInCartea, -- Assuming 'days in cartera' is days since issue date for unpaid
        c.nombreCompleto AS clientNombreCompleto,
        eo.name AS etiquetaOficinaName,
        r.name AS ramoName
      FROM GeneralPolicy gp
      LEFT JOIN Client c ON gp.clientId = c.id
      LEFT JOIN Etiqueta eo ON gp.etiquetaOficinaId = eo.id
      LEFT JOIN Ramo r ON gp.ramoId = r.id
    `;

    const conditions: string[] = [];
    const params: any[] = [];

    // Only calculate days in cartera if policy is not fully paid
    conditions.push("gp.paymentStatus != 'pagado'");


    if (officeEtiquetaId) {
      conditions.push('gp.etiquetaOficinaId = ?');
      params.push(officeEtiquetaId);
    }
    if (ramoId) {
      conditions.push('gp.ramoId = ?');
      params.push(ramoId);
    }
    if (clientName) {
      conditions.push('c.nombreCompleto LIKE ?');
      params.push(`%${clientName}%`);
    }
    if (paymentStatus) {
      conditions.push('gp.paymentStatus = ?');
      params.push(paymentStatus);
    }

    if (conditions.length > 0) {
      baseQuery += ' WHERE ' + conditions.join(' AND ');
    }

    baseQuery += ' ORDER BY daysInCartea DESC'; // Most overdue first

    const [rows] = await pool.query(baseQuery, params);
    
    const carteraItems = rows as any[]; 
    
    // Format dates for consistency
    const formattedCarteraItems = carteraItems.map(item => ({
      ...item,
      fechaExpedicion: item.fechaExpedicion?.toISOString().split('T')[0],
      fechaFinVigencia: item.fechaFinVigencia?.toISOString().split('T')[0],
    }));

    return NextResponse.json(formattedCarteraItems);
  } catch (error) {
    console.error('Error fetching cartera items:', error);
    return NextResponse.json({ message: 'Error interno del servidor al obtener items de cartera' }, { status: 500 });
  }
}
