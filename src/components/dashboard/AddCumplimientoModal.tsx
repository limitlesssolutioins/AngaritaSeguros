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
  fechaInicioVigencia?: string;
  fechaTerminacionVigencia?: string;
  aseguradora?: string;
  valorPrimaNeta?: number;
  valorTotalAPagar?: number;
  numeroPoliza?: string;
  numeroAnexos?: number;
  tipoAmparo?: string;
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
    fechaInicioVigencia: '',
    fechaTerminacionVigencia: '',
    valorPrimaNeta: '',
    valorTotalAPagar: '',
    numeroPoliza: '',
    numeroAnexos: '',
    tipoAmparo: '',
  });
  const [etiqueta, setEtiqueta] = useState<Option | null>(null);
  const [aseguradora, setAseguradora] = useState<Option | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setFormData(prev => ({
        ...prev,
        titularPoliza: initialData.titularPoliza || '',
        numeroPoliza: initialData.numeroPoliza || '',
        valorPrimaNeta: initialData.valorPrimaNeta?.toString() || '',
        valorTotalAPagar: initialData.valorTotalAPagar?.toString() || '',
        fechaExpedicion: initialData.fechaExpedicion ? new Date(initialData.fechaExpedicion).toISOString().split('T')[0] : prev.fechaExpedicion,
        fechaInicioVigencia: initialData.fechaInicioVigencia ? new Date(initialData.fechaInicioVigencia).toISOString().split('T')[0] : prev.fechaInicioVigencia,
        fechaTerminacionVigencia: initialData.fechaTerminacionVigencia ? new Date(initialData.fechaTerminacionVigencia).toISOString().split('T')[0] : prev.fechaTerminacionVigencia,
        numeroAnexos: initialData.numeroAnexos?.toString() || '',
        tipoAmparo: initialData.tipoAmparo || '',
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

    // Basic validation for new fields
    if (!etiqueta || !formData.titularPoliza || !formData.fechaExpedicion || !formData.fechaInicioVigencia || !formData.fechaTerminacionVigencia || !aseguradora || !formData.valorPrimaNeta || !formData.valorTotalAPagar || !formData.numeroPoliza || !formData.tipoAmparo) {
      setError('Todos los campos son obligatorios.');
      return;
    }

    setIsSubmitting(true);
    try {
      const data = new FormData();
      data.append('etiqueta', etiqueta.label);
      data.append('titularPoliza', formData.titularPoliza);
      data.append('fechaExpedicion', formData.fechaExpedicion);
      data.append('fechaInicioVigencia', formData.fechaInicioVigencia);
      data.append('fechaTerminacionVigencia', formData.fechaTerminacionVigencia);
      data.append('aseguradora', aseguradora.label);
      data.append('valorPrimaNeta', formData.valorPrimaNeta);
      data.append('valorTotalAPagar', formData.valorTotalAPagar);
      data.append('numeroPoliza', formData.numeroPoliza);
      data.append('numeroAnexos', formData.numeroAnexos);
      data.append('tipoAmparo', formData.tipoAmparo);

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
              <label htmlFor="fechaInicioVigencia">Fecha Inicio Vigencia</label>
              <input type="date" id="fechaInicioVigencia" value={formData.fechaInicioVigencia} onChange={handleChange} />
            </div>
             <div className={styles.formGroup}>
              <label htmlFor="fechaTerminacionVigencia">Fecha Fin Vigencia</label>
              <input type="date" id="fechaTerminacionVigencia" value={formData.fechaTerminacionVigencia} onChange={handleChange} />
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
              <label htmlFor="valorTotalAPagar">Valor Total a Pagar</label>
              <input type="number" id="valorTotalAPagar" value={formData.valorTotalAPagar} onChange={handleChange} />
            </div>
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label htmlFor="numeroAnexos">Número de Anexos</label>
              <input type="number" id="numeroAnexos" value={formData.numeroAnexos} onChange={handleChange} />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="tipoAmparo">Tipo de Amparo</label>
              <input type="text" id="tipoAmparo" value={formData.tipoAmparo} onChange={handleChange} />
            </div>
          </div>

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