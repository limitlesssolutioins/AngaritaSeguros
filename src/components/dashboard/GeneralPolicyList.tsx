import styles from './PolicyList.module.css'; // Re-using styles for now

// Define the structure of a general policy
interface GeneralPolicy {
  id: string;
  etiquetaOficina: string;
  etiquetaCliente: string;
  aseguradora: string;
  clientNombreCompleto: string; // New: comes from Client table join
  clientTipoIdentificacion: string; // New: comes from Client table join
  clientNumeroIdentificacion: string; // New: comes from Client table join
  ramo: string;
  numeroPoliza: string;
  fechaExpedicion: string;
  fechaInicio: string;
  fechaFinVigencia: string;
  placa?: string;
  valorPrimaNeta: number;
  valorTotalAPagar: number;
  financiado: boolean;
  financiera?: string;
  files?: string[];
}

interface GeneralPolicyListProps {
  policies: GeneralPolicy[];
  isLoading: boolean;
  error: string | null;
  onEdit: (policyId: string) => void;
  onDelete: (policyId: string) => void;
}

const GeneralPolicyList: React.FC<GeneralPolicyListProps> = ({ policies, isLoading, error, onEdit, onDelete }) => {
  if (isLoading) return <p>Cargando pólizas...</p>;
  if (error) return <p className={styles.errorText}>{error}</p>;

  return (
    <div className={styles.tableContainer}>
      {policies.length === 0 ? (
        <p>No hay pólizas generales creadas todavía.</p>
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
              <th>Ramo</th>
              <th>Nº Póliza</th>
              <th>Fecha Expedición</th>
              <th>Fecha Inicio</th>
              <th>Fecha Fin</th>
              <th>Placa</th>
              <th>Prima Neta</th>
              <th>Total a Pagar</th>
              <th>Financiado</th>
              <th>Financiera</th>
              <th>Archivos</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {policies.map(policy => (
              <tr key={policy.id}>
                <td>{policy.clientNombreCompleto}</td>
                <td>{policy.clientTipoIdentificacion}</td>
                <td>{policy.clientNumeroIdentificacion}</td>
                <td>{policy.etiquetaCliente}</td>
                <td>{policy.etiquetaOficina}</td>
                <td>{policy.aseguradora}</td>
                <td>{policy.ramo}</td>
                <td>{policy.numeroPoliza}</td>
                <td>{new Date(policy.fechaExpedicion).toLocaleDateString()}</td>
                <td>{new Date(policy.fechaInicio).toLocaleDateString()}</td>
                <td>{new Date(policy.fechaFinVigencia).toLocaleDateString()}</td>
                <td>{policy.placa ?? 'N/A'}</td>
                <td>{policy.valorPrimaNeta.toLocaleString('es-CO', { style: 'currency', currency: 'COP' })}</td>
                <td>{policy.valorTotalAPagar.toLocaleString('es-CO', { style: 'currency', currency: 'COP' })}</td>
                <td>{policy.financiado ? 'Sí' : 'No'}</td>
                <td>{policy.financiera ?? 'N/A'}</td>
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

export default GeneralPolicyList;