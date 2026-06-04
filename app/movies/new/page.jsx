'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import MovieForm from '@/components/MovieForm';
import { Film } from 'lucide-react';
import styles from '../movies.module.css';

export default function NewMoviePage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          router.push('/auth?redirect=/movies/new');
        } else {
          setUser(session.user);
          setCheckingAuth(false);
        }
      } catch (err) {
        console.error('Error checking auth:', err);
        router.push('/auth?redirect=/movies/new');
      }
    };

    checkAuth();
  }, [router]);

  const handleSubmit = async (formData) => {
    if (!user) {
      alert('Pro přidání filmu musíte být přihlášeni.');
      return;
    }

    try {
      setIsSubmitting(true);
      
      const moviePayload = {
        ...formData,
        user_id: user.id,
      };

      // Insert movie into Supabase
      const { error } = await supabase
        .from('movies')
        .insert([moviePayload]);

      if (error) {
        throw error;
      }

      // Redirect back to list
      router.push('/movies');
    } catch (err) {
      console.error('Chyba při ukládání filmu:', err);
      alert(`Nepodařilo se uložit film: ${err.message || 'Neznámá chyba'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (checkingAuth) {
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

  return (
    <div className="container fade-in" style={{ padding: '2rem 1.5rem 4rem 1.5rem', maxWidth: '800px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
        <Film size={28} style={{ color: 'var(--accent-primary)' }} />
        <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>Přidat nový film</h1>
      </div>

      <div className="glass-panel" style={{ padding: '2rem' }}>
        <MovieForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />
      </div>
    </div>
  );
}
