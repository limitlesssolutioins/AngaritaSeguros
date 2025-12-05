import { NextRequest, NextResponse } from 'next/server';
import { writeFile, rm, mkdir, access, constants } from 'fs/promises';
import path from 'path';
import { pool } from '@/lib/db';
import { customAlphabet } from 'nanoid';

const nanoid = customAlphabet('0123456789abcdefghijklmnopqrstuvwxyz', 21);

// GET: List documents for a specific client
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const clientId = params.id;
    if (!clientId) {
      return NextResponse.json({ message: 'Client ID es obligatorio' }, { status: 400 });
    }

    const [documents] = await pool.query(
      'SELECT id, fileName, fileType, filePath, description, uploadedAt FROM ClientDocument WHERE clientId = ? ORDER BY uploadedAt DESC',
      [clientId]
    );

    return NextResponse.json(documents);
  } catch (error) {
    console.error('Error fetching client documents:', error);
    return NextResponse.json({ message: 'Error interno del servidor al obtener documentos' }, { status: 500 });
  }
}

// POST: Upload a document for a specific client
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const clientId = params.id;
    if (!clientId) {
      return NextResponse.json({ message: 'Client ID es obligatorio' }, { status: 400 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const description = formData.get('description') as string | null;

    if (!file) {
      return NextResponse.json({ message: 'No se ha subido ningún archivo' }, { status: 400 });
    }

    // Sanitize filename to prevent directory traversal
    const sanitizedFileName = path.basename(file.name);
    
    // Create client-specific upload directory if it doesn't exist
    const clientUploadDir = path.join(process.cwd(), 'public', 'uploads', 'clients', clientId);
    
    // Check if directory exists, create if not
    try {
      await access(clientUploadDir, constants.F_OK);
    } catch (e) {
      await mkdir(clientUploadDir, { recursive: true });
    }

    const uniqueFileName = `${nanoid(10)}-${sanitizedFileName}`;
    const filePathOnDisk = path.join(clientUploadDir, uniqueFileName);
    const publicFilePath = `/uploads/clients/${clientId}/${uniqueFileName}`; // Path for DB and client access

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePathOnDisk, buffer);

    const documentId = `doc_${nanoid(17)}`;
    await pool.query(
      'INSERT INTO ClientDocument (id, clientId, fileName, fileType, filePath, description) VALUES (?, ?, ?, ?, ?, ?)',
      [documentId, clientId, sanitizedFileName, file.type, publicFilePath, description]
    );

    return NextResponse.json(
      { 
        id: documentId, 
        clientId, 
        fileName: sanitizedFileName, 
        fileType: file.type, 
        filePath: publicFilePath, 
        description,
        uploadedAt: new Date().toISOString()
      }, 
      { status: 201 }
    );
  } catch (error) {
    console.error('Error uploading client document:', error);
    return NextResponse.json({ message: 'Error interno del servidor al subir el documento' }, { status: 500 });
  }
}

// DELETE: Delete a specific document for a client
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const clientId = params.id;
    const documentId = request.nextUrl.searchParams.get('documentId'); // Get documentId from query params

    if (!clientId || !documentId) {
      return NextResponse.json({ message: 'Client ID y Document ID son obligatorios' }, { status: 400 });
    }

    const [rows]: [any[], any] = await pool.query(
      'SELECT filePath FROM ClientDocument WHERE id = ? AND clientId = ?',
      [documentId, clientId]
    );

    if (rows.length === 0) {
      return NextResponse.json({ message: 'Documento no encontrado' }, { status: 404 });
    }

    const dbFilePath = rows[0].filePath;
    // Ensure the file is within the intended upload directory and prevent directory traversal
    const expectedPrefix = path.join('/', 'uploads', 'clients', clientId);
    if (!dbFilePath.startsWith(expectedPrefix)) {
        console.warn('Attempted to delete file outside expected directory:', dbFilePath);
        return NextResponse.json({ message: 'Operación de eliminación no permitida' }, { status: 403 });
    }

    const absoluteFilePath = path.join(process.cwd(), 'public', dbFilePath);
    
    // Check if file exists on disk before attempting to delete
    try {
        await access(absoluteFilePath, constants.F_OK);
        await rm(absoluteFilePath);
    } catch (e: any) {
        if (e.code === 'ENOENT') {
            console.warn(`File not found on disk for document ID ${documentId}: ${absoluteFilePath}`);
        } else {
            console.error(`Error deleting file from disk for document ID ${documentId}:`, e);
            // Even if file delete fails, proceed to delete DB entry for consistency
        }
    }

    await pool.query('DELETE FROM ClientDocument WHERE id = ? AND clientId = ?', [documentId, clientId]);

    return NextResponse.json({ message: 'Documento eliminado exitosamente' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting client document:', error);
    return NextResponse.json({ message: 'Error interno del servidor al eliminar documento' }, { status: 500 });
  }
}
