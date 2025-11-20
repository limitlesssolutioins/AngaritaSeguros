
import Link from 'next/link';
import FadeIn from '@/components/animation/FadeIn';
import styles from './NoticiasSection.module.css';

const NoticiasSection = () => {
  const posts = [
    {
      id: 1,
      titulo: '5 Mitos Comunes sobre el Seguro de Automóvil',
      resumen: 'Desmentimos las creencias populares más extendidas...',
      categoria: 'Automóvil',
    },
    {
      id: 2,
      titulo: '¿Por qué un Seguro de Vida es la mejor inversión?',
      resumen: 'Más allá de una protección, es una herramienta financiera...',
      categoria: 'Vida',
    },
    {
      id: 3,
      titulo: 'Guía Completa para Entender tu Póliza de Hogar',
      resumen: '¿Sabes qué cubre exactamente tu seguro? Te ayudamos...',
      categoria: 'Hogar',
    },
  ];

  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <FadeIn duration={0.5} delay={0.2}>
          <div className={`${styles.text_center} ${styles.mb_12}`}>
            <h2 className={styles.title}>Mantente Informado</h2>
            <p className={styles.subtitle}>Las últimas noticias y consejos de nuestro blog.</p>
          </div>
        </FadeIn>
        <div className={styles.grid}>
          {posts.map((post, index) => (
            <FadeIn key={post.id} duration={0.5} delay={0.4 + index * 0.2}>
              <div className={styles.card}>
                <div className={styles.card_content}>
                  <span className={styles.category}>{post.categoria}</span>
                  <h3 className={styles.card_title}>{post.titulo}</h3>
                  <p className={styles.card_resumen}>{post.resumen}</p>
                  <Link href={`/blog/${post.id}`} className={styles.read_more}>
                    Leer más →
                  </Link>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
        <FadeIn duration={0.5} delay={0.4 + posts.length * 0.2}>
          <div className={`${styles.text_center} ${styles.mt_12}`}>
            <Link href="/blog" className={styles.view_all_button}>
              Ver todas las noticias
            </Link>
          </div>
        </FadeIn>
      </div>
    </section>
  );
};

export default NoticiasSection;
