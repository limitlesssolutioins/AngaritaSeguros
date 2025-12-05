'use client';

import { useState, useEffect } from 'react';
import styles from './AddClientModal.module.css';
import { FaUser, FaIdCard, FaHashtag, FaPhone, FaEnvelope, FaMapMarkerAlt, FaCalendarAlt } from 'react-icons/fa';

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

interface AddClientModalProps {
  onClose: () => void;
  clientToEdit?: Client | null;
}

const AddClientModal: React.FC<AddClientModalProps> = ({ onClose, clientToEdit }) => {
  const isEditMode = !!clientToEdit;

  const [formData, setFormData] = useState({
    nombreCompleto: '',
    tipoIdentificacion: '',
    numeroIdentificacion: '',
    fechaNacimiento: '',
    direccion: '',
    telefono: '',
    correo: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isEditMode && clientToEdit) {
      setFormData({
        nombreCompleto: clientToEdit.nombreCompleto || '',
        tipoIdentificacion: clientToEdit.tipoIdentificacion || '',
        numeroIdentificacion: clientToEdit.numeroIdentificacion || '',
        fechaNacimiento: clientToEdit.fechaNacimiento ? new Date(clientToEdit.fechaNacimiento).toISOString().split('T')[0] : '',
        direccion: clientToEdit.direccion || '',
        telefono: clientToEdit.telefono || '',
        correo: clientToEdit.correo || '',
      });
    }
  }, [clientToEdit, isEditMode]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.nombreCompleto || !formData.numeroIdentificacion) {
      setError('Nombre Completo y Número de Identificación son obligatorios.');
      return;
    }

    setIsSubmitting(true);
    try {
      const url = isEditMode ? `/api/clients/${clientToEdit?.id}` : '/api/clients';
      const method = isEditMode ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Error al ${isEditMode ? 'actualizar' : 'crear'} el cliente`);
      }

      alert(`Cliente ${isEditMode ? 'actualizado' : 'creado'} exitosamente`);
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>{isEditMode ? 'Editar Cliente' : 'Agregar Nuevo Cliente'}</h2>
        </div>
        <form onSubmit={handleSubmit} className={styles.formGrid}>
          <div className={`${styles.formGroup} ${styles.fullWidth}`}>
            <label htmlFor="nombreCompleto">Nombre Completo / Razón Social</label>
            <div className={styles.inputWrapper}>
              <FaUser className={styles.inputIcon} />
              <input type="text" id="nombreCompleto" value={formData.nombreCompleto} onChange={handleChange} />
            </div>
          </div>
          
          <div className={styles.formGroup}>
            <label htmlFor="tipoIdentificacion">Tipo de Identificación</label>
            <div className={styles.inputWrapper}>
              <FaIdCard className={styles.inputIcon} />
              <select id="tipoIdentificacion" value={formData.tipoIdentificacion} onChange={handleChange}>
                <option value="">Selecciona...</option>
                <option value="CC">Cédula de Ciudadanía</option>
                <option value="NIT">NIT</option>
                <option value="CE">Cédula de Extranjería</option>
                <option value="PA">Pasaporte</option>
              </select>
            </div>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="numeroIdentificacion">Número de Identificación</label>
            <div className={styles.inputWrapper}>
              <FaHashtag className={styles.inputIcon} />
              <input type="text" id="numeroIdentificacion" value={formData.numeroIdentificacion} onChange={handleChange} />
            </div>
          </div>
          
          <div className={styles.formGroup}>
            <label htmlFor="telefono">Teléfono</label>
            <div className={styles.inputWrapper}>
              <FaPhone className={styles.inputIcon} />
              <input type="text" id="telefono" value={formData.telefono} onChange={handleChange} />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="correo">Correo Electrónico</label>
            <div className={styles.inputWrapper}>
              <FaEnvelope className={styles.inputIcon} />
              <input type="email" id="correo" value={formData.correo} onChange={handleChange} />
            </div>
          </div>
          
          <div className={`${styles.formGroup} ${styles.fullWidth}`}>
            <label htmlFor="direccion">Dirección</label>
            <div className={styles.inputWrapper}>
              <FaMapMarkerAlt className={styles.inputIcon} />
              <input type="text" id="direccion" value={formData.direccion} onChange={handleChange} />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="fechaNacimiento">Fecha de Nacimiento</label>
            <div className={styles.inputWrapper}>
               <FaCalendarAlt className={styles.inputIcon} />
              <input type="date" id="fechaNacimiento" value={formData.fechaNacimiento} onChange={handleChange} />
            </div>
          </div>
          
          {error && <p className={styles.errorText}>{error}</p>}
        </form>
        <div className={styles.modalActions}>
          <button type="button" onClick={onClose} className={styles.cancelButton} disabled={isSubmitting}>
            Cancelar
          </button>
          <button type="submit" form="client-form" className={styles.submitButton} disabled={isSubmitting} onClick={handleSubmit}>
            {isSubmitting ? 'Guardando...' : (isEditMode ? 'Actualizar Cliente' : 'Agregar Cliente')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddClientModal;
