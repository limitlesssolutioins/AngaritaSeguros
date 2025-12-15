import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import styles from './Dropzone.module.css';

interface DropzoneProps {
  onFilesAccepted: (files: File[]) => void;
  externalFiles?: File[];
}

const Dropzone: React.FC<DropzoneProps> = ({ onFilesAccepted, externalFiles = [] }) => {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    onFilesAccepted(acceptedFiles);
  }, [onFilesAccepted]);

  const {
    getRootProps,
    getInputProps,
    isDragActive,
    acceptedFiles
  } = useDropzone({ onDrop });

  // Combine internal accepted files with external files for display
  const allFiles = [...externalFiles, ...acceptedFiles];

  // Remove duplicates based on name and size (simple check)
  const uniqueFiles = allFiles.filter((file, index, self) =>
    index === self.findIndex((f) => (
      f.name === file.name && f.size === file.size
    ))
  );

  const fileList = uniqueFiles.map(file => (
    <li key={`${file.name}-${file.size}`} className={styles.fileListItem}>
      {file.name} - {Math.round(file.size / 1024)} KB
    </li>
  ));

  return (
    <section className={styles.container}>
      <div {...getRootProps({ className: `${styles.dropzone} ${isDragActive ? styles.active : ''}` })}>
        <input {...getInputProps()} />
        <p>Arrastra y suelta archivos aquí, o haz clic para seleccionarlos</p>
      </div>
      {fileList.length > 0 && (
        <aside className={styles.fileListContainer}>
          <h4 className={styles.fileListTitle}>Archivos seleccionados:</h4>
          <ul className={styles.fileList}>{fileList}</ul>
        </aside>
      )}
    </section>
  );
};

export default Dropzone;
