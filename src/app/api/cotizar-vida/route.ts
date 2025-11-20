// src/app/api/cotizar-vida/route.ts

import { NextResponse } from 'next/server';

interface PolizaVida {
  aseguradora: string;
  logo: string;
  plan: string;
  coberturaFallecimiento: number;
  coberturaInvalidez: number;
  valorMensual: number;
  beneficiosAdicionales: string[];
}

const generateMockQuotes = (edad: number, esFumador: boolean): PolizaVida[] => {
  const basePremium = 50000 + (edad * 1500);

  let quotes: PolizaVida[] = [
    {
      aseguradora: 'Sura',
      logo: '/img/aliado1.png',
      plan: 'Vida Esencial',
      coberturaFallecimiento: 100000000,
      coberturaInvalidez: 50000000,
      valorMensual: basePremium * 1.1,
      beneficiosAdicionales: ['Anticipo para gastos funerarios', 'Asistencia legal'],
    },
    {
      aseguradora: 'Bolívar',
      logo: '/img/aliado3.png',
      plan: 'Vida y Ahorro',
      coberturaFallecimiento: 200000000,
      coberturaInvalidez: 100000000,
      valorMensual: basePremium * 1.5,
      beneficiosAdicionales: ['Componente de ahorro con rentabilidad', 'Cobertura de enfermedades graves', 'Asistencia psicológica'],
    },
    {
      aseguradora: 'Allianz',
      logo: '/img/aliado2.png',
      plan: 'Protección Total',
      coberturaFallecimiento: 500000000,
      coberturaInvalidez: 250000000,
      valorMensual: basePremium * 2.1,
      beneficiosAdicionales: ['Devolución de primas por no reclamación', 'Cobertura para 15 enfermedades graves', 'Renta diaria por hospitalización'],
    },
  ];

  if (esFumador) {
    quotes = quotes.map(q => ({ ...q, valorMensual: q.valorMensual * 1.4 })); // 40% more expensive for smokers
  }

  return quotes;
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const edad = parseInt(searchParams.get('edad') || '30', 10);
  const fumador = searchParams.get('fumador') === 'true';

  const cotizaciones = generateMockQuotes(edad, fumador);

  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 1000));

  return NextResponse.json(cotizaciones);
}
