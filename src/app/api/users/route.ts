// src/app/api/users/route.ts

import { NextResponse } from 'next/server';

interface UserData {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'agent' | 'viewer';
}

const mockUsers: UserData[] = [
  {
    id: 'user_001',
    name: 'Admin User',
    email: 'admin@angarita.com',
    role: 'admin',
  },
  {
    id: 'user_002',
    name: 'Agente Comercial',
    email: 'agent@angarita.com',
    role: 'agent',
  },
  {
    id: 'user_003',
    name: 'Usuario de Consulta',
    email: 'viewer@angarita.com',
    role: 'viewer',
  },
  {
    id: 'user_004',
    name: 'Supervisor',
    email: 'supervisor@angarita.com',
    role: 'admin',
  },
];

export async function GET() {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 300 + Math.random() * 300));
  return NextResponse.json(mockUsers);
}
