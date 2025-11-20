import { NextResponse } from 'next/server';

// This is a mock API to simulate fetching insurance quotes.
// In a real-world scenario, this would connect to multiple insurance provider APIs.

const generateMockQuotes = (placa: string) => {
  // Use the license plate to add some variation to the quotes
  const basePrice = 1000000 + (parseInt(placa.replace(/[^0-9]/g, '').slice(-3), 10) % 5) * 100000;

  return [
    {
      aseguradora: 'Sura',
      logo: '/img/aliado1.png',
      tipoSeguro: 'Plan Clásico',
      valorDanioTerceros: 800000000,
      porcentajePerdidaTotal: 80,
      valorTotal: basePrice * 1.2,
      beneficiosAdicionales: ['Grúa 24/7', 'Conductor elegido (6 eventos)', 'Asistencia jurídica'],
    },
    {
      aseguradora: 'Allianz',
      logo: '/img/aliado2.png',
      tipoSeguro: 'Plan Estandar',
      valorDanioTerceros: 1200000000,
      porcentajePerdidaTotal: 90,
      valorTotal: basePrice * 1.45,
      beneficiosAdicionales: ['Vehículo de reemplazo (5 días)', 'Grúa 24/7', 'Llantas estalladas (1 evento)'],
    },
    {
      aseguradora: 'Bolívar',
      logo: '/img/aliado3.png',
      tipoSeguro: 'Plan Premium',
      valorDanioTerceros: 2000000000,
      porcentajePerdidaTotal: 100,
      valorTotal: basePrice * 1.8,
      beneficiosAdicionales: ['Vehículo de reemplazo (15 días)', 'Grúa 24/7 ilimitada', 'Asistencia en viaje internacional'],
    },
    {
        aseguradora: 'Liberty',
        logo: '/img/aliado4.png',
        tipoSeguro: 'Plan Básico',
        valorDanioTerceros: 600000000,
        porcentajePerdidaTotal: 80,
        valorTotal: basePrice * 1.1,
        beneficiosAdicionales: ['Grúa (2 eventos)', 'Asistencia jurídica'],
      },
  ];
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const tipo = searchParams.get('tipo');
  const valor = searchParams.get('valor'); // This would be the license plate for vehicles

  if (tipo === 'vehiculo' && valor) {
    const cotizacionesDeEjemplo = generateMockQuotes(valor);
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 1500));

    return NextResponse.json(cotizacionesDeEjemplo);
  }

  // Handle other quote types in the future
  return NextResponse.json({ message: 'Tipo de cotización no soportado' }, { status: 400 });
}