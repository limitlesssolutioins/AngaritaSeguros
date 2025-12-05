import React, { useState } from 'react';
import PaymentUploadModule from './PaymentUploadModule';
import AgentLiquidationModule from './AgentLiquidationModule';
import styles from './GestionEmpresarialContainer.module.css';

const GestionEmpresarialContainer: React.FC = () => {
  const [activeTab, setActiveTab] = useState('upload'); // 'upload' or 'liquidations'

  return (
    <div className={styles.container}>
      <h2 className={styles.header}>Gestión Empresarial</h2>
      <div className={styles.tabs}>
        <button
          className={`${styles.tabButton} ${activeTab === 'upload' ? styles.active : ''}`}
          onClick={() => setActiveTab('upload')}
        >
          Carga de Pagos
        </button>
        <button
          className={`${styles.tabButton} ${activeTab === 'liquidations' ? styles.active : ''}`}
          onClick={() => setActiveTab('liquidations')}
        >
          Liquidaciones de Agentes
        </button>
      </div>
      <div className={styles.content}>
        {activeTab === 'upload' && <PaymentUploadModule />}
        {activeTab === 'liquidations' && <AgentLiquidationModule />}
      </div>
    </div>
  );
};

export default GestionEmpresarialContainer;
