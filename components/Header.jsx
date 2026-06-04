'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Film, Plus, LogOut, User } from 'lucide-react';
import styles from './Header.module.css';

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setUser(session?.user ?? null);
      } catch (err) {
        console.error('Error fetching session:', err);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      router.push('/movies');
      router.refresh();
    } catch (err) {
      console.error('Error signing out:', err);
    }
  };

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
          
          {user && (
            <Link
              href="/movies/new"
              className={styles.ctaBtn}
              id="nav-link-new"
            >
              <Plus size={16} />
              <span>Přidat film</span>
            </Link>
          )}

          {!loading && (
            <>
              {user ? (
                <div className={styles.userContainer} id="nav-user-info">
                  <span className={styles.userEmail} title={user.email}>
                    {user.user_metadata?.display_name || user.email}
                  </span>
                  <button
                    onClick={handleSignOut}
                    className={styles.logoutBtn}
                    id="nav-btn-logout"
                    title="Odhlásit se"
                  >
                    <LogOut size={16} style={{ display: 'inline', marginRight: '0.25rem', verticalAlign: 'middle' }} />
                    <span>Odhlásit</span>
                  </button>
                </div>
              ) : (
                <Link
                  href="/auth"
                  className={`${styles.link} ${pathname === '/auth' ? styles.linkActive : ''}`}
                  id="nav-link-login"
                >
                  Přihlásit se
                </Link>
              )}
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
