import Link from 'next/link';
import { useRouter } from 'next/navigation';
import styles from './DashboardNavbar.module.css';
import { FaListAlt, FaUsers, FaTasks, FaMoneyBillWave, FaChartBar, FaFileAlt, FaCog, FaUserCircle, FaFileContract, FaBullhorn, FaSignOutAlt } from 'react-icons/fa';

interface DashboardNavbarProps {
  activeSection: string;
  setActiveSection: (section: string) => void;
}

const DashboardNavbar: React.FC<DashboardNavbarProps> = ({ activeSection, setActiveSection }) => {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/dashboard/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const navItems = [
    { name: 'Web', section: 'requests', icon: FaListAlt }, // Renamed from Solicitudes
    { name: 'Clientes', section: 'clients', icon: FaUsers },
    { name: 'Tareas', section: 'tasks', icon: FaTasks },
    { name: 'Comunicación', section: 'comunicacion', icon: FaBullhorn },
    { name: 'Cartera', section: 'cartera', icon: FaMoneyBillWave },
    { name: 'Gestión Empresarial', section: 'gestion-empresarial', icon: FaFileAlt },
    { name: 'Informes', section: 'reports', icon: FaChartBar },
    { name: 'Pólizas Generales', section: 'general-policies', icon: FaFileContract },
    { name: 'Cumplimiento', section: 'cumplimiento', icon: FaFileContract },
    { name: 'Configuración', section: 'settings', icon: FaCog },
  ];

  return (
    <nav className={styles.navbar}>
      <div className={styles.container}>
        <div className={styles.navItems}>
          {navItems.map((item) => (
            <Link 
              key={item.name} 
              href={`#${item.section}`} 
              onClick={() => setActiveSection(item.section)}
              className={`${styles.navLink} ${activeSection === item.section ? styles.activeNavLink : ''}`}
            >
              <item.icon className={styles.navIcon} />
              <span>{item.name}</span>
            </Link>
          ))}
        </div>
        
        <button onClick={handleLogout} className={`${styles.navLink} ${styles.logoutButton}`}>
          <FaSignOutAlt className={styles.navIcon} />
          <span>Cerrar Sesión</span>
        </button>
      </div>
    </nav>
  );
};

export default DashboardNavbar;
