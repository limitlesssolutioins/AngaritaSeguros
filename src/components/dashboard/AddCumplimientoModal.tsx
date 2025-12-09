'use client';
import { useState, useEffect, useCallback } from 'react';
import styles from './AddCumplimientoModal.module.css';
import CreatableSelect from '@/components/ui/CreatableSelect';
import Dropzone from '@/components/ui/Dropzone';
import { FaSearch, FaUser } from 'react-icons/fa'; // Import icons

// This interface should ideally be shared from a common types file
interface Policy {
  id?: string;
  etiquetaOficina?: string;
  etiquetaCliente?: string;
  clientNombreCompleto?: string;
  clientNumeroIdentificacion?: string;
  tipoIdentificacion?: string;
  fechaExpedicion?: string;
  fechaInicioVigencia?: string;
  fechaTerminacionVigencia?: string;
  aseguradora?: string;
  valorPrimaNeta?: number;
  valorTotalAPagar?: number;
  numeroPoliza?: string;
  numeroAnexos?: number;
  tipoPoliza?: string;
}

interface Option {
  value: string;
  label: string;
}

// Client interface from client list, but simplified for this use
interface Client {
  id: string;
  nombreCompleto: string;
  tipoIdentificacion: string;
  numeroIdentificacion: string;
}

interface AddCumplimientoModalProps {
  onClose: () => void;
  initialData?: Partial<Policy> | null;
  policyToEdit?: Policy | null;
}

