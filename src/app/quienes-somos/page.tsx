
import type { Metadata } from 'next';
import styles from './page.module.css';

export const metadata: Metadata = {
  title: 'Quiénes Somos - Angarita Seguros',
  description: 'Conoce nuestra historia, misión y al equipo de expertos dedicados a tu protección.',
};

const QuienesSomosPage = () => {
  return (
    <div className={styles.page}>
      <section className={`${styles.container} ${styles.section_history}`}>
        <h1 className={styles.title}>Nuestra Historia</h1>
        <p className={styles.subtitle}>
          En Angarita Seguros, llevamos más de 20 años comprometidos con la seguridad y tranquilidad de nuestros clientes. Nacimos con la misión de ofrecer asesoría experta y un servicio cercano, entendiendo las necesidades únicas de cada persona y empresa en Barranquilla y toda la región Caribe.
        </p>
      </section>

      <section className={styles.section_mission}>
        <div className={styles.container}>
          <h2 className={styles.title}>Misión y Visión</h2>
          <div className={styles.mission_vision_container}>
            <div className={`${styles.card} ${styles.md_w_1_2}`}>
              <h3 className={styles.card_title}>Misión</h3>
              <p className={styles.card_text}>
                Brindar a nuestros clientes la mejor asesoría en seguros, con un portafolio completo y el respaldo de las aseguradoras más importantes del país, garantizando su protección y la de su patrimonio a través de un servicio ágil, transparente y digital.
              </p>
            </div>
            <div className={`${styles.card} ${styles.md_w_1_2}`}>
              <h3 className={styles.card_title}>Visión</h3>
              <p className={styles.card_text}>
                Ser la agencia de seguros líder en innovación en la Costa Caribe, reconocida por nuestra plataforma digital de vanguardia y por transformar la manera en que las personas cotizan, compran y gestionan sus pólizas, siendo siempre el aliado de confianza de nuestros asegurados.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.section_team}>
        <div className={styles.container}>
          <h2 className={styles.title}>Nuestro Equipo</h2>
          <div className={styles.team_grid}>
            {/* Miembro del Equipo 1 */}
            <div className={styles.team_member}>
              <div className={styles.avatar}></div>
              <h4 className={styles.team_member_name}>Juan Angarita</h4>
              <p className={styles.team_member_role}>Fundador y Gerente General</p>
            </div>
            {/* Miembro del Equipo 2 */}
            <div className={styles.team_member}>
              <div className={styles.avatar}></div>
              <h4 className={styles.team_member_name}>María Rodríguez</h4>
              <p className={styles.team_member_role}>Directora Comercial</p>
            </div>
            {/* Miembro del Equipo 3 */}
            <div className={styles.team_member}>
              <div className={styles.avatar}></div>
              <h4 className={styles.team_member_name}>Carlos Gómez</h4>
              <p className={styles.team_member_role}>Especialista en Seguros de Vida</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default QuienesSomosPage;
