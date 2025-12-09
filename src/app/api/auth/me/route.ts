import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';

export async function GET(request: Request) {
  let userId = request.headers.get('x-user-id');
  let userRole = request.headers.get('x-user-role');
  let userOffice = request.headers.get('x-user-office');
  let userEmail = request.headers.get('x-user-email');

  // Fallback: Check cookie directly if headers are missing (middleware bypass issue)
  if (!userId) {
    const token = cookies().get('auth_token')?.value;
    if (token) {
      try {
        const decoded = await verifyToken(token);
        userId = decoded.id as string;
        userRole = decoded.role as string;
        userOffice = decoded.office as string;
        userEmail = decoded.email as string;
      } catch (error) {
        console.error('Token verification failed in /api/auth/me:', error);
      }
    }
  }

  if (!userId) {
    return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
  }

  return NextResponse.json({
    id: userId,
    role: userRole,
    office: userOffice,
    email: userEmail
  });
}
