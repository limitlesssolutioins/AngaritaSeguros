'use client';
import { useState, useEffect } from 'react';
import styles from './PolicyModule.module.css'; // Using a new styles file for PolicyModule
import AddPolicyModal from './AddPolicyModal';
import GeneralPolicyList from './GeneralPolicyList';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import Dropzone from '../ui/Dropzone'; // Import Dropzone

// Define the structure of a general policy
interface GeneralPolicy {
  id: string;
  etiquetaOficina: string;
  etiquetaCliente: string;
  aseguradora: string;
  clientNombreCompleto: string; // New: comes from Client table join
  clientTipoIdentificacion: string; // New: comes from Client table join
  clientNumeroIdentificacion: string; // New: comes from Client table join
  ramo: string;
  numeroPoliza: string;
  fechaExpedicion: string;
  fechaInicio: string;
  fechaFinVigencia: string;
  placa?: string;
  valorPrimaNeta: number;
  valorTotalAPagar: number;
  financiado: boolean;
  financiera?: string;
  files?: string[];
}

const PolicyModule = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [policies, setPolicies] = useState<GeneralPolicy[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // State for AI extraction
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractedData, setExtractedData] = useState<Partial<GeneralPolicy> | null>(null);
  const [debugText, setDebugText] = useState<string>('');
  const [policyToEdit, setPolicyToEdit] = useState<GeneralPolicy | null>(null);

  // State for filters
  const [etiquetas, setEtiquetas] = useState<any[]>([]); // Assuming these are "Etiqueta Cliente"
  const [aseguradoras, setAseguradoras] = useState<any[]>([]);
  const [ramos, setRamos] = useState<any[]>([]);
  const [filterEtiqueta, setFilterEtiqueta] = useState('');
  const [filterAseguradora, setFilterAseguradora] = useState('');
  const [filterRamo, setFilterRamo] = useState('');

  const fetchPolicies = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/policies'); // New API endpoint
      if (!response.ok) {
        throw new Error('Error al cargar las pólizas');
      }
      const data = await response.json();
      setPolicies(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPolicies();
    // Fetch data for filters
    const fetchFilterData = async () => {
      try {
        const [etiquetasRes, aseguradorasRes, ramosRes] = await Promise.all([
          fetch('/api/etiquetas'), // Reusing existing etiqueta endpoint for 'Etiqueta Cliente'
          fetch('/api/aseguradoras'), // Reusing existing aseguradora endpoint
          fetch('/api/ramos'), // NEW endpoint needed for 'Ramo'
        ]);

        // Process Etiquetas
        if (etiquetasRes.ok) {
            const etiquetasData = await etiquetasRes.json();
            setEtiquetas(Array.isArray(etiquetasData) ? etiquetasData : []);
        } else {
            console.error("Failed to fetch etiquetas");
            setEtiquetas([]);
        }

        // Process Aseguradoras
        if (aseguradorasRes.ok) {
            const aseguradorasData = await aseguradorasRes.json();
            setAseguradoras(Array.isArray(aseguradorasData) ? aseguradorasData : []);
        } else {
            console.error("Failed to fetch aseguradoras");
            setAseguradoras([]);
        }

        // Process Ramos
        if (ramosRes.ok) {
            const ramosData = await ramosRes.json();
            setRamos(Array.isArray(ramosData) ? ramosData : []);
        } else {
            console.error("Failed to fetch ramos");
            setRamos([]);
        }
        
      } catch (error) {
        console.error("Error fetching filter data", error);
        setEtiquetas([]);
        setAseguradoras([]);
        setRamos([]);
      }
    };
    fetchFilterData();
  }, []);

  const handleOpenModal = () => {
    setExtractedData(null);
    setPolicyToEdit(null);
    setIsModalOpen(true);
  }

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setPolicyToEdit(null);
    setExtractedData(null);
    fetchPolicies(); // Refetch policies when modal closes
  };

  const handleEditPolicy = async (policyId: string) => {
    try {
        const response = await fetch(`/api/policies/${policyId}`);
        if (!response.ok) {
            throw new Error('Error al obtener los detalles de la póliza');
        }
        const policyData = await response.json();
        setPolicyToEdit(policyData);
        setIsModalOpen(true);
    } catch (err: any) {
        console.error(err);
        alert(`Error: ${err.message}`);
    }
  };

  const handleDeletePolicy = async (policyId: string) => {
    if (confirm(`¿Está seguro que desea eliminar la póliza?`)) {
      try {
        const response = await fetch(`/api/policies/${policyId}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Error al eliminar la póliza');
        }

        alert('Póliza eliminada exitosamente');
        fetchPolicies(); // Refetch policies to update the list
      } catch (err: any) {
        console.error(err);
        alert(`Error: ${err.message}`);
      }
    }
  };
  
  const handleFileDrop = async (files: File[]) => {
    if (files.length === 0) return;
    const file = files[0];
    
    const formData = new FormData();
    formData.append('file', file);

    setIsExtracting(true);
    setExtractedData(null);
    setDebugText('');
    try {
      const response = await fetch('/api/policies/extract-gemini', { // Use the new endpoint
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorResult = await response.json();
        throw new Error(errorResult.message || 'Error al extraer los datos del PDF.');
      }

      const result = await response.json();
      setExtractedData(result);
      setDebugText(JSON.stringify(result, null, 2)); // For debugging
      setIsModalOpen(true); // Open the modal with the pre-filled data

    } catch (err: any) {
      console.error(err);
      alert(`Error: ${err.message}`);
      setDebugText(err.message); // Show error in debug area
    } finally {
      setIsExtracting(false);
    }
  };

  const handleDownload = () => {
    const worksheet = XLSX.utils.json_to_sheet(filteredPolicies.map(p => ({
      'Oficina': p.etiquetaOficina,
      'Cliente': p.etiquetaCliente,
      'Aseguradora': p.aseguradora,
      'Nombre Razón Social': p.clientNombreCompleto, // Use new field
      'Tipo de Identificación': p.clientTipoIdentificacion, // Use new field
      'Número de Identificación': p.clientNumeroIdentificacion, // Use new field
      'Ramo': p.ramo,
      'Número de Póliza': p.numeroPoliza,
      'Fecha de Expedición': new Date(p.fechaExpedicion).toLocaleDateString(),
      'Fecha Inicio': new Date(p.fechaInicio).toLocaleDateString(),
      'Fecha Fin Vigencia': new Date(p.fechaFinVigencia).toLocaleDateString(),
      'Placa': p.placa || 'N/A',
      'Valor Prima Neta': p.valorPrimaNeta,
      'Valor Total a Pagar': p.valorTotalAPagar,
      'Financiado': p.financiado ? 'Sí' : 'No',
      'Financiera': p.financiera || 'N/A',
    })));
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Pólizas Generales");
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' });
    saveAs(data, 'Reporte_Polizas_Generales.xlsx');
  };

  // Computed filtered policies
  const filteredPolicies = policies.filter(policy => {
    return (
      (filterEtiqueta === '' || policy.etiquetaCliente === filterEtiqueta) &&
      (filterAseguradora === '' || policy.aseguradora === filterAseguradora) &&
      (filterRamo === '' || policy.ramo === filterRamo)
    );
  });

  return (
    <>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1>Pólizas Generales</h1>
          <button onClick={handleOpenModal} className={styles.addButton}>Crear Póliza</button>
        </div>

        <div className={styles.aiSection}>
          <h2>Inteligencia Artificial</h2>
          <p>Arrastra un PDF de póliza para llenar los datos automáticamente.</p>
          {isExtracting ? (
            <p>Extrayendo datos del PDF...</p>
          ) : (
            <Dropzone onFilesAccepted={handleFileDrop} />
          )}
        </div>

        {debugText && (
          <div className={styles.debugSection}>
            <h3>Texto Extraído del PDF (para depuración):</h3>
            <pre className={styles.debugText}>{debugText}</pre>
            <button onClick={() => setDebugText('')} className={styles.clearButton}>Limpiar</button>
          </div>
        )}

        <div className={styles.filterContainer}>
          <select value={filterEtiqueta} onChange={e => setFilterEtiqueta(e.target.value)}>
            <option value="">Todas las Etiquetas de Cliente</option>
            {etiquetas.map(e => <option key={e.id} value={e.name}>{e.name}</option>)}
          </select>
          <select value={filterAseguradora} onChange={e => setFilterAseguradora(e.target.value)}>
            <option value="">Todas las Aseguradoras</option>
            {aseguradoras.map(a => <option key={a.id} value={a.name}>{a.name}</option>)}
          </select>
          <select value={filterRamo} onChange={e => setFilterRamo(e.target.value)}>
            <option value="">Todos los Ramos</option>
            {ramos.map(r => <option key={r.id} value={r.name}>{r.name}</option>)}
          </select>
          <button onClick={handleDownload} className={styles.downloadButton}>Descargar Listado</button>
        </div>

        <GeneralPolicyList 
          policies={filteredPolicies} 
          isLoading={isLoading} 
          error={error} 
          onEdit={handleEditPolicy}
          onDelete={handleDeletePolicy}
        />
      </div>
      {isModalOpen && <AddPolicyModal onClose={handleCloseModal} initialData={extractedData} policyToEdit={policyToEdit}/>}
    </>
  )
};

export default PolicyModule;