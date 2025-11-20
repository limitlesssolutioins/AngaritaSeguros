'use client';

import { useEffect, useState, useMemo } from 'react';
import { FaCheckCircle, FaHourglassHalf, FaTimesCircle, FaExclamationCircle } from 'react-icons/fa';
import { useReactTable, getCoreRowModel, flexRender, ColumnDef, getFilteredRowModel } from '@tanstack/react-table';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import styles from './RequestsList.module.css'; // Import CSS Module
import RequestDetailsModal from './RequestDetailsModal'; // Import the modal

interface RequestData {
  id: string;
  type: 'vehiculo' | 'salud' | 'vida' | 'soat' | 'mascotas' | 'financiacion';
  status: 'nueva' | 'pendiente' | 'completada' | 'rechazada';
  date: string;
  clientName: string;
  details: string;
}

const statusColors = {
  nueva: styles.statusNueva,
  pendiente: styles.statusPendiente,
  completada: styles.statusCompletada,
  rechazada: styles.statusRechazada,
};

const statusIcons = {
  nueva: <FaExclamationCircle className={styles.statusIcon} />,
  pendiente: <FaHourglassHalf className={styles.statusIcon} />,
  completada: <FaCheckCircle className={styles.statusIcon} />,
  rechazada: <FaTimesCircle className={styles.statusIcon} />,
};

export default function RequestsList() {
  const [requests, setRequests] = useState<RequestData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<string>('all');
  const [selectedRequest, setSelectedRequest] = useState<RequestData | null>(null);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const res = await fetch('/api/requests');
        if (!res.ok) {
          throw new Error('Error al cargar las solicitudes.');
        }
        const data = await res.json();
        setRequests(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchRequests();
  }, []);

  const handleViewDetails = (request: RequestData) => {
    setSelectedRequest(request);
  };

  const columns = useMemo<ColumnDef<RequestData>[]>(
    () => [
      {
        accessorKey: 'id',
        header: 'ID',
        cell: info => info.getValue(),
      },
      {
        accessorKey: 'type',
        header: 'Tipo',
        cell: info => info.getValue(),
      },
      {
        accessorKey: 'clientName',
        header: 'Cliente',
        cell: info => info.getValue(),
      },
      {
        accessorKey: 'details',
        header: 'Detalles',
        cell: info => info.getValue(),
      },
      {
        accessorKey: 'date',
        header: 'Fecha',
        cell: info => info.getValue(),
      },
      {
        accessorKey: 'status',
        header: 'Estado',
        cell: info => (
          <span className={`${styles.statusBadge} ${statusColors[info.getValue() as RequestData['status']]}`}>
            {statusIcons[info.getValue() as RequestData['status']]}<span className={styles.statusText}>{info.getValue() as string}</span>
          </span>
        ),
      },
      {
        id: 'actions',
        header: 'Acciones',
        cell: ({ row }) => (
          <button onClick={() => handleViewDetails(row.original)} className={styles.actionButton}>Ver</button>
        ),
      },
    ],
    []
  );

  const table = useReactTable({
    data: requests,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      globalFilter: filterType === 'all' ? '' : filterType,
    },
    onGlobalFilterChange: (updater) => {
      // This is handled by the filterType state directly
    },
    globalFilterFn: (row, columnId, filterValue) => {
      if (filterValue === '') return true;
      const value = row.getValue(columnId) as string;
      return value.toLowerCase().includes(filterValue.toLowerCase());
    },
  });

  const handleExportToExcel = () => {
    const dataToExport = requests.filter(request => {
      if (filterType === 'all') return true;
      return request.type === filterType;
    }).map(request => ({
      ID: request.id,
      Tipo: request.type,
      Cliente: request.clientName,
      Detalles: request.details,
      Fecha: request.date,
      Estado: request.status,
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Solicitudes');
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' });
    saveAs(data, 'solicitudes.xlsx');
  };

  if (loading) {
    return <p className={styles.loadingText}>Cargando solicitudes...</p>;
  }

  if (error) {
    return <p className={styles.errorText}>Error: {error}</p>;
  }

  return (
    <>
      <div className={styles.requestsListContainer}>
        <div className={styles.controlsContainer}>
          <div className={styles.filterGroup}>
            <label htmlFor="request-type-filter" className={styles.filterLabel}>Filtrar por Tipo de Solicitud:</label>
            <select
              id="request-type-filter"
              className={styles.filterSelect}
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="all">Todos</option>
              <option value="vehiculo">Vehículo</option>
              <option value="salud">Salud</option>
              <option value="vida">Vida</option>
              <option value="soat">SOAT</option>
              <option value="mascotas">Mascotas</option>
              <option value="financiacion">Financiación</option>
            </select>
          </div>
          <button
            onClick={handleExportToExcel}
            className={styles.exportButton}
          >
            Exportar a Excel
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
      </div>
      <RequestDetailsModal request={selectedRequest} onClose={() => setSelectedRequest(null)} />
    </>
  );
}
