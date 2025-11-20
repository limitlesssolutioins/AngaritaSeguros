import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import styles from './Dropzone.module.css';

interface DropzoneProps {
  onFilesAccepted: (files: File[]) => void;
}

const Dropzone: React.FC<DropzoneProps> = ({ onFilesAccepted }) => {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    onFilesAccepted(acceptedFiles);
  }, [onFilesAccepted]);

  const {
    getRootProps,
    getInputProps,
    isDragActive,
    acceptedFiles
  } = useDropzone({ onDrop });

  const files = acceptedFiles.map(file => (
    <li key={file.name} className={styles.fileListItem}>
      {file.name} - {Math.round(file.size / 1024)} KB
    </li>
  ));

  return (
    <section className={styles.container}>
      <div {...getRootProps({ className: `${styles.dropzone} ${isDragActive ? styles.active : ''}` })}>
        <input {...getInputProps()} />
        <p>Arrastra y suelta archivos aquí, o haz clic para seleccionarlos</p>
      </div>
      {files.length > 0 && (
        <aside className={styles.fileListContainer}>
          <h4 className={styles.fileListTitle}>Archivos seleccionados:</h4>
          <ul className={styles.fileList}>{files}</ul>
        </aside>
      )}
    </section>
  );
};

export default Dropzone;
