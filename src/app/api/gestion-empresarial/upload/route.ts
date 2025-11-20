import { NextRequest, NextResponse } from 'next/server';
import * as XLSX from 'xlsx';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const aseguradoraId = formData.get('aseguradoraId') as string | null;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded.' }, { status: 400 });
    }

    if (!aseguradoraId) {
      return NextResponse.json({ error: 'Insurance company not selected.' }, { status: 400 });
    }

    // Read the file content as a Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Parse the Excel file
    const workbook = XLSX.read(buffer, { type: 'buffer' });

    // Get the first sheet name
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    // Convert sheet to JSON
    const jsonData = XLSX.utils.sheet_to_json(worksheet);

    console.log(`Received file: ${file.name}, type: ${file.type}, size: ${file.size} bytes for Aseguradora ID: ${aseguradoraId}`);
    console.log('Extracted Excel data:', jsonData);

    // Here you would typically save jsonData to your database or further process it
    // based on the aseguradoraId and a potential configuration for that aseguradora.

    return NextResponse.json({ message: `File ${file.name} uploaded for ${aseguradoraId} and ${jsonData.length} rows processed successfully.` });
  } catch (error) {
    console.error('Error uploading or processing file:', error);
    return NextResponse.json({ error: 'Failed to upload or process file.' }, { status: 500 });
  }
}
