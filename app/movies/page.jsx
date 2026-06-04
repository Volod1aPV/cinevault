'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import MovieCard from '@/components/MovieCard';
import { Search, SlidersHorizontal, Plus, Film, Database, AlertTriangle } from 'lucide-react';
import { GENRES } from '@/lib/schemas';
import styles from './movies.module.css';

export default function MoviesPage() {
  // Check if Supabase keys are configured
  const isEnvConfigured =
    !!(process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

  const [user, setUser] = useState(null);
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(isEnvConfigured);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('');
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'my'
  const [dbError, setDbError] = useState(null);

  const fetchMovies = useCallback(async () => {
    try {
      setLoading(true);
      setDbError(null);
      
      const { data, error } = await supabase
        .from('movies')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      setMovies(data || []);
    } catch (err) {
      console.error('Chyba při načítání filmů:', err);
      setDbError(err.message || 'Nepodařilo se připojit k databázi.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isEnvConfigured) {
      Promise.resolve().then(() => {
        fetchMovies();
      });
    }

    // Get current user and watch auth state
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
    };
    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (!session) {
        setActiveTab('all');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [isEnvConfigured, fetchMovies]);

  const handleDelete = async (id) => {
    try {
      const { error } = await supabase
        .from('movies')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Update state local list
      setMovies((prev) => prev.filter((m) => m.id !== id));
    } catch (err) {
      console.error('Chyba při mazání filmu:', err);
      alert('Nepodařilo se smazat film. Zkuste to prosím znovu.');
    }
  };

  // Filter movies by search term, genre, and owner tab
  const filteredMovies = movies.filter((movie) => {
    const matchesSearch =
      movie.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      movie.director.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesGenre = selectedGenre === '' || movie.genre === selectedGenre;

    const matchesTab = activeTab === 'all' || (user && movie.user_id === user.id);

    return matchesSearch && matchesGenre && matchesTab;
  });

  const sqlSchema = `-- Run this in your Supabase SQL Editor to apply database changes:
alter table public.movies add column if not exists user_id uuid references auth.users(id) on delete set null;

create table if not exists public.reviews (
  id uuid default gen_random_uuid() primary key,
  movie_id uuid references public.movies(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete set null,
  user_name text not null,
  rating numeric(3, 1) not null check (rating >= 0 and rating <= 10),
  comment text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.movies enable row level security;
alter table public.reviews enable row level security;

-- Setup RLS Policies for movies
drop policy if exists "Public access to movies" on public.movies;
create policy "Everyone can view movies" on public.movies for select using (true);
create policy "Authenticated users can insert movies" on public.movies for insert with check (auth.role() = 'authenticated');
create policy "Users can update their own movies" on public.movies for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users can delete their own movies" on public.movies for delete using (auth.uid() = user_id);

-- Setup RLS Policies for reviews
create policy "Everyone can view reviews" on public.reviews for select using (true);
create policy "Authenticated users can insert reviews" on public.reviews for insert with check (auth.role() = 'authenticated');`;

  if (!isEnvConfigured) {
    return (
      <div className="container fade-in">
        <div className={`glass-panel ${styles.warnOverlay}`}>
          <h2>
            <AlertTriangle />
            <span>Chybí konfigurace Supabase</span>
          </h2>
          <p>
            Pro fungování aplikace je nutné propojit ji s vaší databází Supabase. Propojení proveďte podle následujících kroků:
          </p>
          <ol className={styles.stepsList}>
            <li>Vytvořte si bezplatný projekt na <a href="https://supabase.com" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'underline', color: 'var(--accent-primary)' }}>supabase.com</a>.</li>
            <li>Zkopírujte soubor <code>.env.local.example</code> v kořenu projektu a pojmenujte ho <code>.env.local</code>.</li>
            <li>Vložte do něj vaše přístupové údaje <code>NEXT_PUBLIC_SUPABASE_URL</code> a <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code> (najdete je v nastavení Supabase v sekci API).</li>
            <li>Restartujte vývojový server příkazem <code>npm run dev</code>.</li>
          </ol>
        </div>
      </div>
    );
  }

  return (
    <div className="container fade-in" style={{ paddingBottom: '3rem' }}>
      <div className={styles.pageHeader}>
        <div className={styles.titleSection}>
          <h1>Moje knihovna filmů</h1>
          <p>Přehled všech uložených filmů ve vaší CineVault databázi.</p>
        </div>
        <Link href={user ? '/movies/new' : '/auth?redirect=/movies/new'} className={styles.addFirstBtn} id="btn-add-movie-top">
          <Plus size={18} />
          <span>Přidat nový film</span>
        </Link>
      </div>

      {dbError && (
        <div className={`glass-panel ${styles.warnOverlay}`} style={{ borderLeftColor: 'var(--color-danger)', background: 'rgba(239, 68, 68, 0.05)' }}>
          <h2 style={{ color: 'var(--color-danger)' }}>
            <Database />
            <span>Problém s tabulkou v databázi</span>
          </h2>
          <p>
            Připojení k Supabase proběhlo úspěšně, ale nepodařilo se načíst data. Je velmi pravděpodobné, že ve vaší databázi ještě neexistují tabulky s požadovanou strukturou.
          </p>
          <p><strong>Řešení:</strong> Přejděte do administrace Supabase, otevřete <strong>SQL Editor</strong>, vytvořte nový dotaz, vložte následující SQL kód a spusťte jej (tlačítkem Run):</p>
          <pre className={styles.sqlBox}>{sqlSchema}</pre>
          <button onClick={fetchMovies} className={styles.addFirstBtn} style={{ marginTop: '1.5rem', background: 'var(--accent-primary)' }}>
            Zkusit znovu načíst data
          </button>
        </div>
      )}

      {!dbError && (
        <>
          {/* Controls: Search and Filters */}
          <div className={styles.controls}>
            <div className={styles.searchWrapper}>
              <Search className={styles.searchIcon} size={18} />
              <input
                type="text"
                className={`form-control ${styles.searchInput}`}
                style={{ paddingLeft: '2.5rem' }}
                placeholder="Hledat film podle názvu nebo režiséra..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                id="search-input"
              />
            </div>
            
            <div className={styles.filterSelect}>
              <select
                className="form-control"
                value={selectedGenre}
                onChange={(e) => setSelectedGenre(e.target.value)}
                id="genre-filter"
              >
                <option value="">Všechny žánry</option>
                {GENRES.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Tab switcher - only display if logged in */}
          {user && (
            <div className={styles.tabContainer} id="movies-tab-container">
              <button
                onClick={() => setActiveTab('all')}
                className={`${styles.tabBtn} ${activeTab === 'all' ? styles.tabBtnActive : ''}`}
                id="tab-all-movies"
              >
                Všechny filmy
              </button>
              <button
                onClick={() => setActiveTab('my')}
                className={`${styles.tabBtn} ${activeTab === 'my' ? styles.tabBtnActive : ''}`}
                id="tab-my-movies"
              >
                Moje filmy
              </button>
            </div>
          )}

          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px' }}>
              <div style={{
                width: '40px',
                height: '40px',
                border: '4px solid var(--glass-border)',
                borderTopColor: 'var(--accent-primary)',
                borderRadius: '50%',
                animation: 'pulseGlow 1.5s infinite linear',
                transform: 'rotate(0deg)'
              }} />
            </div>
          ) : filteredMovies.length > 0 ? (
            <div className={styles.grid}>
              {filteredMovies.map((movie) => (
                <MovieCard key={movie.id} movie={movie} onDelete={handleDelete} currentUserId={user?.id} />
              ))}
            </div>
          ) : (
            <div className={`glass-panel ${styles.emptyState}`}>
              <Film size={64} className={styles.emptyIcon} />
              <h2>Žádné filmy nenalezeny</h2>
              <p>
                {movies.length === 0
                  ? 'Vaše knihovna je zatím prázdná. Přidejte svůj první film kliknutím na tlačítko níže!'
                  : activeTab === 'my'
                  ? 'Nemáte uložené žádné vlastní filmy.'
                  : 'Žádný film neodpovídá vašemu vyhledávání nebo zvolenému žánru.'}
              </p>
              {movies.length === 0 || (activeTab === 'my' && filteredMovies.length === 0) ? (
                <Link href={user ? '/movies/new' : '/auth?redirect=/movies/new'} className={styles.addFirstBtn} id="btn-add-first-movie">
                  <Plus size={18} />
                  <span>Přidat film</span>
                </Link>
              ) : (
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedGenre('');
                    setActiveTab('all');
                  }}
                  className={styles.addFirstBtn}
                  style={{ background: 'var(--bg-tertiary)' }}
                  id="btn-reset-filters"
                >
                  Vymazat filtry
                </button>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
