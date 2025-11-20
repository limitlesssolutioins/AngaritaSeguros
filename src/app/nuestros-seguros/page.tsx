
import type { Metadata } from 'next';
import styles from './page.module.css';

export const metadata: Metadata = {
  title: 'Nuestros Seguros - Angarita Seguros',
  description: 'Explora nuestra amplia gama de seguros para vehículos, hogar, vida y empresas. Encuentra la cobertura perfecta para ti.',
};

const NuestrosSegurosPage = () => {
  const seguros = [
    {
      titulo: 'Seguro de Automóvil',
      descripcion: 'Protección completa para tu vehículo contra accidentes, robo y daños a terceros. Viaja con la tranquilidad de estar siempre respaldado.',
      icono: '🚗',
    },
    {
      titulo: 'Seguro de Hogar',
      descripcion: 'Asegura tu casa o apartamento contra incendios, inundaciones, robos y otros imprevistos. Protege tu mayor patrimonio.',
      icono: '🏠',
    },
    {
      titulo: 'Seguro de Vida',
      descripcion: 'Garantiza el futuro financiero de tus seres queridos. Ofrecemos pólizas flexibles que se adaptan a tus necesidades y presupuesto.',
      icono: '👨‍👩‍👧‍👦',
    },
    {
      titulo: 'Seguro de Salud (Póliza de Salud)',
      descripcion: 'Accede a una red de clínicas y especialistas de primer nivel. Cobertura para consultas, hospitalización, cirugías y más.',
      icono: '🏥',
    },
    {
      titulo: 'Seguro para Empresas',
      descripcion: 'Protege tu negocio con soluciones a la medida: seguros para flotas, responsabilidad civil, maquinaria y más.',
      icono: '🏢',
    },
    {
      titulo: 'SOAT',
      descripcion: 'Cumple con la ley y adquiere el Seguro Obligatorio de Accidentes de Tránsito de forma rápida y sencilla a través de nuestra plataforma.',
      icono: '📄',
    },
  ];

  return (
    <div className={styles.page}>
      <section className={styles.section}>
        <div className={styles.text_center}>
          <h1 className={styles.title}>Nuestros Seguros</h1>
          <p className={styles.subtitle}>
            Ofrecemos una solución para cada una de tus necesidades de protección. Conoce nuestras principales coberturas y encuentra la ideal para ti.
          </p>
        </div>

        <div className={styles.grid}>
          {seguros.map((seguro) => (
            <div key={seguro.titulo} className={styles.card}>
              <div className={styles.icon}>{seguro.icono}</div>
              <h3 className={styles.card_title}>{seguro.titulo}</h3>
              <p className={styles.card_description}>{seguro.descripcion}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default NuestrosSegurosPage;
