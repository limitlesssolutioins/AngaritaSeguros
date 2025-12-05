import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';

// Placeholder for sending email - In a real application, this would integrate with an email service (e.g., Nodemailer, SendGrid)
async function sendEmail(to: string, subject: string, body: string): Promise<boolean> {
  console.log(`Simulating email send to: ${to}`);
  console.log(`Subject: ${subject}`);
  console.log(`Body: ${body}`);
  // In a real scenario, call your email service here
  // const success = await emailService.send(to, subject, body);
  // return success;
  return true; // Simulate success for now
}

// Placeholder for sending WhatsApp message - In a real application, this would integrate with a WhatsApp API (e.g., Twilio, Meta)
async function sendWhatsApp(to: string, body: string): Promise<boolean> {
  console.log(`Simulating WhatsApp message send to: ${to}`);
  console.log(`Body: ${body}`);
  // In a real scenario, call your WhatsApp API here
  // const success = await whatsappService.send(to, body);
  // return success;
  return true; // Simulate success for now
}

export async function POST(request: NextRequest) {
  try {
    const { policyId, templateId, channel, overrideContent } = await request.json();

    if (!policyId || !templateId || !channel) {
      return NextResponse.json({ message: 'policyId, templateId y channel son obligatorios' }, { status: 400 });
    }

    // 1. Fetch Policy Data
    const [policyRows]: [any[], any] = await pool.query(
      `SELECT gp.*, c.nombreCompleto as clientName, c.correo as clientEmail, c.telefono as clientPhone,
              a.name AS aseguradoraName, r.name AS ramoName
       FROM GeneralPolicy gp
       JOIN Client c ON gp.clientId = c.id
       LEFT JOIN Aseguradora a ON gp.aseguradoraId = a.id
       LEFT JOIN Ramo r ON gp.ramoId = r.id
       WHERE gp.id = ?`,
      [policyId]
    );

    if (policyRows.length === 0) {
      return NextResponse.json({ message: 'Póliza no encontrada' }, { status: 404 });
    }
    const policy = policyRows[0];

    // 2. Fetch Template
    const [templateRows]: [any[], any] = await pool.query(
      'SELECT * FROM Template WHERE id = ?',
      [templateId]
    );

    if (templateRows.length === 0) {
      return NextResponse.json({ message: 'Plantilla no encontrada' }, { status: 404 });
    }
    const template = templateRows[0];

    // Ensure channel matches template type
    if (template.type !== channel) {
      return NextResponse.json({ message: `La plantilla de tipo '${template.type}' no puede ser usada para el canal '${channel}'` }, { status: 400 });
    }

    // 3. Compose Message
    let subject = template.subject || '';
    let body = overrideContent || template.body;

    // Personalization: Replace placeholders
    body = body.replace(/{{clientName}}/g, policy.clientName || 'Cliente');
    body = body.replace(/{{policyNumber}}/g, policy.numeroPoliza || 'N/A');
    body = body.replace(/{{expirationDate}}/g, policy.fechaFinVigencia ? new Date(policy.fechaFinVigencia).toLocaleDateString('es-CO') : 'N/A');
    body = body.replace(/{{primaNeta}}/g, policy.valorPrimaNeta ? policy.valorPrimaNeta.toLocaleString('es-CO') : 'N/A');
    body = body.replace(/{{totalAPagar}}/g, policy.valorTotalAPagar ? policy.valorTotalAPagar.toLocaleString('es-CO') : 'N/A');
    body = body.replace(/{{aseguradoraName}}/g, policy.aseguradoraName || 'N/A');
    body = body.replace(/{{ramoName}}/g, policy.ramoName || 'N/A');

    subject = subject.replace(/{{clientName}}/g, policy.clientName || 'Cliente');
    subject = subject.replace(/{{policyNumber}}/g, policy.numeroPoliza || 'N/A');
    subject = subject.replace(/{{expirationDate}}/g, policy.fechaFinVigencia ? new Date(policy.fechaFinVigencia).toLocaleDateString('es-CO') : 'N/A');

    let sendSuccess = false;
    let contactInfo = '';

    // 4. Send Message based on Channel
    if (channel === 'email') {
      if (!policy.clientEmail) {
        return NextResponse.json({ message: 'El cliente no tiene un correo electrónico registrado para enviar el recordatorio.' }, { status: 400 });
      }
      contactInfo = policy.clientEmail;
      sendSuccess = await sendEmail(policy.clientEmail, subject, body);
    } else if (channel === 'whatsapp') {
      if (!policy.clientPhone) {
        return NextResponse.json({ message: 'El cliente no tiene un número de teléfono registrado para enviar el recordatorio por WhatsApp.' }, { status: 400 });
      }
      contactInfo = policy.clientPhone;
      sendSuccess = await sendWhatsApp(policy.clientPhone, body);
    } else {
      return NextResponse.json({ message: 'Canal de comunicación no soportado' }, { status: 400 });
    }

    if (sendSuccess) {
      // 5. Update lastReminderSent in GeneralPolicy
      await pool.query(
        `UPDATE GeneralPolicy SET lastReminderSent = NOW(), updatedAt = NOW() WHERE id = ?`,
        [policyId]
      );
      return NextResponse.json({ message: `Recordatorio enviado exitosamente vía ${channel} a ${contactInfo}.` }, { status: 200 });
    } else {
      return NextResponse.json({ message: `Fallo al enviar recordatorio vía ${channel}.` }, { status: 500 });
    }

  } catch (error) {
    console.error('Error sending renewal reminder:', error);
    return NextResponse.json({ message: 'Error interno del servidor al enviar el recordatorio de renovación' }, { status: 500 });
  }
}
