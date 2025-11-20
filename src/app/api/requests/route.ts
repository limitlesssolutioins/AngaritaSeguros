// src/app/api/requests/route.ts

import { NextResponse } from 'next/server';

interface RequestData {
  id: string;
  type: 'vehiculo' | 'salud' | 'vida' | 'soat' | 'mascotas' | 'financiacion';
  status: 'nueva' | 'pendiente' | 'completada' | 'rechazada';
  date: string; // YYYY-MM-DD
  clientName: string;
  details: string;
}

const mockRequests: RequestData[] = [
  {
    id: 'req_001',
    type: 'vehiculo',
    status: 'nueva',
    date: '2025-09-20',
    clientName: 'Juan Perez',
    details: 'Cotización de seguro para automóvil placa ABC-123',
  },
  {
    id: 'req_002',
    type: 'salud',
    status: 'pendiente',
    date: '2025-09-19',
    clientName: 'Maria Garcia',
    details: 'Solicitud de plan de salud para ID 123456789',
  },
  {
    id: 'req_003',
    type: 'vida',
    status: 'completada',
    date: '2025-09-18',
    clientName: 'Carlos Lopez',
    details: 'Cotización de seguro de vida para persona de 45 años',
  },
  {
    id: 'req_004',
    type: 'soat',
    status: 'nueva',
    date: '2025-09-20',
    clientName: 'Laura Martinez',
    details: 'Redirección a Seguros Mundial para SOAT placa XYZ-789',
  },
  {
    id: 'req_005',
    type: 'mascotas',
    status: 'pendiente',
    date: '2025-09-17',
    clientName: 'Pedro Rodriguez',
    details: 'Cotización de seguro para perro raza Golden Retriever',
  },
  {
    id: 'req_006',
    type: 'financiacion',
    status: 'rechazada',
    date: '2025-09-16',
    clientName: 'Ana Sanchez',
    details: 'Solicitud de financiación redirigida a Sura Financia',
  },
];

export async function GET() {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 500));
  return NextResponse.json(mockRequests);
}
