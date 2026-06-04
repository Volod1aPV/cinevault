'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import MovieCard from '@/components/MovieCard';
import { Search, Plus, Film, Database, AlertTriangle } from 'lucide-react';
import { GENRES } from '@/lib/schemas';
import styles from './movies.module.css';

export default function MoviesPage() {
  // Check if Supabase keys are configured
  const isEnvConfigured =
    !!(process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(isEnvConfigured);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('');
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

  // Filter movies by search term and genre
  const filteredMovies = movies.filter((movie) => {
    const matchesSearch =
      movie.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      movie.director.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesGenre = selectedGenre === '' || movie.genre === selectedGenre;

    return matchesSearch && matchesGenre;
  });

  const sqlSchema = `-- Spusťte tento kód v Supabase SQL Editoru pro nastavení databáze:
create table if not exists public.movies (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  director text not null,
  year integer not null,
  genre text not null,
  rating numeric(3, 1) not null check (rating >= 0 and rating <= 10),
  description text,
  poster_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists public.reviews (
  id uuid default gen_random_uuid() primary key,
  movie_id uuid references public.movies(id) on delete cascade not null,
  user_name text not null,
  rating numeric(3, 1) not null check (rating >= 0 and rating <= 10),
  comment text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Vypnutí/zapnutí RLS nebo povolení veřejného přístupu
alter table public.movies enable row level security;
alter table public.reviews enable row level security;

create policy "Umožnit všem číst filmy" on public.movies for select using (true);
create policy "Umožnit všem vkládat filmy" on public.movies for insert with check (true);
create policy "Umožnit všem upravovat filmy" on public.movies for update using (true);
create policy "Umožnit všem mazat filmy" on public.movies for delete using (true);

create policy "Umožnit všem číst recenze" on public.reviews for select using (true);
create policy "Umožnit všem vkládat recenze" on public.reviews for insert with check (true);`;

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
        <Link href="/movies/new" className={styles.addFirstBtn} id="btn-add-movie-top">
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
                <MovieCard key={movie.id} movie={movie} onDelete={handleDelete} />
              ))}
            </div>
          ) : (
            <div className={`glass-panel ${styles.emptyState}`}>
              <Film size={64} className={styles.emptyIcon} />
              <h2>Žádné filmy nenalezeny</h2>
              <p>
                {movies.length === 0
                  ? 'Vaše knihovna je zatím prázdná. Přidejte svůj první film kliknutím na tlačítko níže!'
                  : 'Žádný film neodpovídá vašemu vyhledávání nebo zvolenému žánru.'}
              </p>
              {movies.length === 0 ? (
                <Link href="/movies/new" className={styles.addFirstBtn} id="btn-add-first-movie">
                  <Plus size={18} />
                  <span>Přidat film</span>
                </Link>
              ) : (
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedGenre('');
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
