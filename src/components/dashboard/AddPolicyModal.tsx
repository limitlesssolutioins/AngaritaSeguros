'use client';
import { useState, useEffect, useCallback } from 'react';
import styles from './AddPolicyModal.module.css';
import CreatableSelect from '@/components/ui/CreatableSelect';
import Dropzone from '@/components/ui/Dropzone';
import { FaSearch, FaUser } from 'react-icons/fa'; // Import icons

// Define the structure of a general policy (duplicated for clarity, ideally shared)
interface GeneralPolicy {
  id?: string;
  etiquetaOficina?: string;
  etiquetaCliente?: string;
  aseguradora?: string;
  clientNombreCompleto?: string;
  clientTipoIdentificacion?: string;
  clientNumeroIdentificacion?: string;
  ramo?: string;
  numeroPoliza?: string;
  fechaExpedicion?: string;
  fechaInicio?: string;
  fechaFinVigencia?: string;
  placa?: string;
  valorPrimaNeta?: number;
  valorTotalAPagar?: number;
  financiado?: boolean;
  financiera?: string;
  files?: string[];
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

interface AddPolicyModalProps {
  onClose: () => void;
  initialData?: Partial<GeneralPolicy> | null;
  policyToEdit?: GeneralPolicy | null;
}

const AddPolicyModal: React.FC<AddPolicyModalProps> = ({ onClose, initialData, policyToEdit }) => {
  const isEditMode = !!policyToEdit;

  const [formData, setFormData] = useState({
    clientNombreCompleto: '',
    clientTipoIdentificacion: '',
    clientNumeroIdentificacion: '',
    numeroPoliza: '',
    fechaExpedicion: new Date().toISOString().split('T')[0],
    fechaInicio: '',
    fechaFinVigencia: '',
    placa: '',
    valorPrimaNeta: '',
    valorTotalAPagar: '',
    financiado: false,
    financiera: '',
  });
  const [etiquetaCliente, setEtiquetaCliente] = useState<Option | null>(null);
  const [aseguradora, setAseguradora] = useState<Option | null>(null);
  const [ramo, setRamo] = useState<Option | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // State for client lookup
  const [clientSearchLoading, setClientSearchLoading] = useState(false);
  const [clientSearchError, setClientSearchError] = useState<string | null>(null);
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
        clientTipoIdentificacion: data.clientTipoIdentificacion || '',
        clientNumeroIdentificacion: data.clientNumeroIdentificacion || '',
        numeroPoliza: data.numeroPoliza || '',
        fechaExpedicion: data.fechaExpedicion ? new Date(data.fechaExpedicion).toISOString().split('T')[0] : prev.fechaExpedicion,
        fechaInicio: data.fechaInicio ? new Date(data.fechaInicio).toISOString().split('T')[0] : prev.fechaInicio,
        fechaFinVigencia: data.fechaFinVigencia ? new Date(data.fechaFinVigencia).toISOString().split('T')[0] : prev.fechaFinVigencia,
        placa: data.placa || '',
        valorPrimaNeta: data.valorPrimaNeta?.toString() || '',
        valorTotalAPagar: data.valorTotalAPagar?.toString() || '',
        financiado: data.financiado || false,
        financiera: data.financiera || '',
      }));

      // if (data.etiquetaOficina) { // Removed manual office selection
      //   setEtiquetaOficina({ value: data.etiquetaOficina, label: data.etiquetaOficina });
      // }
      if (data.etiquetaCliente) {
        setEtiquetaCliente({ value: data.etiquetaCliente, label: data.etiquetaCliente });
      }
      if (data.aseguradora) {
        setAseguradora({ value: data.aseguradora, label: data.aseguradora });
      }
      if (data.ramo) {
        setRamo({ value: data.ramo, label: data.ramo });
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
    const { id, value, type, checked } = e.target as HTMLInputElement;
    setFormData((prev) => ({ ...prev, [id]: type === 'checkbox' ? checked : value }));
  };

  const debounce = (func: (...args: any[]) => void, delay: number) => {
    let timeout: NodeJS.Timeout;
    return (...args: any[]) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), delay);
    };
  };

  const searchClient = useCallback(debounce(async (numeroIdentificacion: string) => {
    if (!numeroIdentificacion) {
      setFoundClientData(null);
      setFormData(prev => ({ ...prev, clientNombreCompleto: '' }));
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
        setFormData(prev => ({ ...prev, clientNombreCompleto: data[0].nombreCompleto, clientTipoIdentificacion: data[0].tipoIdentificacion }));
      } else {
        setFoundClientData(null);
        // Only clear if the user hasn't typed anything else into nombreCompleto
        if (formData.clientNombreCompleto === (initialData?.clientNombreCompleto || policyToEdit?.clientNombreCompleto || '')) {
            setFormData(prev => ({ ...prev, clientNombreCompleto: '' }));
        }
      }
    } catch (err: any) {
      setClientSearchError(err.message);
      setFoundClientData(null);
    } finally {
      setClientSearchLoading(false);
    }
  }, 500), [formData.clientNombreCompleto, initialData, policyToEdit]);


  const handleNumeroIdentificacionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setFormData(prev => ({ ...prev, clientNumeroIdentificacion: value }));
    searchClient(value);
  };

  const handleCreateOption = async (apiUrl: string, inputValue: string): Promise<Option> => {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: inputValue }),
    });
    if (!response.ok) {
      throw new Error(`Error al crear la opción en ${apiUrl}`);
    }
    const newOption = await response.json();
    return { value: newOption.id, label: newOption.name };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Basic validation
    if (!userOffice || !etiquetaCliente || !aseguradora || !ramo || !formData.clientNombreCompleto || !formData.clientTipoIdentificacion || !formData.clientNumeroIdentificacion || !formData.numeroPoliza || !formData.fechaExpedicion || !formData.fechaInicio || !formData.fechaFinVigencia || !formData.valorPrimaNeta || !formData.valorTotalAPagar || (formData.financiado && !formData.financiera)) {
      if (!userOffice) {
        setError('No se pudo cargar la información de la oficina. Por favor, recargue la página.');
      } else {
        setError('Por favor, complete todos los campos obligatorios.');
      }
      return;
    }

    setIsSubmitting(true);
    try {
      const data = new FormData();
      if (userOffice) {
          data.append('etiquetaOficina', userOffice);
      }
      data.append('etiquetaCliente', etiquetaCliente.label);
      data.append('aseguradora', aseguradora.label);
      
      data.append('nombreRazonSocial', formData.clientNombreCompleto);
      data.append('tipoIdentificacion', formData.clientTipoIdentificacion);
      data.append('numeroIdentificacion', formData.clientNumeroIdentificacion);

      // Append found clientId if exists
      if (foundClientData?.id) {
        data.append('clientId', foundClientData.id);
      }
      
      data.append('ramo', ramo.label);
      data.append('numeroPoliza', formData.numeroPoliza);
      data.append('fechaExpedicion', formData.fechaExpedicion);
      data.append('fechaInicio', formData.fechaInicio);
      data.append('fechaFinVigencia', formData.fechaFinVigencia);
      data.append('placa', formData.placa || '');
      data.append('valorPrimaNeta', formData.valorPrimaNeta);
      data.append('valorTotalAPagar', formData.valorTotalAPagar);
      data.append('financiado', formData.financiado.toString());
      data.append('financiera', formData.financiera || '');

      if (!isEditMode) {
        files.forEach(file => {
          data.append('files', file);
        });
      }

      const url = isEditMode ? `/api/policies/${policyToEdit?.id}` : '/api/policies';
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
          <h2>{isEditMode ? 'Editar' : 'Crear'} Póliza General</h2>
          <button onClick={onClose} className={styles.closeButton}>&times;</button>
        </div>
        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.formRow}>
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
                onCreate={(inputValue) => handleCreateOption('/api/etiquetas', inputValue)}
                placeholder="Selecciona o escribe para crear..."
              />
            </div>
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label htmlFor="aseguradora">Aseguradora</label>
              <CreatableSelect
                apiUrl="/api/aseguradoras"
                value={aseguradora}
                onChange={setAseguradora}
                onCreate={(inputValue) => handleCreateOption('/api/aseguradoras', inputValue)}
                placeholder="Selecciona o escribe para crear..."
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="ramo">Ramo</label>
              <CreatableSelect
                apiUrl="/api/ramos"
                value={ramo}
                onChange={setRamo}
                onCreate={(inputValue) => handleCreateOption('/api/ramos', inputValue)}
                placeholder="Selecciona o escribe para crear..."
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
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="clientNombreCompleto">Nombre Completo / Razón Social del Tomador</label>
              <div className={styles.inputWithIcon}>
                <FaUser className={styles.inputIcon} />
                <input
                  type="text"
                  id="clientNombreCompleto"
                  placeholder="Ej: Juan Pérez"
                  value={foundClientData?.nombreCompleto || formData.clientNombreCompleto}
                  onChange={handleChange}
                  readOnly={!!foundClientData}
                  className={foundClientData ? styles.readOnlyInput : ''}
                />
              </div>
            </div>
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label htmlFor="clientTipoIdentificacion">Tipo de Identificación del Tomador</label>
              <select id="clientTipoIdentificacion" value={formData.clientTipoIdentificacion} onChange={handleChange} disabled={!!foundClientData}>
                <option value="">Selecciona</option>
                <option value="CC">Cédula de Ciudadanía</option>
                <option value="NIT">NIT</option>
                <option value="CE">Cédula de Extranjería</option>
                <option value="PA">Pasaporte</option>
              </select>
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="numeroPoliza">Número de Póliza</label>
              <input type="text" id="numeroPoliza" value={formData.numeroPoliza} onChange={handleChange} />
            </div>
          </div>
          

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label htmlFor="fechaExpedicion">Fecha de Expedición</label>
              <input type="date" id="fechaExpedicion" value={formData.fechaExpedicion} onChange={handleChange} />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="fechaInicio">Fecha Inicio Vigencia</label>
              <input type="date" id="fechaInicio" value={formData.fechaInicio} onChange={handleChange} />
            </div>
             <div className={styles.formGroup}>
              <label htmlFor="fechaFinVigencia">Fecha Fin Vigencia</label>
              <input type="date" id="fechaFinVigencia" value={formData.fechaFinVigencia} onChange={handleChange} />
            </div>
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label htmlFor="placa">Placa (Solo para Vehículos)</label>
              <input type="text" id="placa" value={formData.placa} onChange={handleChange} />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="valorPrimaNeta">Valor Prima Neta</label>
              <input type="number" id="valorPrimaNeta" value={formData.valorPrimaNeta} onChange={handleChange} />
            </div>
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label htmlFor="valorTotalAPagar">Valor Total a Pagar</label>
              <input type="number" id="valorTotalAPagar" value={formData.valorTotalAPagar} onChange={handleChange} />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="financiado">Financiado</label>
              <input type="checkbox" id="financiado" checked={formData.financiado} onChange={handleChange} />
            </div>
          </div>

          {formData.financiado && (
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label htmlFor="financiera">Financiera</label>
                <input type="text" id="financiera" value={formData.financiera} onChange={handleChange} />
              </div>
            </div>
          )}

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

export default AddPolicyModal;