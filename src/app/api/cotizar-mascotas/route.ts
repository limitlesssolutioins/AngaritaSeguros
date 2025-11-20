// src/app/api/cotizar-mascotas/route.ts

import { NextResponse } from 'next/server';

interface PolizaMascota {
  aseguradora: string;
  logo: string;
  plan: string;
  coberturaEmergencias: number;
  coberturaConsultas: number;
  valorMensual: number;
  beneficiosAdicionales: string[];
}

const generateMockQuote = (especie: string, edad: number): PolizaMascota => {
  let basePremium = 40000;
  if (especie.toLowerCase() === 'perro') {
    basePremium = 50000;
  }
  if (edad > 8) {
    basePremium *= 1.5; // 50% more for senior pets
  }

  return {
    aseguradora: 'SURA',
    logo: '/img/aliado1.png',
    plan: 'Plan Mascotas Felices',
    coberturaEmergencias: 1000000,
    coberturaConsultas: 200000,
    valorMensual: basePremium,
    beneficiosAdicionales: [
      'Consultas veterinarias a domicilio',
      'Vacunación anual',
      'Guardería por viaje del propietario',
      'Asistencia exequial para la mascota',
    ],
  };
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const especie = searchParams.get('especie') || 'perro';
  const edad = parseInt(searchParams.get('edad') || '3', 10);

  const cotizacion = generateMockQuote(especie, edad);

  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1200 + Math.random() * 800));

  // Note: We wrap the single object in an array because the frontend component expects an array.
  return NextResponse.json([cotizacion]);
}
