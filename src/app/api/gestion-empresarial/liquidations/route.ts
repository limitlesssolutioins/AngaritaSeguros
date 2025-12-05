import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { customAlphabet } from 'nanoid';
import { generateLiquidationPdf, LiquidationData } from '@/lib/pdf-generator'; // Import PDF utility

const nanoid = customAlphabet('0123456789abcdefghijklmnopqrstuvwxyz', 12);

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const agentId = searchParams.get('agentId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const status = searchParams.get('status');

    let baseQuery = `
      SELECT al.*, u.name AS agentName -- Assuming User table has a 'name' column
      FROM AgentLiquidation al
      LEFT JOIN User u ON al.agentId = u.id
    `;

    const conditions: string[] = [];
    const params: any[] = [];

    if (agentId) {
      conditions.push('al.agentId = ?');
      params.push(agentId);
    }
    if (startDate) {
      conditions.push('al.startDate >= ?');
      params.push(startDate);
    }
    if (endDate) {
      conditions.push('al.endDate <= ?');
      params.push(endDate);
    }
    if (status) {
      conditions.push('al.status = ?');
      params.push(status);
    }

    if (conditions.length > 0) {
      baseQuery += ' WHERE ' + conditions.join(' AND ');
    }

    baseQuery += ' ORDER BY al.createdAt DESC';

    const [rows] = await pool.query(baseQuery, params);
    
    const liquidations = rows as any[]; 
    
    const formattedLiquidations = liquidations.map(l => ({
      ...l,
      startDate: l.startDate?.toISOString().split('T')[0],
      endDate: l.endDate?.toISOString().split('T')[0],
      createdAt: l.createdAt?.toISOString(),
      updatedAt: l.updatedAt?.toISOString(),
    }));

    return NextResponse.json(formattedLiquidations);
  } catch (error) {
    console.error('Error fetching liquidations:', error);
    return NextResponse.json({ message: 'Error interno del servidor al obtener liquidaciones' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { agentId, startDate, endDate, deductions } = await request.json(); // Deductions is an array of objects { description, amount }

    if (!agentId || !startDate || !endDate) {
      return NextResponse.json({ message: 'agentId, startDate y endDate son obligatorios.' }, { status: 400 });
    }

    // --- Start Transaction ---
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    let liquidationId = `al${nanoid()}`;
    let liquidationPdfPath: string | null = null;
    let agentName = 'Unknown Agent'; // Default agent name

    try {
      // Fetch agent name for PDF
      const [agentRows]: [any[], any] = await connection.query('SELECT name FROM User WHERE id = ?', [agentId]);
      if (agentRows.length > 0) {
        agentName = agentRows[0].name;
      }

      // 1. Fetch all PolicyPayments for the agent within the date range
      const [payments]: [any[], any] = await connection.query(
        `SELECT pp.amount, pp.commissionEarned, gp.commissionRate, gp.etiquetaOficinaId, gp.ramoId
         FROM PolicyPayment pp
         JOIN GeneralPolicy gp ON pp.policyId = gp.id
         WHERE pp.processedByAgentId = ? AND pp.paymentDate >= ? AND pp.paymentDate <= ?`,
        [agentId, startDate, endDate]
      );

      let totalCommissions = 0;
      for (const payment of payments) {
          totalCommissions += parseFloat(payment.commissionEarned);
      }

      let totalDeductions = 0;
      if (deductions && Array.isArray(deductions)) {
        totalDeductions = deductions.reduce((sum, d) => sum + parseFloat(d.amount), 0);
      }

      const netPayment = totalCommissions - totalDeductions;

      // 2. Create a new AgentLiquidation record
      await connection.query(
        `INSERT INTO AgentLiquidation (id, agentId, startDate, endDate, totalCommissions, totalDeductions, netPayment, status, createdAt, updatedAt)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
        [
          liquidationId,
          agentId,
          startDate,
          endDate,
          totalCommissions,
          totalDeductions,
          netPayment,
          'generated' // Initial status
        ]
      );

      // 3. Generate Pre-Liquidation PDF
      const pdfData: LiquidationData = {
        id: liquidationId,
        agentName: agentName,
        startDate: startDate,
        endDate: endDate,
        totalCommissions: totalCommissions,
        totalDeductions: totalDeductions,
        netPayment: netPayment,
        status: 'generated', // For PDF context
        createdAt: new Date().toISOString(),
      };
      liquidationPdfPath = await generateLiquidationPdf(pdfData, 'pre-liquidation');

      // 4. Update AgentLiquidation record with PDF path
      await connection.query(
        `UPDATE AgentLiquidation SET liquidationPdfPath = ? WHERE id = ?`,
        [liquidationPdfPath, liquidationId]
      );

      await connection.commit();
      return NextResponse.json({ message: 'Liquidación generada exitosamente.', liquidationId, liquidationPdfPath }, { status: 201 });

    } catch (transactionError: any) {
      await connection.rollback();
      throw transactionError; // Re-throw to be caught by outer catch
    } finally {
      connection.release();
    }

  } catch (error) {
    console.error('Error generating liquidation:', error);
    return NextResponse.json({ message: 'Error interno del servidor al generar liquidación' }, { status: 500 });
  }
}
