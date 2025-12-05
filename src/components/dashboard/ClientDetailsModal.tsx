'use client';
import { useState } from 'react';
import styles from './ClientDetailsModal.module.css';
import { FaUser, FaFileContract, FaFolderOpen, FaEdit, FaTimes } from 'react-icons/fa';
import ClientPoliciesList from './ClientPoliciesList';
import ClientDocumentsTab from './ClientDocumentsTab'; // Import the new documents tab
import AddClientModal from './AddClientModal'; // We'll need this to edit

// This interface should match the database schema
interface Client {
  id: string;
  nombreCompleto: string;
  tipoIdentificacion: string;
  numeroIdentificacion: string;
  fechaNacimiento: string;
  direccion: string;
  telefono: string;
  correo: string;
}

interface ClientDetailsModalProps {
  onClose: () => void;
  client: Client;
}

// Internal component for the General Info Tab
const GeneralInfoTab = ({ client }: { client: Client }) => {
    // Dummy state for edit modal - will be handled properly later
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    const clientData = [
        { label: 'Nombre Completo', value: client.nombreCompleto },
        { label: 'Tipo ID', value: client.tipoIdentificacion },
        { label: 'Número ID', value: client.numeroIdentificacion },
        { label: 'Teléfono', value: client.telefono },
        { label: 'Correo', value: client.correo },
        { label: 'Dirección', value: client.direccion },
        { label: 'Fecha de Nacimiento', value: client.fechaNacimiento ? new Date(client.fechaNacimiento).toLocaleDateString() : 'N/A' },
    ];

    return (
        <div>
            <div className={styles.infoGrid}>
                {clientData.map(data => (
                    <div key={data.label} className={styles.infoItem}>
                        <span className={styles.infoLabel}>{data.label}</span>
                        <span className={styles.infoValue}>{data.value}</span>
                    </div>
                ))}
            </div>
            <button className={styles.editInfoButton} onClick={() => setIsEditModalOpen(true)}>
                <FaEdit /> Editar Información
            </button>

            {isEditModalOpen && <AddClientModal onClose={() => setIsEditModalOpen(false)} clientToEdit={client} />}
        </div>
    );
};

const ClientDetailsModal: React.FC<ClientDetailsModalProps> = ({ onClose, client }) => {
  const [activeTab, setActiveTab] = useState<'info' | 'policies' | 'documents'>('info');

  const TABS = [
    { id: 'info', label: 'Información General', icon: FaUser },
    { id: 'policies', label: 'Pólizas', icon: FaFileContract },
    { id: 'documents', label: 'Documentos', icon: FaFolderOpen },
  ];

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>Detalles del Cliente</h2>
          <button onClick={onClose} className={styles.closeButton}><FaTimes /></button>
        </div>
        
        <div className={styles.tabBar}>
          {TABS.map(tab => (
            <button 
              key={tab.id}
              className={`${styles.tabButton} ${activeTab === tab.id ? styles.activeTab : ''}`}
              onClick={() => setActiveTab(tab.id as any)}
            >
              <tab.icon />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        <div className={styles.tabContent}>
          {activeTab === 'info' && <GeneralInfoTab client={client} />}
          {activeTab === 'policies' && <ClientPoliciesList clientId={client.id} />}
          {activeTab === 'documents' && <ClientDocumentsTab clientId={client.id} />}
        </div>
      </div>
    </div>
  );
};

export default ClientDetailsModal;
