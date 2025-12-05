'use client';

import { useState } from 'react';
import RequestsList from '@/components/dashboard/RequestsList';
import UsersList from '@/components/dashboard/UsersList';
import ClientList from '@/components/dashboard/ClientList';
import PolicyRenewalTasks from '@/components/dashboard/PolicyRenewalTasks';
import ReportsModule from '@/components/dashboard/ReportsModule';
import DashboardNavbar from '@/components/dashboard/DashboardNavbar';
import CarteraModule from '@/components/dashboard/CarteraModule'; // Changed from CarteraList
import GestionEmpresarialContainer from '@/components/dashboard/GestionEmpresarialContainer'; // New Import
import SettingsModule from '@/components/dashboard/SettingsModule';
import CumplimientoModule from '@/components/dashboard/CumplimientoModule';
import PolicyModule from '@/components/dashboard/PolicyModule';
import ComunicacionModule from '@/components/dashboard/ComunicacionModule';
import styles from './DashboardLayout.module.css'; // Use layout's CSS

export default function DashboardPage() {
  const [activeSection, setActiveSection] = useState('requests');

  const getSectionTitle = () => {
    switch (activeSection) {
      case 'requests':
        return 'Módulo Web';
      case 'clients':
        return 'Gestión de Clientes';
      case 'tasks':
        return 'Gestión de Tareas de Renovación de Pólizas';
      case 'cartera':
        return 'Gestión de Cartera'; // Title remains the same
      case 'reports':
        return 'Informes';
      case 'gestion-empresarial':
        return 'Gestión Empresarial'; // Title remains the same
      case 'settings':
        return 'Configuración';
      case 'cumplimiento':
        return 'Pólizas de Cumplimiento';
      case 'general-policies':
        return 'Pólizas Generales';
      case 'comunicacion':
        return 'Módulo de Comunicación';
      default:
        return 'Dashboard';
    }
  };

  return (
    <>
      <DashboardNavbar activeSection={activeSection} setActiveSection={setActiveSection} />

      {/* Main Content is now directly inside the layout's main tag */}
      <h1 className={styles.pageTitle}>{getSectionTitle()}</h1>
      
      {activeSection === 'requests' && (
        <div>
          <RequestsList />
        </div>
      )}

      {activeSection === 'clients' && (
        <div>
          <ClientList />
        </div>
      )}
      {activeSection === 'tasks' && (
        <div>
          <PolicyRenewalTasks />
        </div>
      )}
      {activeSection === 'cartera' && (
        <div>
          <CarteraModule /> {/* Changed from CarteraList */}
        </div>
      )}
      {activeSection === 'reports' && (
        <div>
          <ReportsModule />
        </div>
      )}
      {activeSection === 'gestion-empresarial' && (
        <div>
          <GestionEmpresarialContainer />
        </div>
      )}
      {activeSection === 'settings' && (
        <div>
          <SettingsModule />
        </div>
      )}
      {activeSection === 'cumplimiento' && (
        <div>
          <CumplimientoModule />
        </div>
      )}
      {activeSection === 'general-policies' && (
        <div>
          <PolicyModule />
        </div>
      )}
      {activeSection === 'comunicacion' && (
        <div>
          <ComunicacionModule />
        </div>
      )}
    </>
  );
}