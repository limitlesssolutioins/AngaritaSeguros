'use client';

import styles from './ClientDetailsModal.module.css'; // Re-use the styled modal CSS
import { FaTimes } from 'react-icons/fa';

interface TaskData {
  id: string;
  type: 'general' | 'policy_expiry' | 'birthday';
  description: string;
  dueDate: string;
  clientName?: string;
  policyId?: string;
  status: 'pending' | 'completed';
}

interface TaskDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: TaskData | null;
}

const birthdayMessageTemplate = (clientName: string) => `Estimado(a) ${clientName},

¡Feliz cumpleaños de parte de todo el equipo de Angarita Seguros!
Esperamos que tenga un día maravilloso lleno de alegría y celebración.

Gracias por confiar en nosotros para sus necesidades de seguro.

Atentamente,
El equipo de Angarita Seguros`;

const policyExpiryMessageTemplate = (clientName: string, policyId: string, dueDate: string) => `Estimado(a) ${clientName},

Le recordamos que su póliza de seguro con ID ${policyId} está próxima a vencer el día ${dueDate}.

Para evitar la interrupción de su cobertura, por favor, póngase en contacto con nosotros para renovarla.

Gracias por su confianza.

Atentamente,
El equipo de Angarita Seguros`;

export default function TaskDetailsModal({ isOpen, onClose, task }: TaskDetailsModalProps) {
  if (!isOpen || !task) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <h2>Detalles de la Tarea</h2>
          <button onClick={onClose} className={styles.closeButton}>
            <FaTimes />
          </button>
        </div>

        <div className={styles.modalBody}>
          <div className={styles.detailGrid}>
            <p><strong>ID:</strong> {task.id}</p>
            <p><strong>Tipo:</strong> {task.type === 'general' ? 'General' : task.type === 'policy_expiry' ? 'Vencimiento de Póliza' : 'Cumpleaños'}</p>
            <p><strong>Fecha Límite:</strong> {task.dueDate}</p>
            <p><strong>Estado:</strong> {task.status === 'pending' ? 'Pendiente' : 'Completada'}</p>
            {task.clientName && <p><strong>Cliente:</strong> {task.clientName}</p>}
            {task.policyId && <p><strong>ID de Póliza:</strong> {task.policyId}</p>}
          </div>
          <p className={styles.detailItemFullWidth}><strong>Descripción:</strong> {task.description}</p>

          {task.type === 'birthday' && task.clientName && (
            <div className={styles.quoteSection}> 
              <h3 className={styles.quoteTitle}>Mensaje de Cumpleaños</h3>
              <textarea
                className={styles.birthdayMessage}
                readOnly
                value={birthdayMessageTemplate(task.clientName)}
              />
              <button className={`${styles.footerButton} ${styles.primary}`}>Enviar Mensaje</button>
            </div>
          )}

          {task.type === 'policy_expiry' && task.clientName && task.policyId && (
            <div className={styles.quoteSection}> 
              <h3 className={styles.quoteTitle}>Recordatorio de Vencimiento</h3>
              <textarea
                className={styles.birthdayMessage} /* Re-using style */
                readOnly
                value={policyExpiryMessageTemplate(task.clientName, task.policyId, task.dueDate)}
              />
              <button className={`${styles.footerButton} ${styles.primary}`}>Enviar Recordatorio</button>
            </div>
          )}
        </div>

        <div className={styles.modalFooter}>
          <button type="button" onClick={onClose} className={`${styles.footerButton} ${styles.secondary}`}>Cerrar</button>
        </div>
      </div>
    </div>
  );
}
