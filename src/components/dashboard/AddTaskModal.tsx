'use client';

import { useState } from 'react';
import styles from './ClientDetailsModal.module.css'; // Re-use the styled modal CSS
import { FaTimes } from 'react-icons/fa';

interface AddTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTask: (task: Omit<TaskData, 'id' | 'status'>) => void;
}

interface TaskData {
  id: string;
  type: 'general' | 'policy_expiry' | 'birthday';
  description: string;
  dueDate: string;
  clientName?: string;
  policyId?: string;
  status: 'pending' | 'completed';
}

export default function AddTaskModal({ isOpen, onClose, onAddTask }: AddTaskModalProps) {
  const [type, setType] = useState<TaskData['type']>('general');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [clientName, setClientName] = useState('');
  const [policyId, setPolicyId] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || !dueDate) {
      alert('Por favor, complete la descripción y la fecha límite.');
      return;
    }

    const newTask: Omit<TaskData, 'id' | 'status'> = {
      type,
      description,
      dueDate,
    };

    if (type === 'policy_expiry' && policyId) {
      newTask.policyId = policyId;
      newTask.clientName = clientName; // Assuming clientName is relevant for policy expiry
    } else if (type === 'birthday' && clientName) {
      newTask.clientName = clientName;
    } else if (type === 'general' && clientName) {
      newTask.clientName = clientName;
    }

    onAddTask(newTask);
    setType('general');
    setDescription('');
    setDueDate('');
    setClientName('');
    setPolicyId('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay}>
      <form onSubmit={handleSubmit} className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <h2>Agregar Nueva Tarea</h2>
          <button type="button" onClick={onClose} className={styles.closeButton}>
            <FaTimes />
          </button>
        </div>

        <div className={styles.modalBody}>
          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label htmlFor="type" className={styles.formLabel}>Tipo de Tarea:</label>
              <select id="type" className={styles.formInput} value={type} onChange={(e) => setType(e.target.value as TaskData['type'])}>
                <option value="general">General</option>
                <option value="policy_expiry">Vencimiento de Póliza</option>
                <option value="birthday">Cumpleaños</option>
              </select>
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="dueDate" className={styles.formLabel}>Fecha Límite:</label>
              <input type="date" id="dueDate" className={styles.formInput} value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
            </div>
            <div className={`${styles.formGroup} ${styles.fullWidth}`}>
              <label htmlFor="description" className={styles.formLabel}>Descripción:</label>
              <input type="text" id="description" className={styles.formInput} value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>

            {(type === 'policy_expiry' || type === 'birthday' || type === 'general') && (
              <div className={styles.formGroup}>
                <label htmlFor="clientName" className={styles.formLabel}>Nombre del Cliente (Opcional):</label>
                <input type="text" id="clientName" className={styles.formInput} value={clientName} onChange={(e) => setClientName(e.target.value)} />
              </div>
            )}

            {type === 'policy_expiry' && (
              <div className={styles.formGroup}>
                <label htmlFor="policyId" className={styles.formLabel}>ID de Póliza (Opcional):</label>
                <input type="text" id="policyId" className={styles.formInput} value={policyId} onChange={(e) => setPolicyId(e.target.value)} />
              </div>
            )}
          </div>
        </div>

        <div className={styles.modalFooter}>
          <button type="submit" className={`${styles.footerButton} ${styles.primary}`}>Agregar Tarea</button>
          <button type="button" onClick={onClose} className={`${styles.footerButton} ${styles.secondary}`}>Cancelar</button>
        </div>
      </form>
    </div>
  );
}
