import React, { useState } from 'react';
import Dropzone from '@/components/ui/Dropzone';
import styles from './PaymentUploadModule.module.css';
import { FaCheckCircle, FaTimesCircle, FaUpload } from 'react-icons/fa';

interface UploadResult {
  success: boolean;
  policyNumber: string;
  message: string;
}

const PaymentUploadModule: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
  const [results, setResults] = useState<UploadResult[]>([]);

  const handleFilesAccepted = (files: File[]) => {
    if (files.length > 0) {
      setSelectedFile(files[0]);
      setUploadError(null);
      setUploadSuccess(null);
      setResults([]);
    } else {
      setSelectedFile(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setUploadError('Por favor, selecciona un archivo CSV para cargar.');
      return;
    }

    setUploading(true);
    setUploadError(null);
    setUploadSuccess(null);
    setResults([]);

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const response = await fetch('/api/gestion-empresarial/upload-payments', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error desconocido al cargar el archivo.');
      }

      const data = await response.json();
      setUploadSuccess(data.message);
      setResults(data.results || []);

    } catch (err: any) {
      setUploadError(err.message);
      console.error('Error uploading payment file:', err);
    } finally {
      setUploading(false);
      setSelectedFile(null); // Clear selected file after upload attempt
    }
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.header}>Cargar Planilla de Pagos</h2>
      <p>Sube un archivo CSV con los detalles de los pagos para su conciliación.</p>

      <Dropzone onFilesAccepted={handleFilesAccepted} />

      {selectedFile && (
        <p style={{ marginTop: '1rem' }}>Archivo seleccionado: <strong>{selectedFile.name}</strong></p>
      )}

      <button
        className={styles.uploadButton}
        onClick={handleUpload}
        disabled={!selectedFile || uploading}
      >
        {uploading ? 'Cargando...' : <><FaUpload style={{ marginRight: '8px' }} />Cargar y Conciliar</>}
      </button>

      {uploading && <p className={styles.loadingText}>Procesando archivo...</p>}
      {uploadError && <p className={styles.errorText}>Error: {uploadError}</p>}
      {uploadSuccess && <p className={styles.successText}>Éxito: {uploadSuccess}</p>}

      {results.length > 0 && (
        <div className={styles.resultsSection}>
          <h3>Resultados de la Conciliación:</h3>
          <ul className={styles.resultsList}>
            {results.map((result, index) => (
              <li key={index} className={`${styles.resultItem} ${result.success ? styles.success : styles.error}`}>
                {result.success ? <FaCheckCircle className={styles.icon} /> : <FaTimesCircle className={styles.icon} />}
                Póliza {result.policyNumber}: {result.message}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default PaymentUploadModule;
