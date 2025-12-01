'use client';
import { useState, useEffect } from 'react';
import styles from './CumplimientoModule.module.css';
import AddCumplimientoModal from './AddCumplimientoModal';
import PolicyList from './PolicyList';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import Dropzone from '../ui/Dropzone';

// Define the structure of a policy, mirroring the backend
interface Policy {
  id: string;
  etiqueta: string;
  titularPoliza: string;
  fechaExpedicion: string;
  fechaInicioVigencia: string;
  fechaTerminacionVigencia: string;
  aseguradora: string;
  valorPrimaNeta: number;
  valorTotalAPagar: number;
  numeroPoliza: string;
  numeroAnexos: number;
  tipoAmparo: string;
  files?: string[];
}


const CumplimientoModule = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractedData, setExtractedData] = useState<Partial<Policy> | null>(null);
  const [debugText, setDebugText] = useState<string>('');


  // State for filters
  const [etiquetas, setEtiquetas] = useState<any[]>([]);
  const [aseguradoras, setAseguradoras] = useState<any[]>([]);
  const [filterEtiqueta, setFilterEtiqueta] = useState('');
  const [filterAseguradora, setFilterAseguradora] = useState('');

  const fetchPolicies = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/cumplimiento');
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
        const [etiquetasRes, aseguradorasRes] = await Promise.all([
          fetch('/api/etiquetas'),
          fetch('/api/aseguradoras'),
        ]);
        const etiquetasData = await etiquetasRes.json();
        const aseguradorasData = await aseguradorasRes.json();
        setEtiquetas(etiquetasData);
        setAseguradoras(aseguradorasData);
      } catch (error) {
        console.error("Error fetching filter data", error);
      }
    };
    fetchFilterData();
  }, []);

  const handleOpenModal = () => {
    setExtractedData(null); // Clear any previous extracted data
    setIsModalOpen(true);
  }
  const handleCloseModal = () => {
    setIsModalOpen(false);
    fetchPolicies(); // Refetch policies when modal closes
  };

  const handleEditPolicy = (policyId: string) => {
    alert(`Editar póliza con ID: ${policyId}`);
    // Implement actual edit logic here, e.g., open an edit modal
  };

  const handleDeletePolicy = (policyId: string) => {
    if (confirm(`¿Está seguro que desea eliminar la póliza con ID: ${policyId}?`)) {
      alert(`Eliminar póliza con ID: ${policyId} (simulado)`);
      // Implement actual delete logic here, then refetch policies
      // fetchPolicies();
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
      const response = await fetch('/api/cumplimiento/extract-gemini', {
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
      'Titular de la Póliza': p.titularPoliza,
      'Etiqueta': p.etiqueta,
      'Aseguradora': p.aseguradora,
      'Número de Póliza': p.numeroPoliza,
      'Tipo de Amparo': p.tipoAmparo,
      'Número de Anexos': p.numeroAnexos,
      'Fecha de Expedición': new Date(p.fechaExpedicion).toLocaleDateString(),
      'Fecha Inicio Vigencia': new Date(p.fechaInicioVigencia).toLocaleDateString(),
      'Fecha Fin Vigencia': new Date(p.fechaTerminacionVigencia).toLocaleDateString(),
      'Valor Prima Neta': p.valorPrimaNeta,
      'Valor Total a Pagar': p.valorTotalAPagar,
    })));
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Pólizas de Cumplimiento");
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' });
    saveAs(data, 'Reporte_Polizas_Cumplimiento.xlsx');
  };

  // Computed filtered policies
  const filteredPolicies = policies.filter(policy => {
    return (
      (filterEtiqueta === '' || policy.etiqueta === filterEtiqueta) &&
      (filterAseguradora === '' || policy.aseguradora === filterAseguradora)
    );
  });

  return (
    <>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1>Pólizas de Cumplimiento</h1>
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
            <option value="">Todas las Etiquetas</option>
            {etiquetas.map(e => <option key={e.id} value={e.name}>{e.name}</option>)}
          </select>
          <select value={filterAseguradora} onChange={e => setFilterAseguradora(e.target.value)}>
            <option value="">Todas las Aseguradoras</option>
            {aseguradoras.map(a => <option key={a.id} value={a.name}>{a.name}</option>)}
          </select>
          <button onClick={handleDownload} className={styles.downloadButton}>Descargar Listado</button>
        </div>

        <PolicyList 
          policies={filteredPolicies} 
          isLoading={isLoading} 
          error={error} 
          onEdit={handleEditPolicy}
          onDelete={handleDeletePolicy}
        />
      </div>
      {isModalOpen && <AddCumplimientoModal onClose={handleCloseModal} initialData={extractedData} />}
    </>
  )
};

export default CumplimientoModule;


