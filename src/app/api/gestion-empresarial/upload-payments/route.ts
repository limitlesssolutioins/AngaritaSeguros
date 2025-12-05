import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { customAlphabet } from 'nanoid';
import Papa from 'papaparse'; // Assuming papaparse is installed

const nanoid = customAlphabet('0123456789abcdefghijklmnopqrstuvwxyz', 12);

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ message: 'No se ha proporcionado ningún archivo.' }, { status: 400 });
    }

    const fileContent = await file.text(); // Read file content as text

    const parsedData = await new Promise((resolve, reject) => {
      Papa.parse(fileContent, {
        header: true, // Assuming the first row is headers
        skipEmptyLines: true,
        complete: (results) => {
          if (results.errors.length) {
            reject(new Error(`CSV parsing errors: ${results.errors.map(e => e.message).join(', ')}`));
          }
          resolve(results.data);
        },
        error: (err: Error) => reject(err),
      });
    });

    if (!Array.isArray(parsedData) || parsedData.length === 0) {
      return NextResponse.json({ message: 'El archivo CSV está vacío o no tiene datos válidos.' }, { status: 400 });
    }

    const processedResults: { success: boolean, policyNumber: string, message: string }[] = [];

    for (const row of parsedData) {
      const {
        numeroPoliza,
        amount,
        paymentDate,
        transactionRef,
        annexNumber,
        processedByAgentId // Optional, can be derived or passed
      } = row as any; // Cast to any for now to access dynamic properties

      if (!numeroPoliza || !amount || !paymentDate) {
        processedResults.push({ success: false, policyNumber: numeroPoliza || 'N/A', message: 'Datos incompletos en la fila.' });
        continue;
      }

      const paymentAmount = parseFloat(amount);
      if (isNaN(paymentAmount) || paymentAmount <= 0) {
        processedResults.push({ success: false, policyNumber: numeroPoliza, message: 'Monto de pago inválido.' });
        continue;
      }

      let connection; // Declare connection outside try block
      try {
        connection = await pool.getConnection(); // Get a connection for transaction
        await connection.beginTransaction();

        // 1. Find the GeneralPolicy
        const [policyRows]: [any[], any] = await connection.query(
          'SELECT id, valorTotalAPagar, paidAmount, currentBalance, commissionRate, responsibleAgentId FROM GeneralPolicy WHERE numeroPoliza = ?',
          [numeroPoliza]
        );

        if (policyRows.length === 0) {
          processedResults.push({ success: false, policyNumber: numeroPoliza, message: 'Póliza no encontrada.' });
          await connection.rollback();
          continue;
        }

        const policy = policyRows[0];
        const policyId = policy.id;
        const totalPolicyValue = parseFloat(policy.valorTotalAPagar);
        const currentPaidAmount = parseFloat(policy.paidAmount);
        const policyCommissionRate = parseFloat(policy.commissionRate);
        const policyResponsibleAgentId = policy.responsibleAgentId;


        // 2. Calculate new paid amounts and balance
        const newPaidAmount = currentPaidAmount + paymentAmount;
        const newCurrentBalance = totalPolicyValue - newPaidAmount;

        let paymentStatus = 'pendiente';
        if (newCurrentBalance <= 0) {
          paymentStatus = 'pagado';
        } else if (newPaidAmount > 0) {
          paymentStatus = 'parcialmente_pagado';
        }

        // 3. Calculate commission earned for THIS payment
        const commissionEarned = paymentAmount * policyCommissionRate; // Simple calculation

        // 4. Update GeneralPolicy
        await connection.query(
          `UPDATE GeneralPolicy
           SET paidAmount = ?, currentBalance = ?, paymentStatus = ?, updatedAt = NOW()
           WHERE id = ?`,
          [newPaidAmount, newCurrentBalance, paymentStatus, policyId]
        );

        // 5. Insert into PolicyPayment
        const paymentId = `pp${nanoid()}`;
        await connection.query(
          `INSERT INTO PolicyPayment (id, policyId, amount, paymentDate, transactionRef, commissionEarned, annexNumber, processedByAgentId, createdAt, updatedAt)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
          [
            paymentId,
            policyId,
            paymentAmount,
            new Date(paymentDate),
            transactionRef || null,
            commissionEarned,
            annexNumber || null,
            policyResponsibleAgentId || null // Use policy's responsible agent if available
          ]
        );

        await connection.commit();
        processedResults.push({ success: true, policyNumber: numeroPoliza, message: 'Pago procesado exitosamente.' });

      } catch (dbError: any) {
        if (connection) {
          await connection.rollback();
        }
        console.error(`Error processing payment for policy ${numeroPoliza}:`, dbError);
        processedResults.push({ success: false, policyNumber: numeroPoliza, message: `Error en base de datos: ${dbError.message}` });
      } finally {
        if (connection) {
          connection.release();
        }
      }
    }

    return NextResponse.json({ message: 'Procesamiento de archivo de pagos completado.', results: processedResults }, { status: 200 });

  } catch (error: any) {
    console.error('Error uploading payments:', error);
    return NextResponse.json({ message: `Error interno del servidor al procesar el archivo de pagos: ${error.message}` }, { status: 500 });
  }
}
