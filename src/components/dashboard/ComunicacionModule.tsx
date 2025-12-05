'use client';
import { useState, useEffect } from 'react';
import styles from './ComunicacionModule.module.css';
import EditTemplateModal, { Template as TemplateInterface } from './EditTemplateModal';

type Template = TemplateInterface;

type OrganizedTemplates = {
  [category: string]: {
    email?: Template;
    whatsapp?: Template;
  };
};

const TEMPLATE_CATEGORIES = [
  { key: 'birthday', name: 'Saludos de Cumpleaños' },
  { key: 'policy_issuance', name: 'Notificación de Expedición de Póliza' },
  { key: 'policy_expiration', name: 'Aviso de Pólizas por Vencer' },
  { key: 'billing', name: 'Mensajes de Cobro' },
];

// Sub-component for displaying a single template card
const TemplateCard = ({ template, type, category, onEdit }: { template?: Template; type: 'email' | 'whatsapp'; category: string; onEdit: () => void; }) => {
  const typeText = type === 'email' ? 'Email' : 'WhatsApp';
  return (
    <div className={styles.templateCard}>
      <div className={styles.cardHeader}>
        <h4>Plantilla de {typeText}</h4>
        <button onClick={onEdit} className={styles.editButton}>
          {template ? 'Editar' : 'Crear'}
        </button>
      </div>
      <div className={styles.cardBody}>
        {template ? (
          <p className={styles.templatePreview}>{template.body}</p>
        ) : (
          <p className={styles.noTemplate}>No hay plantilla configurada.</p>
        )}
      </div>
    </div>
  );
};


const ComunicacionModule = () => {
  const [templates, setTemplates] = useState<OrganizedTemplates>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<{ category: string; type: 'email' | 'whatsapp', initialTemplate?: Template | null } | null>(null);

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/templates');
        if (!response.ok) {
          throw new Error('No se pudieron cargar las plantillas.');
        }
        const data: Template[] = await response.json();
        
        // Organize flat data into a structured object
        const organized: OrganizedTemplates = {};
        data.forEach(t => {
          if (!organized[t.category]) {
            organized[t.category] = {};
          }
          if (t.type === 'email' || t.type === 'whatsapp') {
            organized[t.category][t.type] = t;
          }
        });
        setTemplates(organized);

      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTemplates();
  }, []);

  const handleEditClick = (category: string, type: 'email' | 'whatsapp') => {
    setEditingTemplate({
      category,
      type,
      initialTemplate: templates[category]?.[type],
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingTemplate(null);
  };

  const handleSaveTemplate = (savedTemplate: Template) => {
    setTemplates(prev => ({
      ...prev,
      [savedTemplate.category]: {
        ...prev[savedTemplate.category],
        [savedTemplate.type]: savedTemplate,
      },
    }));
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Módulo de Plantillas de Comunicación</h1>
      </div>

      {isLoading && <p>Cargando plantillas...</p>}
      {error && <p className={styles.error}>{error}</p>}

      {!isLoading && !error && (
        <div className={styles.categoriesContainer}>
          {TEMPLATE_CATEGORIES.map(({ key, name }) => (
            <section key={key} className={styles.categorySection}>
              <h2>{name}</h2>
              {key === 'billing' && <p className={styles.comingSoonNote}>Nota: La automatización de cobros se activará con el módulo de cartera.</p>}
              <div className={styles.cardsWrapper}>
                <TemplateCard 
                  template={templates[key]?.email}
                  type="email"
                  category={key}
                  onEdit={() => handleEditClick(key, 'email')}
                />
                <TemplateCard 
                  template={templates[key]?.whatsapp}
                  type="whatsapp"
                  category={key}
                  onEdit={() => handleEditClick(key, 'whatsapp')}
                />
              </div>
            </section>
          ))}
        </div>
      )}

      {editingTemplate && (
        <EditTemplateModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onSave={handleSaveTemplate}
          category={editingTemplate.category}
          type={editingTemplate.type}
          initialTemplate={editingTemplate.initialTemplate}
        />
      )}
    </div>
  );
};

export default ComunicacionModule;
