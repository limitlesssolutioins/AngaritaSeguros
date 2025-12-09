'use client';

import { useState } from 'react';
import styles from './SettingsModule.module.css';
import { FaBell, FaInfoCircle, FaSave, FaTable, FaUsers, FaDatabase, FaCog } from 'react-icons/fa';
import FlatFileConfigurator from './FlatFileConfigurator';
import UsersList from './UsersList';
import MastersSettings from './MastersSettings';

export default function SettingsModule() {
  const [activeTab, setActiveTab] = useState<'general' | 'users' | 'masters' | 'integrations'>('general');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [emailNotificationsEnabled, setEmailNotificationsEnabled] = useState(true);
  const [whatsappNotificationsEnabled, setWhatsappNotificationsEnabled] = useState(false);
  const [notificationFrequency, setNotificationFrequency] = useState('daily');

  const handleSaveChanges = () => {
    alert('Configuración guardada (simulado)!');
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'general':
        return (
          <div className={styles.tabContent}>
             <div className={styles.settingsSection}>
                <h3 className={styles.sectionTitle}><FaBell className={styles.sectionIcon} /> Notificaciones</h3>
                <div className={styles.settingItem}>
                  <label htmlFor="notificationsToggle" className={styles.settingLabel}>Habilitar Notificaciones Generales:</label>
                  <input
                    type="checkbox"
                    id="notificationsToggle"
                    checked={notificationsEnabled}
                    onChange={(e) => setNotificationsEnabled(e.target.checked)}
                    className={styles.toggleSwitch}
                  />
                </div>
                <div className={styles.settingItem}>
                  <label htmlFor="emailNotificationsToggle" className={styles.settingLabel}>Notificaciones por Email:</label>
                  <input
                    type="checkbox"
                    id="emailNotificationsToggle"
                    checked={emailNotificationsEnabled}
                    onChange={(e) => setEmailNotificationsEnabled(e.target.checked)}
                    className={styles.toggleSwitch}
                    disabled={!notificationsEnabled}
                  />
                </div>
                <div className={styles.settingItem}>
                  <label htmlFor="whatsappNotificationsToggle" className={styles.settingLabel}>Notificaciones por WhatsApp:</label>
                  <input
                    type="checkbox"
                    id="whatsappNotificationsToggle"
                    checked={whatsappNotificationsEnabled}
                    onChange={(e) => setWhatsappNotificationsEnabled(e.target.checked)}
                    className={styles.toggleSwitch}
                    disabled={!notificationsEnabled}
                  />
                </div>
                <div className={styles.settingItem}>
                  <label htmlFor="notificationFrequency" className={styles.settingLabel}>Frecuencia de Notificaciones:</label>
                  <select
                    id="notificationFrequency"
                    value={notificationFrequency}
                    onChange={(e) => setNotificationFrequency(e.target.value)}
                    className={styles.selectInput}
                    disabled={!notificationsEnabled}
                  >
                    <option value="daily">Diario</option>
                    <option value="weekly">Semanal</option>
                    <option value="monthly">Mensual</option>
                  </select>
                </div>
              </div>
              <div className={styles.settingsSection}>
                <h3 className={styles.sectionTitle}><FaInfoCircle className={styles.sectionIcon} /> Acerca de</h3>
                <div className={styles.settingItem}>
                  <p className={styles.settingLabel}>Versión de la Aplicación: 1.0.0</p>
                  <p className={styles.settingLabel}>Desarrollado por: Angarita Seguros</p>
                </div>
              </div>
               <div className={styles.saveChangesContainer}>
                <button onClick={handleSaveChanges} className={styles.saveButton}>
                  <FaSave /> Guardar Cambios
                </button>
              </div>
          </div>
        );
      case 'users':
        return (
          <div className={styles.tabContent}>
            <UsersList />
          </div>
        );
      case 'masters':
        return (
          <div className={styles.tabContent}>
            <MastersSettings />
          </div>
        );
      case 'integrations':
        return (
          <div className={styles.tabContent}>
             <div className={styles.settingsSection}>
                <h3 className={styles.sectionTitle}><FaTable className={styles.sectionIcon} /> Configuración de Planillas</h3>
                <FlatFileConfigurator />
              </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className={styles.settingsModuleContainer}>
      <div className={styles.tabsHeader}>
        <button 
          className={`${styles.tabButton} ${activeTab === 'general' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('general')}
        >
          <FaCog /> General
        </button>
        <button 
          className={`${styles.tabButton} ${activeTab === 'users' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('users')}
        >
          <FaUsers /> Usuarios
        </button>
        <button 
          className={`${styles.tabButton} ${activeTab === 'masters' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('masters')}
        >
          <FaDatabase /> Maestros
        </button>
        <button 
          className={`${styles.tabButton} ${activeTab === 'integrations' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('integrations')}
        >
          <FaTable /> Integraciones
        </button>
      </div>
      
      <div className={styles.mainContent}>
        {renderContent()}
      </div>
    </div>
  );
}