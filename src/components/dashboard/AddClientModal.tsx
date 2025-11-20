'use client';

import { useState, useEffect } from 'react';
import styles from './AddClientModal.module.css';

interface AddClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddClient: (client: Omit<ClientData, 'id'>) => void;
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

interface UserData {
  id: string;
  name: string;
}

export default function AddClientModal({ isOpen, onClose, onAddClient }: AddClientModalProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [document, setDocument] = useState('');
  const [address, setAddress] = useState('');
  const [clientType, setClientType] = useState('natural');
  const [userId, setUserId] = useState('');
  const [users, setUsers] = useState<UserData[]>([]);

  useEffect(() => {
    if (isOpen) {
      fetch('/api/users')
        .then(res => res.json())
        .then(data => setUsers(data));
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !phone || !document || !address || !userId) {
      alert('Por favor, complete todos los campos.');
      return;
    }
    onAddClient({ name, email, phone, document, address, clientType, userId });
    setName('');
    setEmail('');
    setPhone('');
    setDocument('');
    setAddress('');
    setClientType('natural');
    setUserId('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <h2 className={styles.modalTitle}>Agregar Nuevo Cliente</h2>
        <form onSubmit={handleSubmit} className={styles.formGrid}>
          <div className={styles.formGroup}>
            <label htmlFor="name" className={styles.formLabel}>Nombre:</label>
            <input type="text" id="name" className={styles.formInput} value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="email" className={styles.formLabel}>Email:</label>
            <input type="email" id="email" className={styles.formInput} value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="phone" className={styles.formLabel}>Teléfono:</label>
            <input type="text" id="phone" className={styles.formInput} value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="document" className={styles.formLabel}>Documento:</label>
            <input type="text" id="document" className={styles.formInput} value={document} onChange={(e) => setDocument(e.target.value)} />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="address" className={styles.formLabel}>Dirección:</label>
            <input type="text" id="address" className={styles.formInput} value={address} onChange={(e) => setAddress(e.target.value)} />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="clientType" className={styles.formLabel}>Tipo de Cliente:</label>
            <select id="clientType" className={styles.formInput} value={clientType} onChange={(e) => setClientType(e.target.value)}>
              <option value="natural">Natural</option>
              <option value="juridico">Jurídico</option>
            </select>
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="user" className={styles.formLabel}>Usuario:</label>
            <select id="user" className={styles.formInput} value={userId} onChange={(e) => setUserId(e.target.value)}>
              <option value="">Seleccione un usuario</option>
              {users.map(user => (
                <option key={user.id} value={user.id}>{user.name}</option>
              ))}
            </select>
          </div>
          <div className={styles.modalActions}>
            <button type="submit" className={styles.submitButton}>Agregar Cliente</button>
            <button type="button" onClick={onClose} className={styles.cancelButton}>Cancelar</button>
          </div>
        </form>
      </div>
    </div>
  );
}
