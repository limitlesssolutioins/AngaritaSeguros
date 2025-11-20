import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

// In-memory placeholder for the database
let policies: CumplimientoPolicy[] = [];

// (Keep the same interface)
interface CumplimientoPolicy {
  id: string;
  etiqueta: string;
  nombre: string;
  fecha: string;
  aseguradora: string;
  valorPrima: number;
  numeroPoliza: string;
  createdBy: string; // User ID
  createdAt: string;
  files?: string[]; // To store file paths
}

export async function GET() {
  try {
    return NextResponse.json(policies);
  } catch (error) {
    console.error('Error fetching policies:', error);
    return NextResponse.json({ message: 'Error interno del servidor' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.formData();
    const etiqueta = data.get('etiqueta') as string;
    const nombre = data.get('nombre') as string;
    const fecha = data.get('fecha') as string;
    const aseguradora = data.get('aseguradora') as string;
    const valorPrima = data.get('valorPrima') as string;
    const numeroPoliza = data.get('numeroPoliza') as string;
    const files = data.getAll('files') as File[];

    if (!etiqueta || !nombre || !fecha || !aseguradora || !valorPrima || !numeroPoliza) {
      return NextResponse.json({ message: 'Todos los campos son obligatorios' }, { status: 400 });
    }

    const userId = 'user_placeholder_id';
    const uploadedFilePaths: string[] = [];

    // Handle file uploads
    if (files && files.length > 0) {
      const uploadDir = path.join(process.cwd(), 'public', 'uploads');
      
      try {
        await mkdir(uploadDir, { recursive: true });
      } catch (error) {
        // Ignore error if directory already exists
        if ((error as NodeJS.ErrnoException).code !== 'EEXIST') {
          throw error; // Rethrow if it's another error
        }
      }

      for (const file of files) {
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const filePath = path.join(uploadDir, file.name);
        await writeFile(filePath, buffer);
        uploadedFilePaths.push(`/uploads/${file.name}`); // Store public path
      }
    }

    const newPolicy: Partial<CumplimientoPolicy> = {
      etiqueta,
      nombre,
      fecha,
      aseguradora,
      valorPrima: parseFloat(valorPrima),
      numeroPoliza,
      createdBy: userId,
      createdAt: new Date().toISOString(),
      files: uploadedFilePaths,
      id: String(policies.length + 1), // Assign a simple unique ID
    };

    policies.push(newPolicy as CumplimientoPolicy);
    console.log('Creating new policy with files:', newPolicy);

    return NextResponse.json({ message: 'Póliza creada exitosamente', policy: newPolicy }, { status: 201 });

  } catch (error) {
    console.error('Error creating policy:', error);
    return NextResponse.json({ message: 'Error interno del servidor' }, { status: 500 });
  }
}
