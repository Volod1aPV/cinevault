'use client';

import { useState, useEffect, use, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import MovieForm from '@/components/MovieForm';
import { Edit3, Film } from 'lucide-react';
import Link from 'next/link';

export default function EditMoviePage({ params }) {
  const router = useRouter();
  
  // In Next 15, params is a Promise that needs to be unwrapped
  const resolvedParams = use(params);
  const movieId = resolvedParams.id;

  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const fetchMovie = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: movieError } = await supabase
        .from('movies')
        .select('*')
        .eq('id', movieId)
        .single();

      if (movieError) {
        throw movieError;
      }

      setMovie(data);
    } catch (err) {
      console.error('Chyba při načítání filmu k úpravě:', err);
      setError('Nepodařilo se načíst údaje o filmu.');
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

  const handleSubmit = async (formData) => {
    try {
      setIsSubmitting(true);
      
      const { error } = await supabase
        .from('movies')
        .update(formData)
        .eq('id', movieId);

      if (error) {
        throw error;
      }

      // Redirect back to detail page
      router.push(`/movies/${movieId}`);
      // Refresh the router to reload fresh data
      router.refresh();
    } catch (err) {
      console.error('Chyba při aktualizaci filmu:', err);
      alert(`Nepodařilo se upravit film: ${err.message || 'Neznámá chyba'}`);
    } finally {
      setIsSubmitting(false);
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
        <h1 style={{ fontSize: '2rem', fontWeight: 700 }}>Film nenalezen</h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem', marginBottom: '2rem' }}>
          {error || 'Záznam neexistuje.'}
        </p>
        <Link href="/movies" style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.6rem 1.2rem',
          background: 'var(--bg-tertiary)',
          border: '1px solid var(--glass-border)',
          borderRadius: 'var(--border-radius-md)',
          color: 'var(--text-primary)',
          fontSize: '0.9rem',
          fontWeight: 600,
          cursor: 'pointer'
        }}>
          Zpět na přehled
        </Link>
      </div>
    );
  }

  // Map null or undefined optional database fields to empty strings for the HTML form
  const formDefaults = {
    title: movie.title || '',
    director: movie.director || '',
    year: movie.year || new Date().getFullYear(),
    genre: movie.genre || '',
    rating: movie.rating || 5.0,
    description: movie.description || '',
    poster_url: movie.poster_url || '',
  };

  return (
    <div className="container fade-in" style={{ padding: '2rem 1.5rem 4rem 1.5rem', maxWidth: '800px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
        <Edit3 size={28} style={{ color: 'var(--accent-primary)' }} />
        <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>Upravit film: {movie.title}</h1>
      </div>

      <div className="glass-panel" style={{ padding: '2rem' }}>
        <MovieForm
          defaultValues={formDefaults}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
        />
      </div>
    </div>
  );
}
