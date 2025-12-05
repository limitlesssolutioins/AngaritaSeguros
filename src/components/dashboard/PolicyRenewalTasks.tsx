import React, { useState, useEffect, useCallback } from 'react';
import styles from './PolicyList.module.css'; // Reusing existing styles
import PolicyDetailsModal from './PolicyDetailsModal'; // Import the details modal
import SendReminderModal from './SendReminderModal'; // Import the new reminder modal
import { format } from 'date-fns';

// Define the Policy type - should ideally come from a central types file
interface Policy {
  id: string;
  numeroPoliza: string;
  fechaExpedicion: string;
  fechaInicio: string;
  fechaFinVigencia: string;
  placa?: string;
  valorPrimaNeta: number;
  valorTotalAPagar: number;
  financiado: boolean;
  financiera?: string;
  files: string[];
  createdAt: string;
  updatedAt: string;
  aseguradora: string;
  etiquetaCliente: string;
  etiquetaOficina: string;
  ramo: string;
  clientId: string;
  clientNombreCompleto: string;
  clientTipoIdentificacion: string;
  clientNumeroIdentificacion: string;
  status: string; // New field
  responsibleAgentId?: string; // New field
  lastReminderSent?: string; // New field
  clientEmail?: string; // Assuming these are fetched from the API
  clientPhone?: string; // Assuming these are fetched from the API
}

interface PolicyRenewalTasksProps {
  // Props for filtering if coming from a parent component (e.g., specific agent's tasks)
  initialAgentId?: string;
}

const PolicyRenewalTasks: React.FC<PolicyRenewalTasksProps> = ({ initialAgentId }) => {
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState<boolean>(false);
  const [selectedPolicy, setSelectedPolicy] = useState<Policy | null>(null);
  const [showSendReminderModal, setShowSendReminderModal] = useState<boolean>(false);
  const [policyToSendReminder, setPolicyToSendReminder] = useState<Policy | null>(null);

  const statusDisplayMap: { [key: string]: string } = {
    'proxima_a_vencer': 'Próxima a vencer',
    'pendiente_renovacion': 'Pendiente de Renovación',
    'renovado': 'Renovada',
    'no_renovo': 'No Renovó',
    'vencida': 'Vencida',
    // Backward compatibility for old English statuses if they still exist in DB
    'upcoming': 'Próxima a vencer (Antiguo)',
    'pending_renewal': 'Pendiente de Renovación (Antiguo)',
    'renewed': 'Renovada (Antiguo)',
    'not_renewed': 'No Renovó (Antiguo)',
    'expired': 'Vencida (Antiguo)',
  };

  const getDisplayStatus = (status: string) => {
    return statusDisplayMap[status] || status; // Fallback to raw status if not mapped
  };


  // Filter states
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [filterAgentId, setFilterAgentId] = useState<string>(initialAgentId || '');
  const [filterExpirationStartDate, setFilterExpirationStartDate] = useState<string>('');
  const [filterExpirationEndDate, setFilterExpirationEndDate] = useState<string>('');

  const fetchPolicies = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const queryParams = new URLSearchParams();
      if (filterStatus) queryParams.append('status', filterStatus);
      if (filterAgentId) queryParams.append('agentId', filterAgentId);
      if (filterExpirationStartDate) queryParams.append('expirationStartDate', filterExpirationStartDate);
      if (filterExpirationEndDate) queryParams.append('expirationEndDate', filterExpirationEndDate);

      const response = await fetch(`/api/policies/renewal-tasks?${queryParams.toString()}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data: Policy[] = await response.json();
      setPolicies(data);
    } catch (err: any) {
      setError(`Failed to fetch policies: ${err.message}`);
      console.error("Error fetching renewal policies:", err);
    } finally {
      setLoading(false);
    }
  }, [filterStatus, filterAgentId, filterExpirationStartDate, filterExpirationEndDate]);

  useEffect(() => {
    fetchPolicies();
  }, [fetchPolicies]);

  const handleViewDetails = (policy: Policy) => {
    setSelectedPolicy(policy);
    setShowDetailsModal(true);
  };

  const handleCloseDetailsModal = () => {
    setShowDetailsModal(false);
    setSelectedPolicy(null);
  };

  const handlePolicyUpdate = useCallback(() => {
    fetchPolicies(); // Re-fetch policies after an update from the modal
  }, [fetchPolicies]);

  const handleSendReminder = (policy: Policy) => {
    setPolicyToSendReminder(policy);
    setShowSendReminderModal(true);
  };

  const handleCloseSendReminderModal = () => {
    setShowSendReminderModal(false);
    setPolicyToSendReminder(null);
  };

  const handleReminderSent = useCallback(() => {
    fetchPolicies(); // Re-fetch policies after a reminder is sent
    handleCloseSendReminderModal();
  }, [fetchPolicies, handleCloseSendReminderModal]);

  if (loading) return <p>Cargando tareas de renovación...</p>;
  if (error) return <p className={styles.errorText}>Error: {error}</p>;

  return (
    <div className={styles.tableContainer}>
      <h2>Tareas de Renovación de Pólizas</h2>

      {/* Filter Section */}
      <div style={{ marginBottom: '1rem', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        <input
          type="text"
          placeholder="Filtrar por Estado (próxima_a_vencer, pendiente_renovacion, etc.)"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
        />
        <input
          type="text"
          placeholder="Filtrar por ID de Agente"
          value={filterAgentId}
          onChange={(e) => setFilterAgentId(e.target.value)}
          style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
        />
        <input
          type="date"
          placeholder="Fecha Inicio Vencimiento"
          value={filterExpirationStartDate}
          onChange={(e) => setFilterExpirationStartDate(e.target.value)}
          style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
        />
        <input
          type="date"
          placeholder="Fecha Fin Vencimiento"
          value={filterExpirationEndDate}
          onChange={(e) => setFilterExpirationEndDate(e.target.value)}
          style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
        />
      </div>

      {policies.length === 0 ? (
        <p>No hay pólizas que coincidan con los criterios de búsqueda.</p>
      ) : (
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Póliza #</th>
              <th>Cliente</th>
              <th>Aseguradora</th>
              <th>Vencimiento</th>
              <th>Estado</th>
              <th>Último Recordatorio</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {policies.map((policy) => (
              <tr key={policy.id}>
                <td>{policy.numeroPoliza}</td>
                <td>{policy.clientNombreCompleto}</td>
                <td>{policy.aseguradora}</td>
                <td>{policy.fechaFinVigencia ? format(new Date(policy.fechaFinVigencia), 'dd/MM/yyyy') : 'N/A'}</td>
                <td>{getDisplayStatus(policy.status)}</td>
                <td>{policy.lastReminderSent ? format(new Date(policy.lastReminderSent), 'dd/MM/yyyy HH:mm') : 'Nunca'}</td>
                <td>
                  <button 
                    className={styles.actionButton} 
                    onClick={() => handleViewDetails(policy)}
                  >
                    Ver Detalles
                  </button>
                  <button 
                    className={styles.actionButton} 
                    onClick={() => handleSendReminder(policy)}
                  >
                    Enviar Recordatorio
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {showDetailsModal && selectedPolicy && (
        <PolicyDetailsModal
          policy={selectedPolicy}
          onClose={handleCloseDetailsModal}
          onUpdate={handlePolicyUpdate}
        />
      )}

      {showSendReminderModal && policyToSendReminder && (
        <SendReminderModal
          policy={policyToSendReminder}
          onClose={handleCloseSendReminderModal}
          onReminderSent={handleReminderSent}
        />
      )}
    </div>
  );
};

export default PolicyRenewalTasks;