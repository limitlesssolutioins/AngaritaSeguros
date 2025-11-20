// src/app/api/persona/[documento]/route.ts

import { NextRequest, NextResponse } from 'next/server';

interface PersonaData {
  documento: string;
  nombres: string;
  apellidos: string;
  fechaNacimiento: string;
  edad: number;
  genero: string;
}

const generateMockData = (documento: string): PersonaData => {
  const names = ['Juan', 'Carlos', 'Ana', 'Maria', 'Luis', 'Laura', 'Sofia', 'Miguel'];
  const lastNames = ['Perez', 'Gomez', 'Rodriguez', 'Martinez', 'Garcia', 'Lopez', 'Hernandez', 'Gonzalez'];
  
  const docNum = parseInt(documento.replace(/[^0-9]/g, ''), 10) || 12345678;

  const nombre = names[docNum % names.length];
  const apellido = lastNames[docNum % lastNames.length];

  const year = new Date().getFullYear() - (18 + (docNum % 50)); // Age between 18 and 68
  const month = (docNum % 12) + 1;
  const day = (docNum % 28) + 1;
  const fechaNacimiento = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  const edad = new Date().getFullYear() - year;

  return {
    documento,
    nombres: nombre,
    apellidos: `${apellido} ${lastNames[(docNum + 1) % lastNames.length]}`,
    fechaNacimiento,
    edad,
    genero: (docNum % 2 === 0) ? 'Masculino' : 'Femenino',
  };
};

export async function GET(request: NextRequest, context: { params: { documento: string } }) {
  const documento = context.params.documento;

  if (!documento) {
    return NextResponse.json({ message: 'Documento inválido.' }, { status: 400 });
  }

  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 800));

  const personaData = generateMockData(documento);

  return NextResponse.json(personaData);
}
