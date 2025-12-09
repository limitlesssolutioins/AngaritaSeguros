'use client';

import { useState, useEffect } from 'react';
import styles from './UserFormModal.module.css'; // Use the new dedicated styles
import { FaTimes } from 'react-icons/fa';

interface UserData {
  id: string;
  name: string;
  email: string;
  role: 'Superadmin' | 'Admin' | 'Agent';
  office: string;
}

interface NewUserPayload extends Omit<UserData, 'id'> {
  password?: string;
}

interface UserFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveUser: (user: NewUserPayload, id?: string) => void;
  userToEdit?: UserData | null;
  isNewUser: boolean;
}

export default function UserFormModal({ isOpen, onClose, onSaveUser, userToEdit, isNewUser }: UserFormModalProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<UserData['role']>('Agent');
  const [office, setOffice] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (userToEdit) {
      setName(userToEdit.name);
      setEmail(userToEdit.email);
      setRole(userToEdit.role);
      setOffice(userToEdit.office);
      setPassword('');
      setConfirmPassword('');
    } else {
      setName('');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setRole('Agent');
      setOffice('');
    }
    setErrorMessage(null); // Clear error on modal open/close
  }, [userToEdit, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null); // Clear previous errors

    if (!name || !email || !office) {
      setErrorMessage('Por favor, complete Nombre, Email y Oficina.');
      return;
    }

    if (isNewUser) {
      if (!password || password.length < 6) {
        setErrorMessage('La contraseña es obligatoria y debe tener al menos 6 caracteres.');
        return;
      }
      if (password !== confirmPassword) {
        setErrorMessage('Las contraseñas no coinciden.');
        return;
      }
    }

    const userData: NewUserPayload = {
      name,
      email,
      role,
      office,
    };

    if (isNewUser) {
      userData.password = password;
    }

    onSaveUser(userData, userToEdit?.id);
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay}>
      <form onSubmit={handleSubmit} className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <h2>{isNewUser ? 'Agregar Nuevo Usuario' : 'Editar Usuario'}</h2>
          <button type="button" onClick={onClose} className={styles.closeButton}>
            <FaTimes />
          </button>
        </div>

        <div className={styles.modalBody}>
          {errorMessage && <p className={styles.errorMessage}>{errorMessage}</p>}
          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label htmlFor="name" className={styles.formLabel}>Nombre:</label>
              <input type="text" id="name" className={styles.formInput} value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="email" className={styles.formLabel}>Email:</label>
              <input type="email" id="email" className={styles.formInput} value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            {isNewUser && (
              <>
                <div className={styles.formGroup}>
                  <label htmlFor="password" className={styles.formLabel}>Contraseña:</label>
                  <input type="password" id="password" className={styles.formInput} value={password} onChange={(e) => setPassword(e.target.value)} required={isNewUser} />
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="confirmPassword" className={styles.formLabel}>Confirmar Contraseña:</label>
                  <input type="password" id="confirmPassword" className={styles.formInput} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required={isNewUser} />
                </div>
              </>
            )}
            <div className={styles.formGroup}>
              <label htmlFor="role" className={styles.formLabel}>Rol:</label>
              <select id="role" className={styles.formSelect} value={role} onChange={(e) => setRole(e.target.value as UserData['role'])}>
                <option value="Superadmin">Superadministrador</option>
                <option value="Admin">Administrador</option>
                <option value="Agent">Agente</option>
              </select>
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="office" className={styles.formLabel}>Oficina:</label>
              <input type="text" id="office" className={styles.formInput} value={office} onChange={(e) => setOffice(e.target.value)} required />
            </div>
          </div>
        </div>

        <div className={styles.modalFooter}>
          <button type="submit" className={`${styles.footerButton} ${styles.primary}`}>Guardar Usuario</button>
          <button type="button" onClick={onClose} className={`${styles.footerButton} ${styles.secondary}`}>Cancelar</button>
        </div>
      </form>
    </div>
  );
}
