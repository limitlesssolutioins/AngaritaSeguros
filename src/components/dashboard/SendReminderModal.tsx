'use client';
import React, { useState, useEffect } from 'react';
import styles from './SendReminderModal.module.css';
import { format } from 'date-fns';
import Select from 'react-select';

// Assuming a Policy type exists
interface Policy {
  id: string;
  numeroPoliza: string;
  fechaExpedicion: string;
  fechaInicio: string;
  fechaFinVigencia: string;
  placa?: string;
  valorPrimaNeta: number;
  valorTotalAPagar: number;
  financiado: boolean;
  financiera?: string;
  files: string[];
  createdAt: string;
  updatedAt: string;
  aseguradora: string;
  etiquetaCliente: string;
  etiquetaOficina: string;
  ramo: string;
  clientId: string;
  clientNombreCompleto: string;
  clientTipoIdentificacion: string;
  clientNumeroIdentificacion: string;
  status: string;
  responsibleAgentId?: string;
  lastReminderSent?: string;
  // Client contact info
  clientEmail?: string;
  clientPhone?: string;
}

interface Template {
  id: string;
  category: string;
  type: 'email' | 'whatsapp';
  subject?: string;
  body: string;
}

interface Option {
  value: string;
  label: string;
  disabled?: boolean;
}

interface SendReminderModalProps {
  policy: Policy;
  onClose: () => void;
  onReminderSent: () => void; // Callback to re-fetch policies in parent component
}

const SendReminderModal: React.FC<SendReminderModalProps> = ({ policy, onClose, onReminderSent }) => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<Option | null>(null);
  const [selectedChannel, setSelectedChannel] = useState<Option | null>(null);
  const [overrideContent, setOverrideContent] = useState<string>('');
  const [previewSubject, setPreviewSubject] = useState<string>('');
  const [previewBody, setPreviewBody] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const response = await fetch('/api/templates');
        if (!response.ok) {
          throw new Error('Error fetching templates');
        }
        const data: Template[] = await response.json();
        setTemplates(data);
      } catch (err: any) {
        setError(err.message);
      }
    };
    fetchTemplates();
  }, []);

  useEffect(() => {
    if (selectedTemplate) {
      const template = templates.find(t => t.id === selectedTemplate.value);
      if (template) {
        setSelectedChannel({ value: template.type, label: template.type === 'email' ? 'Correo Electrónico' : 'WhatsApp' });
        // Replace placeholders for preview
        let subject = template.subject || '';
        let body = template.body;

        body = body.replace(/{{clientName}}/g, policy.clientNombreCompleto || 'Cliente');
        body = body.replace(/{{policyNumber}}/g, policy.numeroPoliza || 'N/A');
        body = body.replace(/{{expirationDate}}/g, policy.fechaFinVigencia ? format(new Date(policy.fechaFinVigencia), 'dd/MM/yyyy') : 'N/A');
        body = body.replace(/{{primaNeta}}/g, policy.valorPrimaNeta ? policy.valorPrimaNeta.toLocaleString('es-CO') : 'N/A');
        body = body.replace(/{{totalAPagar}}/g, policy.valorTotalAPagar ? policy.valorTotalAPagar.toLocaleString('es-CO') : 'N/A');
        body = body.replace(/{{aseguradoraName}}/g, policy.aseguradora || 'N/A');
        body = body.replace(/{{ramoName}}/g, policy.ramo || 'N/A');

        subject = subject.replace(/{{clientName}}/g, policy.clientNombreCompleto || 'Cliente');
        subject = subject.replace(/{{policyNumber}}/g, policy.numeroPoliza || 'N/A');
        subject = subject.replace(/{{expirationDate}}/g, policy.fechaFinVigencia ? format(new Date(policy.fechaFinVigencia), 'dd/MM/yyyy') : 'N/A');

        setPreviewSubject(subject);
        setPreviewBody(overrideContent || body);
      }
    } else {
      setPreviewSubject('');
      setPreviewBody('');
      setSelectedChannel(null);
    }
  }, [selectedTemplate, overrideContent, templates, policy]);

  const handleTemplateChange = (option: Option | null) => {
    setSelectedTemplate(option);
    setOverrideContent(''); // Clear override content when template changes
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!selectedTemplate || !selectedChannel) {
      setError('Por favor, selecciona una plantilla y un canal.');
      return;
    }

    // Check if client has contact info for the selected channel
    if (selectedChannel.value === 'email' && !policy.clientEmail) {
      setError('El cliente no tiene un correo electrónico registrado.');
      return;
    }
    if (selectedChannel.value === 'whatsapp' && !policy.clientPhone) {
      setError('El cliente no tiene un número de teléfono registrado para WhatsApp.');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/communications/send-renewal-reminder', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          policyId: policy.id,
          templateId: selectedTemplate.value,
          channel: selectedChannel.value,
          overrideContent: overrideContent || null,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al enviar el recordatorio');
      }

      alert('Recordatorio enviado exitosamente!');
      onReminderSent(); // Notify parent to re-fetch policies
      onClose();

    } catch (err: any) {
      setError(err.message);
      console.error("Error sending reminder:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const templateOptions = templates.map(t => ({
    value: t.id,
    label: `${t.category} - ${t.type === 'email' ? 'Correo' : 'WhatsApp'} - ${t.subject || t.body.substring(0, 30)}...`,
  }));

  const channelOptions = [
    { value: 'email', label: 'Correo Electrónico', disabled: !policy.clientEmail },
    { value: 'whatsapp', label: 'WhatsApp', disabled: !policy.clientPhone },
  ];

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <h2>Enviar Recordatorio de Renovación - Póliza #{policy.numeroPoliza}</h2>
          <button onClick={onClose} className={styles.closeButton}>&times;</button>
        </div>
        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label htmlFor="template-select">Seleccionar Plantilla</label>
            <Select
              id="template-select"
              options={templateOptions}
              value={selectedTemplate}
              onChange={handleTemplateChange}
              placeholder="Selecciona una plantilla..."
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="channel-select">Canal de Comunicación</label>
            <Select
              id="channel-select"
              options={channelOptions}
              value={selectedChannel}
              isDisabled={true} // Channel is determined by template type
              placeholder="Canal (automático según plantilla)"
            />
          </div>

          {selectedTemplate && (
            <>
              {selectedChannel?.value === 'email' && (
                <div className={styles.formGroup}>
                  <label>Asunto del Correo</label>
                  <input type="text" value={previewSubject} readOnly />
                </div>
              )}
              <div className={styles.formGroup}>
                <label htmlFor="overrideContent">Cuerpo del Mensaje (Previsualización y Edición)</label>
                <textarea
                  id="overrideContent"
                  value={previewBody}
                  onChange={(e) => setOverrideContent(e.target.value)}
                ></textarea>
              </div>
            </>
          )}

          {error && <p className={styles.errorText}>{error}</p>}

          <div className={styles.formActions}>
            <button type="button" onClick={onClose} className={styles.cancelButton} disabled={isSubmitting}>Cancelar</button>
            <button type="submit" className={styles.sendButton} disabled={isSubmitting || !selectedTemplate || !selectedChannel}>
              {isSubmitting ? 'Enviando...' : 'Enviar Recordatorio'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SendReminderModal;