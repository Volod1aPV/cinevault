'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import MovieForm from '@/components/MovieForm';
import { Film } from 'lucide-react';
import styles from '../movies.module.css';

export default function NewMoviePage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (formData) => {
    try {
      setIsSubmitting(true);
      
      // Insert movie into Supabase
      const { error } = await supabase
        .from('movies')
        .insert([formData]);

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
