import { useState } from 'react'
import Snackbar from '@mui/material/Snackbar'
import Alert from '@mui/material/Alert'
import type { SavedBook } from '../services/indexedDBService'
import { useCoverImage } from '../hooks/useCoverImage'
import { updateBookRating, removeBook, updateBookProgress } from '../services/indexedDBService'

interface RatingBookCardProps {
  book: SavedBook
  onRatingChange?: (bookKey: string, rating: number) => void
  onProgressChange?: (bookKey: string, progress: number) => void
  onRemove?: (bookKey: string) => void
}

export default function RatingBookCard({
  book,
  onRatingChange,
  onProgressChange,
  onRemove,
}: RatingBookCardProps) {
  const [rating, setRating] = useState<number>(book.rating ?? 0)
  const [progress, setProgress] = useState<number>(book.progress ?? 0)
  const [isUpdating, setIsUpdating] = useState(false)
  const [isRemoving, setIsRemoving] = useState(false)
  const [toastOpen, setToastOpen] = useState(false)
  const [toastMessage, setToastMessage] = useState('')

  const coverUrl = useCoverImage(book.cover_i, 'M')
  const author = book.author_name?.join(', ') ?? 'Unknown author'

  const handleStarClick = async (starRating: number) => {
    if (isUpdating || starRating === rating) return

    setIsUpdating(true)
    try {
      await updateBookRating(book.key, starRating)
      setRating(starRating)
      if (onRatingChange) {
        onRatingChange(book.key, starRating)
      }
    } catch (error) {
      console.error('Failed to update rating:', error)
    } finally {
      setIsUpdating(false)
    }
  }

  const handleProgressChange = async () => {
    try {
      await updateBookProgress(book.key, progress)
      if (onProgressChange) {
        onProgressChange(book.key, progress)
      }
      // Show completion toast when progress reaches 100%
      if (progress === 100) {
        setToastMessage(`Congrats! You've completed '${book.title}'! Keep going!`)
        setToastOpen(true)
      }
    } catch (error) {
      console.error('Failed to update progress:', error)
    }
  }

  const handleRemove = async () => {
    if (isRemoving) return

    setIsRemoving(true)
    try {
      await removeBook(book.key)
      if (onRemove) {
        onRemove(book.key)
      }
    } catch (error) {
      console.error('Failed to remove book:', error)
      setIsRemoving(false)
    }
  }

  return (
    <>
    <article className={`rating-book-card ${
      rating === 5 ? 'rating-five-stars' : rating === 4 ? 'rating-four-stars' : ''
    }`}>
      <div className="rating-book-cover">
        {coverUrl ? (
          <img src={coverUrl} alt={book.title} loading="lazy" />
        ) : (
          <div className="rating-cover-placeholder">No cover</div>
        )}
      </div>
      <div className="rating-book-info">
        <div className="rating-book-header">
          <h3 className="rating-book-title">{book.title}</h3>
          <button
            className="remove-from-reading"
            onClick={handleRemove}
            disabled={isRemoving}
            title="Remove from reading"
          >
            ✕
          </button>
        </div>
        <p className="rating-book-author">{author}</p>

        {/* Reading Progress Control */}
        <div className="progress-control">
          <div className="progress-header">
            <label htmlFor={`progress-${book.key}`} className="progress-label">
              Progress
            </label>
            <span className="progress-value">{progress}%</span>
          </div>
          <input
            id={`progress-${book.key}`}
            type="range"
            min="0"
            max="100"
            step="10"
            value={progress}
            onChange={(e) => setProgress(Number(e.target.value))}
            onMouseUp={handleProgressChange}
            onTouchEnd={handleProgressChange}
            className="progress-slider"
            style={{ '--progress': `${progress}%` } as React.CSSProperties}
          />
        </div>

        {/* Star Rating System */}
        <div className="star-rating">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              className={`rating-star ${star <= rating ? 'filled' : 'empty'}`}
              onClick={() => handleStarClick(star)}
              disabled={isUpdating}
              title={`Rate ${star} star${star !== 1 ? 's' : ''}`}
              aria-label={`Rate ${star} star${star !== 1 ? 's' : ''}`}
            >
              {star <= rating ? '★' : '☆'}
            </button>
          ))}
        </div>
      </div>
    </article>
    <Snackbar
        open={toastOpen}
        autoHideDuration={4000}
        onClose={() => setToastOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setToastOpen(false)}
          severity="success"
          sx={{
            width: '100%',
            background: 'linear-gradient(135deg, #d4a574 0%, #c59559 100%)',
            color: '#1a1a1a',
            fontFamily: "'Lora', serif",
            fontWeight: 500,
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.25), 0 0 20px rgba(212, 165, 116, 0.4)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
          }}
        >
          {toastMessage}
        </Alert>
      </Snackbar>
    </>
  )
}
