'use client';

import React, { useState } from 'react';
import styles from './FlatFileConfigurator.module.css';
import { FaPlus, FaTrash, FaSave } from 'react-icons/fa';

// Mock data for insurance companies (should be fetched from backend)
const mockAseguradoras = [
  { id: 'sura', name: 'Sura' },
  { id: 'allianz', name: 'Allianz' },
  { id: 'mapfre', name: 'Mapfre' },
  { id: 'liberty', name: 'Liberty' },
];

// Define the structure for a field mapping
interface FieldMapping {
  id: number;
  fieldName: string; // e.g., 'Número de Póliza', 'Cliente'
  excelColumn: string; // e.g., 'A', 'B', 'C'
}

export default function FlatFileConfigurator() {
  const [selectedAseguradora, setSelectedAseguradora] = useState<string>('');
  const [mappings, setMappings] = useState<FieldMapping[]>(
    // Initial mock mappings for demonstration
    [
      { id: 1, fieldName: 'Número de Póliza', excelColumn: 'A' },
      { id: 2, fieldName: 'Aseguradora', excelColumn: 'B' },
      { id: 3, fieldName: 'Etiqueta', excelColumn: 'C' },
      { id: 4, fieldName: 'Cliente', excelColumn: 'D' },
    ]
  );
  const [nextId, setNextId] = useState(5); // For unique key generation

  const handleAseguradoraChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedAseguradora(event.target.value);
    // In a real app, you would fetch existing mappings for this aseguradora
    setMappings([
      { id: 1, fieldName: 'Número de Póliza', excelColumn: 'A' },
      { id: 2, fieldName: 'Aseguradora', excelColumn: 'B' },
      { id: 3, fieldName: 'Etiqueta', excelColumn: 'C' },
      { id: 4, fieldName: 'Cliente', excelColumn: 'D' },
    ]); // Reset to mock for now
  };

  const handleMappingChange = (id: number, field: keyof FieldMapping, value: string) => {
    setMappings(prevMappings =>
      prevMappings.map(mapping =>
        mapping.id === id ? { ...mapping, [field]: value } : mapping
      )
    );
  };

  const handleAddField = () => {
    setMappings(prevMappings => [...prevMappings, { id: nextId, fieldName: '', excelColumn: '' }]);
    setNextId(prevId => prevId + 1);
  };

  const handleRemoveField = (id: number) => {
    setMappings(prevMappings => prevMappings.filter(mapping => mapping.id !== id));
  };

  const handleSaveConfiguration = () => {
    if (!selectedAseguradora) {
      alert('Por favor, seleccione una aseguradora antes de guardar.');
      return;
    }
    console.log(`Guardando configuración para ${selectedAseguradora}:`, mappings);
    alert('Configuración guardada (simulado)!');
    // In a real app, send this data to the backend
  };

  return (
    <div className={styles.configuratorContainer}>
      <div className={styles.formGroup}>
        <label htmlFor="aseguradora" className={styles.label}>Seleccionar Aseguradora:</label>
        <select
          id="aseguradora"
          className={styles.select}
          value={selectedAseguradora}
          onChange={handleAseguradoraChange}
        >
          <option value="">Seleccione una aseguradora</option>
          {mockAseguradoras.map(aseguradora => (
            <option key={aseguradora.id} value={aseguradora.id}>
              {aseguradora.name}
            </option>
          ))}
        </select>
      </div>

      {selectedAseguradora && (
        <div className={styles.mappingsSection}>
          <h3 className={styles.sectionTitle}>Mapeo de Campos para {mockAseguradoras.find(a => a.id === selectedAseguradora)?.name}</h3>
          <p className={styles.description}>Defina qué columna de Excel corresponde a cada campo de datos.</p>

          <div className={styles.mappingHeader}>
            <span className={styles.headerField}>Campo de Datos</span>
            <span className={styles.headerColumn}>Columna de Excel</span>
            <span className={styles.headerActions}></span>
          </div>

          {mappings.map(mapping => (
            <div key={mapping.id} className={styles.mappingItem}>
              <input
                type="text"
                className={styles.mappingInput}
                value={mapping.fieldName}
                onChange={(e) => handleMappingChange(mapping.id, 'fieldName', e.target.value)}
                placeholder="Nombre del Campo"
              />
              <input
                type="text"
                className={styles.mappingInput}
                value={mapping.excelColumn}
                onChange={(e) => handleMappingChange(mapping.id, 'excelColumn', e.target.value.toUpperCase())}
                placeholder="Ej: A, B, C"
              />
              <button onClick={() => handleRemoveField(mapping.id)} className={styles.removeButton}>
                <FaTrash />
              </button>
            </div>
          ))}

          <button onClick={handleAddField} className={styles.addFieldButton}>
            <FaPlus /> Añadir Campo
          </button>

          <button onClick={handleSaveConfiguration} className={styles.saveConfigButton}>
            <FaSave /> Guardar Configuración
          </button>
        </div>
      )}
    </div>
  );
}
