
import FadeIn from '@/components/animation/FadeIn';
import styles from './TestimoniosSection.module.css';

const TestimoniosSection = () => {
  const testimonios = [
    {
      nombre: 'Ana María G.',
      testimonio: '¡El proceso fue increíblemente rápido! En menos de 5 minutos tenía mi cotización. El equipo me ayudó a elegir la mejor opción para mi carro. ¡Totalmente recomendados!',
      ciudad: 'Barranquilla',
    },
    {
      nombre: 'Carlos F.',
      testimonio: 'Tenía dudas sobre el seguro de vida y me dieron una asesoría súper completa. Se nota que saben lo que hacen y se preocupan por el cliente. Excelente servicio.',
      ciudad: 'Cartagena',
    },
    {
      nombre: 'Sofía V.',
      testimonio: 'Pude asegurar mi apartamento de forma muy sencilla. La plataforma es muy intuitiva y el soporte por WhatsApp fue inmediato para resolver una duda que tenía.',
      ciudad: 'Santa Marta',
    },
  ];

  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <FadeIn duration={0.5} delay={0.2}>
          <div className={`${styles.text_center} ${styles.mb_12}`}>
            <h2 className={styles.title}>Lo que dicen nuestros clientes</h2>
          </div>
        </FadeIn>
        <div className={styles.grid}>
          {testimonios.map((testimonio, index) => (
            <FadeIn key={testimonio.nombre} duration={0.5} delay={0.4 + index * 0.2}>
              <div className={styles.card}>
                <p className={styles.testimonio}>'{testimonio.testimonio}'</p>
                <div className={styles.nombre}>{testimonio.nombre}</div>
                <div className={styles.ciudad}>{testimonio.ciudad}</div>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimoniosSection;
