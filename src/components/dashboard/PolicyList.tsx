import styles from './PolicyList.module.css';

// Define the structure of a policy, mirroring the backend
interface Policy {
  id: string;
  etiqueta: string;
  titularPoliza: string; // Renamed from 'nombre'
  fechaExpedicion: string;
  fechaVencimiento: string;
  aseguradora: string;
  valorPrima: number;
  numeroPoliza: string;
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
        <p>No hay pólizas creadas todavía.</p>
      ) : (
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Titular de la Póliza</th>
              <th>Etiqueta</th>
              <th>Aseguradora</th>
              <th>Nº Póliza</th>
              <th>Fecha Expedición</th>
              <th>Fecha Vencimiento</th>
              <th>Valor Prima</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {policies.map(policy => (
              <tr key={policy.id}>
                <td>{policy.titularPoliza}</td>
                <td>{policy.etiqueta}</td>
                <td>{policy.aseguradora}</td>
                <td>{policy.numeroPoliza}</td>
                <td>{new Date(policy.fechaExpedicion).toLocaleDateString()}</td>
                <td>{new Date(policy.fechaVencimiento).toLocaleDateString()}</td>
                <td>{policy.valorPrima.toLocaleString('es-CO', { style: 'currency', currency: 'COP' })}</td>
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
