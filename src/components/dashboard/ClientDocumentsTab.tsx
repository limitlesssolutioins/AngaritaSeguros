'use client';

import { useEffect, useState } from 'react';
import styles from './ClientDocumentsTab.module.css';
import Dropzone from '@/components/ui/Dropzone'; // Reusing existing Dropzone component
import { FaDownload, FaTrashAlt, FaUpload } from 'react-icons/fa';

interface ClientDocument {
  id: string;
  fileName: string;
  fileType: string;
  filePath: string;
  description: string | null;
  uploadedAt: string;
}

interface ClientDocumentsTabProps {
  clientId: string;
}

export default function ClientDocumentsTab({ clientId }: ClientDocumentsTabProps) {
  const [documents, setDocuments] = useState<ClientDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fileToUpload, setFileToUpload] = useState<File | null>(null);
  const [description, setDescription] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const fetchDocuments = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/clients/${clientId}/documents`);
      if (!res.ok) throw new Error('Error al cargar los documentos');
      const data: ClientDocument[] = await res.json();
      setDocuments(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (clientId) {
      fetchDocuments();
    }
  }, [clientId]);

  const handleFilesAccepted = (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setFileToUpload(acceptedFiles[0]); // Only allow one file at a time for simplicity
      setUploadError(null);
    }
  };

  const handleUpload = async () => {
    if (!fileToUpload) {
      setUploadError('Por favor, selecciona un archivo para subir.');
      return;
    }

    setIsUploading(true);
    setUploadError(null);

    const formData = new FormData();
    formData.append('file', fileToUpload);
    if (description) {
      formData.append('description', description);
    }

    try {
      const res = await fetch(`/api/clients/${clientId}/documents`, {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Error al subir el archivo');
      }

      const newDoc: ClientDocument = await res.json();
      setDocuments(prev => [newDoc, ...prev]); // Add new doc to the list
      setFileToUpload(null);
      setDescription('');
      alert('Documento subido exitosamente');

    } catch (err: any) {
      setUploadError(err.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteDocument = async (documentId: string, fileName: string) => {
    if (!confirm(`¿Estás seguro de que quieres eliminar "${fileName}"? Esta acción no se puede deshacer.`)) {
      return;
    }

    try {
      const res = await fetch(`/api/clients/${clientId}/documents?documentId=${documentId}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Error al eliminar el documento');
      }

      setDocuments(prev => prev.filter(doc => doc.id !== documentId)); // Remove from list
      alert('Documento eliminado exitosamente');

    } catch (err: any) {
      setError(err.message);
    }
  };

  if (loading) {
    return <p className={styles.loadingText}>Cargando documentos...</p>;
  }

  if (error) {
    return <p className={styles.errorText}>Error: {error}</p>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.uploadSection}>
        <h3>Subir Nuevo Documento</h3>
        <Dropzone onFilesAccepted={handleFilesAccepted} />
        {fileToUpload && <p className={styles.fileToUploadName}>Archivo seleccionado: {fileToUpload.name}</p>}
        {uploadError && <p className={styles.errorText}>{uploadError}</p>}
        <div className={styles.uploadControls}>
          <input
            type="text"
            placeholder="Descripción (opcional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className={styles.descriptionInput}
            disabled={isUploading}
          />
          <button
            onClick={handleUpload}
            className={styles.uploadButton}
            disabled={!fileToUpload || isUploading}
          >
            {isUploading ? 'Subiendo...' : <><FaUpload /> Subir</>}
          </button>
        </div>
      </div>

      <div className={styles.documentListSection}>
        <h3>Documentos Subidos</h3>
        {documents.length === 0 ? (
          <p className={styles.noDocumentsText}>No hay documentos asociados a este cliente.</p>
        ) : (
          <table className={styles.documentTable}>
            <thead>
              <tr>
                <th>Nombre del Archivo</th>
                <th>Tipo</th>
                <th>Descripción</th>
                <th>Fecha</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {documents.map(doc => (
                <tr key={doc.id}>
                  <td>
                    <a href={doc.filePath} target="_blank" rel="noopener noreferrer" className={styles.documentLink}>
                      {doc.fileName}
                    </a>
                  </td>
                  <td>{doc.fileType}</td>
                  <td>{doc.description || 'N/A'}</td>
                  <td>{new Date(doc.uploadedAt).toLocaleDateString()}</td>
                  <td>
                    <button onClick={() => handleDeleteDocument(doc.id, doc.fileName)} className={styles.deleteButton}>
                      <FaTrashAlt />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
