'use client';

import { useState } from 'react';
import styles from './GestionEmpresarialModule.module.css';
import AgentList from './AgentList';

// Mock data for insurance companies
const mockAseguradoras = [
  { id: 'sura', name: 'Sura' },
  { id: 'allianz', name: 'Allianz' },
  { id: 'mapfre', name: 'Mapfre' },
  { id: 'liberty', name: 'Liberty' },
];

export default function GestionEmpresarialModule() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedAseguradora, setSelectedAseguradora] = useState<string>('');
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'success' | 'error' | null>(null);
  const [message, setMessage] = useState('');
  const [activeTab, setActiveTab] = useState('agents');

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setSelectedFile(event.target.files[0]);
    } else {
      setSelectedFile(null);
    }
  };

  const handleAseguradoraChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedAseguradora(event.target.value);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!selectedFile || !selectedAseguradora) {
      setMessage('Por favor, seleccione una aseguradora y un archivo.');
      setUploadStatus('error');
      return;
    }

    setUploading(true);
    setUploadStatus(null);
    setMessage('');

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('aseguradoraId', selectedAseguradora);

    try {
      const response = await fetch('/api/gestion-empresarial/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setUploadStatus('success');
        setMessage(data.message || 'Archivos subidos exitosamente.');
        setSelectedFile(null);
        setSelectedAseguradora('');
      } else {
        const errorData = await response.json();
        setUploadStatus('error');
        setMessage(errorData.error || 'Error al subir los archivos.');
      }
    } catch (error) {
      console.error('Error uploading files:', error);
      setUploadStatus('error');
      setMessage('Error de red o del servidor.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className={styles.moduleContainer}>
      <div className={styles.tabNav}>
        <button 
          className={`${styles.tabButton} ${activeTab === 'agents' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('agents')}
        >
          Gestión de Agentes
        </button>
        <button 
          className={`${styles.tabButton} ${activeTab === 'upload' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('upload')}
        >
          Carga de Planillas
        </button>
      </div>

      {activeTab === 'agents' && (
        <>
          <h2 className={styles.title}>Gestión de Agentes</h2>
          <p className={styles.description}>
            Aquí podrá gestionar los agentes de la empresa y sus clientes asociados.
          </p>
          <AgentList />
        </>
      )}

      {activeTab === 'upload' && (
        <>
          <h2 className={styles.title}>Carga de Planillas de Aseguradoras</h2>
          <p className={styles.description}>
            Seleccione la aseguradora y suba la planilla de Excel (.xlsx, .xls).
          </p>
          <form onSubmit={handleSubmit} className={styles.uploadForm}>
            <div className={styles.formGroup}>
              <label htmlFor="aseguradora" className={styles.label}>Aseguradora:</label>
              <select
                id="aseguradora"
                className={styles.select}
                value={selectedAseguradora}
                onChange={handleAseguradoraChange}
                disabled={uploading}
              >
                <option value="">Seleccione una aseguradora</option>
                {mockAseguradoras.map(aseguradora => (
                  <option key={aseguradora.id} value={aseguradora.id}>
                    {aseguradora.name}
                  </option>
                ))}
              </select>
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="file" className={styles.label}>Archivo Excel:</label>
              <input
                type="file"
                id="file"
                accept=".xlsx, .xls"
                onChange={handleFileChange}
                disabled={uploading}
                className={styles.fileInput}
              />
            </div>
            <button type="submit" className={styles.uploadButton} disabled={uploading || !selectedFile || !selectedAseguradora}>
              {uploading ? 'Subiendo...' : 'Subir Planilla'}
            </button>
          </form>

          {uploading && <p className={styles.uploadingStatus}>Subiendo archivos...</p>}
          {uploadStatus === 'success' && <p className={styles.successMessage}>{message}</p>}
          {uploadStatus === 'error' && <p className={styles.errorMessage}>{message}</p>}
        </>
      )}
    </div>
  );
}
