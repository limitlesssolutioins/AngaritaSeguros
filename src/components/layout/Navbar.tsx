
import Link from 'next/link';
import styles from './Navbar.module.css';

const Navbar = () => {
  return (
    <nav className={styles.nav}>
      <div className={styles.container}>
        <div className={styles.flex_between}>
          <Link href="/" className={styles.logo_link}>
            <img src="/img/icon.png" alt="Angarita Seguros Icon" className={styles.logo_icon} />
            <img src="/img/logotext.png" alt="Angarita Seguros" className={styles.logo_text} />
          </Link>
        </div>
        <div className={styles.nav_links_container}>
          <div className={styles.nav_links}>
            <Link href="/" className={styles.nav_link}>Inicio</Link>
            <Link href="/quienes-somos" className={styles.nav_link}>Quiénes Somos</Link>
            <Link href="/nuestros-seguros" className={styles.nav_link}>Nuestros Seguros</Link>
            <Link href="/blog" className={styles.nav_link}>Blog</Link>
            <Link href="/contacto" className={styles.nav_link}>Contacto</Link>
            <Link href="/dashboard" className={styles.nav_link}>Dashboard</Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
