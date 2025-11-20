import { useEffect, useState, useMemo } from 'react';
import { useReactTable, getCoreRowModel, flexRender, ColumnDef, getFilteredRowModel } from '@tanstack/react-table';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import styles from './ClientList.module.css';
import AddClientModal from './AddClientModal';
import ClientDetailsModal from './ClientDetailsModal';

interface ClientData {
  id: string;
  name: string;
  email: string;
  phone: string;
  document: string;
  address: string;
  clientType: string;
  userId: string;
}

interface UserData {
  id: string;
  name: string;
}

const mockClients: ClientData[] = [
  { id: '1', name: 'Juan Perez', email: 'juan.perez@example.com', phone: '123-456-7890', document: '1001', address: 'Calle 1 # 2-3', clientType: 'natural', userId: 'U002' },
  { id: '2', name: 'Maria Garcia', email: 'maria.garcia@example.com', phone: '098-765-4321', document: '1002', address: 'Carrera 4 # 5-6', clientType: 'natural', userId: 'U002' },
  { id: '3', name: 'Pedro Lopez', email: 'pedro.lopez@example.com', phone: '111-222-3333', document: '1003', address: 'Avenida 7 # 8-9', clientType: 'juridico', userId: 'U001' },
];

export default function ClientList() {
  const [clients, setClients] = useState<ClientData[]>([]);
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [globalFilter, setGlobalFilter] = useState<string>('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false); // State for details modal
  const [selectedClient, setSelectedClient] = useState<ClientData | null>(null); // State for selected client

  const usersMap = useMemo(() => {
    return users.reduce((acc, user) => {
      acc[user.id] = user.name;
      return acc;
    }, {} as Record<string, string>);
  }, [users]);

  useEffect(() => {
    // Simulate API call
    Promise.all([
      Promise.resolve(mockClients),
      fetch('/api/users').then(res => res.json()),
    ]).then(([clientData, userData]) => {
      setClients(clientData);
      setUsers(userData);
      setLoading(false);
    }).catch(err => {
      setError('Error al cargar los datos');
      setLoading(false);
    });
  }, []);

  const handleAddClient = (newClient: Omit<ClientData, 'id'>) => {
    // In a real app, you'd send this to an API and get a real ID
    const newId = (clients.length + 1).toString(); 
    setClients(prevClients => [...prevClients, { ...newClient, id: newId }]);
  };

  const handleViewDetails = (client: ClientData) => {
    setSelectedClient(client);
    setIsDetailsModalOpen(true);
  };

  const columns = useMemo<ColumnDef<ClientData>[]>(
    () => [
      {
        accessorKey: 'id',
        header: 'ID',
        cell: info => info.getValue(),
      },
      {
        accessorKey: 'name',
        header: 'Nombre',
        cell: info => info.getValue(),
      },
      {
        accessorKey: 'email',
        header: 'Email',
        cell: info => info.getValue(),
      },
      {
        accessorKey: 'phone',
        header: 'Teléfono',
        cell: info => info.getValue(),
      },
      {
        accessorKey: 'document',
        header: 'Documento',
        cell: info => info.getValue(),
      },
      {
        accessorKey: 'address',
        header: 'Dirección',
        cell: info => info.getValue(),
      },
      {
        accessorKey: 'clientType',
        header: 'Tipo Cliente',
        cell: info => info.getValue(),
      },
      {
        accessorKey: 'userId',
        header: 'Usuario',
        cell: ({ row }) => usersMap[row.original.userId] || row.original.userId,
      },
      {
        id: 'actions',
        header: 'Acciones',
        cell: ({ row }) => (
          <button onClick={() => handleViewDetails(row.original)} className={styles.actionButton}>Ver Detalles</button>
        ),
      },
    ],
    [clients] // Re-memoize if clients change to update actions
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
      ID: client.id,
      Nombre: client.name,
      Email: client.email,
      Teléfono: client.phone,
      Documento: client.document,
      Dirección: client.address,
      'Tipo Cliente': client.clientType,
      Usuario: usersMap[client.userId] || client.userId,
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Clientes');
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' });
    saveAs(data, 'clientes.xlsx');
  };

  if (loading) {
    return <p className={styles.loadingText}>Cargando clientes...</p>;
  }

  if (error) {
    return <p className={styles.errorText}>Error: {error}</p>;
  }

  return (
    <div className={styles.clientListContainer}>
      <div className={styles.controlsContainer}>
        <input
          type="text"
          placeholder="Buscar cliente..."
          value={globalFilter ?? ''}
          onChange={e => setGlobalFilter(e.target.value)}
          className={styles.filterInput}
        />
        <button
          onClick={handleExportToExcel}
          className={styles.exportButton}
        >
          Exportar a Excel
        </button>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className={styles.addButton}
        >
          Agregar Cliente
        </button>
      </div>
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id} className={styles.tableHeaderRow}>
                {headerGroup.headers.map(header => (
                  <th key={header.id} className={styles.tableHeader}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
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

      <AddClientModal 
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddClient={handleAddClient}
      />

      <ClientDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        client={selectedClient}
        usersMap={usersMap}
      />
    </div>
  );
}
