'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import { useReactTable, getCoreRowModel, flexRender, ColumnDef } from '@tanstack/react-table';
import styles from './UsersList.module.css';
import UserFormModal from './UserFormModal';

interface UserData {
  id: string;
  name: string;
  email: string;
  role: 'Superadmin' | 'Admin' | 'Agent';
  office: string;
  createdAt: string;
  updatedAt: string;
}

interface NewUserPayload {
  name: string;
  email: string;
  password?: string;
  role: 'Superadmin' | 'Admin' | 'Agent';
  office: string;
}

export default function UsersList() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [userToEdit, setUserToEdit] = useState<UserData | null>(null);
  const [isNewUser, setIsNewUser] = useState(false);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/users');
      if (!response.ok) {
        throw new Error('Error al cargar usuarios');
      }
      const data: UserData[] = await response.json();
      setUsers(data);
    } catch (err: any) {
      setError(err.message);
      console.error("Failed to fetch users:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleSaveUser = async (userData: NewUserPayload, id?: string) => {
    setError(null);
    try {
      let response;
      if (id && !isNewUser) { // Editing existing user
        response = await fetch(`/api/users/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(userData),
        });
      } else { // Adding new user
        response = await fetch('/api/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(userData),
        });
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Error al ${id ? 'actualizar' : 'crear'} el usuario.`);
      }

      alert(`Usuario ${id ? 'actualizado' : 'creado'} exitosamente`);
      setIsFormModalOpen(false);
      setUserToEdit(null);
      fetchUsers(); // Re-fetch users to update the list
    } catch (err: any) {
      setError(err.message);
      console.error(`Failed to ${id ? 'update' : 'create'} user:`, err);
      alert(`Error: ${err.message}`);
    }
  };

  const handleEditClick = (user: UserData) => {
    setUserToEdit(user);
    setIsNewUser(false);
    setIsFormModalOpen(true);
  };

  const handleDeleteUser = async (userId: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar este usuario?')) {
      setError(null);
      try {
        const response = await fetch(`/api/users/${userId}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Error al eliminar el usuario');
        }

        alert('Usuario eliminado exitosamente');
        fetchUsers(); // Re-fetch users to update the list
      } catch (err: any) {
        setError(err.message);
        console.error("Failed to delete user:", err);
        alert(`Error: ${err.message}`);
      }
    }
  };

  const columns = useMemo<ColumnDef<UserData>[]>(
    () => [
      { accessorKey: 'name', header: 'Nombre' },
      { accessorKey: 'email', header: 'Email' },
      { accessorKey: 'office', header: 'Oficina' },
      {
        accessorKey: 'role',
        header: 'Rol',
        cell: info => {
          const role = info.getValue() as UserData['role'];
          return (
            <span className={`${styles.roleBadge} ${styles[role.toLowerCase()]}`}>
              {role === 'Superadmin' ? 'Superadministrador' : role === 'Admin' ? 'Administrador' : 'Agente'}
            </span>
          );
        },
      },
      {
        accessorKey: 'createdAt',
        header: 'Fecha Creación',
        cell: info => new Date(info.getValue() as string).toLocaleDateString(),
      },
      {
        id: 'actions',
        header: 'Acciones',
        cell: ({ row }) => (
          <div className={styles.actionGroup}>
            <button onClick={() => handleEditClick(row.original)} className={`${styles.actionButton} ${styles.actionButtonSecondary}`}>Editar</button>
            <button onClick={() => handleDeleteUser(row.original.id)} className={`${styles.actionButton} ${styles.actionButtonDanger}`}>Eliminar</button>
          </div>
        ),
      },
    ],
    [] // No need to re-memoize on users change as data is passed directly to table instance
  );

  const table = useReactTable({
    data: users,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  if (loading) {
    return <p className={styles.loadingText}>Cargando usuarios...</p>;
  }

  if (error) {
    return <p className={styles.errorText}>Error: {error}</p>;
  }

  return (
    <div className={styles.usersListContainer}>
      <div className={styles.controlsContainer}>
        <button
          onClick={() => { setUserToEdit(null); setIsNewUser(true); setIsFormModalOpen(true); }}
          className={styles.addButton}
        >
          Agregar Usuario
        </button>
      </div>
      {users.length === 0 ? (
        <p>No hay usuarios creados todavía.</p>
      ) : (
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              {table.getHeaderGroups().map(headerGroup => (
                <tr key={headerGroup.id} className={styles.tableHeaderRow}>
                  {headerGroup.headers.map(header => (
                    <th key={header.id} className={styles.tableHeader}>
                      {flexRender(header.column.columnDef.header, header.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.map(row => (
                <tr key={row.id} className={styles.tableRow}>
                  {row.getVisibleCells().map(cell => (
                    <td key={cell.id} className={styles.tableCell}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <UserFormModal
        isOpen={isFormModalOpen}
        onClose={() => { setIsFormModalOpen(false); setUserToEdit(null); }}
        onSaveUser={handleSaveUser}
        userToEdit={userToEdit}
        isNewUser={isNewUser}
      />
    </div>
  );
}
