import Link from 'next/link';
import { Star, Film, Trash2, Eye } from 'lucide-react';
import styles from './MovieCard.module.css';

export default function MovieCard({ movie, onDelete }) {
  const { id, title, director, year, genre, rating, poster_url } = movie;

  const handleDelete = (e) => {
    e.preventDefault(); // Prevent navigating to detail page if wrapped in click handlers
    if (confirm(`Opravdu chcete smazat film "${title}"?`)) {
      onDelete(id);
    }
  };

  return (
    <div className={`glass-panel ${styles.card}`}>
      <div className={styles.posterWrapper}>
        {poster_url ? (
          <img
            src={poster_url}
            alt={`Plakát k filmu ${title}`}
            className={styles.poster}
            loading="lazy"
          />
        ) : (
          <div className={styles.posterPlaceholder}>
            <Film size={48} className={styles.posterPlaceholderIcon} />
            <span style={{ fontSize: '0.85rem' }}>Bez plakátu</span>
          </div>
        )}
        
        <div className={styles.ratingBadge}>
          <Star size={14} fill="currentColor" />
          <span>{Number(rating).toFixed(1)}</span>
        </div>

        <div className={styles.badge}>{genre}</div>
      </div>

      <div className={styles.content}>
        <div className={styles.metaInfo}>
          <span>{year}</span>
          <span>•</span>
          <span>{genre}</span>
        </div>
        
        <h3 className={styles.title} title={title}>{title}</h3>
        <p className={styles.director}>Režie: {director}</p>

        <div className={styles.actions}>
          <Link href={`/movies/${id}`} className={styles.viewBtn}>
            <Eye size={16} />
            <span>Detail</span>
          </Link>

          <button
            onClick={handleDelete}
            className={styles.deleteBtn}
            title="Smazat film"
            aria-label={`Smazat film ${title}`}
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
