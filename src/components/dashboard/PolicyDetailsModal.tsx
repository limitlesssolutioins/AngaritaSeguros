'use client';
import { useState, useEffect } from 'react';
import styles from './PolicyDetailsModal.module.css';
import { format } from 'date-fns';
import Select from 'react-select'; // Using react-select for better dropdowns

// Assuming a Policy type exists, similar to the one in PolicyRenewalTasks.tsx
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
}

interface Option {
  value: string;
  label: string;
}

interface PolicyDetailsModalProps {
  policy: Policy; // The policy to display/edit
  onClose: () => void;
  onUpdate: () => void; // Callback to re-fetch policies in parent component
}

const statusOptions = [
  { value: 'proxima_a_vencer', label: 'Próxima a vencer' },
  { value: 'pendiente_renovacion', label: 'Pendiente de Renovación' },
  { value: 'renovado', label: 'Renovada' },
  { value: 'no_renovo', label: 'No Renovó' },
  { value: 'vencida', label: 'Vencida' },
];

const PolicyDetailsModal: React.FC<PolicyDetailsModalProps> = ({ policy, onClose, onUpdate }) => {
  const [currentStatus, setCurrentStatus] = useState<Option | null>(
    statusOptions.find(option => option.value === policy.status) || null
  );
  const [currentResponsibleAgentId, setCurrentResponsibleAgentId] = useState<string>(policy.responsibleAgentId || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // TODO: Fetch list of agents for the responsibleAgentId dropdown

  const handleStatusChange = (selectedOption: Option | null) => {
    setCurrentStatus(selectedOption);
  };

  const handleResponsibleAgentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentResponsibleAgentId(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const formData = new FormData();
      // Append all existing policy fields (even if read-only) to ensure the PUT request is complete
      // and only modify the status and responsibleAgentId
      formData.append('etiquetaOficina', policy.etiquetaOficina);
      formData.append('etiquetaCliente', policy.etiquetaCliente);
      formData.append('aseguradora', policy.aseguradora);
      formData.append('ramo', policy.ramo);
      formData.append('nombreRazonSocial', policy.clientNombreCompleto);
      formData.append('tipoIdentificacion', policy.clientTipoIdentificacion);
      formData.append('numeroIdentificacion', policy.clientNumeroIdentificacion);
      formData.append('numeroPoliza', policy.numeroPoliza);
      formData.append('fechaExpedicion', format(new Date(policy.fechaExpedicion), 'yyyy-MM-dd'));
      formData.append('fechaInicio', format(new Date(policy.fechaInicio), 'yyyy-MM-dd'));
      formData.append('fechaFinVigencia', format(new Date(policy.fechaFinVigencia), 'yyyy-MM-dd'));
      if (policy.placa) formData.append('placa', policy.placa);
      formData.append('valorPrimaNeta', policy.valorPrimaNeta.toString());
      formData.append('valorTotalAPagar', policy.valorTotalAPagar.toString());
      formData.append('financiado', policy.financiado.toString());
      if (policy.financiera) formData.append('financiera', policy.financiera);
      
      // New fields to update
      if (currentStatus) formData.append('status', currentStatus.value);
      if (currentResponsibleAgentId) formData.append('responsibleAgentId', currentResponsibleAgentId);
      // lastReminderSent is updated by the send-renewal-reminder API, not directly editable here
      if (policy.lastReminderSent) formData.append('lastReminderSent', policy.lastReminderSent); // Pass existing value

      const response = await fetch(`/api/policies/${policy.id}`, {
        method: 'PUT',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al actualizar la póliza');
      }

      alert('Póliza actualizada exitosamente');
      onUpdate(); // Trigger parent to re-fetch
      onClose();

    } catch (err: any) {
      setError(err.message);
      console.error("Error updating policy:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <h2>Detalles de Póliza #{policy.numeroPoliza}</h2>
          <button onClick={onClose} className={styles.closeButton}>&times;</button>
        </div>
        <form className={styles.form} onSubmit={handleSubmit}>
          {/* Policy Details - Read Only */}
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label>Cliente</label>
              <input type="text" value={policy.clientNombreCompleto} disabled />
            </div>
            <div className={styles.formGroup}>
              <label>Identificación Cliente</label>
              <input type="text" value={`${policy.clientTipoIdentificacion}: ${policy.clientNumeroIdentificacion}`} disabled />
            </div>
          </div>
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label>Aseguradora</label>
              <input type="text" value={policy.aseguradora} disabled />
            </div>
            <div className={styles.formGroup}>
              <label>Ramo</label>
              <input type="text" value={policy.ramo} disabled />
            </div>
          </div>
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label>Fecha Expedición</label>
              <input type="date" value={format(new Date(policy.fechaExpedicion), 'yyyy-MM-dd')} disabled />
            </div>
            <div className={styles.formGroup}>
              <label>Fecha Inicio Vigencia</label>
              <input type="date" value={format(new Date(policy.fechaInicio), 'yyyy-MM-dd')} disabled />
            </div>
             <div className={styles.formGroup}>
              <label>Fecha Fin Vigencia</label>
              <input type="date" value={format(new Date(policy.fechaFinVigencia), 'yyyy-MM-dd')} disabled />
            </div>
          </div>
          {policy.placa && (
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label>Placa</label>
                <input type="text" value={policy.placa} disabled />
              </div>
            </div>
          )}
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label>Prima Neta</label>
              <input type="text" value={policy.valorPrimaNeta.toLocaleString('es-CO')} disabled />
            </div>
            <div className={styles.formGroup}>
              <label>Total a Pagar</label>
              <input type="text" value={policy.valorTotalAPagar.toLocaleString('es-CO')} disabled />
            </div>
          </div>
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label>Financiado</label>
              <input type="checkbox" checked={policy.financiado} disabled />
            </div>
            {policy.financiado && (
              <div className={styles.formGroup}>
                <label>Financiera</label>
                <input type="text" value={policy.financiera || 'N/A'} disabled />
              </div>
            )}
          </div>
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label>Último Recordatorio Enviado</label>
              <input type="text" value={policy.lastReminderSent ? format(new Date(policy.lastReminderSent), 'dd/MM/yyyy HH:mm') : 'Nunca'} disabled />
            </div>
          </div>


          {/* Editable Fields */}
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label htmlFor="status">Estado de Renovación</label>
              <Select
                id="status"
                options={statusOptions}
                value={currentStatus}
                onChange={handleStatusChange}
                placeholder="Selecciona un estado"
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="responsibleAgentId">ID Agente Responsable</label>
              <input
                type="text"
                id="responsibleAgentId"
                value={currentResponsibleAgentId}
                onChange={handleResponsibleAgentChange}
                placeholder="Ej: cl123abcde"
              />
            </div>
          </div>

          {error && <p className={styles.errorText}>{error}</p>}

          <div className={styles.formActions}>
            <button type="button" onClick={onClose} className={styles.cancelButton} disabled={isSubmitting}>Cancelar</button>
            <button type="submit" className={styles.saveButton} disabled={isSubmitting}>
              {isSubmitting ? 'Actualizando...' : 'Actualizar Póliza'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PolicyDetailsModal;
