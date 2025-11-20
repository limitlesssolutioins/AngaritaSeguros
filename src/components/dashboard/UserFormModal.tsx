'use client';

import { useState, useEffect } from 'react';
import styles from './ClientDetailsModal.module.css'; // Re-using styles for consistency
import { FaTimes } from 'react-icons/fa';

interface UserData {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'agent' | 'viewer';
  permissions: string[]; // e.g., ['view_clients', 'edit_policies']
}

interface UserFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveUser: (user: Omit<UserData, 'id'>, id?: string) => void;
  userToEdit?: UserData | null;
}

const allPermissions = [
  'view_dashboard',
  'manage_requests',
  'manage_clients',
  'manage_tasks',
  'view_collections',
  'edit_collections',
  'view_reports',
  'manage_files',
  'manage_settings',
  'manage_users',
];

export default function UserFormModal({ isOpen, onClose, onSaveUser, userToEdit }: UserFormModalProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserData['role']>('agent');
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);

  useEffect(() => {
    if (userToEdit) {
      setName(userToEdit.name);
      setEmail(userToEdit.email);
      setRole(userToEdit.role);
      setSelectedPermissions(userToEdit.permissions);
    } else {
      setName('');
      setEmail('');
      setRole('agent');
      setSelectedPermissions([]);
    }
  }, [userToEdit, isOpen]);

  const handlePermissionChange = (permission: string) => {
    setSelectedPermissions(prev =>
      prev.includes(permission) ? prev.filter(p => p !== permission) : [...prev, permission]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) {
      alert('Por favor, complete el nombre y el email.');
      return;
    }

    const userData: Omit<UserData, 'id'> = {
      name,
      email,
      role,
      permissions: selectedPermissions,
    };

    onSaveUser(userData, userToEdit?.id);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay}>
      <form onSubmit={handleSubmit} className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <h2>{userToEdit ? 'Editar Usuario' : 'Agregar Usuario'}</h2>
          <button type="button" onClick={onClose} className={styles.closeButton}>
            <FaTimes />
          </button>
        </div>

        <div className={styles.modalBody}>
          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label htmlFor="name" className={styles.formLabel}>Nombre:</label>
              <input type="text" id="name" className={styles.formInput} value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="email" className={styles.formLabel}>Email:</label>
              <input type="email" id="email" className={styles.formInput} value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="role" className={styles.formLabel}>Rol:</label>
              <select id="role" className={styles.formInput} value={role} onChange={(e) => setRole(e.target.value as UserData['role'])}>
                <option value="admin">Administrador</option>
                <option value="agent">Agente</option>
                <option value="viewer">Visualizador</option>
              </select>
            </div>

            <div className={`${styles.formGroup} ${styles.fullWidth}`}>
              <label className={styles.formLabel}>Permisos:</label>
              <div className={styles.permissionsGrid}>
                {allPermissions.map(permission => (
                  <div key={permission} className={styles.permissionItem}>
                    <input
                      type="checkbox"
                      id={permission}
                      checked={selectedPermissions.includes(permission)}
                      onChange={() => handlePermissionChange(permission)}
                    />
                    <label htmlFor={permission}>{permission.replace(/_/g, ' ')}</label>
                  </div>
                ))}
              </div>
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
