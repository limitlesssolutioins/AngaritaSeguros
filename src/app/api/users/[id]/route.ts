import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const userId = request.headers.get('x-user-id');
    const userRole = request.headers.get('x-user-role');

    // Only Superadmin or Admin can delete users
    if (userRole !== 'Superadmin' && userRole !== 'Admin') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
    }

    const { id } = params;

    // Prevent deleting self
    if (id === userId) {
      return NextResponse.json({ message: 'Cannot delete own account' }, { status: 400 });
    }

    // Check if the user exists
    const [existingUser]: any = await pool.query('SELECT id FROM User WHERE id = ?', [id]);
    if (existingUser.length === 0) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    await pool.query('DELETE FROM User WHERE id = ?', [id]);
    return NextResponse.json({ message: 'User deleted successfully' }, { status: 200 });

  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json({ message: 'Error interno del servidor al eliminar usuario' }, { status: 500 });
  }
}

// Optionally, you might want a GET and PUT for a single user as well
export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const userId = request.headers.get('x-user-id');
    const userRole = request.headers.get('x-user-role');

    // Superadmin/Admin can view any user, Agent can only view self
    if (userRole === 'Agent' && params.id !== userId) {
      return NextResponse.json({ message: 'Unauthorized to view this user' }, { status: 403 });
    }

    const [rows]: any = await pool.query('SELECT id, name, email, role, office, createdAt, updatedAt FROM User WHERE id = ?', [params.id]);
    if (rows.length === 0) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }
    return NextResponse.json(rows[0]);
  } catch (error) {
    console.error('Error fetching single user:', error);
    return NextResponse.json({ message: 'Error interno del servidor al obtener usuario' }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const requesterId = request.headers.get('x-user-id');
    const requesterRole = request.headers.get('x-user-role');
    const { id } = params;
    const body = await request.json();
    const { name, email, role, office } = body; // Password update will be separate or handled carefully

    // A user can update their own profile (name, email, office), but not role unless Superadmin/Admin
    // Superadmin/Admin can update any user
    if (id !== requesterId && requesterRole !== 'Superadmin' && requesterRole !== 'Admin') {
      return NextResponse.json({ message: 'Unauthorized to update this user' }, { status: 403 });
    }

    // Prevent non-Superadmin/Admin from changing roles
    if (role && role !== body.originalRole && requesterRole !== 'Superadmin' && requesterRole !== 'Admin') {
        return NextResponse.json({ message: 'Unauthorized to change user role' }, { status: 403 });
    }

    // Only Superadmin can create Superadmin
    if (role === 'Superadmin' && requesterRole !== 'Superadmin') {
      return NextResponse.json({ message: 'Unauthorized to create/assign Superadmin role' }, { status: 403 });
    }

    // Admin can only create/assign Agents, not other Admins or Superadmins
    if (role === 'Admin' && requesterRole === 'Admin') { // If admin tries to create admin
        return NextResponse.json({ message: 'Admin cannot create/assign other Admin roles' }, { status: 403 });
    }
    if (role === 'Superadmin' && requesterRole === 'Admin') { // If admin tries to create superadmin
        return NextResponse.json({ message: 'Admin cannot create/assign Superadmin roles' }, { status: 403 });
    }

    const [existingUser]: any = await pool.query('SELECT id FROM User WHERE id = ?', [id]);
    if (existingUser.length === 0) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }
    
    // Build update query dynamically
    let updateQuery = 'UPDATE User SET ';
    const updateParams: any[] = [];
    if (name) { updateQuery += 'name = ?, '; updateParams.push(name); }
    if (email) { updateQuery += 'email = ?, '; updateParams.push(email); }
    if (role && (requesterRole === 'Superadmin' || requesterRole === 'Admin')) { // Role can only be changed by Superadmin/Admin
      updateQuery += 'role = ?, '; updateParams.push(role);
    }
    if (office) { updateQuery += 'office = ?, '; updateParams.push(office); }
    
    updateQuery += 'updatedAt = NOW() WHERE id = ?';
    updateParams.push(id);

    // Remove trailing comma if any fields were updated
    updateQuery = updateQuery.replace(/, updatedAt = NOW\(\)/, 'updatedAt = NOW()');

    await pool.query(updateQuery, updateParams);
    return NextResponse.json({ message: 'User updated successfully' }, { status: 200 });

  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json({ message: 'Error interno del servidor al actualizar usuario' }, { status: 500 });
  }
}
