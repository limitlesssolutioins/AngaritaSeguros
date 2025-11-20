'use client';

import styles from './ClientDetailsModal.module.css'; // Re-using styles for consistency
import { FaTimes } from 'react-icons/fa';

interface RequestData {
  id: string;
  type: 'vehiculo' | 'salud' | 'vida' | 'soat' | 'mascotas' | 'financiacion';
  status: 'nueva' | 'pendiente' | 'completada' | 'rechazada';
  date: string;
  clientName: string;
  details: string;
}

interface RequestDetailsModalProps {
  request: RequestData | null;
  onClose: () => void;
}

export default function RequestDetailsModal({ request, onClose }: RequestDetailsModalProps) {
  if (!request) return null;

  const renderDetails = () => {
    // Later, we can customize this based on request.type
    return (
        <p><strong>Detalles:</strong> {request.details}</p>
    );
  }

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <h2>Detalles de la Solicitud</h2>
          <button onClick={onClose} className={styles.closeButton}>
            <FaTimes />
          </button>
        </div>
        <div className={styles.modalBody}>
            <div className={styles.detailGrid}>
                <p><strong>ID de Solicitud:</strong> {request.id}</p>
                <p><strong>Cliente:</strong> {request.clientName}</p>
                <p><strong>Fecha:</strong> {request.date}</p>
                <p><strong>Tipo:</strong> {request.type}</p>
                <p><strong>Estado:</strong> {request.status}</p>
                {renderDetails()}
            </div>
        </div>
        <div className={styles.modalFooter}>
          <button onClick={() => console.log('Agregar Póliza')} className={`${styles.footerButton} ${styles.primary}`}>Agregar Póliza</button>
          <button onClick={() => console.log('Editar Solicitud')} className={`${styles.footerButton} ${styles.secondary}`}>Editar</button>
          <button onClick={() => console.log('Eliminar Solicitud')} className={`${styles.footerButton} ${styles.danger}`}>Eliminar</button>
          <button onClick={() => console.log('Rechazar Solicitud')} className={`${styles.footerButton} ${styles.warning}`}>Rechazar</button>
          <button onClick={onClose} className={styles.footerButton}>
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
