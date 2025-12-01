import { useState, useEffect } from 'react';
import styles from './AddCumplimientoModal.module.css';
import CreatableSelect from '@/components/ui/CreatableSelect';
import Dropzone from '@/components/ui/Dropzone';

// This interface should ideally be shared from a common types file
interface Policy {
  id?: string;
  etiqueta?: string;
  titularPoliza?: string;
  fechaExpedicion?: string;
  fechaVencimiento?: string;
  aseguradora?: string;
  valorPrimaNeta?: number;
  valorTotalAsegurado?: number;
  numeroPoliza?: string;
}

interface Option {
  value: string;
  label: string;
}

interface AddCumplimientoModalProps {
  onClose: () => void;
  initialData?: Partial<Policy> | null;
}

const AddCumplimientoModal: React.FC<AddCumplimientoModalProps> = ({ onClose, initialData }) => {
  const [formData, setFormData] = useState({
    titularPoliza: '',
    fechaExpedicion: new Date().toISOString().split('T')[0],
    fechaVencimiento: '',
    valorPrimaNeta: '',
    valorTotalAsegurado: '',
    numeroPoliza: '',
  });
  const [etiqueta, setEtiqueta] = useState<Option | null>(null);
  const [aseguradora, setAseguradora] = useState<Option | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [hasRCE, setHasRCE] = useState(false);
  const [numeroRCE, setNumeroRCE] = useState('');
  const [valorRCE, setValorRCE] = useState('');

  useEffect(() => {
    if (initialData) {
      setFormData(prev => ({
        ...prev,
        titularPoliza: initialData.titularPoliza || '',
        numeroPoliza: initialData.numeroPoliza || '',
        valorPrimaNeta: initialData.valorPrimaNeta?.toString() || '',
        valorTotalAsegurado: initialData.valorTotalAsegurado?.toString() || '',
        fechaExpedicion: initialData.fechaExpedicion ? new Date(initialData.fechaExpedicion).toISOString().split('T')[0] : prev.fechaExpedicion,
        fechaVencimiento: initialData.fechaVencimiento ? new Date(initialData.fechaVencimiento).toISOString().split('T')[0] : prev.fechaVencimiento,
      }));

      if (initialData.aseguradora) {
        setAseguradora({ value: initialData.aseguradora, label: initialData.aseguradora });
      }
      if (initialData.etiqueta) {
        setEtiqueta({ value: initialData.etiqueta, label: initialData.etiqueta });
      }
    }
  }, [initialData]);


  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleCreateEtiqueta = async (inputValue: string): Promise<Option> => {
    const response = await fetch('/api/etiquetas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: inputValue }),
    });
    if (!response.ok) {
      throw new Error('Error al crear la etiqueta');
    }
    const newEtiqueta = await response.json();
    return { value: newEtiqueta.id, label: newEtiqueta.name };
  };

  const handleCreateAseguradora = async (inputValue: string): Promise<Option> => {
    const response = await fetch('/api/aseguradoras', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: inputValue }),
    });
    if (!response.ok) {
      throw new Error('Error al crear la aseguradora');
    }
    const newAseguradora = await response.json();
    return { value: newAseguradora.id, label: newAseguradora.name };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!etiqueta || !formData.titularPoliza || !formData.fechaExpedicion || !formData.fechaVencimiento || !aseguradora || !formData.valorPrimaNeta || !formData.valorTotalAsegurado || !formData.numeroPoliza) {
      setError('Todos los campos obligatorios (excepto RCE si no aplica).');
      return;
    }

    if (hasRCE && (!numeroRCE || !valorRCE)) {
      setError('Por favor, complete los campos de RCE.');
      return;
    }

    setIsSubmitting(true);
    try {
      const data = new FormData();
      data.append('etiqueta', etiqueta.label);
      data.append('titularPoliza', formData.titularPoliza);
      data.append('fechaExpedicion', formData.fechaExpedicion);
      data.append('fechaVencimiento', formData.fechaVencimiento);
      data.append('aseguradora', aseguradora.label);
      data.append('valorPrimaNeta', formData.valorPrimaNeta);
      data.append('valorTotalAsegurado', formData.valorTotalAsegurado);
      data.append('numeroPoliza', formData.numeroPoliza);
      if (hasRCE) {
        data.append('hasRCE', 'true');
        data.append('numeroRCE', numeroRCE);
        data.append('valorRCE', valorRCE);
      }
      files.forEach(file => {
        data.append('files', file);
      });

      const response = await fetch('/api/cumplimiento', {
        method: 'POST',
        body: data,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al crear la póliza');
      }

      alert('Póliza creada exitosamente');
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
          <h2>Crear Póliza de Cumplimiento</h2>
          <button onClick={onClose} className={styles.closeButton}>&times;</button>
        </div>
        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label htmlFor="etiqueta">Etiqueta (Cliente)</label>
              <CreatableSelect
                apiUrl="/api/etiquetas"
                value={etiqueta}
                onChange={setEtiqueta}
                onCreate={handleCreateEtiqueta}
                placeholder="Selecciona o escribe para crear..."
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="titularPoliza">Titular de la Póliza</label>
              <input type="text" id="titularPoliza" placeholder="Ej: CARLOS MENA" value={formData.titularPoliza} onChange={handleChange} />
            </div>
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label htmlFor="fechaExpedicion">Fecha de Expedición</label>
              <input type="date" id="fechaExpedicion" value={formData.fechaExpedicion} onChange={handleChange} />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="fechaVencimiento">Fecha de Vencimiento</label>
              <input type="date" id="fechaVencimiento" value={formData.fechaVencimiento} onChange={handleChange} />
            </div>
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label htmlFor="aseguradora">Aseguradora</label>
              <CreatableSelect
                apiUrl="/api/aseguradoras"
                value={aseguradora}
                onChange={setAseguradora}
                onCreate={handleCreateAseguradora}
                placeholder="Selecciona o escribe para crear..."
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="numeroPoliza">Número de Póliza</label>
              <input type="text" id="numeroPoliza" value={formData.numeroPoliza} onChange={handleChange} />
            </div>
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label htmlFor="valorPrimaNeta">Valor Prima Neta</label>
              <input type="number" id="valorPrimaNeta" value={formData.valorPrimaNeta} onChange={handleChange} />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="valorTotalAsegurado">Valor Total Asegurado</label>
              <input type="number" id="valorTotalAsegurado" value={formData.valorTotalAsegurado} onChange={handleChange} />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="hasRCE" className={styles.checkboxLabel}>
              <input
                type="checkbox"
                id="hasRCE"
                checked={hasRCE}
                onChange={(e) => setHasRCE(e.target.checked)}
                className={styles.checkboxInput}
              />
              ¿Tiene RCE?
            </label>
          </div>

          {hasRCE && (
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label htmlFor="numeroRCE">Número de RCE</label>
                <input type="text" id="numeroRCE" value={numeroRCE} onChange={(e) => setNumeroRCE(e.target.value)} />
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="valorRCE">Valor de RCE</label>
                <input type="number" id="valorRCE" value={valorRCE} onChange={(e) => setValorRCE(e.target.value)} />
              </div>
            </div>
          )}

          <div className={styles.formGroup}>
            <label>Adjuntar Archivos</label>
            <Dropzone onFilesAccepted={setFiles} />
          </div>

          {error && <p className={styles.errorText}>{error}</p>}

          <div className={styles.formActions}>
            <button type="button" onClick={onClose} className={styles.cancelButton} disabled={isSubmitting}>Cancelar</button>
            <button type="submit" className={styles.saveButton} disabled={isSubmitting}>
              {isSubmitting ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddCumplimientoModal;
