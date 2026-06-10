'use client';

import { useState, useEffect, use, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { ArrowLeft, Edit2, Trash2, Star, Calendar, User, Film, Send, AlertCircle } from 'lucide-react';
import styles from '../movie-detail.module.css';

export default function MovieDetailPage({ params }) {
  const router = useRouter();
  
  // In Next 15, params is a Promise that needs to be unwrapped with React.use()
  const resolvedParams = use(params);
  const movieId = resolvedParams.id;

  const [movie, setMovie] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Review form state
  const [authorName, setAuthorName] = useState('');
  const [rating, setRating] = useState(10);
  const [comment, setComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState(null);

  const fetchReviews = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('movie_id', movieId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReviews(data || []);
    } catch (err) {
      console.error('Chyba při načítání recenzí:', err);
    }
  }, [movieId]);

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
      await fetchReviews();
    } catch (err) {
      console.error('Chyba při načítání detailu filmu:', err);
      setError(err.message || 'Nepodařilo se načíst detail filmu.');
    } finally {
      setLoading(false);
    }
  }, [movieId, fetchReviews]);

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

  const handleReviewSubmit = async (e) => {
    e.preventDefault();

    if (!authorName.trim()) {
      setReviewError('Zadejte prosím své jméno.');
      return;
    }

    if (rating < 0 || rating > 10) {
      setReviewError('Hodnocení musí být v rozmezí 0 až 10.');
      return;
    }

    try {
      setIsSubmittingReview(true);
      setReviewError(null);

      const reviewPayload = {
        movie_id: movieId,
        user_name: authorName.trim(),
        rating: Number(rating),
        comment: comment.trim(),
      };

      const { error } = await supabase
        .from('reviews')
        .insert([reviewPayload]);

      if (error) throw error;

      // Reset form fields
      setComment('');
      setAuthorName('');
      setRating(10);
      
      // Refresh local reviews list
      await fetchReviews();
    } catch (err) {
      console.error('Chyba při přidávání recenze:', err);
      setReviewError(err.message || 'Nepodařilo se odeslat hodnocení.');
    } finally {
      setIsSubmittingReview(false);
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
    <div className="container fade-in" style={{ paddingBottom: '4rem' }}>
      <div className={styles.container}>
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
            {movie.slogan && <p className={styles.sloganText}>„{movie.slogan}“</p>}
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

          {/* O filmu factsheet grid */}
          <div className={styles.aboutSection}>
            <h2>O filmu</h2>
            <div className={styles.aboutGrid}>
              <div className={styles.aboutRow}>
                <span className={styles.aboutKey}>Rok výroby</span>
                <span className={styles.aboutVal}>{movie.year}</span>
              </div>
              
              {movie.country && (
                <div className={styles.aboutRow}>
                  <span className={styles.aboutKey}>Země původu</span>
                  <span className={styles.aboutVal}>{movie.country}</span>
                </div>
              )}

              <div className={styles.aboutRow}>
                <span className={styles.aboutKey}>Žánr</span>
                <span className={styles.aboutVal}>{movie.genre}</span>
              </div>

              <div className={styles.aboutRow}>
                <span className={styles.aboutKey}>Režie</span>
                <span className={styles.aboutVal}>{movie.director}</span>
              </div>

              {movie.screenplay && (
                <div className={styles.aboutRow}>
                  <span className={styles.aboutKey}>Scénář</span>
                  <span className={styles.aboutVal}>{movie.screenplay}</span>
                </div>
              )}

              {movie.producer && (
                <div className={styles.aboutRow}>
                  <span className={styles.aboutKey}>Produkce</span>
                  <span className={styles.aboutVal}>{movie.producer}</span>
                </div>
              )}

              {movie.cinematography && (
                <div className={styles.aboutRow}>
                  <span className={styles.aboutKey}>Kamera</span>
                  <span className={styles.aboutVal}>{movie.cinematography}</span>
                </div>
              )}

              {movie.music && (
                <div className={styles.aboutRow}>
                  <span className={styles.aboutKey}>Hudba</span>
                  <span className={styles.aboutVal}>{movie.music}</span>
                </div>
              )}

              {movie.budget && (
                <div className={styles.aboutRow}>
                  <span className={styles.aboutKey}>Rozpočet</span>
                  <span className={styles.aboutVal}>{movie.budget}</span>
                </div>
              )}

              {movie.box_office && (
                <div className={styles.aboutRow}>
                  <span className={styles.aboutKey}>Tržby celosvětově</span>
                  <span className={styles.aboutVal}>{movie.box_office}</span>
                </div>
              )}

              {movie.age_rating && (
                <div className={styles.aboutRow}>
                  <span className={styles.aboutKey}>Přístupnost</span>
                  <span className={styles.aboutVal}>{movie.age_rating}</span>
                </div>
              )}

              {movie.duration && (
                <div className={styles.aboutRow}>
                  <span className={styles.aboutKey}>Délka filmu</span>
                  <span className={styles.aboutVal}>{movie.duration}</span>
                </div>
              )}
            </div>
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

      {/* Reviews Section */}
      <div className={styles.reviewsSection}>
        <h2>Hodnocení a recenze uživatelů</h2>
        
        <div className={styles.reviewsLayout}>
          {/* Reviews List */}
          <div className={styles.reviewsList}>
            {reviews.length > 0 ? (
              reviews.map((rev) => (
                <div key={rev.id} className={styles.reviewCard}>
                  <div className={styles.reviewHeader}>
                    <div className={styles.reviewAuthor}>{rev.user_name}</div>
                    <div className={styles.reviewMeta}>
                      <div className={styles.reviewStars}>
                        <Star size={14} fill="currentColor" />
                        <span>{Number(rev.rating).toFixed(0)}/10</span>
                      </div>
                      <span className={styles.reviewDate}>
                        {new Date(rev.created_at).toLocaleDateString('cs-CZ')}
                      </span>
                    </div>
                  </div>
                  {rev.comment && <p className={styles.reviewComment}>{rev.comment}</p>}
                </div>
              ))
            ) : (
              <p className={styles.noReviews}>Tento film zatím nikdo nehodnotil. Buďte první!</p>
            )}
          </div>

          {/* Add Review Form */}
          <div className={styles.reviewFormCard}>
            <h3>Přidat hodnocení</h3>
            
            <form onSubmit={handleReviewSubmit} className={styles.reviewForm}>
              {reviewError && (
                <div className={`${styles.loginPrompt}`} style={{ color: 'var(--color-danger)', borderColor: 'rgba(244, 63, 94, 0.2)', background: 'rgba(244, 63, 94, 0.02)' }}>
                  <AlertCircle size={16} style={{ display: 'inline', marginRight: '0.25rem', verticalAlign: 'middle' }} />
                  <span>{reviewError}</span>
                </div>
              )}
              
              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label htmlFor="review-author" className="form-label">
                  Vaše jméno *
                </label>
                <input
                  id="review-author"
                  type="text"
                  className="form-control"
                  placeholder="Např. Jan Novák"
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label htmlFor="review-rating" className="form-label">
                  Hodnocení (1 - 10 hvězd) *
                </label>
                <select
                  id="review-rating"
                  className="form-control"
                  value={rating}
                  onChange={(e) => setRating(Number(e.target.value))}
                  required
                >
                  {[10, 9, 8, 7, 6, 5, 4, 3, 2, 1].map((val) => (
                    <option key={val} value={val}>
                      {val} {val === 1 ? 'hvězda' : val >= 2 && val <= 4 ? 'hvězdy' : 'hvězd'}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label htmlFor="review-comment" className="form-label">
                  Komentář (volitelné)
                </label>
                <textarea
                  id="review-comment"
                  className="form-control"
                  style={{ minHeight: '100px', resize: 'vertical' }}
                  placeholder="Podělte se o své dojmy z filmu..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                />
              </div>

              <button
                type="submit"
                className={styles.editBtn}
                disabled={isSubmittingReview}
                style={{ width: '100%', justifyContent: 'center' }}
                id="btn-submit-review"
              >
                <Send size={16} />
                <span>{isSubmittingReview ? 'Odesílání...' : 'Odeslat hodnocení'}</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
