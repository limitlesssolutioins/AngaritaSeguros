import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { generateLiquidationPdf, LiquidationData } from '@/lib/pdf-generator';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const { status, generatePaidPdf, generatePreLiquidationPdf } = await request.json(); // Added flags for PDF generation

    if (!id) {
      return NextResponse.json({ message: 'El ID de la liquidación es obligatorio.' }, { status: 400 });
    }

    // --- Start Transaction ---
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    let updatedLiquidationPdfPath: string | undefined;
    let updatedPaidPdfPath: string | undefined;

    try {
      // 1. Fetch full liquidation data for PDF generation
      const [liquidationRows]: [any[], any] = await connection.query(
        `SELECT al.*, u.name AS agentName
         FROM AgentLiquidation al
         LEFT JOIN User u ON al.agentId = u.id
         WHERE al.id = ?`,
        [id]
      );

      if (liquidationRows.length === 0) {
        await connection.rollback();
        return NextResponse.json({ message: 'Liquidación no encontrada.' }, { status: 404 });
      }
      const currentLiquidation = liquidationRows[0];

      const updateFields: string[] = [];
      const updateParams: any[] = [];

      // Update status if provided
      if (status) {
        updateFields.push('status = ?');
        updateParams.push(status);
      }

      // Prepare data for PDF generation
      const pdfData: LiquidationData = {
        id: currentLiquidation.id,
        agentName: currentLiquidation.agentName || 'Agente Desconocido',
        startDate: currentLiquidation.startDate.toISOString().split('T')[0],
        endDate: currentLiquidation.endDate.toISOString().split('T')[0],
        totalCommissions: currentLiquidation.totalCommissions,
        totalDeductions: currentLiquidation.totalDeductions,
        netPayment: currentLiquidation.netPayment,
        status: status || currentLiquidation.status, // Use new status if provided
        createdAt: currentLiquidation.createdAt.toISOString(),
      };

      // Generate Paid PDF if requested or status changes to paid
      if (status === 'paid' || generatePaidPdf) {
        updatedPaidPdfPath = await generateLiquidationPdf(pdfData, 'paid');
        updateFields.push('paidPdfPath = ?');
        updateParams.push(updatedPaidPdfPath);
      }

      // Regenerate Pre-liquidation PDF if requested
      if (generatePreLiquidationPdf) {
        updatedLiquidationPdfPath = await generateLiquidationPdf(pdfData, 'pre-liquidation');
        updateFields.push('liquidationPdfPath = ?');
        updateParams.push(updatedLiquidationPdfPath);
      }
      
      if (updateFields.length === 0) {
        await connection.rollback();
        return NextResponse.json({ message: 'No se proporcionaron campos para actualizar.' }, { status: 400 });
      }

      const query = `
        UPDATE AgentLiquidation
        SET ${updateFields.join(', ')}, updatedAt = NOW()
        WHERE id = ?
      `;
      updateParams.push(id);

      await connection.query(query, updateParams);
      await connection.commit();

      return NextResponse.json({ 
        message: 'Liquidación actualizada exitosamente.',
        liquidationPdfPath: updatedLiquidationPdfPath || currentLiquidation.liquidationPdfPath,
        paidPdfPath: updatedPaidPdfPath || currentLiquidation.paidPdfPath,
      }, { status: 200 });

    } catch (transactionError: any) {
      await connection.rollback();
      throw transactionError; // Re-throw to be caught by outer catch
    } finally {
      connection.release();
    }

  } catch (error) {
    console.error('Error updating liquidation:', error);
    return NextResponse.json({ message: 'Error interno del servidor al actualizar liquidación.' }, { status: 500 });
  }
}
