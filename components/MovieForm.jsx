'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { Save, X, AlertCircle } from 'lucide-react';
import { movieSchema, GENRES } from '@/lib/schemas';
import styles from './MovieForm.module.css';

export default function MovieForm({ defaultValues, onSubmit, isSubmitting }) {
  const router = useRouter();
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(movieSchema),
    defaultValues: defaultValues || {
      title: '',
      director: '',
      year: new Date().getFullYear(),
      genre: '',
      rating: 5.0,
      description: '',
      poster_url: '',
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={styles.form} noValidate>
      <div className={styles.row}>
        {/* Title */}
        <div className="form-group">
          <label htmlFor="title" className="form-label">
            Název filmu *
          </label>
          <input
            id="title"
            type="text"
            className="form-control"
            placeholder="Např. Počátek"
            {...register('title')}
          />
          {errors.title && (
            <span className="form-error">
              <AlertCircle size={14} />
              {errors.title.message}
            </span>
          )}
        </div>

        {/* Director */}
        <div className="form-group">
          <label htmlFor="director" className="form-label">
            Režisér *
          </label>
          <input
            id="director"
            type="text"
            className="form-control"
            placeholder="Např. Christopher Nolan"
            {...register('director')}
          />
          {errors.director && (
            <span className="form-error">
              <AlertCircle size={14} />
              {errors.director.message}
            </span>
          )}
        </div>
      </div>

      <div className={styles.row}>
        {/* Year */}
        <div className="form-group">
          <label htmlFor="year" className="form-label">
            Rok vydání *
          </label>
          <input
            id="year"
            type="number"
            className="form-control"
            placeholder="Např. 2010"
            {...register('year')}
          />
          {errors.year && (
            <span className="form-error">
              <AlertCircle size={14} />
              {errors.year.message}
            </span>
          )}
        </div>

        {/* Genre */}
        <div className="form-group">
          <label htmlFor="genre" className="form-label">
            Žánr *
          </label>
          <select id="genre" className="form-control" {...register('genre')}>
            <option value="">-- Vyberte žánr --</option>
            {GENRES.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
          {errors.genre && (
            <span className="form-error">
              <AlertCircle size={14} />
              {errors.genre.message}
            </span>
          )}
        </div>
      </div>

      <div className={styles.row}>
        {/* Rating */}
        <div className="form-group">
          <label htmlFor="rating" className="form-label">
            Hodnocení (0.0 - 10.0) *
          </label>
          <input
            id="rating"
            type="number"
            step="0.1"
            className="form-control"
            placeholder="Např. 8.5"
            {...register('rating')}
          />
          {errors.rating && (
            <span className="form-error">
              <AlertCircle size={14} />
              {errors.rating.message}
            </span>
          )}
        </div>

        {/* Poster URL */}
        <div className="form-group">
          <label htmlFor="poster_url" className="form-label">
            URL plakátu (volitelné)
          </label>
          <input
            id="poster_url"
            type="url"
            className="form-control"
            placeholder="https://images.unsplash.com/..."
            {...register('poster_url')}
          />
          {errors.poster_url && (
            <span className="form-error">
              <AlertCircle size={14} />
              {errors.poster_url.message}
            </span>
          )}
        </div>
      </div>

      {/* Description */}
      <div className="form-group">
        <label htmlFor="description" className="form-label">
          Popis filmu
        </label>
        <textarea
          id="description"
          className={`${styles.textarea} form-control`}
          placeholder="Stručný děj filmu..."
          {...register('description')}
        />
        {errors.description && (
          <span className="form-error">
            <AlertCircle size={14} />
            {errors.description.message}
          </span>
        )}
      </div>

      {/* Actions */}
      <div className={styles.actions}>
        <button
          type="button"
          onClick={() => router.back()}
          className={styles.cancelBtn}
          disabled={isSubmitting}
        >
          <X size={16} />
          <span>Zrušit</span>
        </button>
        <button type="submit" className={styles.submitBtn} disabled={isSubmitting}>
          <Save size={16} />
          <span>{isSubmitting ? 'Ukládá se...' : 'Uložit film'}</span>
        </button>
      </div>
    </form>
  );
}
