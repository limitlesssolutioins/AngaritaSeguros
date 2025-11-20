'use client';

import { useEffect, useState, useMemo } from 'react';
import { useReactTable, getCoreRowModel, flexRender, ColumnDef } from '@tanstack/react-table';
import styles from './UsersList.module.css'; // Create this CSS module
import UserFormModal from './UserFormModal';

interface UserData {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'agent' | 'viewer';
  permissions: string[];
}

const mockUsers: UserData[] = [
  { id: 'U001', name: 'Admin User', email: 'admin@example.com', role: 'admin', permissions: ['manage_users', 'manage_clients', 'manage_requests', 'view_reports'] },
  { id: 'U002', name: 'Agent Smith', email: 'agent@example.com', role: 'agent', permissions: ['manage_clients', 'manage_requests'] },
  { id: 'U003', name: 'Viewer John', email: 'viewer@example.com', role: 'viewer', permissions: ['view_clients', 'view_reports'] },
];

export default function UsersList() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [userToEdit, setUserToEdit] = useState<UserData | null>(null);

  useEffect(() => {
    // Simulate API call
    setUsers(mockUsers);
    setLoading(false);
  }, []);

  const handleAddUser = (newUser: Omit<UserData, 'id'>) => {
    const newId = 'U' + (users.length + 1).toString().padStart(3, '0');
    setUsers(prev => [...prev, { ...newUser, id: newId }]);
  };

  const handleSaveUser = (updatedUser: Omit<UserData, 'id'>, id?: string) => {
    if (id) {
      setUsers(prev => prev.map(user => (user.id === id ? { ...updatedUser, id } : user)));
    } else {
      handleAddUser(updatedUser);
    }
    setIsFormModalOpen(false);
    setUserToEdit(null);
  };

  const handleEditClick = (user: UserData) => {
    setUserToEdit(user);
    setIsFormModalOpen(true);
  };

  const handleDeleteUser = (userId: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar este usuario?')) {
      setUsers(prev => prev.filter(user => user.id !== userId));
    }
  };

  const columns = useMemo<ColumnDef<UserData>[]>(
    () => [
      { accessorKey: 'name', header: 'Nombre' },
      { accessorKey: 'email', header: 'Email' },
      {
        accessorKey: 'role',
        header: 'Rol',
        cell: info => {
          const role = info.getValue() as UserData['role'];
          return (
            <span className={`${styles.roleBadge} ${styles[role]}`}>
              {role === 'admin' ? 'Administrador' : role === 'agent' ? 'Agente' : 'Visualizador'}
            </span>
          );
        },
      },
      {
        accessorKey: 'permissions',
        header: 'Permisos',
        cell: info => (
          <div className={styles.permissionsCell}>
            {(info.getValue() as string[]).map(p => (
              <span key={p} className={styles.permissionTag}>{p.replace(/_/g, ' ')}</span>
            ))}
          </div>
        ),
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
    [users] // Re-memoize if users change to update actions
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
    <div className={styles.usersListContainer}> {/* Re-using container style */}
      <div className={styles.controlsContainer}>
        <button
          onClick={() => { setUserToEdit(null); setIsFormModalOpen(true); }}
          className={styles.addButton}
        >
          Agregar Usuario
        </button>
      </div>
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
      <UserFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSaveUser={handleSaveUser}
        userToEdit={userToEdit}
      />
    </div>
  );
}
