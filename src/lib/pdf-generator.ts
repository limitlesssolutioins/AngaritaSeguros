import puppeteer from 'puppeteer';
import path from 'path';
import fs from 'fs/promises';

const PDF_OUTPUT_DIR = path.join(process.cwd(), 'public', 'liquidations'); // PDFs will be served from /liquidations/

interface LiquidationData {
  id: string;
  agentName: string;
  startDate: string;
  endDate: string;
  totalCommissions: number;
  totalDeductions: number;
  netPayment: number;
  status: string;
  createdAt: string;
  // Potentially more details like a breakdown of payments/commissions
}

/**
 * Generates an HTML string for a liquidation PDF.
 * @param data The liquidation data.
 * @param type 'pre-liquidation' or 'paid'
 * @returns HTML string.
 */
function generateLiquidationHtml(data: LiquidationData, type: 'pre-liquidation' | 'paid'): string {
  const title = type === 'pre-liquidation' ? 'Pre-Liquidación de Agente' : 'Comprobante de Pago de Liquidación';
  const statusBadge = type === 'paid' ? `<span style="background-color: #28a745; color: white; padding: 5px 10px; border-radius: 5px;">PAGADO</span>` : '';

  const commissionFormatted = data.totalCommissions.toLocaleString('es-CO', { style: 'currency', currency: 'COP' });
  const deductionsFormatted = data.totalDeductions.toLocaleString('es-CO', { style: 'currency', currency: 'COP' });
  const netPaymentFormatted = data.netPayment.toLocaleString('es-CO', { style: 'currency', currency: 'COP' });

  return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${title} - ${data.agentName}</title>
        <style>
            body { font-family: 'Helvetica Neue', 'Helvetica', Arial, sans-serif; margin: 20px; color: #333; }
            .container { width: 800px; margin: 0 auto; border: 1px solid #eee; padding: 30px; box-shadow: 0 0 10px rgba(0,0,0,0.05); }
            h1 { text-align: center; color: #007bff; margin-bottom: 20px; }
            .header-info { display: flex; justify-content: space-between; margin-bottom: 20px; font-size: 0.9em; }
            .section-title { border-bottom: 1px solid #eee; padding-bottom: 5px; margin-top: 25px; margin-bottom: 15px; color: #007bff; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
            .total-row td { font-weight: bold; }
            .total-section { text-align: right; margin-top: 30px; }
            .total-item { display: flex; justify-content: flex-end; align-items: center; margin-bottom: 5px; }
            .total-item strong { width: 150px; text-align: right; margin-right: 10px; }
            .total-item span { width: 150px; text-align: right; font-weight: bold; color: #007bff; }
            .footer { text-align: center; margin-top: 40px; font-size: 0.8em; color: #777; }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>${title}</h1>
            <div class="header-info">
                <div>
                    <strong>Agente:</strong> ${data.agentName}<br>
                    <strong>ID Liquidación:</strong> ${data.id}<br>
                    <strong>Fecha de Generación:</strong> ${new Date(data.createdAt).toLocaleDateString('es-CO')}
                </div>
                <div>
                    <strong>Periodo:</strong> ${new Date(data.startDate).toLocaleDateString('es-CO')} - ${new Date(data.endDate).toLocaleDateString('es-CO')}<br>
                    ${statusBadge}
                </div>
            </div>

            <h2 class="section-title">Resumen Financiero</h2>
            <div class="total-section">
                <div class="total-item"><strong>Total Comisiones:</strong> <span>${commissionFormatted}</span></div>
                <div class="total-item"><strong>Total Deducciones:</strong> <span>${deductionsFormatted}</span></div>
                <div class="total-item" style="border-top: 1px solid #eee; padding-top: 10px; margin-top: 10px;"><strong>Pago Neto:</strong> <span style="font-size: 1.2em; color: #28a745;">${netPaymentFormatted}</span></div>
            </div>

            <!-- TODO: Add detailed breakdown of payments/commissions if needed -->
            <!-- <h2 class="section-title">Detalle de Comisiones</h2> -->
            <!-- <table> ... </table> -->

            <div class="footer">
                Documento generado por Angarita Seguros el ${new Date().toLocaleDateString('es-CO')}
            </div>
        </div>
    </body>
    </html>
  `;
}

/**
 * Generates a PDF from HTML content.
 * @param data The liquidation data.
 * @param type 'pre-liquidation' or 'paid'
 * @returns The relative path to the generated PDF.
 */
export async function generateLiquidationPdf(data: LiquidationData, type: 'pre-liquidation' | 'paid'): Promise<string> {
  const htmlContent = generateLiquidationHtml(data, type);
  // Launching puppeteer with 'new' headless mode for better performance/stability in newer versions
  const browser = await puppeteer.launch({ headless: 'new' }); 
  const page = await browser.newPage();
  await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

  await fs.mkdir(PDF_OUTPUT_DIR, { recursive: true });

  const filename = `${data.id}_${type}_${Date.now()}.pdf`;
  const absolutePath = path.join(PDF_OUTPUT_DIR, filename);
  const relativePath = `/liquidations/${filename}`; // Path accessible via URL

  await page.pdf({
    path: absolutePath,
    format: 'A4',
    printBackground: true,
  });

  await browser.close();
  return relativePath;
}

