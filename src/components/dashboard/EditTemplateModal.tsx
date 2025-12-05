'use client';

import { useState, useEffect } from 'react';
import styles from './EditTemplateModal.module.css';

export interface Template {
  id?: string;
  category: string;
  type: 'email' | 'whatsapp';
  subject?: string;
  body: string;
}

interface EditTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (savedTemplate: Template) => void;
  category: string;
  type: 'email' | 'whatsapp';
  initialTemplate?: Omit<Template, 'category' | 'type'> | null;
}

const EditTemplateModal = ({ isOpen, onClose, onSave, category, type, initialTemplate }: EditTemplateModalProps) => {
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const typeText = type === 'email' ? 'Email' : 'WhatsApp';
  const categoryText = {
    birthday: 'Cumpleaños',
    policy_issuance: 'Expedición de Póliza',
    policy_expiration: 'Vencimiento de Póliza',
    billing: 'Cobro',
  }[category] || 'General';

  useEffect(() => {
    if (isOpen) {
      setSubject(initialTemplate?.subject || '');
      setBody(initialTemplate?.body || '');
      setError('');
      setIsLoading(false);
    }
  }, [isOpen, initialTemplate]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (type === 'email' && !subject) {
      setError('El asunto es obligatorio para los correos.');
      return;
    }
    if (!body) {
      setError('El contenido no puede estar vacío.');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/templates', {
        method: 'POST', // This is an UPSERT operation on the backend
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ category, type, subject, body }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al guardar la plantilla.');
      }

      const savedTemplate = await response.json();
      onSave(savedTemplate);
      onClose();

    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeButton} onClick={onClose}>&times;</button>
        <form className={styles.form} onSubmit={handleSave}>
          <h2>Editar Plantilla de {typeText}</h2>
          <p className={styles.categoryLabel}>Categoría: {categoryText}</p>
          
          {type === 'email' && (
            <div className={styles.formGroup}>
              <label htmlFor="subject">Asunto del Correo</label>
              <input
                id="subject"
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Ej: ¡Feliz cumpleaños, {{nombreCompleto}}!"
                disabled={isLoading}
              />
            </div>
          )}

          <div className={styles.formGroup}>
            <label htmlFor="body">Contenido del Mensaje</label>
            <textarea
              id="body"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Escribe el contenido de tu plantilla aquí. Puedes usar variables como {{nombreCompleto}}."
              disabled={isLoading}
            />
             <p className={styles.variableInfo}>Variables disponibles: <code>{`{{nombreCompleto}}`}</code>, <code>{`{{fechaTerminacionVigencia}}`}</code>, etc.</p>
          </div>

          {error && <p className={styles.error}>{error}</p>}

          <button type="submit" className={styles.submitButton} disabled={isLoading}>
            {isLoading ? 'Guardando...' : 'Guardar Plantilla'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditTemplateModal;
