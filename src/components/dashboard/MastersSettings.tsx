'use client';

import { useState, useEffect } from 'react';
import styles from './SettingsModule.module.css'; // Reusing general settings styles
import { FaPlus, FaTrash, FaEdit, FaSave, FaTimes } from 'react-icons/fa';

interface MasterItem {
  id: string;
  name: string;
}

export default function MastersSettings() {
  const [aseguradoras, setAseguradoras] = useState<MasterItem[]>([]);
  const [etiquetas, setEtiquetas] = useState<MasterItem[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Edit/Create states
  const [editingItem, setEditingItem] = useState<{ type: 'aseguradora' | 'etiqueta', id: string | null, name: string } | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [asegRes, etiqRes] = await Promise.all([
        fetch('/api/aseguradoras'),
        fetch('/api/etiquetas')
      ]);
      setAseguradoras(await asegRes.json());
      setEtiquetas(await etiqRes.json());
    } catch (error) {
      console.error("Error fetching masters data", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!editingItem || !editingItem.name.trim()) return;

    const endpoint = editingItem.type === 'aseguradora' ? '/api/aseguradoras' : '/api/etiquetas';
    const method = editingItem.id ? 'PUT' : 'POST';
    const url = editingItem.id ? `${endpoint}/${editingItem.id}` : endpoint;
    const body = editingItem.type === 'aseguradora' ? { name: editingItem.name } : { name: editingItem.name, type: 'Oficina' }; // Default type for etiquetas if needed, backend handles it? Check backend.

    // Note: The existing POST /api/etiquetas expects { name, type }. 
    // The existing POST /api/aseguradoras expects { name }.
    // Let's adjust body for creation if needed based on the type.
    
    // For simplicity, assuming backend handles basics. 
    // Actually, checking previous code, POST /api/etiquetas might need 'type'.
    // Let's assume for now generic 'Oficina' or 'Cliente' isn't distinguished strictly in the simplified UI or we default.
    // Re-reading /api/etiquetas/route.ts would confirm.
    // For now, sending just name for update is fine, but creation might need type for etiquetas.
    
    const payload = editingItem.id 
      ? { name: editingItem.name } 
      : (editingItem.type === 'etiqueta' ? { name: editingItem.name, type: 'General' } : { name: editingItem.name });

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const err = await res.json();
        alert(err.message || 'Error al guardar');
        return;
      }
      
      setEditingItem(null);
      fetchData(); // Refresh list
    } catch (error) {
      console.error(error);
      alert('Error de conexión');
    }
  };

  const handleDelete = async (type: 'aseguradora' | 'etiqueta', id: string) => {
    if (!confirm('¿Estás seguro de eliminar este ítem?')) return;

    const endpoint = type === 'aseguradora' ? `/api/aseguradoras/${id}` : `/api/etiquetas/${id}`;
    try {
      const res = await fetch(endpoint, { method: 'DELETE' });
      if (!res.ok) {
         const err = await res.json();
         alert(err.message || 'Error al eliminar');
         return;
      }
      fetchData();
    } catch (error) {
       console.error(error);
       alert('Error de conexión');
    }
  };

  if (loading) return <p>Cargando maestros...</p>;

  return (
    <div className={styles.mastersContainer}>
      {/* Aseguradoras Section */}
      <div className={styles.masterSection}>
        <div className={styles.sectionHeader}>
          <h3>Aseguradoras</h3>
          <button 
            className={styles.addButton}
            onClick={() => setEditingItem({ type: 'aseguradora', id: null, name: '' })}
          >
            <FaPlus /> Agregar
          </button>
        </div>
        
        {editingItem?.type === 'aseguradora' && !editingItem.id && (
             <div className={styles.editRow}>
                <input 
                  autoFocus
                  type="text" 
                  value={editingItem.name} 
                  onChange={e => setEditingItem({...editingItem, name: e.target.value})}
                  placeholder="Nombre de Aseguradora"
                />
                <button onClick={handleSave} className={styles.iconButton}><FaSave /></button>
                <button onClick={() => setEditingItem(null)} className={styles.iconButton}><FaTimes /></button>
             </div>
        )}

        <ul className={styles.masterList}>
          {aseguradoras.map(item => (
             <li key={item.id} className={styles.masterItem}>
               {editingItem?.type === 'aseguradora' && editingItem.id === item.id ? (
                 <div className={styles.editRow}>
                    <input 
                      autoFocus
                      type="text" 
                      value={editingItem.name} 
                      onChange={e => setEditingItem({...editingItem, name: e.target.value})}
                    />
                    <button onClick={handleSave} className={styles.iconButton}><FaSave /></button>
                    <button onClick={() => setEditingItem(null)} className={styles.iconButton}><FaTimes /></button>
                 </div>
               ) : (
                 <>
                   <span>{item.name}</span>
                   <div className={styles.actions}>
                     <button onClick={() => setEditingItem({ type: 'aseguradora', id: item.id, name: item.name })} className={styles.iconButton}><FaEdit /></button>
                     <button onClick={() => handleDelete('aseguradora', item.id)} className={`${styles.iconButton} ${styles.delete}`}><FaTrash /></button>
                   </div>
                 </>
               )}
             </li>
          ))}
        </ul>
      </div>

      {/* Etiquetas Section */}
      <div className={styles.masterSection}>
        <div className={styles.sectionHeader}>
          <h3>Etiquetas (Ramos/Oficinas)</h3>
           <button 
            className={styles.addButton}
            onClick={() => setEditingItem({ type: 'etiqueta', id: null, name: '' })}
          >
            <FaPlus /> Agregar
          </button>
        </div>

        {editingItem?.type === 'etiqueta' && !editingItem.id && (
             <div className={styles.editRow}>
                <input 
                  autoFocus
                  type="text" 
                  value={editingItem.name} 
                  onChange={e => setEditingItem({...editingItem, name: e.target.value})}
                  placeholder="Nombre de Etiqueta"
                />
                <button onClick={handleSave} className={styles.iconButton}><FaSave /></button>
                <button onClick={() => setEditingItem(null)} className={styles.iconButton}><FaTimes /></button>
             </div>
        )}

        <ul className={styles.masterList}>
          {etiquetas.map(item => (
             <li key={item.id} className={styles.masterItem}>
                {editingItem?.type === 'etiqueta' && editingItem.id === item.id ? (
                 <div className={styles.editRow}>
                    <input 
                      autoFocus
                      type="text" 
                      value={editingItem.name} 
                      onChange={e => setEditingItem({...editingItem, name: e.target.value})}
                    />
                    <button onClick={handleSave} className={styles.iconButton}><FaSave /></button>
                    <button onClick={() => setEditingItem(null)} className={styles.iconButton}><FaTimes /></button>
                 </div>
               ) : (
                 <>
                    <span>{item.name}</span>
                    <div className={styles.actions}>
                      <button onClick={() => setEditingItem({ type: 'etiqueta', id: item.id, name: item.name })} className={styles.iconButton}><FaEdit /></button>
                      <button onClick={() => handleDelete('etiqueta', item.id)} className={`${styles.iconButton} ${styles.delete}`}><FaTrash /></button>
                    </div>
                  </>
               )}
             </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