const AddCumplimientoModal: React.FC<AddCumplimientoModalProps> = ({ onClose, initialData, policyToEdit }) => {
  const isEditMode = !!policyToEdit;

  const [formData, setFormData] = useState({
    clientNombreCompleto: '',
    clientNumeroIdentificacion: '',
    tipoIdentificacion: '',
    fechaExpedicion: new Date().toISOString().split('T')[0],
    fechaInicioVigencia: '',
    fechaTerminacionVigencia: '',
    valorPrimaNeta: '',
    valorTotalAPagar: '',
    numeroPoliza: '',
    numeroAnexos: '',
    tipoPoliza: '',
  });
  // const [etiquetaOficina, setEtiquetaOficina] = useState<Option | null>(null); // Removed manual office selection
  const [etiquetaCliente, setEtiquetaCliente] = useState<Option | null>(null);
  const [aseguradora, setAseguradora] = useState<Option | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // State for client lookup
  const [clientSearchLoading, setClientSearchLoading] = useState(false);
  const [clientSearchError, setClientSearchError] = useState<string | null>(null);
  const [clientSearchMessage, setClientSearchMessage] = useState<string | null>(null);
  const [foundClientData, setFoundClientData] = useState<Client | null>(null);
  const [userOffice, setUserOffice] = useState<string>(''); // State for user office

  useEffect(() => {
    // Fetch current user info to get office
    const fetchUserOffice = async () => {
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const userData = await res.json();
          setUserOffice(userData.office || '');
        }
      } catch (err) {
        console.error("Error fetching user info", err);
      }
    };
    fetchUserOffice();
  }, []);

  useEffect(() => {
    const data = policyToEdit || initialData;
    if (data) {
      setFormData(prev => ({
        ...prev,
        clientNombreCompleto: data.clientNombreCompleto || '',
        clientNumeroIdentificacion: data.clientNumeroIdentificacion || '',
        tipoIdentificacion: data.tipoIdentificacion || '',
        numeroPoliza: data.numeroPoliza || '',
        valorPrimaNeta: data.valorPrimaNeta?.toString() || '',
        valorTotalAPagar: data.valorTotalAPagar?.toString() || '',
        fechaExpedicion: data.fechaExpedicion ? new Date(data.fechaExpedicion).toISOString().split('T')[0] : prev.fechaExpedicion,
        fechaInicioVigencia: data.fechaInicioVigencia ? new Date(data.fechaInicioVigencia).toISOString().split('T')[0] : prev.fechaInicioVigencia,
        fechaTerminacionVigencia: data.fechaTerminacionVigencia ? new Date(data.fechaTerminacionVigencia).toISOString().split('T')[0] : prev.fechaTerminacionVigencia,
        numeroAnexos: data.numeroAnexos?.toString() || '',
        tipoPoliza: data.tipoPoliza || '',
      }));

      if (data.aseguradora) {
        setAseguradora({ value: data.aseguradora, label: data.aseguradora });
      }
      // if (data.etiquetaOficina) { // Removed manual office selection
      //   setEtiquetaOficina({ value: data.etiquetaOficina, label: data.etiquetaOficina });
      // }
      if (data.etiquetaCliente) {
        setEtiquetaCliente({ value: data.etiquetaCliente, label: data.etiquetaCliente });
      }

      // If initial data has client ID, we should try to fetch the full client data
      if (data.clientNumeroIdentificacion) {
        handleNumeroIdentificacionChange({
            target: {
                id: 'clientNumeroIdentificacion',
                value: data.clientNumeroIdentificacion
            }
        } as React.ChangeEvent<HTMLInputElement>);
      }
    }
  }, [initialData, policyToEdit]);


  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const debounce = (func: (...args: any[]) => void, delay: number) => {
    let timeout: NodeJS.Timeout;
    return (...args: any[]) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), delay);
    };
  };

  const searchClient = useCallback(debounce(async (numeroIdentificacion: string) => {
    setClientSearchMessage(null); // Clear previous messages
    if (!numeroIdentificacion) {
      setFoundClientData(null);
      // setFormData(prev => ({ ...prev, clientNombreCompleto: '', tipoIdentificacion: '' })); // Optional: keep or clear
      setClientSearchError(null);
      return;
    }

    setClientSearchLoading(true);
    setClientSearchError(null);
    try {
      const res = await fetch(`/api/clients?numeroIdentificacion=${numeroIdentificacion}`);
      if (!res.ok) {
        throw new Error('Error al buscar cliente');
      }
      const data: Client[] = await res.json();
      if (data.length > 0) {
        setFoundClientData(data[0]);
        setFormData(prev => ({ 
            ...prev, 
            clientNombreCompleto: data[0].nombreCompleto, 
            tipoIdentificacion: data[0].tipoIdentificacion 
        }));
      } else {
        setFoundClientData(null);
        setClientSearchMessage('Cliente no encontrado. Ingrese los datos para crear uno nuevo.'); // Set info message
        // If client is not found, retain the nombreCompleto and tipoIdentificacion from initialData/formData
      }
    } catch (err: any) {
      setClientSearchError(err.message);
      setFoundClientData(null);
    } finally {
      setClientSearchLoading(false);
    }
  }, 500), [initialData, policyToEdit]); // Removed dependency on formData.clientNombreCompleto to prevent loops


  const handleNumeroIdentificacionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setFormData(prev => ({ ...prev, clientNumeroIdentificacion: value }));
    searchClient(value);
  };

  const handleCreateOption = async (inputValue: string): Promise<Option> => {
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

    if (!etiquetaCliente || !formData.clientNombreCompleto || !formData.clientNumeroIdentificacion || !formData.tipoIdentificacion || !aseguradora || !formData.numeroPoliza) {
      setError('Los campos Etiqueta Cliente, Nombre del Tomador, Tipo y Número de Identificación, Aseguradora y Número de Póliza son obligatorios.');
      return;
    }

    setIsSubmitting(true);
    try {
      const data = new FormData();
      // if(etiquetaOficina) data.append('etiquetaOficina', etiquetaOficina.label); // Removed manual office
      data.append('etiquetaCliente', etiquetaCliente.label);
      data.append('tomadorPoliza', formData.clientNombreCompleto); // Send client's full name
      data.append('numeroIdentificacion', formData.clientNumeroIdentificacion); // Send identification number
      data.append('tipoIdentificacion', formData.tipoIdentificacion); // Send identification type

      // If a client was found, include its ID
      if (foundClientData?.id) {
        data.append('clientId', foundClientData.id);
      }
      
      data.append('fechaExpedicion', formData.fechaExpedicion);
      data.append('fechaInicioVigencia', formData.fechaInicioVigencia);
      data.append('fechaTerminacionVigencia', formData.fechaTerminacionVigencia);
      data.append('aseguradora', aseguradora.label);
      data.append('valorPrimaNeta', formData.valorPrimaNeta);
      data.append('valorTotalAPagar', formData.valorTotalAPagar);
      data.append('numeroPoliza', formData.numeroPoliza);
      data.append('numeroAnexos', formData.numeroAnexos);
      data.append('tipoPoliza', formData.tipoPoliza);

      if (!isEditMode) {
        files.forEach(file => {
          data.append('files', file);
        });
      }

      const url = isEditMode ? `/api/cumplimiento/${policyToEdit?.id}` : '/api/cumplimiento';
      const method = isEditMode ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method: method,
        body: data,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Error al ${isEditMode ? 'actualizar' : 'crear'} la póliza`);
      }

      alert(`Póliza ${isEditMode ? 'actualizada' : 'creada'} exitosamente`);
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
          <h2>{isEditMode ? 'Editar' : 'Crear'} Póliza de Cumplimiento</h2>
          <button onClick={onClose} className={styles.closeButton}>&times;</button>
        </div>
        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.formRow}>
             {/* Re-added Etiqueta Oficina as Read-Only */}
            <div className={styles.formGroup}>
                <label htmlFor="userOffice">Etiqueta (Oficina)</label>
                <input 
                  type="text" 
                  id="userOffice" 
                  value={userOffice} 
                  readOnly 
                  className={styles.readOnlyInput} 
                  placeholder="Cargando oficina..."
                />
            </div>
            <div className={styles.formGroup}>
                <label htmlFor="etiquetaCliente">Etiqueta (Cliente)</label>
                <CreatableSelect
                    apiUrl="/api/etiquetas"
                    value={etiquetaCliente}
                    onChange={setEtiquetaCliente}
                    onCreate={handleCreateOption}
                    placeholder="Selecciona o crea..."
                />
            </div>
          </div>
          
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label htmlFor="clientNumeroIdentificacion">Número de Identificación del Tomador</label>
              <div className={styles.inputWithIcon}>
                <FaSearch className={styles.inputIcon} />
                <input type="text" id="clientNumeroIdentificacion" value={formData.clientNumeroIdentificacion} onChange={handleNumeroIdentificacionChange} />
              </div>
              {clientSearchLoading && <p className={styles.searchStatus}>Buscando cliente...</p>}
              {clientSearchError && <p className={styles.searchError}>{clientSearchError}</p>}
              {clientSearchMessage && <p className={styles.searchInfo}>{clientSearchMessage}</p>}
            </div>
            <div className={styles.formGroup}>
                <label htmlFor="clientNombreCompleto">Nombre Completo del Tomador</label>
                <div className={styles.inputWithIcon}>
                  <FaUser className={styles.inputIcon} />
                  <input
                    type="text"
                    id="clientNombreCompleto"
                    value={formData.clientNombreCompleto} // CHANGED: Always reflect formData
                    onChange={handleChange}
                    readOnly={!!foundClientData}
                    className={foundClientData ? styles.readOnlyInput : ''}
                  />
                </div>
            </div>
          </div>
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label htmlFor="tipoIdentificacion">Tipo de Identificación del Tomador</label>
              <select 
                id="tipoIdentificacion" 
                value={formData.tipoIdentificacion} // CHANGED: Always reflect formData
                onChange={handleChange} 
                disabled={!!foundClientData}
                className={foundClientData ? styles.readOnlyInput : ''}
              >
                <option value="">Selecciona...</option>
                <option value="CC">Cédula de Ciudadanía</option>
                <option value="NIT">NIT</option>
                <option value="CE">Cédula de Extranjería</option>
                <option value="PA">Pasaporte</option>
              </select>
            </div>
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
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label htmlFor="numeroPoliza">Número de Póliza</label>
              <input type="text" id="numeroPoliza" value={formData.numeroPoliza} onChange={handleChange} />
            </div>
            <div className={styles.formGroup}>
                <label htmlFor="tipoPoliza">Tipo de Póliza</label>
                <input type="text" id="tipoPoliza" value={formData.tipoPoliza} onChange={handleChange} />
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
              <label htmlFor="valorPrimaNeta">Valor Prima Neta</label>
              <input type="number" id="valorPrimaNeta" value={formData.valorPrimaNeta} onChange={handleChange} />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="valorTotalAPagar">Valor Total a Pagar</label>
              <input type="number" id="valorTotalAPagar" value={formData.valorTotalAPagar} onChange={handleChange} />
            </div>
             <div className={styles.formGroup}>
                <label htmlFor="numeroAnexos">No. Anexo</label>
                <input type="number" id="numeroAnexos" value={formData.numeroAnexos} onChange={handleChange} />
            </div>
          </div>

          {!isEditMode && (
            <div className={styles.formGroup}>
              <label>Adjuntar Archivos</label>
              <Dropzone onFilesAccepted={setFiles} />
            </div>
          )}

          {error && <p className={styles.errorText}>{error}</p>}

          <div className={styles.formActions}>
            <button type="button" onClick={onClose} className={styles.cancelButton} disabled={isSubmitting}>Cancelar</button>
            <button type="submit" className={styles.saveButton} disabled={isSubmitting}>
              {isSubmitting ? 'Guardando...' : (isEditMode ? 'Actualizar' : 'Guardar')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddCumplimientoModal;