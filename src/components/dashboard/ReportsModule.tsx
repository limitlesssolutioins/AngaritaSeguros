'use client';

import { useState, useEffect } from 'react';
import styles from './ReportsModule.module.css';
import { FaChartPie, FaChartBar } from 'react-icons/fa';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';

// --- Mock Data for Reports ---
const policiesByTypeData = [
  { name: 'Vehículo', count: 120 },
  { name: 'Salud', count: 80 },
  { name: 'Vida', count: 50 },
  { name: 'SOAT', count: 150 },
  { name: 'Mascotas', count: 30 },
  { name: 'Financiación', count: 40 },
];

const collectionsStatusData = [
  { name: 'Pendiente', value: 75 },
  { name: 'Pagada', value: 200 },
  { name: 'Cancelada', value: 25 },
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

// --- Report Components ---
const PoliciesByTypeChart = () => (
  <div className={styles.reportContent}>
    <h3><FaChartBar className={styles.reportIcon} /> Pólizas por Tipo</h3>
    <ResponsiveContainer width="100%" height={300}>
      <BarChart
        data={policiesByTypeData}
        margin={{
          top: 20, right: 30, left: 20, bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="count" fill="#8884d8" name="Cantidad de Pólizas" />
      </BarChart>
    </ResponsiveContainer>
  </div>
);

const CollectionsStatusChart = () => (
  <div className={styles.reportContent}>
    <h3><FaChartPie className={styles.reportIcon} /> Estado de Cobros</h3>
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={collectionsStatusData}
          cx="50%"
          cy="50%"
          labelLine={false}
          outerRadius={100}
          fill="#8884d8"
          dataKey="value"
          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
        >
          {collectionsStatusData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  </div>
);

export default function ReportsModule() {
  const [selectedReport, setSelectedReport] = useState<string>('policiesByType');
  const [displayedReport, setDisplayedReport] = useState<string | null>(null);

  useEffect(() => {
    // Automatically generate the first report on mount
    setDisplayedReport(selectedReport);
  }, []);

  const handleGenerateReport = () => {
    setDisplayedReport(selectedReport);
  };

  const renderReport = () => {
    if (!displayedReport) {
      return <p className={styles.noReportSelected}>Seleccione un informe y haga clic en 'Generar Informe'.</p>;
    }

    switch (displayedReport) {
      case 'policiesByType':
        return <PoliciesByTypeChart />;
      case 'collectionsStatus':
        return <CollectionsStatusChart />;
      default:
        return <p className={styles.noReportSelected}>Informe no reconocido.</p>;
    }
  };

  return (
    <div className={styles.reportsModuleContainer}>
      <div className={styles.reportSelector}>
        <label htmlFor="report-type-selector" className={styles.selectorLabel}>Seleccionar Informe:</label>
        <select
          id="report-type-selector"
          className={styles.selectorSelect}
          value={selectedReport}
          onChange={(e) => setSelectedReport(e.target.value)}
        >
          <option value="policiesByType">Pólizas por Tipo</option>
          <option value="collectionsStatus">Estado de Cobros</option>
        </select>
        <button onClick={handleGenerateReport} className={styles.generateReportButton}>
          Generar Informe
        </button>
      </div>
      <div className={styles.reportDisplayArea}>
        {renderReport()}
      </div>
    </div>
  );
}
