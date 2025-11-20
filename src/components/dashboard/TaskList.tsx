'use client';

import { useEffect, useState, useMemo } from 'react';
import { useReactTable, getCoreRowModel, flexRender, ColumnDef, getFilteredRowModel } from '@tanstack/react-table';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import styles from './TaskList.module.css';
import AddTaskModal from './AddTaskModal';
import TaskDetailsModal from './TaskDetailsModal';

interface TaskData {
  id: string;
  type: 'general' | 'policy_expiry' | 'birthday';
  description: string;
  dueDate: string;
  clientName?: string; // Optional for general tasks
  policyId?: string; // Optional for policy expiry tasks
  status: 'pending' | 'completed';
}

const mockTasks: TaskData[] = [
  { id: 'T001', type: 'general', description: 'Revisar documentos de cliente nuevo', dueDate: '2025-10-01', status: 'pending' },
  { id: 'T002', type: 'policy_expiry', description: 'Póliza de Vehículo #ABC12345 de Juan Perez vence pronto', dueDate: '2025-09-30', clientName: 'Juan Perez', policyId: 'ABC12345', status: 'pending' },
  { id: 'T003', type: 'birthday', description: 'Cumpleaños de Maria Garcia', dueDate: '2025-09-28', clientName: 'Maria Garcia', status: 'pending' },
  { id: 'T004', type: 'general', description: 'Llamar a Pedro Lopez para seguimiento', dueDate: '2025-10-05', status: 'completed' },
  { id: 'T005', type: 'policy_expiry', description: 'Póliza de Salud #DEF67890 de Pedro Lopez vence pronto', dueDate: '2025-10-15', clientName: 'Pedro Lopez', policyId: 'DEF67890', status: 'pending' },
];

export default function TaskList() {
  const [tasks, setTasks] = useState<TaskData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<string>('all');
  const [globalFilter, setGlobalFilter] = useState<string>('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false); // State for details modal
  const [selectedTask, setSelectedTask] = useState<TaskData | null>(null); // State for selected task

  useEffect(() => {
    // Simulate API call
    setTasks(mockTasks);
    setLoading(false);
  }, []);

  const handleAddTask = (newTaskData: Omit<TaskData, 'id' | 'status'>) => {
    const newId = 'T' + (tasks.length + 1).toString().padStart(3, '0');
    setTasks(prevTasks => [...prevTasks, { ...newTaskData, id: newId, status: 'pending' }]);
  };

  const handleViewDetails = (task: TaskData) => {
    setSelectedTask(task);
    setIsDetailsModalOpen(true);
  };

  const columns = useMemo<ColumnDef<TaskData>[]>(
    () => [
      {
        accessorKey: 'id',
        header: 'ID',
        cell: info => info.getValue(),
      },
      {
        accessorKey: 'type',
        header: 'Tipo',
        cell: info => {
            const type = info.getValue() as TaskData['type'];
            switch (type) {
                case 'general': return 'General';
                case 'policy_expiry': return 'Vencimiento de Póliza';
                case 'birthday': return 'Cumpleaños';
                default: return type;
            }
        },
      },
      {
        accessorKey: 'description',
        header: 'Descripción',
        cell: info => info.getValue(),
      },
      {
        accessorKey: 'dueDate',
        header: 'Fecha Límite',
        cell: info => info.getValue(),
      },
      {
        accessorKey: 'clientName',
        header: 'Cliente',
        cell: info => info.getValue() || 'N/A',
      },
      {
        accessorKey: 'status',
        header: 'Estado',
        cell: info => (
          <span className={`${styles.statusBadge} ${info.getValue() === 'pending' ? styles.statusPending : styles.statusCompleted}`}>
            {info.getValue() === 'pending' ? 'Pendiente' : 'Completada'}
          </span>
        ),
      },
      {
        id: 'actions',
        header: 'Acciones',
        cell: ({ row }) => (
          <button onClick={() => handleViewDetails(row.original)} className={styles.actionButton}>Ver Detalles</button>
        ),
      },
    ],
    [tasks] // Re-memoize if tasks change to update actions
  );

  const table = useReactTable({
    data: tasks,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      globalFilter: filterType === 'all' ? globalFilter : `${filterType} ${globalFilter}`,
    },
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: (row, columnId, filterValue) => {
      if (!filterValue) return true;
      const value = row.getValue(columnId) as string;
      return value?.toLowerCase().includes(filterValue.toLowerCase());
    },
  });

  const handleExportToExcel = () => {
    const dataToExport = tasks.filter(task => {
      if (filterType === 'all') return true;
      return task.type === filterType;
    }).map(task => ({
      ID: task.id,
      Tipo: task.type,
      Descripción: task.description,
      'Fecha Límite': task.dueDate,
      Cliente: task.clientName || 'N/A',
      Estado: task.status,
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Tareas');
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' });
    saveAs(data, 'tareas.xlsx');
  };

  if (loading) {
    return <p className={styles.loadingText}>Cargando tareas...</p>;
  }

  if (error) {
    return <p className={styles.errorText}>Error: {error}</p>;
  }

  return (
    <div className={styles.taskListContainer}>
      <div className={styles.controlsContainer}>
        <div className={styles.filterGroup}>
          <label htmlFor="task-type-filter" className={styles.filterLabel}>Filtrar por Tipo de Tarea:</label>
          <select
            id="task-type-filter"
            className={styles.filterSelect}
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="all">Todos</option>
            <option value="general">General</option>
            <option value="policy_expiry">Vencimiento de Póliza</option>
            <option value="birthday">Cumpleaños</option>
          </select>
        </div>
        <input
          type="text"
          placeholder="Buscar tarea..."
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
          Agregar Tarea
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

      <AddTaskModal 
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddTask={handleAddTask}
      />

      <TaskDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        task={selectedTask}
      />
    </div>
  );
}
