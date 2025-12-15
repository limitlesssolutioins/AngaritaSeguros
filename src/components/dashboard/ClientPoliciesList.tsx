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
  files?: string[];
  type?: string; // Optional type for debugging or styling
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
        const [generalRes, cumplimientoRes] = await Promise.all([
            fetch(`/api/policies?clientId=${clientId}`),
            fetch(`/api/cumplimiento?clientId=${clientId}`)
        ]);

        let combinedPolicies: Policy[] = [];

        if (generalRes.ok) {
            const generalData = await generalRes.json();
            const mappedGeneral = generalData.map((p: any) => ({
                id: p.id,
                numeroPoliza: p.numeroPoliza,
                ramo: p.ramo,
                aseguradora: p.aseguradora,
                fechaFinVigencia: p.fechaFinVigencia,
                valorTotalAPagar: p.valorTotalAPagar,
                financiado: p.financiado,
                files: p.files,
                type: 'General'
            }));
            combinedPolicies = [...combinedPolicies, ...mappedGeneral];
        }

        if (cumplimientoRes.ok) {
            const cumplimientoData = await cumplimientoRes.json();
            const mappedCumplimiento = cumplimientoData.map((p: any) => ({
                id: p.id,
                numeroPoliza: p.numeroPoliza,
                ramo: p.tipoPoliza || 'Cumplimiento',
                aseguradora: p.aseguradora,
                fechaFinVigencia: p.fechaTerminacionVigencia,
                valorTotalAPagar: p.valorTotalAPagar,
                financiado: false, // Cumplimiento usually doesn't have this field exposed same way
                files: p.files,
                type: 'Cumplimiento'
            }));
            combinedPolicies = [...combinedPolicies, ...mappedCumplimiento];
        }

        setPolicies(combinedPolicies);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPolicies();
  }, [clientId]);

  const handleDelete = async (policyId: string, type: string) => {
    if (!confirm('¿Está seguro de eliminar esta póliza?')) return;

    try {
      const endpoint = type === 'General' ? `/api/policies/${policyId}` : `/api/cumplimiento/${policyId}`;
      const res = await fetch(endpoint, { method: 'DELETE' });
      
      if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.message || 'Error al eliminar la póliza');
      }
      
      setPolicies(prev => prev.filter(p => p.id !== policyId));
      alert('Póliza eliminada exitosamente');
    } catch (err: any) {
      alert(err.message);
    }
  };

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
      {
        accessorKey: 'files',
        header: 'Archivos',
        cell: info => {
          const files = info.getValue() as string[];
          if (!files || files.length === 0) return 'Sin archivos';
          return (
            <div className={styles.fileLinks}>
              {files.map((fileUrl, index) => (
                <a 
                  key={index} 
                  href={`/api/files/view?url=${encodeURIComponent(fileUrl)}`}
                  target="_blank" 
                  rel="noopener noreferrer"
                  className={styles.fileLink}
                >
                  Ver PDF {index + 1}
                </a>
              ))}
            </div>
          );
        },
      },
      {
        id: 'actions',
        header: 'Acciones',
        cell: info => (
          <button 
            className={styles.deleteButton}
            onClick={() => handleDelete(info.row.original.id, info.row.original.type || 'General')}
          >
            Eliminar
          </button>
        )
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
