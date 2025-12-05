'use client';

import { useEffect, useState, useMemo } from 'react';
import { useReactTable, getCoreRowModel, flexRender, ColumnDef } from '@tanstack/react-table';
import styles from './ClientPoliciesList.module.css';

interface Policy {
  id: string;
  numeroPoliza: string;
  ramo: string;
  aseguradora: string;
  fechaFinVigencia: string;
  valorTotalAPagar: number;
  financiado: boolean;
}

interface ClientPoliciesListProps {
  clientId: string;
}

export default function ClientPoliciesList({ clientId }: ClientPoliciesListProps) {
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!clientId) return;

    const fetchPolicies = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/policies?clientId=${clientId}`);
        if (!res.ok) {
          throw new Error('Error al cargar las pólizas del cliente');
        }
        const data = await res.json();
        setPolicies(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPolicies();
  }, [clientId]);

  const columns = useMemo<ColumnDef<Policy>[]>(
    () => [
      { accessorKey: 'numeroPoliza', header: 'N° Póliza' },
      { accessorKey: 'ramo', header: 'Ramo' },
      { accessorKey: 'aseguradora', header: 'Aseguradora' },
      {
        accessorKey: 'valorTotalAPagar',
        header: 'Valor Total',
        cell: info => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(info.getValue() as number),
      },
      {
        accessorKey: 'fechaFinVigencia',
        header: 'Fin Vigencia',
        cell: info => new Date(info.getValue() as string).toLocaleDateString(),
      },
      {
        accessorKey: 'financiado',
        header: 'Financiado',
        cell: info => (
          <span className={`${styles.financiadoBadge} ${info.getValue() ? styles.financiadoYes : styles.financiadoNo}`}>
            {info.getValue() ? 'Sí' : 'No'}
          </span>
        ),
      },
    ],
    []
  );

  const table = useReactTable({
    data: policies,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  if (loading) {
    return <p className={styles.loadingText}>Cargando pólizas...</p>;
  }

  if (error) {
    return <p className={styles.errorText}>{error}</p>;
  }

  if (policies.length === 0) {
    return <p className={styles.noPoliciesText}>Este cliente no tiene pólizas asociadas.</p>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <th key={header.id}>{flexRender(header.column.columnDef.header, header.getContext())}</th>
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
    </div>
  );
}
