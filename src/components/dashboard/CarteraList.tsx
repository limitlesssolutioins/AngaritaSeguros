'use client';

import { useEffect, useState, useMemo } from 'react';
import { useReactTable, getCoreRowModel, flexRender, ColumnDef } from '@tanstack/react-table';
import styles from './RequestsList.module.css'; // Re-using styles for consistency

interface CollectionData {
  id: string;
  policyId: string;
  clientName: string;
  product: string;
  amount: number;
  dueDate: string;
  status: 'pendiente' | 'pagada' | 'cancelada';
}

const mockCollections: CollectionData[] = [
  { id: 'C001', policyId: 'P-V001', clientName: 'Juan Perez', product: 'Seguro de Vehículo', amount: 1200000, dueDate: '2025-10-15', status: 'pendiente' },
  { id: 'C002', policyId: 'P-S001', clientName: 'Maria Garcia', product: 'Póliza de Salud', amount: 850000, dueDate: '2025-10-20', status: 'pendiente' },
  { id: 'C003', policyId: 'P-V002', clientName: 'Pedro Lopez', product: 'SOAT', amount: 650000, dueDate: '2025-09-30', status: 'pagada' },
  { id: 'C004', policyId: 'P-M001', clientName: 'Juan Perez', product: 'Seguro de Mascotas', amount: 300000, dueDate: '2025-11-01', status: 'cancelada' },
];

const statusColors = {
  pendiente: styles.statusPendiente,
  pagada: styles.statusCompletada,
  cancelada: styles.statusRechazada,
};

export default function CarteraList() {
  const [collections, setCollections] = useState<CollectionData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API call
    setCollections(mockCollections);
    setLoading(false);
  }, []);

  const handleStatusChange = (collectionId: string, newStatus: CollectionData['status']) => {
    setCollections(prevCollections =>
      prevCollections.map(c => (c.id === collectionId ? { ...c, status: newStatus } : c))
    );
  };

  const columns = useMemo<ColumnDef<CollectionData>[]>(
    () => [
      { accessorKey: 'policyId', header: 'ID Póliza' },
      { accessorKey: 'clientName', header: 'Cliente' },
      { accessorKey: 'product', header: 'Producto' },
      { 
        accessorKey: 'amount', 
        header: 'Valor', 
        cell: info => `$${(info.getValue() as number).toLocaleString('es-CO')}` 
      },
      { accessorKey: 'dueDate', header: 'Fecha Vencimiento' },
      {
        accessorKey: 'status',
        header: 'Estado',
        cell: info => (
          <span className={`${styles.statusBadge} ${statusColors[info.getValue() as CollectionData['status']]}`}>
            {info.getValue() as string}
          </span>
        ),
      },
      {
        id: 'actions',
        header: 'Acciones',
        cell: ({ row }) => {
          const collection = row.original;
          return (
            <div className={styles.actionGroup}>
              {collection.status === 'pendiente' && (
                <>
                  <button onClick={() => handleStatusChange(collection.id, 'pagada')} className={`${styles.actionButton} ${styles.actionButtonSuccess}`}>Marcar Pagada</button>
                  <button onClick={() => handleStatusChange(collection.id, 'cancelada')} className={`${styles.actionButton} ${styles.actionButtonDanger}`}>Cancelar</button>
                </>
              )}
              {collection.status !== 'pendiente' && (
                <button onClick={() => handleStatusChange(collection.id, 'pendiente')} className={`${styles.actionButton} ${styles.actionButtonSecondary}`}>Revertir a Pendiente</button>
              )}
            </div>
          );
        },
      },
    ],
    [handleStatusChange]
  );

  const table = useReactTable({
    data: collections,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  if (loading) {
    return <p className={styles.loadingText}>Cargando cartera...</p>;
  }

  return (
    <div className={styles.requestsListContainer}> {/* Re-using container style */}
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
    </div>
  );
}
