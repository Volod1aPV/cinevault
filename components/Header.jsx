'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Film, Plus } from 'lucide-react';
import styles from './Header.module.css';

export default function Header() {
  const pathname = usePathname();

  return (
    <header className={styles.header}>
      <div className={`container ${styles.navContainer}`}>
        <Link href="/movies" className={styles.logo} id="nav-logo">
          <Film className={styles.logoIcon} size={24} />
          <span className={styles.logoText}>CineVault</span>
        </Link>

        <nav className={styles.navLinks}>
          <Link
            href="/movies"
            className={`${styles.link} ${
              pathname === '/movies' || pathname === '/' ? styles.linkActive : ''
            }`}
            id="nav-link-movies"
          >
            Filmy
          </Link>
          <Link
            href="/movies/new"
            className={styles.ctaBtn}
            id="nav-link-new"
          >
            <Plus size={16} />
            <span>Přidat film</span>
          </Link>
        </nav>
      </div>
    </header>
  );
}
