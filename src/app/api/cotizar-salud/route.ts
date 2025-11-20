
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const documento = searchParams.get('documento');
  const edad = searchParams.get('edad');
  const preexistentes = searchParams.get('preexistentes');

  // En un futuro, aquí se conectarían las APIs de las aseguradoras de salud
  // Por ahora, devolvemos datos de ejemplo basados en los parámetros

  let cotizacionesDeEjemplo = [
    {
      aseguradora: 'Sura Salud',
      logo: '/img/aliado1.png',
      plan: 'Plan Básico',
      coberturaHospitalaria: 'Básica',
      coberturaAmbulatoria: 'Básica',
      valorTotal: 150000,
      beneficiosAdicionales: ['Red de clínicas', 'Consultas generales'],
    },
    {
      aseguradora: 'Colsanitas',
      logo: '/img/aliado5.png',
      plan: 'Plan Premium',
      coberturaHospitalaria: 'Completa',
      coberturaAmbulatoria: 'Completa',
      valorTotal: 250000,
      beneficiosAdicionales: ['Acceso a especialistas', 'Odontología básica', 'Chequeos anuales'],
    },
    {
      aseguradora: 'Medicina Prepagada',
      logo: '/img/aliado6.png',
      plan: 'Plan Familiar',
      coberturaHospitalaria: 'VIP',
      coberturaAmbulatoria: 'VIP',
      valorTotal: 400000,
      beneficiosAdicionales: ['Atención domiciliaria', 'Terapias', 'Cobertura internacional'],
    },
  ];

  // Ajustar precios o planes basados en edad o preexistencias (simulado)
  if (edad && parseInt(edad) > 50) {
    cotizacionesDeEjemplo = cotizacionesDeEjemplo.map(cot => ({
      ...cot,
      valorTotal: cot.valorTotal * 1.3, // 30% más caro para mayores de 50
    }));
  }

  if (preexistentes === 'true') {
    cotizacionesDeEjemplo = cotizacionesDeEjemplo.map(cot => ({
      ...cot,
      valorTotal: cot.valorTotal * 1.5, // 50% más caro con preexistencias
      beneficiosAdicionales: [...cot.beneficiosAdicionales, 'Evaluación médica inicial'],
    }));
  }

  // Simular un pequeño retraso de la red
  await new Promise(resolve => setTimeout(resolve, 1500));

  return NextResponse.json(cotizacionesDeEjemplo);
}
