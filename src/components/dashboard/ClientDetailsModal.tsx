'use client';

import { useState } from 'react';
import styles from './ClientDetailsModal.module.css';
import { FaTimes, FaUserCircle, FaEnvelope, FaPhone, FaMapMarkerAlt, FaIdCard } from 'react-icons/fa';
import PolicyList from './PolicyList';
import AttachmentSection from './AttachmentSection';

// Define the structure of a policy, mirroring the backend
interface Policy {
  id: string;
  etiqueta: string;
  nombre: string;
  fechaExpedicion: string;
  fechaVencimiento: string;
  aseguradora: string;
  valorPrima: number;
  numeroPoliza: string;
  files?: string[];
}

// Define the structure of an attachment
interface Attachment {
  id: string;
  name: string;
  url: string;
}

interface ClientData {
  id: string;
  name: string;
  email: string;
  phone: string;
  document: string;
  address: string;
  clientType: string;
  userId: string;
}

interface ClientDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  client: ClientData | null;
  usersMap: Record<string, string>;
}

export default function ClientDetailsModal({ isOpen, onClose, client, usersMap }: ClientDetailsModalProps) {
  const [activeTab, setActiveTab] = useState('info');

  // Mock data for policies
  const mockPolicies: Policy[] = [
    { id: 'pol1', etiqueta: 'SOAT', nombre: 'SOAT Moto', fechaExpedicion: '2024-01-15', fechaVencimiento: '2025-01-15', aseguradora: 'Sura', valorPrima: 500000, numeroPoliza: 'SOAT-12345' },
    { id: 'pol2', etiqueta: 'Vehículo', nombre: 'Todo Riesgo Automóvil', fechaExpedicion: '2024-02-20', fechaVencimiento: '2025-02-20', aseguradora: 'Allianz', valorPrima: 1200000, numeroPoliza: 'TR-67890' },
  ];

  // Mock data for attachments
  const mockAttachments: Attachment[] = [
    { id: 'att1', name: 'Documento de Identidad.pdf', url: '#' },
    { id: 'att2', name: 'Licencia de Conducción.pdf', url: '#' },
  ];

  if (!isOpen || !client) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <div className={styles.clientIdentifier}>
            <FaUserCircle className={styles.avatar} />
            <h2 className={styles.clientName}>{client.name}</h2>
          </div>
          <button onClick={onClose} className={styles.closeButton}>
            <FaTimes />
          </button>
        </div>

        <div className={styles.tabNav}>
          <button className={`${styles.tabButton} ${activeTab === 'info' ? styles.activeTab : ''}`} onClick={() => setActiveTab('info')}>Información</button>
          <button className={`${styles.tabButton} ${activeTab === 'policies' ? styles.activeTab : ''}`} onClick={() => setActiveTab('policies')}>Pólizas</button>
          <button className={`${styles.tabButton} ${activeTab === 'attachments' ? styles.activeTab : ''}`} onClick={() => setActiveTab('attachments')}>Archivos Adjuntos</button>
        </div>

        <div className={styles.modalBody}>
          {activeTab === 'info' && (
            <>
              <div className={styles.infoSection}>
                <h3>Información de Contacto</h3>
                <div className={styles.infoGrid}>
                  <div className={styles.infoItem}>
                    <FaEnvelope className={styles.infoIcon} />
                    <span className={styles.infoLabel}>Email</span>
                    <span className={styles.infoValue}>{client.email}</span>
                  </div>
                  <div className={styles.infoItem}>
                    <FaPhone className={styles.infoIcon} />
                    <span className={styles.infoLabel}>Teléfono</span>
                    <span className={styles.infoValue}>{client.phone}</span>
                  </div>
                  <div className={styles.infoItem}>
                    <FaIdCard className={styles.infoIcon} />
                    <span className={styles.infoLabel}>Documento</span>
                    <span className={styles.infoValue}>{client.document}</span>
                  </div>
                  <div className={styles.infoItem}>
                    <FaMapMarkerAlt className={styles.infoIcon} />
                    <span className={styles.infoLabel}>Dirección</span>
                    <span className={styles.infoValue}>{client.address}</span>
                  </div>
                  <div className={styles.infoItem}>
                    <FaUserCircle className={styles.infoIcon} />
                    <span className={styles.infoLabel}>Tipo Cliente</span>
                    <span className={styles.infoValue}>{client.clientType}</span>
                  </div>
                  <div className={styles.infoItem}>
                    <FaUserCircle className={styles.infoIcon} />
                    <span className={styles.infoLabel}>Usuario</span>
                    <span className={styles.infoValue}>{usersMap[client.userId] || client.userId}</span>
                  </div>
                </div>
              </div>

              <div className={styles.actionsSection}>
                <h3>Acciones Rápidas</h3>
                <div className={styles.actionButtonsContainer}>
                    <button className={styles.actionButton}>Cotizar Vehículo</button>
                    <button className={styles.actionButton}>Cotizar Salud</button>
                    <button className={styles.actionButton}>Cotizar Vida</button>
                    <button className={styles.actionButton}>Comprar SOAT</button>
                    <button className={styles.actionButton}>Cotizar Mascotas</button>
                    <button className={styles.actionButton}>Póliza PYME</button>
                    <button className={styles.actionButton}>Póliza Hogar</button>
                    <button className={styles.actionButton}>Transporte</button>
                    <button className={styles.actionButton}>RC Médico</button>
                </div>
              </div>
            </>
          )}
          {activeTab === 'policies' && (
            <PolicyList policies={mockPolicies} isLoading={false} error={null} />
          )}
          {activeTab === 'attachments' && (
            <AttachmentSection attachments={mockAttachments} />
          )}
        </div>

        <div className={styles.modalFooter}>
          <button type="button" className={`${styles.footerButton} ${styles.danger}`}>Eliminar</button>
          <button type="button" className={`${styles.footerButton} ${styles.primary}`}>Editar Cliente</button>
          <button type="button" onClick={onClose} className={`${styles.footerButton} ${styles.secondary}`}>Cerrar</button>
        </div>
      </div>
    </div>
  );
}
