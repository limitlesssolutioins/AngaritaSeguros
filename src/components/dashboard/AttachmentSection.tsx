
'use client';

import { useState } from 'react';
import Dropzone from '../ui/Dropzone';
import styles from './AttachmentSection.module.css';

interface Attachment {
  id: string;
  name: string;
  url: string;
}

interface AttachmentSectionProps {
  attachments: Attachment[];
}

export default function AttachmentSection({ attachments: initialAttachments }: AttachmentSectionProps) {
  const [attachments, setAttachments] = useState<Attachment[]>(initialAttachments);
  const [newFiles, setNewFiles] = useState<File[]>([]);

  const handleFilesAccepted = (files: File[]) => {
    setNewFiles(prevFiles => [...prevFiles, ...files]);
  };

  const handleSave = () => {
    // Here you would typically upload the files to a server
    // and then update the attachments list.
    console.log('Uploading files:', newFiles);
    // For now, we'll just add them to the list visually
    const newAttachments: Attachment[] = newFiles.map((file, index) => ({
      id: `new-${index}`,
      name: file.name,
      url: URL.createObjectURL(file),
    }));
    setAttachments(prev => [...prev, ...newAttachments]);
    setNewFiles([]);
  };

  return (
    <div>
      <h3>Archivos Adjuntos</h3>
      <Dropzone onFilesAccepted={handleFilesAccepted} />
      {newFiles.length > 0 && (
        <div className={styles.newFilesSection}>
          <h4>Nuevos archivos para subir:</h4>
          <ul>
            {newFiles.map(file => (
              <li key={file.name}>{file.name}</li>
            ))}
          </ul>
          <button onClick={handleSave} className={styles.saveButton}>Guardar Archivos</button>
        </div>
      )}
      <div className={styles.attachmentList}>
        <h4>Archivos existentes:</h4>
        {attachments.length === 0 ? (
          <p>No hay archivos adjuntos.</p>
        ) : (
          <ul>
            {attachments.map(attachment => (
              <li key={attachment.id}>
                <a href={attachment.url} target="_blank" rel="noopener noreferrer">
                  {attachment.name}
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
