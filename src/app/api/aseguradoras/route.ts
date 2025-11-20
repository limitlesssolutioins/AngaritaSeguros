import { NextResponse } from 'next/server';

// In-memory placeholder for the database
let aseguradoras = [
  { id: '1', name: 'SURA' },
  { id: '2', name: 'Allianz' },
  { id: '3', name: 'Bolivar' },
];

/**
 * @swagger
 * /api/aseguradoras:
 *   get:
 *     summary: Get all aseguradoras
 *     description: Returns a list of all insurance companies.
 *     responses:
 *       200:
 *         description: A list of aseguradoras.
 */
export async function GET() {
  try {
    // In a real app, you would fetch this from a database
    return NextResponse.json(aseguradoras);
  } catch (error) {
    return NextResponse.json({ message: 'Error interno del servidor' }, { status: 500 });
  }
}

/**
 * @swagger
 * /api/aseguradoras:
 *   post:
 *     summary: Create a new aseguradora
 *     description: Creates a new insurance company.
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
 *         description: Aseguradora created successfully.
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
    const newAseguradora = { id: String(aseguradoras.length + 1), name };
    aseguradoras.push(newAseguradora);

    return NextResponse.json(newAseguradora, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: 'Error interno del servidor' }, { status: 500 });
  }
}
