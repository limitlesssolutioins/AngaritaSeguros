// src/app/api/vehiculo/[placa]/route.ts

import { NextResponse } from 'next/server';

interface VehiculoData {
  placa: string;
  marca: string;
  linea: string;
  modelo: number;
  cilindraje: number;
  clase: string;
  tipoServicio: string;
  color: string;
  propietario: string;
  identificacionPropietario: string;
}

/**
 * Generates deterministic mock vehicle data based on a license plate.
 * @param placa The license plate to generate data for.
 * @returns A VehiculoData object.
 */
const generateMockData = (placa: string): VehiculoData => {
  const letters = placa.substring(0, 3).toUpperCase();
  const numbers = placa.replace(/[^0-9]/g, '').slice(-3); // Get last 3 digits

  const marcas = ['Renault', 'Chevrolet', 'Mazda', 'Kia', 'Nissan', 'Toyota', 'Ford', 'Volkswagen'];
  const lineas: { [key: string]: string[] } = {
    Renault: ['Logan', 'Duster', 'Sandero', 'Kwid'],
    Chevrolet: ['Onix', 'Spark', 'Tracker', 'Captiva'],
    Mazda: ['2', '3', 'CX-5', 'CX-30'],
    Kia: ['Picanto', 'Rio', 'Sportage', 'Seltos'],
    Nissan: ['Versa', 'March', 'Kicks', 'Frontier'],
    Toyota: ['Corolla', 'Hilux', 'Yaris', 'RAV4'],
    Ford: ['Fiesta', 'Focus', 'Escape', 'Ranger'],
    Volkswagen: ['Gol', 'Jetta', 'T-Cross', 'Amarok'],
  };

  const marcaSeed = (letters.charCodeAt(0) + letters.charCodeAt(1)) % marcas.length;
  const marca = marcas[marcaSeed];
  const lineaSeed = placa.charCodeAt(2) % lineas[marca].length;
  const linea = lineas[marca][lineaSeed];
  
  const numericPart = parseInt(numbers, 10) || 123;
  const modelo = 2010 + (numericPart % 15); // Year between 2010 and 2024
  const cilindraje = 1200 + (numericPart % 8) * 100; // 1200 to 1900

  return {
    placa: placa.toUpperCase(),
    marca,
    linea,
    modelo,
    cilindraje,
    clase: 'Automóvil',
    tipoServicio: 'Particular',
    color: ['Rojo', 'Gris Plata', 'Blanco', 'Negro', 'Azul'][numericPart % 5],
    propietario: `Propietario de ${placa.toUpperCase()}`,
    identificacionPropietario: `10${numericPart.toString().padStart(8, '0')}`,
  };
};

export async function GET(request: Request, { params }: { params: { placa: string } }) {
  const placa = params.placa;

  if (!placa || placa.length < 5) {
    return NextResponse.json({ message: 'Placa inválida.' }, { status: 400 });
  }

  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));

  // Simulate a small chance of failure for demonstration purposes
  if (placa.toUpperCase().includes('FAIL')) {
    return NextResponse.json({ message: 'Error simulado al consultar la placa.' }, { status: 500 });
  }

  const vehiculoData = generateMockData(placa);

  return NextResponse.json(vehiculoData);
}
