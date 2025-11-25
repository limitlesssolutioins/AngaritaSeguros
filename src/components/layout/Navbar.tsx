'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './Navbar.module.css';

const Navbar = () => {
  const pathname = usePathname();

  return (
    <nav className={styles.nav}>
      <div className={styles.container}>
        <div className={styles.flex_between}>
          <Link href="/" className={styles.logo_link}>
            <img src="/img/logoangarita.png" alt="Angarita Seguros Logo" className={styles.logo} />
          </Link>
        </div>
        <div className={styles.nav_links_container}>
          <div className={styles.nav_links}>
            <Link href="/" className={`${styles.nav_link} ${pathname === '/' ? styles.active_link : ''}`}>Inicio</Link>
            <Link href="/quienes-somos" className={`${styles.nav_link} ${pathname === '/quienes-somos' ? styles.active_link : ''}`}>Quiénes Somos</Link>
            <Link href="/nuestros-seguros" className={`${styles.nav_link} ${pathname === '/nuestros-seguros' ? styles.active_link : ''}`}>Nuestros Seguros</Link>
            <Link href="/blog" className={`${styles.nav_link} ${pathname === '/blog' ? styles.active_link : ''}`}>Blog</Link>
            <Link href="/contacto" className={`${styles.nav_link} ${pathname === '/contacto' ? styles.active_link : ''}`}>Contacto</Link>
            <Link href="/dashboard" className={`${styles.nav_link} ${pathname === '/dashboard' ? styles.active_link : ''}`}>Dashboard</Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
