
import styles from './AseguradorasSection.module.css';

const AseguradorasSection = () => {
  const logos = [
    { name: 'Sura', logo: '/img/aliado1.png' },
    { name: 'Allianz', logo: '/img/aliado2.png' },
    { name: 'Bolívar', logo: '/img/aliado3.png' },
    { name: 'Equidad', logo: '/img/aliado4.png' },
    { name: 'Mapfre', logo: '/img/aliado5.png' },
    { name: 'Previsora', logo: '/img/aliado6.png' },
  ];

  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <div className={styles.relative}>
          <div className={styles.flex_marquee}>
            {logos.concat(logos).map((logo, index) => (
              <div key={index} className={styles.logo_container}>
                <img src={logo.logo} alt={logo.name} className={styles.logo} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default AseguradorasSection;
