import { NextResponse } from 'next/server';

// In-memory placeholder for the database
let etiquetas = [
  { id: '1', name: 'CARLOS MENA' },
  { id: '2', name: 'CLIENTE EJEMPLO' },
];

/**
 * @swagger
 * /api/etiquetas:
 *   get:
 *     summary: Get all etiquetas
 *     description: Returns a list of all tags/labels.
 *     responses:
 *       200:
 *         description: A list of etiquetas.
 */
export async function GET() {
  try {
    // In a real app, you would fetch this from a database
    return NextResponse.json(etiquetas);
  } catch (error) {
    return NextResponse.json({ message: 'Error interno del servidor' }, { status: 500 });
  }
}

/**
 * @swagger
 * /api/etiquetas:
 *   post:
 *     summary: Create a new etiqueta
 *     description: Creates a new tag/label.
 *     requestBody:
 *       required: true,
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string }
 *     responses:
 *       201:
 *         description: Etiqueta created successfully.
 *       400:
 *         description: Invalid data provided.
 */
export async function POST(request: Request) {
  try {
    const { name } = await request.json();
    if (!name) {
      return NextResponse.json({ message: 'El nombre es obligatorio' }, { status: 400 });
    }

    // In a real app, you would save this to a database
    const newEtiqueta = { id: String(etiquetas.length + 1), name };
    etiquetas.push(newEtiqueta);

    return NextResponse.json(newEtiqueta, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: 'Error interno del servidor' }, { status: 500 });
  }
}
