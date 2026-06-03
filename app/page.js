import Link from 'next/link';
import { Film, ArrowRight, Database, ShieldCheck, Cpu } from 'lucide-react';
import styles from './page.module.css';

export default function Home() {
  return (
    <div className="container">
      <section className={styles.heroSection}>
        <div className={`glass-panel ${styles.heroContent} fade-in`}>
          <div className={styles.iconWrapper}>
            <Film size={40} />
          </div>
          
          <h1 className={styles.title}>Vítejte v CineVault</h1>
          
          <p className={styles.subtitle}>
            Moderní a plně responzivní webová aplikace pro správu vaší osobní filmové knihovny. 
            Vytvořeno v Next.js (App Router) s přímou integrací Supabase pro bezpečné a rychlé ukládání dat.
          </p>

          <div className={styles.ctas}>
            <Link href="/movies" className={styles.primaryBtn} id="home-btn-browse">
              <span>Prohlížet knihovnu</span>
              <ArrowRight size={18} />
            </Link>
            
            <Link href="/movies/new" className={styles.secondaryBtn} id="home-btn-add">
              <span>Přidat nový film</span>
            </Link>
          </div>

          <div className={styles.techList}>
            <div className={styles.techItem}>
              <Cpu size={14} style={{ color: 'var(--accent-primary)' }} />
              <span>Next.js 15 App Router</span>
            </div>
            <div className={styles.techItem}>
              <Database size={14} style={{ color: 'var(--color-success)' }} />
              <span>Supabase Postgres DB</span>
            </div>
            <div className={styles.techItem}>
              <ShieldCheck size={14} style={{ color: 'var(--accent-secondary)' }} />
              <span>React Hook Form & Zod</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
