'use client';
import { useState } from 'react';
import styles from './ComunicacionModule.module.css';

const ComunicacionModule = () => {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Módulo de Comunicación</h1>
      </div>

      <div className={styles.comingSoon}>
        <h2>Próximamente</h2>
        <p>
          Este módulo permitirá la gestión y el envío de comunicaciones automáticas y manuales a los clientes.
        </p>
        <ul className={styles.featureList}>
          <li><span className={styles.icon}>📧</span> Creación y gestión de plantillas de correo electrónico.</li>
          <li><span className={styles.icon}>📱</span> Integración con WhatsApp Business para mensajes automáticos y masivos.</li>
          <li><span className={styles.icon}>🎂</span> Automatización de saludos de cumpleaños.</li>
          <li><span className={styles.icon}>✨</span> Notificaciones de expedición de pólizas.</li>
          <li><span className={styles.icon}>⏳</span> Alertas de pólizas a punto de vencer.</li>
          <li><span className={styles.icon}>📊</span> Envío de encuestas de satisfacción.</li>
        </ul>
        <p>
          La funcionalidad completa se implementará después de la creación del Módulo de Clientes, que centralizará la información de contacto.
        </p>
      </div>
    </div>
  );
};

export default ComunicacionModule;
