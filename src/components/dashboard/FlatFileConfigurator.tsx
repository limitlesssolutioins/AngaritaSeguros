'use client';

import { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import * as XLSX from 'xlsx';
import styles from './FlatFileConfigurator.module.css';
import { FaUpload, FaFileExcel, FaSave, FaCheck, FaTimes, FaCog } from 'react-icons/fa';

// --- Interfaces ---
interface ExcelColumn {
  header: string;
  index: number;
  sampleValue?: string | number | null;
}

interface MappingConfig {
  [systemField: string]: {
    excelHeader: string;
    excelIndex: number;
    staticValue?: string; // For fields like 'Aseguradora' if not in file
  };
}

interface AseguradoraConfig {
  id: string; // The ID of the aseguradora (e.g., 'allianz', 'sura')
  name: string; // Display name
  mapping: MappingConfig;
  startRow: number; // Row number where data starts (0-based)
}

// System fields that we need to extract for "Cumplimiento" policies
// This is our "Target Schema"
const SYSTEM_FIELDS = [
  { key: 'tomadorPoliza', label: 'Tomador (Nombre)', required: true },
  { key: 'numeroIdentificacion', label: 'Número Identificación', required: true },
  { key: 'tipoIdentificacion', label: 'Tipo Identificación', required: false }, // Could be static or mapped
  { key: 'numeroPoliza', label: 'Número Póliza', required: true },
  { key: 'fechaExpedicion', label: 'Fecha Expedición', required: true },
  { key: 'fechaInicioVigencia', label: 'Fecha Inicio', required: true },
  { key: 'fechaTerminacionVigencia', label: 'Fecha Fin', required: true },
  { key: 'valorPrimaNeta', label: 'Valor Prima', required: true },
  // 'aseguradora' is implicitly handled by which config we are editing
];

export default function FlatFileConfigurator() {
  const [aseguradoras, setAseguradoras] = useState<{ id: string, name: string }[]>([]); // Dynamic state
  const [selectedAseguradoraId, setSelectedAseguradoraId] = useState<string>('');
  const [file, setFile] = useState<File | null>(null);
  const [excelColumns, setExcelColumns] = useState<ExcelColumn[]>([]);
  const [currentMapping, setCurrentMapping] = useState<MappingConfig>({});
  const [startRow, setStartRow] = useState<number>(1); // Default to row 2 (index 1) assuming header is row 1
  const [isSaving, setIsSaving] = useState(false);
  
  // Fetch aseguradoras from API on mount
  useEffect(() => {
    const fetchAseguradoras = async () => {
      try {
        const response = await fetch('/api/aseguradoras');
        if (response.ok) {
          const data = await response.json();
          setAseguradoras(data);
          // Optional: Select the first one by default if list is not empty
          if (data.length > 0 && !selectedAseguradoraId) {
             // setSelectedAseguradoraId(data[0].id); // Or keep it empty to force user selection
          }
        } else {
          console.error("Failed to fetch aseguradoras");
        }
      } catch (error) {
        console.error("Error fetching aseguradoras:", error);
      }
    };
    fetchAseguradoras();
  }, []); // Run once on mount


  // Load saved config when aseguradora changes
  useEffect(() => {
    if (selectedAseguradoraId) {
      // In a real app, we would fetch the saved config from backend API
      // const savedConfig = await fetch(`/api/config/flatfile/${selectedAseguradoraId}`);
      // For now, reset or load mock
      console.log(`Loading config for ${selectedAseguradoraId}...`);
      setCurrentMapping({});
      setStartRow(1);
    }
  }, [selectedAseguradoraId]);


  const onDrop = useCallback((acceptedFiles: File[]) => {
    const uploadedFile = acceptedFiles[0];
    setFile(uploadedFile);
    readExcelHeaders(uploadedFile);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop, 
    accept: { 
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls']
    },
    maxFiles: 1
  });

  const readExcelHeaders = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const data = e.target?.result;
      const workbook = XLSX.read(data, { type: 'binary' });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      
      // Convert sheet to JSON array of arrays (header assumed at row 0 temporarily to find columns)
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      
      if (jsonData.length > 0) {
        const headers = jsonData[0] as string[]; // Assume first row is header for preview
        const sampleRow = jsonData.length > 1 ? jsonData[1] as any[] : [];

        const columns: ExcelColumn[] = headers.map((header, index) => ({
          header: header || `Column ${index + 1}`,
          index: index,
          sampleValue: sampleRow[index]
        }));
        setExcelColumns(columns);
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleMappingChange = (systemFieldKey: string, excelColumnIndex: string) => {
    if (excelColumnIndex === '') {
      // Remove mapping
      const newMapping = { ...currentMapping };
      delete newMapping[systemFieldKey];
      setCurrentMapping(newMapping);
      return;
    }

    const index = parseInt(excelColumnIndex);
    const column = excelColumns.find(c => c.index === index);
    
    if (column) {
      setCurrentMapping({
        ...currentMapping,
        [systemFieldKey]: {
          excelHeader: column.header,
          excelIndex: index
        }
      });
    }
  };

  const handleSaveConfig = async () => {
    if (!selectedAseguradoraId) {
      alert("Por favor seleccione una aseguradora.");
      return;
    }

    setIsSaving(true);
    // Simulate API call to save config
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const configToSave: AseguradoraConfig = {
      id: selectedAseguradoraId,
      name: aseguradoras.find(a => a.id === selectedAseguradoraId)?.name || 'Unknown',
      mapping: currentMapping,
      startRow: startRow
    };
    
    console.log("Saving Configuration:", configToSave);
    alert(`Configuración guardada para ${configToSave.name}`);
    setIsSaving(false);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.selectorContainer}>
          <label className={styles.label}>Configurar para Aseguradora:</label>
          <select 
            className={styles.select}
            value={selectedAseguradoraId}
            onChange={(e) => setSelectedAseguradoraId(e.target.value)}
          >
            <option value="">-- Seleccione --</option>
            {aseguradoras.map(a => (
              <option key={a.id} value={a.id}>{a.name}</option>
            ))}
          </select>
        </div>
      </div>

      {selectedAseguradoraId && (
        <div className={styles.configArea}>
          {/* Step 1: Upload Sample File */}
          <div className={styles.stepSection}>
            <h4 className={styles.stepTitle}>1. Cargar Archivo de Muestra</h4>
            <p className={styles.stepDesc}>Suba un archivo Excel reciente de esta aseguradora para detectar las columnas.</p>
            
            <div {...getRootProps()} className={`${styles.dropzone} ${isDragActive ? styles.active : ''}`}>
              <input {...getInputProps()} />
              {file ? (
                <div className={styles.fileInfo}>
                  <FaFileExcel className={styles.fileIcon} />
                  <span>{file.name}</span>
                  <button 
                    onClick={(e) => { e.stopPropagation(); setFile(null); setExcelColumns([]); }}
                    className={styles.removeFileBtn}
                  >
                    <FaTimes />
                  </button>
                </div>
              ) : (
                <div className={styles.uploadPrompt}>
                  <FaUpload className={styles.uploadIcon} />
                  <p>Arrastre un archivo Excel aquí, o haga clic para seleccionar</p>
                </div>
              )}
            </div>
          </div>

          {/* Step 2: Map Columns */}
          {excelColumns.length > 0 && (
            <div className={styles.stepSection}>
              <h4 className={styles.stepTitle}>2. Mapeo de Columnas</h4>
              <p className={styles.stepDesc}>Relacione las columnas del archivo Excel con los campos del sistema.</p>

              <div className={styles.generalSettings}>
                <div className={styles.inputGroup}>
                   <label>Fila de Inicio de Datos:</label>
                   <input 
                      type="number" 
                      min="1" 
                      value={startRow + 1} // Display as 1-based for user
                      onChange={(e) => setStartRow(Math.max(0, parseInt(e.target.value) - 1))}
                      className={styles.numberInput}
                   />
                   <span className={styles.hint}>(Fila donde comienza el primer registro real, usualmente después de los encabezados)</span>
                </div>
              </div>

              <div className={styles.mappingGrid}>
                {SYSTEM_FIELDS.map(field => {
                  const mapped = currentMapping[field.key];
                  return (
                    <div key={field.key} className={styles.mappingRow}>
                      <div className={styles.fieldInfo}>
                        <span className={styles.fieldName}>{field.label}</span>
                        {field.required && <span className={styles.requiredBadge}>Requerido</span>}
                      </div>
                      <div className={styles.arrow}>→</div>
                      <div className={styles.excelSelector}>
                        <select 
                          value={mapped ? mapped.excelIndex : ''}
                          onChange={(e) => handleMappingChange(field.key, e.target.value)}
                          className={`${styles.columnSelect} ${mapped ? styles.mapped : ''}`}
                        >
                          <option value="">-- Sin asignar --</option>
                          {excelColumns.map(col => (
                            <option key={col.index} value={col.index}>
                              {col.header} (Ej: {col.sampleValue})
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className={styles.statusIcon}>
                         {mapped ? <FaCheck className={styles.checkIcon} /> : null}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className={styles.actions}>
                <button 
                  onClick={handleSaveConfig} 
                  className={styles.saveButton}
                  disabled={isSaving}
                >
                  <FaSave /> {isSaving ? 'Guardando...' : 'Guardar Configuración'}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}