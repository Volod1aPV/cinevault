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
      country: '',
      slogan: '',
      screenplay: '',
      producer: '',
      cinematography: '',
      music: '',
      budget: '',
      box_office: '',
      age_rating: '',
      duration: '',
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

      <div className={styles.row}>
        {/* Country */}
        <div className="form-group">
          <label htmlFor="country" className="form-label">
            Země původu (volitelné)
          </label>
          <input
            id="country"
            type="text"
            className="form-control"
            placeholder="Např. USA, Velká Británie"
            {...register('country')}
          />
          {errors.country && (
            <span className="form-error">
              <AlertCircle size={14} />
              {errors.country.message}
            </span>
          )}
        </div>

        {/* Slogan */}
        <div className="form-group">
          <label htmlFor="slogan" className="form-label">
            Slogan (volitelné)
          </label>
          <input
            id="slogan"
            type="text"
            className="form-control"
            placeholder="Např. Nejdále se dostaneme, když překonáme své hranice"
            {...register('slogan')}
          />
          {errors.slogan && (
            <span className="form-error">
              <AlertCircle size={14} />
              {errors.slogan.message}
            </span>
          )}
        </div>
      </div>

      <div className={styles.row}>
        {/* Screenplay */}
        <div className="form-group">
          <label htmlFor="screenplay" className="form-label">
            Scénář (volitelné)
          </label>
          <input
            id="screenplay"
            type="text"
            className="form-control"
            placeholder="Např. Jonathan Nolan, Christopher Nolan"
            {...register('screenplay')}
          />
          {errors.screenplay && (
            <span className="form-error">
              <AlertCircle size={14} />
              {errors.screenplay.message}
            </span>
          )}
        </div>

        {/* Producer */}
        <div className="form-group">
          <label htmlFor="producer" className="form-label">
            Produkce (volitelné)
          </label>
          <input
            id="producer"
            type="text"
            className="form-control"
            placeholder="Např. Emma Thomas, Christopher Nolan"
            {...register('producer')}
          />
          {errors.producer && (
            <span className="form-error">
              <AlertCircle size={14} />
              {errors.producer.message}
            </span>
          )}
        </div>
      </div>

      <div className={styles.row}>
        {/* Cinematography */}
        <div className="form-group">
          <label htmlFor="cinematography" className="form-label">
            Kamera (volitelné)
          </label>
          <input
            id="cinematography"
            type="text"
            className="form-control"
            placeholder="Např. Hoyte van Hoytema"
            {...register('cinematography')}
          />
          {errors.cinematography && (
            <span className="form-error">
              <AlertCircle size={14} />
              {errors.cinematography.message}
            </span>
          )}
        </div>

        {/* Music */}
        <div className="form-group">
          <label htmlFor="music" className="form-label">
            Hudba (volitelné)
          </label>
          <input
            id="music"
            type="text"
            className="form-control"
            placeholder="Např. Hans Zimmer"
            {...register('music')}
          />
          {errors.music && (
            <span className="form-error">
              <AlertCircle size={14} />
              {errors.music.message}
            </span>
          )}
        </div>
      </div>

      <div className={styles.row}>
        {/* Budget */}
        <div className="form-group">
          <label htmlFor="budget" className="form-label">
            Rozpočet (volitelné)
          </label>
          <input
            id="budget"
            type="text"
            className="form-control"
            placeholder="Např. $165 000 000"
            {...register('budget')}
          />
          {errors.budget && (
            <span className="form-error">
              <AlertCircle size={14} />
              {errors.budget.message}
            </span>
          )}
        </div>

        {/* Box Office */}
        <div className="form-group">
          <label htmlFor="box_office" className="form-label">
            Tržby celosvětově (volitelné)
          </label>
          <input
            id="box_office"
            type="text"
            className="form-control"
            placeholder="Např. $773 889 028"
            {...register('box_office')}
          />
          {errors.box_office && (
            <span className="form-error">
              <AlertCircle size={14} />
              {errors.box_office.message}
            </span>
          )}
        </div>
      </div>

      <div className={styles.row}>
        {/* Age Rating */}
        <div className="form-group">
          <label htmlFor="age_rating" className="form-label">
            Věkové omezení / Přístupnost (volitelné)
          </label>
          <input
            id="age_rating"
            type="text"
            className="form-control"
            placeholder="Např. 12+ nebo PG-13"
            {...register('age_rating')}
          />
          {errors.age_rating && (
            <span className="form-error">
              <AlertCircle size={14} />
              {errors.age_rating.message}
            </span>
          )}
        </div>

        {/* Duration */}
        <div className="form-group">
          <label htmlFor="duration" className="form-label">
            Délka filmu (volitelné)
          </label>
          <input
            id="duration"
            type="text"
            className="form-control"
            placeholder="Např. 169 min nebo 2 h 49 min"
            {...register('duration')}
          />
          {errors.duration && (
            <span className="form-error">
              <AlertCircle size={14} />
              {errors.duration.message}
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
