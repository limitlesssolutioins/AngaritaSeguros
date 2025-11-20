import Link from 'next/link';
import styles from './DashboardNavbar.module.css';
import { FaListAlt, FaUsers, FaTasks, FaMoneyBillWave, FaChartBar, FaFileAlt, FaCog, FaUserCircle, FaFileContract } from 'react-icons/fa';

interface DashboardNavbarProps {
  activeSection: string;
  setActiveSection: (section: string) => void;
}

const DashboardNavbar: React.FC<DashboardNavbarProps> = ({ activeSection, setActiveSection }) => {
  const navItems = [
    { name: 'Solicitudes', section: 'requests', icon: FaListAlt },
    { name: 'Clientes', section: 'clients', icon: FaUsers },
    { name: 'Tareas', section: 'tasks', icon: FaTasks },
    { name: 'Cartera', section: 'cartera', icon: FaMoneyBillWave },
    { name: 'Informes', section: 'reports', icon: FaChartBar },
    { name: 'Gestión Empresarial', section: 'gestion-empresarial', icon: FaFileAlt },
    { name: 'Configuración', section: 'settings', icon: FaCog },
    { name: 'Usuarios', section: 'users', icon: FaUserCircle },
    { name: 'Cumplimiento', section: 'cumplimiento', icon: FaFileContract },
  ];

  return (
    <nav className={styles.navbar}>
      <div className={styles.container}>
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
    </nav>
  );
};

export default DashboardNavbar;
