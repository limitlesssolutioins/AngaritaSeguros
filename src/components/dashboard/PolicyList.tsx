import styles from './PolicyList.module.css';

// Define the structure of a policy, mirroring the backend
interface Policy {
  id: string;
  etiqueta: string;
  titularPoliza: string;
  fechaExpedicion: string;
  fechaInicioVigencia: string; // Matches DB
  fechaTerminacionVigencia: string; // Matches DB
  aseguradora: string;
  valorPrimaNeta: number; // Matches DB
  valorTotalAPagar: number; // Matches DB
  numeroPoliza: string;
  numeroAnexos: number;
  tipoAmparo: string;
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
              <th>Fecha Inicio Vigencia</th>
              <th>Fecha Fin Vigencia</th>
              <th>Valor Prima Neta</th>
              <th>Valor Total a Pagar</th>
              <th>Nº Anexos</th>
              <th>Tipo Amparo</th>
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
                <td>{new Date(policy.fechaInicioVigencia).toLocaleDateString()}</td>
                <td>{new Date(policy.fechaTerminacionVigencia).toLocaleDateString()}</td>
                <td>{policy.valorPrimaNeta.toLocaleString('es-CO', { style: 'currency', currency: 'COP' })}</td>
                <td>{policy.valorTotalAPagar.toLocaleString('es-CO', { style: 'currency', currency: 'COP' })}</td>
                <td>{policy.numeroAnexos ?? 'N/A'}</td>
                <td>{policy.tipoAmparo ?? 'N/A'}</td>
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
