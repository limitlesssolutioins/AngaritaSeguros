'use client';

import { useState } from 'react';
import { FaFolder, FaFileAlt, FaUpload, FaDownload, FaArrowUp, FaSearch } from 'react-icons/fa';
import styles from './FilesModule.module.css'; // Create this CSS module

interface FileItem {
  id: string;
  name: string;
  type: 'file' | 'folder';
  content?: string; // For files
  policyId?: string; // Optional link to policy
  clientId?: string; // Optional link to client
}

interface Folder extends FileItem {
  type: 'folder';
  children: FileItem[];
}

// Mock File System Data
const mockFileSystem: Folder = {
  id: 'root',
  name: 'Root',
  type: 'folder',
  children: [
    {
      id: 'policies',
      name: 'Pólizas',
      type: 'folder',
      children: [
        { id: 'pol1', name: 'Póliza_Vehiculo_JP_2025.pdf', type: 'file', policyId: 'P-V001', content: 'Contenido de la póliza de vehículo de Juan Perez.' },
        { id: 'pol2', name: 'Póliza_Salud_MG_2025.pdf', type: 'file', policyId: 'P-S001', content: 'Contenido de la póliza de salud de Maria Garcia.' },
        { id: 'pol3', name: 'SOAT_PL_2025.pdf', type: 'file', policyId: 'P-V002', content: 'Contenido del SOAT de Pedro Lopez.' },
      ],
    },
    {
      id: 'clients',
      name: 'Clientes',
      type: 'folder',
      children: [
        { id: 'cli1', name: 'Doc_Juan_Perez.pdf', type: 'file', clientId: '1', content: 'Documentos de identificación de Juan Perez.' },
        { id: 'cli2', name: 'Doc_Maria_Garcia.pdf', type: 'file', clientId: '2', content: 'Documentos de identificación de Maria Garcia.' },
      ],
    },
    { id: 'misc', name: 'Otros Documentos', type: 'folder', children: [] },
    { id: 'template', name: 'Plantilla_General.docx', type: 'file', content: 'Plantilla general para nuevos documentos.' },
  ],
};

export default function FilesModule() {
  const [currentFolder, setCurrentFolder] = useState<Folder>(mockFileSystem);
  const [pathHistory, setPathHistory] = useState<Folder[]>([mockFileSystem]);
  const [searchTerm, setSearchTerm] = useState('');

  const handleOpenFolder = (folder: Folder) => {
    setCurrentFolder(folder);
    setPathHistory(prev => [...prev, folder]);
  };

  const handleGoUp = () => {
    if (pathHistory.length > 1) {
      const newPathHistory = pathHistory.slice(0, -1);
      setCurrentFolder(newPathHistory[newPathHistory.length - 1]);
      setPathHistory(newPathHistory);
    }
  };

  const handleUpload = () => {
    alert('Simulando carga de archivo...');
    console.log('Upload action simulated.');
  };

  const handleDownload = (file: FileItem) => {
    alert(`Simulando descarga de ${file.name}...`);
    console.log(`Download action simulated for ${file.name}. Content: ${file.content}`);
  };

  const filteredChildren = currentFolder.children.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className={styles.filesModuleContainer}>
      <div className={styles.controlsContainer}>
        <button onClick={handleGoUp} disabled={pathHistory.length <= 1} className={styles.controlButton}>
          <FaArrowUp /> Subir Nivel
        </button>
        <div className={styles.searchBar}>
          <FaSearch className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Buscar archivos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
        </div>
        <button onClick={handleUpload} className={`${styles.controlButton} ${styles.uploadButton}`}>
          <FaUpload /> Subir Archivo
        </button>
      </div>

      <div className={styles.pathDisplay}>
        Ruta Actual: {pathHistory.map(folder => folder.name).join(' / ')}
      </div>

      <div className={styles.fileList}>
        {filteredChildren.length === 0 ? (
          <p className={styles.emptyFolder}>Esta carpeta está vacía o no hay resultados para la búsqueda.</p>
        ) : (
          filteredChildren.map(item => (
            <div key={item.id} className={styles.fileItem} onClick={() => item.type === 'folder' ? handleOpenFolder(item as Folder) : handleDownload(item)}>
              {item.type === 'folder' ? <FaFolder className={styles.fileIcon} /> : <FaFileAlt className={styles.fileIcon} />}
              <span className={styles.fileName}>{item.name}</span>
              {item.type === 'file' && (
                <button onClick={(e) => { e.stopPropagation(); handleDownload(item); }} className={styles.downloadButton}>
                  <FaDownload />
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
