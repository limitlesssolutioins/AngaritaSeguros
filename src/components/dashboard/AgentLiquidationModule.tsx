import React, { useState, useEffect, useCallback } from 'react';
import styles from './AgentLiquidationModule.module.css';
import { format } from 'date-fns';

interface Agent {
  id: string;
  name: string; // Assuming a 'name' field for display
}

interface Liquidation {
  id: string;
  agentId: string;
  agentName?: string; // Populated by JOIN in API
  startDate: string;
  endDate: string;
  totalCommissions: number;
  totalDeductions: number;
  netPayment: number;
  status: string;
  liquidationPdfPath?: string;
  paidPdfPath?: string;
  createdAt: string;
}

interface AgentLiquidationModuleProps {
  // Can accept initial filters if needed
}

const AgentLiquidationModule: React.FC<AgentLiquidationModuleProps> = () => {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [deductions, setDeductions] = useState<number>(0);
  const [liquidations, setLiquidations] = useState<Liquidation[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  // Fetch agents
  useEffect(() => {
    const fetchAgents = async () => {
      try {
        const response = await fetch('/api/users'); // Assuming /api/users returns agent list
        if (!response.ok) {
          throw new Error('Error al cargar agentes');
        }
        const data: Agent[] = await response.json();
        setAgents(data);
      } catch (err: any) {
        console.error('Error fetching agents:', err);
        setError('No se pudieron cargar los agentes.');
      }
    };
    fetchAgents();
  }, []);

  const fetchLiquidations = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const queryParams = new URLSearchParams();
      if (selectedAgent) queryParams.append('agentId', selectedAgent);
      if (startDate) queryParams.append('startDate', startDate);
      if (endDate) queryParams.append('endDate', endDate);

      const response = await fetch(`/api/gestion-empresarial/liquidations?${queryParams.toString()}`);
      if (!response.ok) {
        throw new Error('Error al cargar liquidaciones');
      }
      const data: Liquidation[] = await response.json();
      setLiquidations(data);
    } catch (err: any) {
      console.error('Error fetching liquidations:', err);
      setError('No se pudieron cargar las liquidaciones.');
    } finally {
      setLoading(false);
    }
  }, [selectedAgent, startDate, endDate]);

  useEffect(() => {
    fetchLiquidations();
  }, [fetchLiquidations]);

  const handleGenerateLiquidation = async () => {
    setError(null);
    if (!selectedAgent || !startDate || !endDate) {
      setError('Por favor, selecciona un agente, fecha de inicio y fecha de fin.');
      return;
    }
    setIsGenerating(true);

    try {
      const response = await fetch('/api/gestion-empresarial/liquidations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentId: selectedAgent,
          startDate,
          endDate,
          deductions: [{ description: 'General Deduction', amount: deductions }], // Simple deduction for now
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al generar la liquidación');
      }

      alert('Liquidación generada exitosamente!');
      fetchLiquidations(); // Refresh list
    } catch (err: any) {
      console.error('Error generating liquidation:', err);
      setError(`Error al generar la liquidación: ${err.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleMarkAsPaid = async (liquidationId: string) => {
    if (!confirm('¿Estás seguro de que quieres marcar esta liquidación como pagada?')) return;
    try {
      const response = await fetch(`/api/gestion-empresarial/liquidations/${liquidationId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'paid' }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al marcar como pagada');
      }
      alert('Liquidación marcada como pagada.');
      fetchLiquidations(); // Refresh list
    } catch (err: any) {
      console.error('Error marking liquidation as paid:', err);
      setError(`Error: ${err.message}`);
    }
  };

  const handleViewPdf = (liquidation: Liquidation) => {
    // TODO: Implement PDF viewing logic
    if (liquidation.liquidationPdfPath) {
      window.open(liquidation.liquidationPdfPath, '_blank');
    } else {
      alert('PDF de pre-liquidación no disponible. Generar primero.');
    }
  };

  const handleDownloadPaidPdf = (liquidation: Liquidation) => {
    // TODO: Implement Paid PDF download logic
    if (liquidation.paidPdfPath) {
      window.open(liquidation.paidPdfPath, '_blank');
    } else {
      alert('PDF de pago no disponible. Marcar como pagada y generar.');
    }
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.header}>Gestión de Liquidaciones de Agentes</h2>

      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
        <div className={styles.formGroup} style={{ flex: 1 }}>
          <label htmlFor="agentSelect">Agente:</label>
          <select
            id="agentSelect"
            value={selectedAgent}
            onChange={(e) => setSelectedAgent(e.target.value)}
          >
            <option value="">Selecciona un Agente</option>
            {agents.map((agent) => (
              <option key={agent.id} value={agent.id}>
                {agent.name}
              </option>
            ))}
          </select>
        </div>
        <div className={styles.formGroup} style={{ flex: 1 }}>
          <label htmlFor="startDate">Fecha Inicio:</label>
          <input
            type="date"
            id="startDate"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>
        <div className={styles.formGroup} style={{ flex: 1 }}>
          <label htmlFor="endDate">Fecha Fin:</label>
          <input
            type="date"
            id="endDate"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>
        <div className={styles.formGroup} style={{ flex: 1 }}>
          <label htmlFor="deductions">Deducciones (Total):</label>
          <input
            type="number"
            id="deductions"
            value={deductions}
            onChange={(e) => setDeductions(parseFloat(e.target.value))}
            min="0"
            step="0.01"
          />
        </div>
        <div className={styles.formActions} style={{ alignSelf: 'flex-end', flex: '0 0 auto' }}>
          <button
            className={styles.generateButton}
            onClick={handleGenerateLiquidation}
            disabled={isGenerating || !selectedAgent || !startDate || !endDate}
          >
            {isGenerating ? 'Generando...' : 'Generar Liquidación'}
          </button>
        </div>
      </div>

      {error && <p className={styles.errorText}>Error: {error}</p>}
      {loading && <p className={styles.loadingText}>Cargando liquidaciones...</p>}

      {!loading && liquidations.length === 0 && (
        <p>No hay liquidaciones disponibles para los criterios seleccionados.</p>
      )}

      {!loading && liquidations.length > 0 && (
        <div className={styles.liquidationsTableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Agente</th>
                <th>Periodo</th>
                <th>Comisiones Totales</th>
                <th>Deducciones Totales</th>
                <th>Pago Neto</th>
                <th>Estado</th>
                <th>Generada</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {liquidations.map((liq) => (
                <tr key={liq.id}>
                  <td>{liq.agentName || liq.agentId}</td>
                  <td>{format(new Date(liq.startDate), 'dd/MM/yyyy')} - {format(new Date(liq.endDate), 'dd/MM/yyyy')}</td>
                  <td>{liq.totalCommissions.toLocaleString('es-CO')}</td>
                  <td>{liq.totalDeductions.toLocaleString('es-CO')}</td>
                  <td>{liq.netPayment.toLocaleString('es-CO')}</td>
                  <td>{liq.status}</td>
                  <td>{format(new Date(liq.createdAt), 'dd/MM/yyyy HH:mm')}</td>
                  <td>
                    <button
                      className={styles.actionButton}
                      onClick={() => handleViewPdf(liq)}
                    >
                      Ver PDF (Pre)
                    </button>
                    {liq.status !== 'paid' && (
                      <button
                        className={`${styles.actionButton} ${styles.paidButton}`}
                        onClick={() => handleMarkAsPaid(liq.id)}
                        disabled={liq.status === 'paid'}
                      >
                        Marcar como Pagada
                      </button>
                    )}
                    {liq.paidPdfPath && (
                      <button
                        className={`${styles.actionButton} ${styles.viewPdfButton}`}
                        onClick={() => handleDownloadPaidPdf(liq)}
                      >
                        Descargar PDF (Pagado)
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AgentLiquidationModule;
