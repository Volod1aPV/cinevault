'use client';

import { useState, useEffect, use, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { ArrowLeft, Edit2, Trash2, Star, Calendar, User, Film } from 'lucide-react';
import styles from '../movie-detail.module.css';

export default function MovieDetailPage({ params }) {
  const router = useRouter();
  
  // In Next 15, params is a Promise that needs to be unwrapped with React.use()
  const resolvedParams = use(params);
  const movieId = resolvedParams.id;

  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchMovie = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('movies')
        .select('*')
        .eq('id', movieId)
        .single();

      if (error) {
        throw error;
      }

      setMovie(data);
    } catch (err) {
      console.error('Chyba při načítání detailu filmu:', err);
      setError(err.message || 'Nepodařilo se načíst detail filmu.');
    } finally {
      setLoading(false);
    }
  }, [movieId]);

  useEffect(() => {
    if (movieId) {
      Promise.resolve().then(() => {
        fetchMovie();
      });
    }
  }, [movieId, fetchMovie]);

  const handleDelete = async () => {
    if (!confirm(`Opravdu chcete smazat film "${movie.title}"?`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('movies')
        .delete()
        .eq('id', movieId);

      if (error) throw error;

      router.push('/movies');
    } catch (err) {
      console.error('Chyba při mazání filmu:', err);
      alert('Nepodařilo se smazat film.');
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '4px solid var(--glass-border)',
          borderTopColor: 'var(--accent-primary)',
          borderRadius: '50%',
          animation: 'pulseGlow 1.5s infinite linear'
        }} />
      </div>
    );
  }

  if (error || !movie) {
    return (
      <div className="container fade-in" style={{ padding: '4rem 1.5rem', textAlign: 'center' }}>
        <Film size={64} style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', opacity: 0.4 }} />
        <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '1rem' }}>Film nebyl nalezen</h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
          {error || 'Záznam o filmu neexistuje nebo byl smazán.'}
        </p>
        <Link href="/movies" className={styles.editBtn} style={{ background: 'var(--bg-tertiary)', textShadow: 'none' }}>
          <ArrowLeft size={16} />
          <span>Zpět na přehled</span>
        </Link>
      </div>
    );
  }

  return (
    <div className={`container fade-in ${styles.container}`}>
      {/* Left side: Poster */}
      <div>
        <Link href="/movies" className={styles.backBtn} id="btn-back">
          <ArrowLeft size={16} />
          <span>Zpět na přehled</span>
        </Link>
        <div className={styles.posterWrapper}>
          {movie.poster_url ? (
            <img
              src={movie.poster_url}
              alt={`Plakát k filmu ${movie.title}`}
              className={styles.poster}
            />
          ) : (
            <div className={styles.posterPlaceholder}>
              <Film size={64} style={{ opacity: 0.3 }} />
              <span style={{ fontSize: '0.9rem' }}>Bez plakátu</span>
            </div>
          )}
        </div>
      </div>

      {/* Right side: Movie Info */}
      <div className={styles.details}>
        <div className={styles.header}>
          <h1 className={styles.title} id="movie-detail-title">{movie.title}</h1>
          <div className={styles.meta}>
            <span className={styles.rating}>
              <Star size={16} fill="currentColor" />
              <span>{Number(movie.rating).toFixed(1)} / 10.0</span>
            </span>
            <span className={styles.separator}>•</span>
            <span className={styles.badge}>{movie.genre}</span>
            <span className={styles.separator}>•</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <Calendar size={16} />
              <span>{movie.year}</span>
            </span>
            <span className={styles.separator}>•</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <User size={16} />
              <span>{movie.director}</span>
            </span>
          </div>
        </div>

        <div className={styles.infoSection}>
          <h2>Děj a popis filmu</h2>
          {movie.description ? (
            <p className={styles.description}>{movie.description}</p>
          ) : (
            <p className={`${styles.description} ${styles.emptyDescription}`}>
              K tomuto filmu zatím nebyl přidán žádný popis.
            </p>
          )}
        </div>

        <div className={styles.actions}>
          <Link href={`/movies/${movieId}/edit`} className={styles.editBtn} id="btn-edit">
            <Edit2 size={16} />
            <span>Upravit film</span>
          </Link>
          <button onClick={handleDelete} className={styles.deleteBtn} id="btn-delete">
            <Trash2 size={16} />
            <span>Smazat film</span>
          </button>
        </div>
      </div>
    </div>
  );
}
