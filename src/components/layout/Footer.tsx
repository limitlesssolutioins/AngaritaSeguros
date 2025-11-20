
import styles from './Footer.module.css';
import { FaFacebookF, FaInstagram, FaLinkedinIn } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.md_flex_between}>
          <div className={styles.footerSection}>
            <h2 className={styles.title}>Angarita Seguros</h2>
            <p className={styles.subtitle}>Tu aliado en protección y tranquilidad.</p>
          </div>
          <div className={styles.footerSection}>
            <h3 className={styles.links_title}>Enlaces Rápidos</h3>
            <ul className={styles.links_list}>
              <li><a href="/" className={styles.link}>Inicio</a></li>
              <li><a href="/quienes-somos" className={styles.link}>Quiénes Somos</a></li>
              <li><a href="/nuestros-seguros" className={styles.link}>Nuestros Seguros</a></li>
              <li><a href="/blog" className={styles.link}>Blog</a></li>
              <li><a href="/contacto" className={styles.link}>Contacto</a></li>
            </ul>
          </div>
          <div className={styles.footerSection}>
            <h3 className={styles.links_title}>Síguenos</h3>
            <div className={styles.socialIcons}>
              <a href="#" className={styles.socialLink} aria-label="Facebook"><FaFacebookF /></a>
              <a href="#" className={styles.socialLink} aria-label="Instagram"><FaInstagram /></a>
              <a href="#" className={styles.socialLink} aria-label="LinkedIn"><FaLinkedinIn /></a>
            </div>
          </div>
        </div>
        <hr className={styles.hr} />
        <div className={styles.text_center}>
          <p>&copy; {new Date().getFullYear()} Angarita Seguros. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
