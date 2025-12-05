import React, { useState, useEffect, useCallback } from 'react';
import styles from './PolicyList.module.css'; // Reusing existing styles
import { format } from 'date-fns';

interface CarteraItem {
  id: string;
  numeroPoliza: string;
  fechaExpedicion: string;
  fechaFinVigencia: string;
  valorTotalAPagar: number;
  paidAmount: number;
  currentBalance: number;
  paymentStatus: string;
  policyStatus: string; // The renewal status
  daysInCartea: number;
  clientNombreCompleto: string;
  etiquetaOficinaName: string;
  ramoName: string;
}

interface Option {
  value: string;
  label: string;
}

const CarteraModule: React.FC = () => {
  const [carteraItems, setCarteraItems] = useState<CarteraItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filter states
  const [filterOfficeEtiquetaId, setFilterOfficeEtiquetaId] = useState<string>('');
  const [filterRamoId, setFilterRamoId] = useState<string>('');
  const [filterClientName, setFilterClientName] = useState<string>('');
  const [filterPaymentStatus, setFilterPaymentStatus] = useState<string>('');

  // Dropdown options (fetched from API or static)
  const [officeEtiquetas, setOfficeEtiquetas] = useState<Option[]>([]);
  const [ramos, setRamos] = useState<Option[]>([]);

  // Payment Status display map
  const paymentStatusDisplayMap: { [key: string]: string } = {
    'pendiente': 'Pendiente',
    'parcialmente_pagado': 'Parcialmente Pagado',
    'pagado': 'Pagado',
    'vencido': 'Vencido',
  };

  const getPaymentStatusDisplay = (status: string) => {
    return paymentStatusDisplayMap[status] || status;
  };

  // Policy Status display map (renewal status)
  const policyStatusDisplayMap: { [key: string]: string } = {
    'proxima_a_vencer': 'Próxima a vencer',
    'pendiente_renovacion': 'Pendiente de Renovación',
    'renovado': 'Renovada',
    'no_renovo': 'No Renovó',
    'vencida': 'Vencida',
    'upcoming': 'Próxima a vencer (Antiguo)',
    'pending_renewal': 'Pendiente de Renovación (Antiguo)',
    'renewed': 'Renovada (Antiguo)',
    'not_renowed': 'No Renovó (Antiguo)',
    'expired': 'Vencida (Antiguo)',
  };

  const getPolicyStatusDisplay = (status: string) => {
    return policyStatusDisplayMap[status] || status;
  };


  // Fetch dropdown options
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const [etiquetasRes, ramosRes] = await Promise.all([
          fetch('/api/etiquetas'), // Assuming this returns all etiquetas
          fetch('/api/ramos'),
        ]);

        const etiquetasData: { id: string; name: string }[] = await etiquetasRes.json();
        const ramosData: { id: string; name: string }[] = await ramosRes.json();

        setOfficeEtiquetas(etiquetasData.map(e => ({ value: e.id, label: e.name })));
        setRamos(ramosData.map(r => ({ value: r.id, label: r.name })));

      } catch (err: any) {
        console.error('Error fetching dropdown options:', err);
      }
    };
    fetchOptions();
  }, []);


  const fetchCarteraItems = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const queryParams = new URLSearchParams();
      if (filterOfficeEtiquetaId) queryParams.append('officeEtiquetaId', filterOfficeEtiquetaId);
      if (filterRamoId) queryParams.append('ramoId', filterRamoId);
      if (filterClientName) queryParams.append('clientName', filterClientName);
      if (filterPaymentStatus) queryParams.append('paymentStatus', filterPaymentStatus);

      const response = await fetch(`/api/cartera?${queryParams.toString()}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data: CarteraItem[] = await response.json();
      setCarteraItems(data);
    } catch (err: any) {
      setError(`Failed to fetch cartera items: ${err.message}`);
      console.error("Error fetching cartera items:", err);
    } finally {
      setLoading(false);
    }
  }, [filterOfficeEtiquetaId, filterRamoId, filterClientName, filterPaymentStatus]);

  useEffect(() => {
    fetchCarteraItems();
  }, [fetchCarteraItems]);

  if (loading) return <p>Cargando cartera...</p>;
  if (error) return <p className={styles.errorText}>Error: {error}</p>;

  return (
    <div className={styles.tableContainer}>
      <h2>Módulo de Cartera</h2>

      {/* Filter Section */}
      <div style={{ marginBottom: '1rem', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        <select
          value={filterOfficeEtiquetaId}
          onChange={(e) => setFilterOfficeEtiquetaId(e.target.value)}
          style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
        >
          <option value="">Filtrar por Etiqueta Oficina</option>
          {officeEtiquetas.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>

        <select
          value={filterRamoId}
          onChange={(e) => setFilterRamoId(e.target.value)}
          style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
        >
          <option value="">Filtrar por Ramo</option>
          {ramos.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>

        <input
          type="text"
          placeholder="Filtrar por Nombre Cliente"
          value={filterClientName}
          onChange={(e) => setFilterClientName(e.target.value)}
          style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
        />

        <select
          value={filterPaymentStatus}
          onChange={(e) => setFilterPaymentStatus(e.target.value)}
          style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
        >
          <option value="">Filtrar por Estado Pago</option>
          {Object.entries(paymentStatusDisplayMap).map(([key, value]) => (
            <option key={key} value={key}>{value}</option>
          ))}
        </select>
      </div>

      {carteraItems.length === 0 ? (
        <p>No hay items en cartera que coincidan con los criterios de búsqueda.</p>
      ) : (
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Etiqueta Oficina</th>
              <th>Ramo</th>
              <th>Cliente</th>
              <th>Póliza #</th>
              <th>Valor Total a Pagar</th>
              <th>Pagado</th>
              <th>Saldo Actual</th>
              <th>Estado Pago</th>
              <th>Días en Cartera</th>
              <th>Estado Póliza</th>
            </tr>
          </thead>
          <tbody>
            {carteraItems.map((item) => (
              <tr key={item.id}>
                <td>{item.etiquetaOficinaName}</td>
                <td>{item.ramoName}</td>
                <td>{item.clientNombreCompleto}</td>
                <td>{item.numeroPoliza}</td>
                <td>{item.valorTotalAPagar.toLocaleString('es-CO', { style: 'currency', currency: 'COP' })}</td>
                <td>{item.paidAmount.toLocaleString('es-CO', { style: 'currency', currency: 'COP' })}</td>
                <td>{item.currentBalance.toLocaleString('es-CO', { style: 'currency', currency: 'COP' })}</td>
                <td>{getPaymentStatusDisplay(item.paymentStatus)}</td>
                <td>{item.daysInCartea}</td>
                <td>{getPolicyStatusDisplay(item.policyStatus)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default CarteraModule;
