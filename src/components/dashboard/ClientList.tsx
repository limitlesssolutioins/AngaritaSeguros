'use client';
import { useEffect, useState, useMemo } from 'react';
import { useReactTable, getCoreRowModel, flexRender, ColumnDef, getFilteredRowModel } from '@tanstack/react-table';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import styles from './ClientList.module.css';
import AddClientModal from './AddClientModal';
import ClientDetailsModal from './ClientDetailsModal';

// This interface should match the database schema
interface Client {
  id: string;
  nombreCompleto: string;
  tipoIdentificacion: string;
  numeroIdentificacion: string;
  fechaNacimiento: string;
  direccion: string;
  telefono: string;
  correo: string;
}

export default function ClientList() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [globalFilter, setGlobalFilter] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [clientToEdit, setClientToEdit] = useState<Client | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  const fetchClients = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/clients');
      if (!res.ok) throw new Error('Error al cargar los datos de clientes');
      const data = await res.json();
      setClients(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const handleOpenModal = () => {
    setClientToEdit(null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setClientToEdit(null);
    setIsModalOpen(false);
    fetchClients();
  };

  const handleOpenDetailsModal = (client: Client) => {
    setSelectedClient(client);
    setIsDetailsModalOpen(true);
  };

  const handleCloseDetailsModal = () => {
    setSelectedClient(null);
    setIsDetailsModalOpen(false);
    fetchClients(); // Also refresh data when this modal closes
  };

  const handleEditClient = (client: Client) => {
    setClientToEdit(client);
    setIsModalOpen(true);
  };

  const handleDeleteClient = async (clientId: string) => {
    if (confirm('¿Está seguro que desea eliminar este cliente? Esta acción no se puede deshacer.')) {
      try {
        const response = await fetch(`/api/clients/${clientId}`, {
          method: 'DELETE',
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Error al eliminar el cliente');
        }
        alert('Cliente eliminado exitosamente');
        fetchClients();
      } catch (err: any) {
        console.error(err);
        alert(`Error: ${err.message}`);
      }
    }
  };

  const columns = useMemo<ColumnDef<Client>[]>(
    () => [
      { accessorKey: 'nombreCompleto', header: 'Nombre Completo / Razón Social' },
      { accessorKey: 'tipoIdentificacion', header: 'Tipo ID' },
      { accessorKey: 'numeroIdentificacion', header: 'Número ID' },
      { accessorKey: 'telefono', header: 'Teléfono' },
      { accessorKey: 'correo', header: 'Correo Electrónico' },
      { accessorKey: 'direccion', header: 'Dirección' },
      {
        accessorKey: 'fechaNacimiento',
        header: 'Fecha de Nacimiento',
        cell: info => new Date(info.getValue() as string).toLocaleDateString(),
      },
      {
        id: 'actions',
        header: 'Acciones',
        cell: ({ row }) => (
          <div className={styles.actionButtons}>
            <button onClick={() => handleOpenDetailsModal(row.original)} className={styles.actionButton}>Ver Detalles</button>
            <button onClick={() => handleDeleteClient(row.original.id)} className={`${styles.actionButton} ${styles.deleteButton}`}>Eliminar</button>
          </div>
        ),
      },
    ],
    []
  );

  const table = useReactTable({
    data: clients,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      globalFilter,
    },
    onGlobalFilterChange: setGlobalFilter,
  });

  const handleExportToExcel = () => {
    const dataToExport = clients.map(client => ({
      'Nombre Completo': client.nombreCompleto,
      'Tipo ID': client.tipoIdentificacion,
      'Número ID': client.numeroIdentificacion,
      'Teléfono': client.telefono,
      'Correo': client.correo,
      'Dirección': client.direccion,
      'Fecha de Nacimiento': client.fechaNacimiento ? new Date(client.fechaNacimiento).toLocaleDateString() : '',
    }));
    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Clientes');
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF--8' });
    saveAs(data, 'Reporte_Clientes.xlsx');
  };

  if (loading) return <p>Cargando clientes...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div className={styles.clientListContainer}>
       <div className={styles.header}>
          <h1>Gestión de Clientes</h1>
        </div>
      <div className={styles.controlsContainer}>
        <input
          type="text"
          placeholder="Buscar cliente..."
          value={globalFilter ?? ''}
          onChange={e => setGlobalFilter(e.target.value)}
          className={styles.filterInput}
        />
        <div className={styles.buttonGroup}>
          <button onClick={handleExportToExcel} className={styles.exportButton}>Exportar a Excel</button>
          <button onClick={handleOpenModal} className={styles.addButton}>Agregar Cliente</button>
        </div>
      </div>
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <th key={header.id}>{flexRender(header.column.columnDef.header,header.getContext())}</th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map(row => (
              <tr key={row.id}>
                {row.getVisibleCells().map(cell => (
                  <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {isModalOpen && <AddClientModal onClose={handleCloseModal} clientToEdit={clientToEdit} />}
      {isDetailsModalOpen && selectedClient && (
        <ClientDetailsModal client={selectedClient} onClose={handleCloseDetailsModal} />
      )}
    </div>
  );
}
