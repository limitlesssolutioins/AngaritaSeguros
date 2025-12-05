import { useState } from 'react';
import styles from './SettingsModule.module.css';
import { FaBell, FaInfoCircle, FaSave, FaTable, FaGift, FaUsers } from 'react-icons/fa';
import FlatFileConfigurator from './FlatFileConfigurator';
import UsersList from './UsersList';

export default function SettingsModule() {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [emailNotificationsEnabled, setEmailNotificationsEnabled] = useState(true);
  const [whatsappNotificationsEnabled, setWhatsappNotificationsEnabled] = useState(false);
  const [notificationFrequency, setNotificationFrequency] = useState('daily');

  const [birthdayMessageEnabled, setBirthdayMessageEnabled] = useState(true);
  const [birthdayMessage, setBirthdayMessage] = useState('¡Feliz cumpleaños, {nombre_cliente}! Te deseamos un día lleno de alegría.');
  const [christmasMessageEnabled, setChristmasMessageEnabled] = useState(true);
  const [christmasMessage, setChristmasMessage] = useState('¡Feliz Navidad, {nombre_cliente}! Que la paz y la alegría llenen tu hogar.');
  const [newYearMessageEnabled, setNewYearMessageEnabled] = useState(true);
  const [newYearMessage, setNewYearMessage] = useState('¡Feliz Año Nuevo, {nombre_cliente}! Que este año esté lleno de éxitos y prosperidad.');

  const handleSaveChanges = () => {
    alert('Configuración guardada (simulado)!');
    console.log('Settings saved:', {
      notificationsEnabled,
      emailNotificationsEnabled,
      whatsappNotificationsEnabled,
      notificationFrequency,
      birthdayMessageEnabled,
      birthdayMessage,
      christmasMessageEnabled,
      christmasMessage,
      newYearMessageEnabled,
      newYearMessage,
    });
  };

  return (
    <div className={styles.settingsModuleContainer}>
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
        <h3 className={styles.sectionTitle}><FaGift className={styles.sectionIcon} /> Configuración de Mensajes Automáticos</h3>
        <p className={styles.description}>
          Configure los mensajes automáticos para cumpleaños, Navidad y Año Nuevo.
          Use <code>{`{nombre_cliente}`}</code> para el nombre del cliente.
        </p>

        <div className={styles.settingItem}>
          <label htmlFor="birthdayMessageEnabled" className={styles.settingLabel}>Habilitar Mensaje de Cumpleaños (Personas Naturales):</label>
          <input
            type="checkbox"
            id="birthdayMessageEnabled"
            checked={birthdayMessageEnabled}
            onChange={(e) => setBirthdayMessageEnabled(e.target.checked)}
            className={styles.toggleSwitch}
          />
        </div>
        <div className={styles.settingItem}>
          <label htmlFor="birthdayMessage" className={styles.settingLabel}>Mensaje de Cumpleaños:</label>
          <textarea
            id="birthdayMessage"
            value={birthdayMessage}
            onChange={(e) => setBirthdayMessage(e.target.value)}
            className={styles.textareaInput}
            rows={3}
            disabled={!birthdayMessageEnabled}
          />
        </div>

        <div className={styles.settingItem}>
          <label htmlFor="christmasMessageEnabled" className={styles.settingLabel}>Habilitar Mensaje de Navidad (Naturales y Jurídicas):</label>
          <input
            type="checkbox"
            id="christmasMessageEnabled"
            checked={christmasMessageEnabled}
            onChange={(e) => setChristmasMessageEnabled(e.target.checked)}
            className={styles.toggleSwitch}
          />
        </div>
        <div className={styles.settingItem}>
          <label htmlFor="christmasMessage" className={styles.settingLabel}>Mensaje de Navidad:</label>
          <textarea
            id="christmasMessage"
            value={christmasMessage}
            onChange={(e) => setChristmasMessage(e.target.value)}
            className={styles.textareaInput}
            rows={3}
            disabled={!christmasMessageEnabled}
          />
        </div>

        <div className={styles.settingItem}>
          <label htmlFor="newYearMessageEnabled" className={styles.settingLabel}>Habilitar Mensaje de Año Nuevo (Naturales y Jurídicas):</label>
          <input
            type="checkbox"
            id="newYearMessageEnabled"
            checked={newYearMessageEnabled}
            onChange={(e) => setNewYearMessageEnabled(e.target.checked)}
            className={styles.toggleSwitch}
          />
        </div>
        <div className={styles.settingItem}>
          <label htmlFor="newYearMessage" className={styles.settingLabel}>Mensaje de Año Nuevo:</label>
          <textarea
            id="newYearMessage"
            value={newYearMessage}
            onChange={(e) => setNewYearMessage(e.target.value)}
            className={styles.textareaInput}
            rows={3}
            disabled={!newYearMessageEnabled}
          />
        </div>
      </div>

      <div className={styles.settingsSection}>
        <h3 className={styles.sectionTitle}><FaUsers className={styles.sectionIcon} /> Gestión de Usuarios</h3>
        <UsersList />
      </div>

      <div className={styles.settingsSection}>
        <h3 className={styles.sectionTitle}><FaTable className={styles.sectionIcon} /> Configuración de Planillas</h3>
        <FlatFileConfigurator />
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
}
