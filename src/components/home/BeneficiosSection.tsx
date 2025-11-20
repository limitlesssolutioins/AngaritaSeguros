
import FadeIn from '@/components/animation/FadeIn';
import styles from './BeneficiosSection.module.css';
import { FaLightbulb, FaHandshake, FaStar, FaCheckCircle, FaCreditCard } from 'react-icons/fa';

const BeneficiosSection = () => {
  const reasons = [
    {
      title: 'Líderes en asesoría de seguros',
      description: 'En AngaritaSeguros.com te guiamos en el proceso de compra digital de tu seguro, sin filas ni papeleos. Te ayudamos a adquirir la póliza que buscas con nuestras aseguradoras aliadas, e identificando el seguro que más se ajuste a tus necesidades.',
      icon: FaLightbulb,
    },
    {
      title: 'Cotiza con las mejores aseguradoras',
      description: 'Gracias a nuestras aseguradoras aliadas y su amplia oferta de pólizas podrás contar con cobertura y asistencia a nivel nacional.',
      icon: FaHandshake,
    },
    {
      title: 'Conoce opiniones de clientes reales',
      description: 'Te ayudamos a elegir el mejor seguro, tanto por cobertura y precio, como por la calificación otorgada por nuestros clientes al servicio de las aseguradoras.',
      icon: FaStar,
    },
    {
      title: 'Te asesoramos de principio a fin sin costo',
      description: 'Nuestros asesores especializados te guiarán y acompañarán durante todo el proceso, resolviendo dudas para que encuentres tu seguro ideal.',
      icon: FaCheckCircle,
    },
    {
      title: 'Financia tu seguro y paga en cuotas',
      description: 'Te brindamos la comodidad de financiar tu seguro en cuotas*, sin estudios y de manera fácil.\n\n*Número de cuotas sujeto a condiciones de la póliza y la entidad responsable.',
      icon: FaCreditCard,
    },
  ];

  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <FadeIn duration={0.5} delay={0.2}>
          <div className={`${styles.text_center} ${styles.mb_12}`}>
            <h2 className={styles.title}>¿Por qué cotizar con nosotros?</h2>
            <p className={styles.subtitle}>Encuentra el seguro ideal para ti, de forma fácil y rápida.</p>
          </div>
        </FadeIn>
        <div className={styles.grid}>
          {reasons.map((reason, index) => (
            <FadeIn key={reason.title} duration={0.5} delay={0.4 + index * 0.2}>
              <div className={styles.card}>
                <div className={styles.icon}><reason.icon /></div>
                <h3 className={styles.card_title}>{reason.title}</h3>
                <p className={styles.card_description}>{reason.description}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BeneficiosSection;
