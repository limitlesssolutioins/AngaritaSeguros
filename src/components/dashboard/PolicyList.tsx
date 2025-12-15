import styles from './PolicyList.module.css';

// Define the structure of a policy, mirroring the new backend schema
interface Policy {
  id: string;
  etiquetaOficina: string;
  etiquetaCliente: string;
  clientNombreCompleto: string; // New: comes from Client table join
  clientNumeroIdentificacion: string; // New: comes from Client table join
  tipoIdentificacion: string; // New: comes from Client table join
  fechaExpedicion: string;
  fechaInicioVigencia: string;
  fechaTerminacionVigencia: string;
  aseguradora: string;
  valorPrimaNeta: number;
  valorTotalAPagar: number;
  numeroPoliza: string;
  numeroAnexos: number;
  tipoPoliza: string;
  files?: string[];
}

interface PolicyListProps {
  policies: Policy[];
  isLoading: boolean;
  error: string | null;
  onEdit: (policyId: string) => void;
  onDelete: (policyId: string) => void;
}

const PolicyList: React.FC<PolicyListProps> = ({ policies, isLoading, error, onEdit, onDelete }) => {
  if (isLoading) return <p>Cargando pólizas...</p>;
  if (error) return <p className={styles.errorText}>{error}</p>;

  return (
    <div className={styles.tableContainer}>
      {policies.length === 0 ? (
        <p>No hay pólizas de cumplimiento creadas todavía.</p>
      ) : (
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Tomador de la Póliza</th>
              <th>Tipo ID</th>
              <th>Número ID</th>
              <th>Etiqueta Cliente</th>
              <th>Etiqueta Oficina</th>
              <th>Aseguradora</th>
              <th>Nº Póliza</th>
              <th>Tipo de Póliza</th>
              <th>No. Anexo</th>
              <th>Archivos</th>
              <th>Fecha Inicio Vigencia</th>
              <th>Fecha Fin Vigencia</th>
              <th>Valor Prima Neta</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {policies.map(policy => (
              <tr key={policy.id}>
                <td>{policy.clientNombreCompleto}</td>
                <td>{policy.tipoIdentificacion}</td>
                <td>{policy.clientNumeroIdentificacion}</td>
                <td>{policy.etiquetaCliente}</td>
                <td>{policy.etiquetaOficina}</td>
                <td>{policy.aseguradora}</td>
                <td>{policy.numeroPoliza}</td>
                <td>{policy.tipoPoliza}</td>
                <td>{policy.numeroAnexos ?? 'N/A'}</td>
                <td>
                  {policy.files && policy.files.length > 0 ? (
                    <div className={styles.fileLinks}>
                      {policy.files.map((fileUrl, index) => (
                        <a 
                          key={index} 
                          href={`/api/files/view?url=${encodeURIComponent(fileUrl)}`}
                          target="_blank" 
                          rel="noopener noreferrer"
                          className={styles.fileLink}
                        >
                          Ver PDF {index + 1}
                        </a>
                      ))}
                    </div>
                  ) : (
                    'Sin archivos'
                  )}
                </td>
                <td>{new Date(policy.fechaInicioVigencia).toLocaleDateString()}</td>
                <td>{new Date(policy.fechaTerminacionVigencia).toLocaleDateString()}</td>
                <td>{policy.valorPrimaNeta.toLocaleString('es-CO', { style: 'currency', currency: 'COP' })}</td>
                <td>
                  <button onClick={() => onEdit(policy.id)} className={styles.actionButton}>Editar</button>
                  <button onClick={() => onDelete(policy.id)} className={`${styles.actionButton} ${styles.deleteButton}`}>Eliminar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default PolicyList;